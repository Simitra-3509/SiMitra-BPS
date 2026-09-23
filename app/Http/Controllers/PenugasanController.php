<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Models\PeriodePengisian;
use App\Http\Requests\UpdatePenugasanRequest;
use App\Services\PenugasanService;
use App\Services\PenugasanImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PenugasanController extends Controller implements HasMiddleware
{
    public function __construct(
        protected PenugasanService $penugasanService,
        protected PenugasanImportService $importService,
    ) {}
    public static function middleware(): array
    {
        return [
            new Middleware('role:operator,admin', only: [
                'create', 'store', 'edit', 'update', 'destroy', 
                'bulkDestroy', 'restore', 'forceDelete', 
                'bulkRestore', 'bulkForceDelete'
            ]),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Query kelompok penugasan (Kegiatan + Detil + Bulan + Tahun)
        $groupQuery = Penugasan::query()
            ->select('kegiatan_id', 'detil_kegiatan_id', 'bulan', 'tahun', DB::raw('MAX(id) as max_id'))
            ->whereNull('deleted_at');

        if ($request->filled('jenis_sbml')) {
            $groupQuery->whereHas('detilKegiatan', function ($q) use ($request) {
                $q->where('jenis_sbml', $request->jenis_sbml);
            });
        }

        if ($request->filled('kegiatan_id')) {
            $groupQuery->where('kegiatan_id', $request->kegiatan_id);
        }

        if ($request->filled('detil_kegiatan_id')) {
            $groupQuery->where('detil_kegiatan_id', $request->detil_kegiatan_id);
        }

        if ($request->filled('bulan')) {
            $groupQuery->where('bulan', $request->bulan);
        }

        // Filter Tahun: default ke tahun berjalan saat pertama kali membuka halaman
        $tahunFilter = $request->input('tahun');
        if (!$request->has('tahun')) {
            $tahunFilter = (string) date('Y');
        }

        if (!empty($tahunFilter) && $tahunFilter !== 'semua') {
            $groupQuery->where('tahun', $tahunFilter);
        }

        if ($request->filled('tanggal_mulai')) {
            $groupQuery->where('tanggal_mulai', '>=', $request->tanggal_mulai);
        }

        if ($request->filled('tanggal_selesai')) {
            $groupQuery->where('tanggal_selesai', '<=', $request->tanggal_selesai);
        }

        if ($request->filled('search')) {
            $groupQuery->where(function($sub) use ($request) {
                $sub->whereHas('mitra', function ($q) use ($request) {
                    $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                      ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
                })->orWhereHas('kegiatan', function ($q) use ($request) {
                    $q->where('nama_kegiatan', 'like', '%' . $request->search . '%');
                })->orWhereHas('detilKegiatan', function ($q) use ($request) {
                    $q->where('nama_detil', 'like', '%' . $request->search . '%');
                });
            });
        }

        $groupQuery->groupBy('kegiatan_id', 'detil_kegiatan_id', 'bulan', 'tahun')
            ->orderByDesc('max_id');

        $paginatedGroups = $groupQuery->paginate(5)->withQueryString();

        // 2. Map grouped collection dan load item penugasan serta relasinya
        $groupedData = $paginatedGroups->getCollection()->map(function ($g) {
            $items = Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra'])
                ->where('kegiatan_id', $g->kegiatan_id)
                ->where('detil_kegiatan_id', $g->detil_kegiatan_id)
                ->where('bulan', $g->bulan)
                ->where('tahun', $g->tahun)
                ->get();

            $first = $items->first();
            $sumHonor = (float) $items->sum('total_honor');
            $sumKuota = (float) $items->sum('kuota_target');

            return [
                'id'                 => $first?->id,
                'key'                => "{$g->kegiatan_id}_{$g->detil_kegiatan_id}_{$g->bulan}_{$g->tahun}",
                'kegiatan_id'        => $g->kegiatan_id,
                'detil_kegiatan_id'  => $g->detil_kegiatan_id,
                'bulan'              => $g->bulan,
                'tahun'              => $g->tahun,
                'kegiatan'           => $first?->kegiatan,
                'detil_kegiatan'     => $first?->detilKegiatan,
                'detilKegiatan'      => $first?->detilKegiatan,
                'totalKuota'         => $sumKuota,
                'kuota_target'       => $sumKuota,
                'totalHonor'         => $sumHonor,
                'total_honor'        => $sumHonor,
                'items'              => $items,
            ];
        });

        $paginatedGroups->setCollection($groupedData);
        $penugasan = $paginatedGroups;
        $semuaKegiatan = Kegiatan::orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan', 'kode_kegiatan']);

        $tahunList = Penugasan::distinct()->whereNotNull('tahun')->pluck('tahun')->map(fn($t) => (int)$t)->sort()->values()->toArray();
        if (empty($tahunList)) {
            $currentYr = (int) date('Y');
            $tahunList = [$currentYr - 1, $currentYr, $currentYr + 1];
        }

        $targetBulan = (int) ($request->input('bulan') ?: date('n'));
        $targetTahun = (int) ($tahunFilter ?: date('Y'));

        $periodeAktif = PeriodePengisian::where('bulan', $targetBulan)
            ->where('tahun', $targetTahun)
            ->first();

        $statusPeriode = [
            'bulan'      => $targetBulan,
            'tahun'      => $targetTahun,
            'status'     => $periodeAktif?->status ?? 'terbuka',
            'is_locked'  => ($periodeAktif?->status ?? 'terbuka') === 'terkunci',
            'dikunci_at' => $periodeAktif?->dikunci_at ? \Carbon\Carbon::parse($periodeAktif->dikunci_at)->format('d M Y H:i') : null,
        ];

        $filters = $request->only(['kegiatan_id', 'detil_kegiatan_id', 'bulan', 'search', 'jenis_sbml', 'status_honor']);
        $filters['tahun'] = $tahunFilter;

        return Inertia::render('Penugasan/Index', [
            'penugasan'     => $penugasan,
            'semuaKegiatan' => $semuaKegiatan,
            'tahunList'     => $tahunList,
            'statusPeriode' => $statusPeriode,
            'filters'       => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }

        $kegiatan = Kegiatan::where('status_aktif', true)->orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan', 'kode_kegiatan']);
        $kecamatanList = Mitra::whereNotNull('kecamatan')
            ->where('kecamatan', '!=', '')
            ->select('kecamatan')
            ->distinct()
            ->orderBy('kecamatan')
            ->pluck('kecamatan');

        return Inertia::render('Penugasan/Create', [
            'kegiatan'      => $kegiatan,
            'kegiatanList'  => $kegiatan,
            'kecamatanList' => $kecamatanList,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }

        $request->validate([
            'kegiatan_id'           => 'required|exists:kegiatans,id',
            'detil_kegiatan_id'     => 'required|exists:detil_kegiatan,id',
            'bulan'                 => 'required|integer|min:1|max:12',
            'tahun'                 => 'required|integer|min:2000|max:2100',
            'mitras'                => 'required|array|min:1',
            'mitras.*.id'           => 'required|exists:mitras,id',
            'mitras.*.kuota_target' => 'required|numeric|min:1',
            'tanggal_mulai'         => 'nullable|date',
            'tanggal_selesai'       => 'nullable|date|after_or_equal:tanggal_mulai',
        ], [
            'kegiatan_id.required'           => 'Kegiatan wajib dipilih.',
            'detil_kegiatan_id.required'     => 'Detil rincian wajib dipilih.',
            'bulan.required'                 => 'Bulan penugasan wajib dipilih.',
            'tahun.required'                 => 'Tahun penugasan wajib diisi.',
            'mitras.required'                => 'Minimal 1 mitra harus dipilih.',
            'mitras.min'                     => 'Minimal 1 mitra harus dipilih.',
            'mitras.*.kuota_target.required' => 'Kuota per mitra wajib diisi.',
            'mitras.*.kuota_target.min'      => 'Kuota per mitra minimal 1.',
            'tanggal_mulai.date'             => 'Format tanggal mulai tidak valid.',
            'tanggal_selesai.date'           => 'Format tanggal selesai tidak valid.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ]);

        $userRole = strtolower(auth()->user()->role ?? '');
        $bulanNum = (int) $request->bulan;
        $tahunNum = (int) $request->tahun;

        // Validasi periode terkunci
        try {
            $this->penugasanService->validasiPeriode($bulanNum, $tahunNum, $userRole);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['periode' => $e->getMessage()])->withInput();
        }

        // Validasi tanggal vs bulan
        $errTanggal = $this->penugasanService->validasiTanggal(
            $request->tanggal_mulai, $request->tanggal_selesai, $bulanNum, $tahunNum
        );
        if ($errTanggal) {
            return back()->withErrors($errTanggal)->withInput();
        }

        try {
            $this->penugasanService->storeBatch(
                (int) $request->kegiatan_id,
                (int) $request->detil_kegiatan_id,
                $bulanNum,
                $tahunNum,
                $request->mitras,
                $request->tanggal_mulai,
                $request->tanggal_selesai
            );
        } catch (\Illuminate\Database\QueryException) {
            return back()->withErrors(['mitras' => 'Terjadi duplikasi penugasan: Mitra sudah ditugaskan ke detil ini pada periode yang sama.'])->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['mitras' => $e->getMessage()])->withInput();
        }

        return redirect()->route('penugasan.index')
            ->with('success', count($request->mitras) . ' penugasan mitra berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Penugasan $penugasan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Penugasan $penugasan)
    {
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }
        $penugasan->load(['kegiatan', 'mitra']);
        $kegiatan = Kegiatan::where('status_aktif', true)->orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan', 'kode_kegiatan']);
        $mitra    = Mitra::where('status_aktif', true)->get(['id', 'nama_lengkap', 'sobat_id']);

        return Inertia::render('Penugasan/Edit', [
            'penugasan' => $penugasan,
            'kegiatan'  => $kegiatan,
            'mitra'     => $mitra,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePenugasanRequest $request, Penugasan $penugasan)
    {
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }

        $userRole    = strtolower(auth()->user()->role ?? '');
        $validated   = $request->validated();
        $bulanNum    = (int) ($validated['bulan'] ?? $penugasan->bulan);
        $tahunNum    = (int) ($validated['tahun'] ?? $penugasan->tahun);
        $detilId     = $validated['detil_kegiatan_id'] ?? $penugasan->detil_kegiatan_id;
        $mitraId     = $validated['mitra_id']           ?? $penugasan->mitra_id;
        $kuotaTarget = (float) ($validated['kuota_target'] ?? $penugasan->kuota_target);
        $tglMulai    = $validated['tanggal_mulai']   ?? null;
        $tglSelesai  = $validated['tanggal_selesai'] ?? null;

        // Validasi periode terkunci
        try {
            $this->penugasanService->validasiPeriode($bulanNum, $tahunNum, $userRole);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['periode' => $e->getMessage()])->withInput();
        }

        // Validasi tanggal vs bulan (pesan error menyebut nama bulan)
        $bulanNama = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret',     4 => 'April',
            5 => 'Mei',     6 => 'Juni',      7 => 'Juli',      8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        if ($tglMulai) {
            $dtMulai = \Carbon\Carbon::parse($tglMulai);
            if ($dtMulai->month !== $bulanNum || $dtMulai->year !== $tahunNum) {
                return back()->withErrors(['tanggal_mulai' => "Tanggal mulai harus berada dalam rentang bulan {$bulanNama[$bulanNum]} {$tahunNum}."])->withInput();
            }
        }
        if ($tglSelesai) {
            $dtSelesai = \Carbon\Carbon::parse($tglSelesai);
            if ($dtSelesai->month !== $bulanNum || $dtSelesai->year !== $tahunNum) {
                return back()->withErrors(['tanggal_selesai' => "Tanggal selesai harus berada dalam rentang bulan {$bulanNama[$bulanNum]} {$tahunNum}."])->withInput();
            }
        }

        try {
            $this->penugasanService->updateSingle(
                $validated, $penugasan, $detilId, $mitraId, $kuotaTarget, $bulanNum, $tahunNum
            );
        } catch (\Exception $e) {
            return back()->withErrors(['kuota_target' => $e->getMessage()])->withInput();
        }

        return redirect()->route('penugasan.index')->with('success', 'Perubahan data penugasan mitra berhasil disimpan.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Penugasan $penugasan)
    {
        $userRole = strtolower(auth()->user()->role ?? '');
        if (!in_array($userRole, ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }

        // Cek apakah periode penugasan sudah dikunci oleh PPK
        $bulanNum = (int)$penugasan->bulan;
        $tahunNum = (int)$penugasan->tahun;
        $periode = PeriodePengisian::where('bulan', $bulanNum)->where('tahun', $tahunNum)->first();

        if ($periode && $periode->status === 'terkunci' && $userRole !== 'ppk') {
            return back()->withErrors([
                'periode' => "Periode {$bulanNum}/{$tahunNum} sudah dikunci oleh PPK. Data penugasan pada periode ini tidak dapat dihapus."
            ]);
        }

        $penugasan->delete();

        return back()->with('success', '1 penugasan mitra berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Bulk delete multiple penugasan records.
     */
    public function bulkDestroy(Request $request)
    {
        $userRole = strtolower(auth()->user()->role ?? '');
        if (!in_array($userRole, ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }

        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id',
        ]);

        $penugasans = Penugasan::whereIn('id', $request->ids)->get();

        if ($userRole !== 'ppk') {
            $lockedPeriods = [];
            foreach ($penugasans as $p) {
                $periode = PeriodePengisian::where('bulan', (int)$p->bulan)->where('tahun', (int)$p->tahun)->first();
                if ($periode && $periode->status === 'terkunci') {
                    $lockedPeriods[] = "{$p->bulan}/{$p->tahun}";
                }
            }

            if (!empty($lockedPeriods)) {
                $lockedList = implode(', ', array_unique($lockedPeriods));
                return back()->withErrors([
                    'periode' => "Sebagian data penugasan berada pada periode yang sudah dikunci oleh PPK ({$lockedList}). Penghapusan dibatalkan."
                ]);
            }
        }

        Penugasan::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' data penugasan mitra berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Import / Upsert Penugasan Mitra dari file Excel.
     * Delegate ke PenugasanImportService.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes'    => 'File harus berformat .xlsx atau .xls.',
            'file.max'      => 'Ukuran file maksimal 10MB.',
        ]);

        try {
            $result = $this->importService->import($request->file('file'));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['import' => $e->getMessage()]);
        }

        if (empty($result['count'])) {
            return redirect()->back()->withErrors([
                'import'      => count($result['errors'])
                    ? 'Terjadi kesalahan pada data (contoh: Kode KRO, Sobat ID tidak ditemukan).'
                    : 'File Excel tidak berisi data penugasan yang valid. Pastikan format baris sesuai dengan template.',
                'import_list' => array_slice($result['errors'], 0, 50),
            ]);
        }

        return redirect()->back()->with(
            'success',
            "Berhasil meng-import / meng-update {$result['count']} data Penugasan Mitra."
        );
    }
}
