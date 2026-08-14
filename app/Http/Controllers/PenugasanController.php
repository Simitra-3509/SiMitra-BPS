<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\AkunKegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Http\Requests\StorePenugasanRequest;
use App\Http\Requests\UpdatePenugasanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenugasanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Penugasan::with(['mitra', 'kegiatan', 'detilKegiatan', 'honoraria'])
            ->whereNull('deleted_at');

        // Filter jenis_sbml (kolom di DB: detil_kegiatan.jenis_sbml)
        if ($request->filled('jenis_sbml')) {
            $query->whereHas('detilKegiatan', fn($q) =>
                $q->where('jenis_sbml', $request->jenis_sbml)
            );
        }

        // Filter kegiatan_id
        if ($request->filled('kegiatan_id')) {
            $query->where('kegiatan_id', $request->kegiatan_id);
        }

        // Filter status honor
        if ($request->filled('status_honor')) {
            if ($request->status_honor === 'sudah') {
                $query->whereHas('honoraria');
            } elseif ($request->status_honor === 'belum') {
                $query->whereDoesntHave('honoraria');
            }
        }

        // Search nama/NIK mitra atau nama kegiatan
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('mitra', fn($m) =>
                    $m->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                )->orWhereHas('kegiatan', fn($k) =>
                    $k->where('nama_kegiatan', 'like', "%{$search}%")
                );
            });
        }

        $penugasan = $query->latest()->paginate(15)->withQueryString();

        // Kegiatan aktif tanpa mitra (untuk warning banner)
        $kegiatanTanpaMitra = Kegiatan::with('akunKegiatan.detilKegiatan')
            ->where('status_aktif', true)
            ->whereDoesntHave('penugasans')
            ->get();

        // Data untuk filter dropdown
        $semuaKegiatan = Kegiatan::where('status_aktif', true)
            ->get(['id', 'nama_kegiatan']);

        return Inertia::render('Penugasan/Index', [
            'penugasan'          => $penugasan,
            'kegiatanTanpaMitra' => $kegiatanTanpaMitra,
            'semuaKegiatan'      => $semuaKegiatan,
            'filters'            => $request->only(['jenis_sbml', 'kegiatan_id', 'status_honor', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kegiatan = Kegiatan::where('status_aktif', true)->get(['id', 'nama_kegiatan', 'kro']);
        $kecamatanList = Mitra::whereNotNull('kecamatan')
            ->where('kecamatan', '!=', '')
            ->distinct()
            ->pluck('kecamatan')
            ->sort()
            ->values();

        return Inertia::render('Penugasan/Create', [
            'kegiatanList'  => $kegiatan,
            'kecamatanList' => $kecamatanList,
        ]);
    }

    /**
     * AJAX Endpoint 1: GET Akun by kegiatan_id
     */
    public function getAkunByKegiatan($kegiatan_id)
    {
        $akun = AkunKegiatan::where('kegiatan_id', $kegiatan_id)->get(['id', 'kode_akun', 'nama_akun']);
        return response()->json($akun);
    }

    /**
     * AJAX Endpoint 2: GET Detil by akun_id (with quota usage count)
     */
    public function getDetilByAkun($akun_id)
    {
        $detils = DetilKegiatan::where('akun_id', $akun_id)->get();
        
        $result = $detils->map(function ($detil) {
            $terpakaiBulan = Penugasan::where('detil_kegiatan_id', $detil->id)
                ->selectRaw('COUNT(DISTINCT CONCAT(bulan, "-", tahun)) as total')
                ->value('total') ?? 0;
            
            // Total volume kuota_target yang sudah ditugaskan untuk detil ini (di semua periode)
            $totalKuotaTerpakai = (float)Penugasan::where('detil_kegiatan_id', $detil->id)->sum('kuota_target');

            return [
                'id'                   => $detil->id,
                'nama_detil'           => $detil->nama_detil,
                'jenis_sbml'           => $detil->jenis_sbml,
                'frekuensi_penugasan'   => $detil->frekuensi_penugasan,
                'satuan'               => $detil->satuan,
                'harga_satuan'         => (float)$detil->harga_satuan,
                'jumlah'               => (float)$detil->jumlah,
                'total'                => (float)$detil->total,
                'terpakai_bulan'       => (int)$terpakaiBulan,
                'total_kuota_terpakai' => $totalKuotaTerpakai,
            ];
        });

        return response()->json($result);
    }

    /**
     * AJAX Endpoint 3: Search Mitra by keyword & filters for Modal Picker
     */
    public function searchMitra(Request $request)
    {
        $q = trim($request->get('q', ''));
        $kecamatan = trim($request->get('kecamatan', ''));
        $status = $request->get('status_aktif', '1');

        $query = Mitra::query();

        if ($status !== '' && $status !== null && $status !== 'all') {
            $query->where('status_aktif', filter_var($status, FILTER_VALIDATE_BOOLEAN));
        }

        if ($kecamatan !== '') {
            $query->where('kecamatan', $kecamatan);
        }

        if (mb_strlen($q) >= 2) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nama_lengkap', 'like', "%{$q}%")
                    ->orWhere('sobat_id', 'like', "%{$q}%");
            });
        } elseif ($q !== '') {
            // Kalau kurang dari 2 karakter, kembalikan array kosong
            return response()->json([]);
        }

        $mitras = $query->limit(20)->get([
            'id', 'sobat_id', 'nama_lengkap', 'kecamatan', 'desa', 'status_aktif'
        ]);

        return response()->json($mitras);
    }

    /**
     * AJAX Endpoint 4: GET Previous Month Assignments for Copy Feature
     */
    public function getPrevMonthPenugasan(Request $request)
    {
        $detilId = $request->get('detil_kegiatan_id');
        $bulanCurrent = $request->get('bulan');
        $tahunCurrent = (int)$request->get('tahun', date('Y'));

        if (!$detilId || !$bulanCurrent) {
            return response()->json(['prev_bulan' => '', 'prev_tahun' => $tahunCurrent, 'data' => []]);
        }

        $months = [
            'Januari' => 1, 'Februari' => 2, 'Maret' => 3, 'April' => 4,
            'Mei' => 5, 'Juni' => 6, 'Juli' => 7, 'Agustus' => 8,
            'September' => 9, 'Oktober' => 10, 'November' => 11, 'Desember' => 12
        ];

        $monthNum = $months[$bulanCurrent] ?? date('n');
        if ($monthNum === 1) {
            $prevMonthNum = 12;
            $prevTahun = $tahunCurrent - 1;
        } else {
            $prevMonthNum = $monthNum - 1;
            $prevTahun = $tahunCurrent;
        }

        $monthNames = array_flip($months);
        $prevBulanName = $monthNames[$prevMonthNum] ?? 'Desember';

        $penugasans = Penugasan::with('mitra')
            ->where('detil_kegiatan_id', $detilId)
            ->where('bulan', $prevBulanName)
            ->where('tahun', $prevTahun)
            ->get();

        $result = $penugasans->map(function ($p) {
            return [
                'mitra_id'     => $p->mitra_id,
                'sobat_id'     => $p->mitra->sobat_id ?? '',
                'nama_lengkap' => $p->mitra->nama_lengkap ?? '',
                'kuota_target' => $p->kuota_target ?? 1,
            ];
        });

        return response()->json([
            'prev_bulan' => $prevBulanName,
            'prev_tahun' => $prevTahun,
            'data'       => $result,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kegiatan_id'           => 'required|exists:kegiatans,id',
            'akun_id'               => 'required|exists:akun_kegiatan,id',
            'detil_kegiatan_id'     => 'required|exists:detil_kegiatan,id',
            'bulan'                 => 'required|string',
            'tahun'                 => 'required|integer',
            'mitras'                => 'required|array|min:1',
            'mitras.*.id'           => 'required|exists:mitras,id',
            'mitras.*.kuota_target' => 'required|numeric|min:1',
        ], [
            'kegiatan_id.required'           => 'Kegiatan wajib dipilih.',
            'akun_id.required'               => 'Akun kegiatan wajib dipilih.',
            'detil_kegiatan_id.required'     => 'Detil rincian wajib dipilih.',
            'bulan.required'                 => 'Bulan wajib dipilih.',
            'tahun.required'                 => 'Tahun wajib diisi.',
            'mitras.required'                => 'Minimal 1 mitra harus dipilih.',
            'mitras.min'                     => 'Minimal 1 mitra harus dipilih.',
            'mitras.*.kuota_target.required' => 'Kuota per mitra wajib diisi.',
            'mitras.*.kuota_target.min'      => 'Kuota per mitra minimal 1.',
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->mitras as $mitraItem) {
                    $exists = Penugasan::where('detil_kegiatan_id', $request->detil_kegiatan_id)
                        ->where('mitra_id', $mitraItem['id'])
                        ->where('bulan', $request->bulan)
                        ->where('tahun', $request->tahun)
                        ->exists();

                    if ($exists) {
                        $mitra = Mitra::find($mitraItem['id']);
                        $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';
                        throw new \Exception("Mitra {$namaMitra} sudah ditugaskan ke detil ini pada bulan {$request->bulan} {$request->tahun}.");
                    }

                    Penugasan::create([
                        'kegiatan_id'       => $request->kegiatan_id,
                        'detil_kegiatan_id' => $request->detil_kegiatan_id,
                        'mitra_id'          => $mitraItem['id'],
                        'bulan'             => $request->bulan,
                        'tahun'             => $request->tahun,
                        'kuota_target'      => $mitraItem['kuota_target'] ?? 1,
                        'status'            => 'ditugaskan',
                    ]);
                }
            });
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['mitras' => 'Terjadi duplikasi penugasan: Mitra sudah ditugaskan ke detil ini pada periode yang sama.']);
        } catch (\Exception $e) {
            return back()->withErrors(['mitras' => $e->getMessage()]);
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
        $penugasan->load(['kegiatan', 'mitra']);
        $kegiatan = Kegiatan::where('status_aktif', true)->get(['id', 'nama_kegiatan']);
        $mitra    = Mitra::where('status_aktif', true)->get(['id', 'nama_lengkap', 'nik']);

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
        $penugasan->update($request->validated());

        return redirect()->route('penugasan.index')->with('success', 'Penugasan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Penugasan $penugasan)
    {
        $penugasan->delete();

        return back()->with('success', 'Penugasan berhasil dihapus.');
    }

    /**
     * Bulk delete multiple penugasan records.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id',
        ]);

        Penugasan::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' penugasan berhasil dihapus.');
    }
}
