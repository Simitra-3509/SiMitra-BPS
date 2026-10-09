<?php

namespace App\Http\Controllers;

use App\Models\Spk;
use App\Models\SpkDetail;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\SbmlLimit;
use App\Models\User;
use App\Services\SpkService;
use App\Services\SpkDocxService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SpkController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role:admin,administrator,ppk,operator', only: ['index', 'show', 'exportPdf']),
            new Middleware('role:ppk', only: ['create', 'store', 'edit', 'update', 'destroy', 'terbitkan', 'generateAndDownload']),
        ];
    }

    public function index(Request $request)
    {
        $query = Spk::with(['mitra', 'ppk', 'details.kegiatan']);

        if ($request->filled('bulan')) {
            $query->where('bulan', $request->bulan);
        }
        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_spk', 'like', "%{$search}%")
                  ->orWhereHas('mitra', function ($m) use ($search) {
                      $m->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('sobat_id', 'like', "%{$search}%");
                  });
            });
        }

        $spks = $query->orderByDesc('id')->paginate(10)->withQueryString();

        return Inertia::render('Spk/Index', [
            'spks' => $spks,
            'filters' => $request->only(['bulan', 'tahun', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $mitras = Mitra::where('status_aktif', true)->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'sobat_id', 'kecamatan']);
        $kegiatans = Kegiatan::where('status_aktif', true)->with('detilKegiatan')->orderBy('nama_kegiatan')->get();

        return Inertia::render('Spk/Create', [
            'mitras' => $mitras,
            'kegiatans' => $kegiatans,
        ]);
    }

    /**
     * Generate SPK dan langsung download PDF dari Dashboard (tanpa form input).
     * Ambil penugasan mitra, create SPK, trigger PDF download.
     */
    public function generateAndDownload(Request $request)
    {
        $mitraId = $request->input('mitra_id');

        if (!$mitraId) {
            return back()->with('error', 'Mitra ID tidak ditemukan.');
        }

        $penugasans = \App\Models\Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra'])
            ->where('mitra_id', $mitraId)
            ->whereNull('deleted_at')
            ->get();

        if ($penugasans->isEmpty()) {
            return back()->with('error', 'Tidak ada penugasan ditemukan untuk mitra ini pada periode yang dipilih.');
        }

        $mitra = $penugasans->first()->mitra;
        $firstP = $penugasans->first();
        
        // Cari PPK aktif
        $ppk = User::where('role', 'ppk')->orWhere('role', 'administrator')->first();
        if (!$ppk) {
            return back()->with('error', 'PPK tidak ditemukan. Harap setup user dengan role PPK terlebih dahulu.');
        }

        $tanggalMulaiAll = $penugasans->map(fn($p) => $p->tanggal_mulai)->filter()->min();
        $tanggalSelesaiAll = $penugasans->map(fn($p) => $p->tanggal_selesai)->filter()->max();

        $details = $penugasans->map(function ($p) {
            $dk = $p->detilKegiatan;
            $k = $p->kegiatan;
            return [
                'kegiatan_id' => $p->kegiatan_id,
                'uraian_tugas' => $dk->nama_detil ?? $k->nama_kegiatan ?? '',
                'tanggal_mulai_detail' => $p->tanggal_mulai ? $p->tanggal_mulai->format('Y-m-d') : now()->format('Y-m-d'),
                'tanggal_selesai_detail' => $p->tanggal_selesai ? $p->tanggal_selesai->format('Y-m-d') : now()->format('Y-m-d'),
                'volume' => (int) ($p->kuota_target ?? 1),
                'satuan' => $dk->satuan ?? 'Dokumen',
                'harga_satuan' => (float) ($p->harga_satuan_snapshot ?? $dk->harga_satuan ?? 0),
                'nilai' => (float) ($p->total_honor ?? 0),
                'kode_anggaran' => $k->kode_kegiatan ?? '',
                'akun_anggaran' => '',
            ];
        })->toArray();

        $totalNilai = array_sum(array_column($details, 'nilai'));

        // Create SPK dengan status terbit (akan auto-generate nomor_spk via Model observer)
        $spk = Spk::create([
            'mitra_id' => $mitraId,
            'bulan' => (int) ($firstP->bulan ?? date('m')),
            'tahun' => (int) ($firstP->tahun ?? date('Y')),
            'tanggal_mulai' => $tanggalMulaiAll ? $tanggalMulaiAll->format('Y-m-d') : now()->format('Y-m-d'),
            'tanggal_selesai' => $tanggalSelesaiAll ? $tanggalSelesaiAll->format('Y-m-d') : now()->format('Y-m-d'),
            'ppk_user_id' => $ppk->id,
            'nama_ppk_snapshot' => $ppk->name,
            'nip_ppk_snapshot' => $ppk->pegawai->nip ?? '-',
            'jabatan_ppk_snapshot' => 'Pejabat Pembuat Komitmen',
            'total_nilai' => $totalNilai,
            'status' => 'terbit',
            'catatan' => 'SPK dibuat otomatis dari Dashboard pada ' . now()->format('d/m/Y H:i'),
        ]);

        // Create detail records
        foreach ($details as $detail) {
            $spk->details()->create($detail);
        }

        // Load relationships untuk PDF/DOCX
        $spk->load(['mitra', 'ppk', 'details.kegiatan']);

        $format = $request->input('format', 'pdf');
        $baseFilename = "SPK-{$spk->nomor_spk}-{$mitra->nama_lengkap}";
        $baseFilename = str_replace(['/', '\\'], '-', $baseFilename);

        if ($format === 'docx') {
            // Generate DOCX (Word)
            $phpWord = \App\Services\SpkDocxService::generate($spk);
            $tempFile = tempnam(sys_get_temp_dir(), 'spk_') . '.docx';
            $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $objWriter->save($tempFile);

            return response()->file($tempFile, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => 'inline; filename="' . $baseFilename . '.docx"',
            ])->deleteFileAfterSend(true);
        }

        // Default: Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.spk', compact('spk'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream($baseFilename . '.pdf');
    }

    /**
     * Buat SPK dari data penugasan mitra (auto-fill dari Dashboard).
     * Menerima mitra_id via query string, lalu mengambil semua penugasan mitra tersebut
     * sesuai filter bulan/tahun, dan meng-auto-fill form Create SPK.
     */
    public function createFromPenugasan(Request $request)
    {
        $mitraId = $request->input('mitra_id');
        $filterBulan = $request->input('bulan');
        $filterTahun = $request->input('tahun', date('Y'));

        $mitras = Mitra::where('status_aktif', true)->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'sobat_id', 'kecamatan']);
        $kegiatans = Kegiatan::where('status_aktif', true)->with('detilKegiatan')->orderBy('nama_kegiatan')->get();

        $autoFill = null;

        if ($mitraId) {
            $query = \App\Models\Penugasan::with(['kegiatan', 'detilKegiatan'])
                ->where('mitra_id', $mitraId)
                ->whereNull('deleted_at');

            if ($filterBulan && $filterBulan !== 'semua') {
                $query->where('bulan', $filterBulan);
            }
            if ($filterTahun && $filterTahun !== 'tahunan') {
                $query->where('tahun', $filterTahun);
            }

            $penugasans = $query->get();

            if ($penugasans->isNotEmpty()) {
                $details = $penugasans->map(function ($p) {
                    $dk = $p->detilKegiatan;
                    $k = $p->kegiatan;
                    return [
                        'kegiatan_id' => $p->kegiatan_id,
                        'uraian_tugas' => $dk->nama_detil ?? $k->nama_kegiatan ?? '',
                        'tanggal_mulai_detail' => $p->tanggal_mulai ? $p->tanggal_mulai->format('Y-m-d') : '',
                        'tanggal_selesai_detail' => $p->tanggal_selesai ? $p->tanggal_selesai->format('Y-m-d') : '',
                        'volume' => (int) ($p->kuota_target ?? 1),
                        'satuan' => $dk->satuan ?? 'Dokumen',
                        'harga_satuan' => (float) ($p->harga_satuan_snapshot ?? $dk->harga_satuan ?? 0),
                        'nilai' => (float) ($p->total_honor ?? 0),
                        'kode_anggaran' => $k->kode_kegiatan ?? '',
                        'akun_anggaran' => '',
                    ];
                })->values()->toArray();

                // Tentukan tanggal mulai/selesai SPK dari range semua penugasan
                $tanggalMulaiAll = $penugasans->map(fn($p) => $p->tanggal_mulai)->filter()->min();
                $tanggalSelesaiAll = $penugasans->map(fn($p) => $p->tanggal_selesai)->filter()->max();

                $firstP = $penugasans->first();
                $autoFill = [
                    'mitra_id' => $mitraId,
                    'bulan' => $filterBulan && $filterBulan !== 'semua' ? (string) $filterBulan : (string) ($firstP->bulan ?? date('m')),
                    'tahun' => $filterTahun && $filterTahun !== 'tahunan' ? (string) $filterTahun : (string) ($firstP->tahun ?? date('Y')),
                    'tanggal_mulai' => $tanggalMulaiAll ? $tanggalMulaiAll->format('Y-m-d') : '',
                    'tanggal_selesai' => $tanggalSelesaiAll ? $tanggalSelesaiAll->format('Y-m-d') : '',
                    'details' => $details,
                ];
            }
        }

        return Inertia::render('Spk/Create', [
            'mitras' => $mitras,
            'kegiatans' => $kegiatans,
            'autoFill' => $autoFill,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mitra_id' => 'required|exists:mitras,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2000|max:2100',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:draft,terbit',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.kegiatan_id' => 'required|exists:kegiatans,id',
            'details.*.uraian_tugas' => 'required|string',
            'details.*.tanggal_mulai_detail' => 'required|date',
            'details.*.tanggal_selesai_detail' => 'required|date|after_or_equal:details.*.tanggal_mulai_detail',
            'details.*.volume' => 'required|integer|min:1',
            'details.*.satuan' => 'required|string',
            'details.*.harga_satuan' => 'required|numeric|min:0',
            'details.*.nilai' => 'required|numeric|min:0',
            'details.*.kode_anggaran' => 'nullable|string',
            'details.*.akun_anggaran' => 'nullable|string',
        ]);

        $user = auth()->user();
        
        // Hitung total nilai
        $totalNilai = collect($request->details)->sum(fn($d) => $d['nilai']);

        // Validasi batas SBML
        $sbmlLimit = SbmlLimit::where('tahun', $request->tahun)->first();
        if ($sbmlLimit && $totalNilai > $sbmlLimit->batas_maksimal) {
            return back()->withErrors(['details' => 'Total nilai SPK (' . number_format($totalNilai, 0, ',', '.') . ') melebihi batas maksimal SBML (' . number_format($sbmlLimit->batas_maksimal, 0, ',', '.') . ').'])->withInput();
        }

        $spk = Spk::create([
            'mitra_id' => $request->mitra_id,
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'ppk_user_id' => $user->id,
            'nama_ppk_snapshot' => $user->name ?? $user->username,
            'nip_ppk_snapshot' => $user->nip ?? '-',
            'jabatan_ppk_snapshot' => $user->jabatan ?? 'Pejabat Pembuat Komitmen',
            'total_nilai' => $totalNilai,
            'status' => $request->status,
            'catatan' => $request->catatan,
        ]);

        foreach ($request->details as $detail) {
            SpkDetail::create([
                'spk_id' => $spk->id,
                'kegiatan_id' => $detail['kegiatan_id'],
                'uraian_tugas' => $detail['uraian_tugas'],
                'tanggal_mulai_detail' => $detail['tanggal_mulai_detail'],
                'tanggal_selesai_detail' => $detail['tanggal_selesai_detail'],
                'volume' => $detail['volume'],
                'satuan' => $detail['satuan'],
                'harga_satuan' => $detail['harga_satuan'],
                'nilai' => $detail['nilai'],
                'kode_anggaran' => $detail['kode_anggaran'] ?? null,
                'akun_anggaran' => $detail['akun_anggaran'] ?? null,
            ]);
        }

        return redirect()->route('spk.index')->with('success', 'Surat Perintah Kerja (SPK) berhasil dibuat.');
    }

    public function show(Spk $spk)
    {
        $spk->load(['mitra', 'ppk', 'details.kegiatan']);

        return Inertia::render('Spk/Show', [
            'spk' => $spk,
        ]);
    }

    public function edit(Spk $spk)
    {
        if ($spk->status === 'terbit' && !in_array(auth()->user()->role, ['admin', 'administrator'])) {
            return redirect()->route('spk.index')->with('error', 'SPK yang sudah terbit tidak dapat diubah.');
        }

        $spk->load(['mitra', 'details.kegiatan']);
        $mitras = Mitra::where('status_aktif', true)->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'sobat_id', 'kecamatan']);
        $kegiatans = Kegiatan::where('status_aktif', true)->with('detilKegiatan')->orderBy('nama_kegiatan')->get();

        return Inertia::render('Spk/Edit', [
            'spk' => $spk,
            'mitras' => $mitras,
            'kegiatans' => $kegiatans,
        ]);
    }

    public function update(Request $request, Spk $spk)
    {
        $request->validate([
            'mitra_id' => 'required|exists:mitras,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2000|max:2100',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:draft,terbit,selesai,dibayar,batal',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.kegiatan_id' => 'required|exists:kegiatans,id',
            'details.*.uraian_tugas' => 'required|string',
            'details.*.tanggal_mulai_detail' => 'required|date',
            'details.*.tanggal_selesai_detail' => 'required|date|after_or_equal:details.*.tanggal_mulai_detail',
            'details.*.volume' => 'required|integer|min:1',
            'details.*.satuan' => 'required|string',
            'details.*.harga_satuan' => 'required|numeric|min:0',
            'details.*.nilai' => 'required|numeric|min:0',
            'details.*.kode_anggaran' => 'nullable|string',
            'details.*.akun_anggaran' => 'nullable|string',
        ]);

        $totalNilai = collect($request->details)->sum(fn($d) => $d['nilai']);

        $spk->update([
            'mitra_id' => $request->mitra_id,
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'total_nilai' => $totalNilai,
            'status' => $request->status,
            'catatan' => $request->catatan,
        ]);

        // Sync details
        $spk->details()->delete();
        foreach ($request->details as $detail) {
            SpkDetail::create([
                'spk_id' => $spk->id,
                'kegiatan_id' => $detail['kegiatan_id'],
                'uraian_tugas' => $detail['uraian_tugas'],
                'tanggal_mulai_detail' => $detail['tanggal_mulai_detail'],
                'tanggal_selesai_detail' => $detail['tanggal_selesai_detail'],
                'volume' => $detail['volume'],
                'satuan' => $detail['satuan'],
                'harga_satuan' => $detail['harga_satuan'],
                'nilai' => $detail['nilai'],
                'kode_anggaran' => $detail['kode_anggaran'] ?? null,
                'akun_anggaran' => $detail['akun_anggaran'] ?? null,
            ]);
        }

        return redirect()->route('spk.index')->with('success', 'SPK berhasil diperbarui.');
    }

    public function destroy(Spk $spk)
    {
        $spk->delete();
        return redirect()->route('spk.index')->with('success', 'SPK berhasil dihapus.');
    }

    public function exportPdf(Spk $spk)
    {
        $spk->load(['mitra', 'ppk', 'details.kegiatan']);
        $pdf = Pdf::loadView('pdf.spk', compact('spk'))->setPaper('a4', 'portrait');
        return $pdf->stream("SPK-{$spk->id}-{$spk->mitra->nama_lengkap}.pdf");
    }
}
