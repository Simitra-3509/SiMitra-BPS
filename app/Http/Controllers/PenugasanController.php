<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Models\PeriodePengisian;
use App\Models\SbmlLimit;
use App\Http\Requests\UpdatePenugasanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PenugasanController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role:operator', only: [
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
        $query = Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra']);

        if ($request->filled('kegiatan_id')) {
            $query->where('kegiatan_id', $request->kegiatan_id);
        }

        if ($request->filled('detil_kegiatan_id')) {
            $query->where('detil_kegiatan_id', $request->detil_kegiatan_id);
        }

        if ($request->filled('tanggal_mulai')) {
            $query->where('tanggal_mulai', '>=', $request->tanggal_mulai);
        }

        if ($request->filled('tanggal_selesai')) {
            $query->where('tanggal_selesai', '<=', $request->tanggal_selesai);
        }

        if ($request->filled('search')) {
            $query->whereHas('mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
            });
        }

        $penugasan = $query->latest()->paginate(15)->withQueryString();
        $semuaKegiatan = Kegiatan::orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan', 'kode_kegiatan']);

        $tahunList = Penugasan::distinct()->whereNotNull('tahun')->pluck('tahun')->map(fn($t) => (int)$t)->sort()->values()->toArray();
        if (empty($tahunList)) {
            $currentYr = (int) date('Y');
            $tahunList = [$currentYr - 1, $currentYr, $currentYr + 1];
        }

        $targetBulan = (int) ($request->input('bulan') ?: date('n'));
        $targetTahun = (int) ($request->input('tahun') ?: date('Y'));

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

        return Inertia::render('Penugasan/Index', [
            'penugasan'     => $penugasan,
            'semuaKegiatan' => $semuaKegiatan,
            'tahunList'     => $tahunList,
            'statusPeriode' => $statusPeriode,
            'filters'       => $request->only(['kegiatan_id', 'detil_kegiatan_id', 'bulan', 'tahun', 'search', 'jenis_sbml', 'status_honor']),
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

        return Inertia::render('Penugasan/Create', [
            'kegiatan'     => $kegiatan,
            'kegiatanList' => $kegiatan,
        ]);
    }

    /**
     * API: Fetch Detil Belanja by Kegiatan ID
     */
    public function getDetilByKegiatan($kegiatan_id)
    {
        $detilList = DetilKegiatan::where('kegiatan_id', $kegiatan_id)
            ->withSum('penugasans', 'kuota_target')
            ->get()
            ->map(function ($detil) {
                $detil->total_kuota_terpakai = (float)($detil->penugasans_sum_kuota_target ?? 0);
                return $detil;
            });

        return response()->json($detilList);
    }

    /**
     * API: Search Mitra (by Sobat ID / Nama Lengkap)
     */
    public function searchMitra(Request $request)
    {
        $q = trim($request->get('q', ''));
        $query = Mitra::where('status_aktif', true);

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('sobat_id', 'like', "%{$q}%")
                    ->orWhere('nama_lengkap', 'like', "%{$q}%");
            });
        }

        $mitraList = $query->orderBy('nama_lengkap')->limit(20)->get(['id', 'sobat_id', 'nama_lengkap']);
        return response()->json($mitraList);
    }

    /**
     * Helper: Parse Date String to Get Previous Month Range
     * We don't have this function anymore.
     */

    /**
     * API: Fetch Prev Month Penugasan for Copy Button
     */
    public function getPrevMonthPenugasan(Request $request)
    {
        $detilId = $request->get('detil_kegiatan_id');
        $bulan   = (int)$request->get('bulan');
        $tahun   = (int)$request->get('tahun');

        if (!$detilId || !$bulan || !$tahun) {
            return response()->json([]);
        }

        $prevPenugasan = Penugasan::with('mitra')
            ->where('detil_kegiatan_id', $detilId)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->get();

        $result = $prevPenugasan->map(function ($item) {
            return [
                'mitra_id'     => $item->mitra_id,
                'sobat_id'     => $item->mitra->sobat_id ?? '-',
                'nama_lengkap' => $item->mitra->nama_lengkap ?? 'Mitra',
                'kuota_target' => $item->kuota_target,
            ];
        });

        $namaBulanList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        return response()->json([
            'prev_bulan_nama' => $namaBulanList[$bulan] ?? '',
            'prev_tahun'      => $tahun,
            'data'            => $result,
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
        ], [
            'kegiatan_id.required'           => 'Kegiatan wajib dipilih.',
            'detil_kegiatan_id.required'     => 'Detil rincian wajib dipilih.',
            'bulan.required'                 => 'Bulan penugasan wajib dipilih.',
            'tahun.required'                 => 'Tahun penugasan wajib diisi.',
            'mitras.required'                => 'Minimal 1 mitra harus dipilih.',
            'mitras.min'                     => 'Minimal 1 mitra harus dipilih.',
            'mitras.*.kuota_target.required' => 'Kuota per mitra wajib diisi.',
            'mitras.*.kuota_target.min'      => 'Kuota per mitra minimal 1.',
        ]);

        // C.4 Validasi Periode Pengisian: Cek kunci sebelum store
        $userRole = strtolower(auth()->user()->role ?? '');
        $bulanNum = (int)$request->bulan;
        $tahunNum = (int)$request->tahun;

        $periode = PeriodePengisian::where('bulan', $bulanNum)->where('tahun', $tahunNum)->first();
        if ($periode && $periode->status === 'terkunci' && $userRole !== 'ppk') {
            return back()->withErrors(['periode' => "Periode {$bulanNum}/{$tahunNum} sudah dikunci. Hubungi PPK untuk membuka kunci."])->withInput();
        }

        $detil = DetilKegiatan::findOrFail($request->detil_kegiatan_id);
        $hargaSatuan  = (float)($detil->harga_satuan ?? 0);
        $jenisSbml    = $detil->jenis_sbml;
        $jumlahDipa   = (float)($detil->jumlah ?? 0); // Target volume DIPA

        // ── Validasi Kuota DIPA ─────────────────────────────────────────────────
        // Total kuota yang sudah tersimpan untuk detil ini (semua bulan/tahun)
        $kuotaTerpakai = (float)Penugasan::where('detil_kegiatan_id', $request->detil_kegiatan_id)
            ->sum('kuota_target');

        // Total kuota yang akan ditambahkan sekarang
        $kuotaBaru = collect($request->mitras)->sum(fn($m) => (float)($m['kuota_target'] ?? 0));

        if ($jumlahDipa > 0 && ($kuotaTerpakai + $kuotaBaru) > $jumlahDipa) {
            $sisa = max(0, $jumlahDipa - $kuotaTerpakai);
            return back()->withErrors([
                'mitras' => "Total kuota penugasan akan melebihi target DIPA untuk detil ini."
                          . " Target DIPA: " . number_format($jumlahDipa, 0, ',', '.')
                          . ", sudah terpakai: " . number_format($kuotaTerpakai, 0, ',', '.')
                          . ", sisa: " . number_format($sisa, 0, ',', '.')
                          . ". Input Anda menambahkan: " . number_format($kuotaBaru, 0, ',', '.') . "."
            ])->withInput();
        }
        // ────────────────────────────────────────────────────────────────────────

        try {
            DB::transaction(function () use ($request, $detil, $hargaSatuan, $jenisSbml) {
                foreach ($request->mitras as $mitraItem) {
                    $mitraId = $mitraItem['id'];
                    $kuotaTarget = (float)($mitraItem['kuota_target'] ?? 1);
                    $totalHonorBaru = $kuotaTarget * $hargaSatuan;

                    $exists = Penugasan::where('detil_kegiatan_id', $request->detil_kegiatan_id)
                        ->where('mitra_id', $mitraId)
                        ->where('bulan', $request->bulan)
                        ->where('tahun', $request->tahun)
                        ->exists();

                    if ($exists) {
                        $mitra = Mitra::find($mitraId);
                        $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';
                        throw new \Exception("Mitra {$namaMitra} sudah ditugaskan ke detil ini pada periode {$request->bulan}/{$request->tahun}.");
                    }

                    // C.3 Validasi SBML — Cek SBML limit per mitra
                    if ($jenisSbml) {
                        $totalTerpakai = (float)Penugasan::where('mitra_id', $mitraId)
                            ->where('bulan', $request->bulan)
                            ->where('tahun', $request->tahun)
                            ->whereHas('detilKegiatan', function ($q) use ($jenisSbml) {
                                $q->where('jenis_sbml', $jenisSbml);
                            })
                            ->sum('total_honor');

                        $sbmlLimit = SbmlLimit::where('jenis_kegiatan', $jenisSbml)
                            ->where('tahun', $request->tahun)
                            ->first();

                        if ($sbmlLimit) {
                            $batasSbml = (float)$sbmlLimit->batas_maksimal;
                            if (($totalTerpakai + $totalHonorBaru) > $batasSbml) {
                                $mitra = Mitra::find($mitraId);
                                $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';
                                $sisa = max(0, $batasSbml - $totalTerpakai);
                                throw new \Exception("Total honor mitra {$namaMitra} untuk {$jenisSbml} bulan {$request->bulan}/{$request->tahun} akan melebihi batas SBML (Rp " . number_format($batasSbml, 0, ',', '.') . "). Sudah terpakai: Rp " . number_format($totalTerpakai, 0, ',', '.') . ", sisa: Rp " . number_format($sisa, 0, ',', '.') . ".");
                            }
                        }
                    }

                    // C.1 Method store(): Hitung honor otomatis
                    Penugasan::create([
                        'kegiatan_id'           => $request->kegiatan_id,
                        'detil_kegiatan_id'     => $request->detil_kegiatan_id,
                        'mitra_id'              => $mitraId,
                        'bulan'                 => $request->bulan,
                        'tahun'                 => $request->tahun,
                        'kuota_target'          => $kuotaTarget,
                        'harga_satuan_snapshot' => $hargaSatuan,
                        'total_honor'           => $totalHonorBaru,
                        'status'                => 'ditugaskan',
                    ]);
                }
            });
        } catch (\Illuminate\Database\QueryException $e) {
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
        $userRole = strtolower(auth()->user()->role ?? '');
        $validated = $request->validated();

        $bulanNum = (int)($validated['bulan'] ?? $penugasan->bulan);
        $tahunNum = (int)($validated['tahun'] ?? $penugasan->tahun);

        // C.4 Validasi Periode Pengisian: Cek kunci sebelum update
        $periode = PeriodePengisian::where('bulan', $bulanNum)->where('tahun', $tahunNum)->first();
        if ($periode && $periode->status === 'terkunci' && $userRole !== 'ppk') {
            return back()->withErrors(['periode' => "Periode {$bulanNum}/{$tahunNum} sudah dikunci. Hubungi PPK untuk membuka kunci."])->withInput();
        }

        $detilId = $validated['detil_kegiatan_id'] ?? $penugasan->detil_kegiatan_id;
        $mitraId = $validated['mitra_id'] ?? $penugasan->mitra_id;
        $kuotaTarget = (float)($validated['kuota_target'] ?? $penugasan->kuota_target);

        $detil = DetilKegiatan::findOrFail($detilId);
        $hargaSatuan = (float)($detil->harga_satuan ?? 0);
        $totalHonorBaru = $kuotaTarget * $hargaSatuan;
        $jenisSbml = $detil->jenis_sbml;

        // C.3 Validasi SBML pada Update
        if ($jenisSbml) {
            $totalTerpakai = (float)Penugasan::where('mitra_id', $mitraId)
                ->where('bulan', $bulanNum)
                ->where('tahun', $tahunNum)
                ->where('id', '!=', $penugasan->id)
                ->whereHas('detilKegiatan', function ($q) use ($jenisSbml) {
                    $q->where('jenis_sbml', $jenisSbml);
                })
                ->sum('total_honor');

            $sbmlLimit = SbmlLimit::where('jenis_kegiatan', $jenisSbml)
                ->where('tahun', $tahunNum)
                ->first();

            if ($sbmlLimit) {
                $batasSbml = (float)$sbmlLimit->batas_maksimal;
                if (($totalTerpakai + $totalHonorBaru) > $batasSbml) {
                    $mitra = Mitra::find($mitraId);
                    $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';
                    $sisa = max(0, $batasSbml - $totalTerpakai);
                    return back()->withErrors([
                        'kuota_target' => "Total honor mitra {$namaMitra} untuk {$jenisSbml} bulan {$bulanNum}/{$tahunNum} akan melebihi batas SBML (Rp " . number_format($batasSbml, 0, ',', '.') . "). Sudah terpakai: Rp " . number_format($totalTerpakai, 0, ',', '.') . ", sisa: Rp " . number_format($sisa, 0, ',', '.') . "."
                    ])->withInput();
                }
            }
        }

        // ── Validasi Kuota DIPA pada Update ─────────────────────────────────────
        $jumlahDipa = (float)($detil->jumlah ?? 0);
        if ($jumlahDipa > 0) {
            // Total kuota tersimpan KECUALI record yang sedang diedit
            $kuotaTerpakai = (float)Penugasan::where('detil_kegiatan_id', $detilId)
                ->where('id', '!=', $penugasan->id)
                ->sum('kuota_target');

            if (($kuotaTerpakai + $kuotaTarget) > $jumlahDipa) {
                $sisa = max(0, $jumlahDipa - $kuotaTerpakai);
                return back()->withErrors([
                    'kuota_target' => "Kuota target melebihi sisa DIPA untuk detil ini."
                                   . " Target DIPA: " . number_format($jumlahDipa, 0, ',', '.')
                                   . ", sudah terpakai (mitra lain): " . number_format($kuotaTerpakai, 0, ',', '.')
                                   . ", sisa tersedia: " . number_format($sisa, 0, ',', '.') . "."
                ])->withInput();
            }
        }
        // ────────────────────────────────────────────────────────────────────────

        // C.2 Method update(): Recalculate snapshot & total_honor
        $validated['harga_satuan_snapshot'] = $hargaSatuan;
        $validated['total_honor']           = $totalHonorBaru;

        $penugasan->update($validated);

        return redirect()->route('penugasan.index')->with('success', 'Perubahan data penugasan mitra berhasil disimpan.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Penugasan $penugasan)
    {
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['operator', 'admin', 'administrator'])) {
            abort(403, 'Hanya Operator dan Admin yang berhak mengelola penugasan mitra.');
        }
        $penugasan->delete();

        return back()->with('success', '1 penugasan mitra berhasil dipindahkan ke Recycle Bin.');
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

        return back()->with('success', count($request->ids) . ' data penugasan mitra berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = Penugasan::onlyTrashed()->with(['kegiatan', 'detilKegiatan', 'mitra']);

        if ($request->filled('search')) {
            $query->whereHas('mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
            });
        }

        $penugasans = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Penugasan/RecycleBin', [
            'penugasans' => $penugasans,
            'filters'    => $request->only(['search']),
        ]);
    }

    /**
     * Restore data penugasan.
     */
    public function restore($id)
    {
        $penugasan = Penugasan::onlyTrashed()->findOrFail($id);
        $penugasan->restore();

        return redirect()->back()->with('success', 'Penugasan mitra berhasil dipulihkan dari Recycle Bin.');
    }

    /**
     * Force delete data penugasan.
     */
    public function forceDelete($id)
    {
        $penugasan = Penugasan::onlyTrashed()->findOrFail($id);
        $penugasan->forceDelete();

        return redirect()->back()->with('success', 'Penugasan mitra telah dihapus secara permanen.');
    }

    /**
     * Restore multiple resources from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id'
        ]);

        Penugasan::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra berhasil dipulihkan.');
    }

    /**
     * Force delete multiple resources from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id'
        ]);

        Penugasan::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra telah dihapus secara permanen.');
    }

    /**
     * Strict helper: Convert month input (string name or number) to integer (1-12) or null
     */
    private function parseBulanStrict($value)
    {
        if (is_numeric($value) && (int)$value >= 1 && (int)$value <= 12) {
            return (int)$value;
        }

        $bulanMap = [
            'januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4,
            'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8,
            'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12,
            'january' => 1, 'february' => 2, 'march' => 3, 'may' => 5,
            'june' => 6, 'july' => 7, 'august' => 8, 'october' => 10, 'december' => 12,
        ];

        $key = strtolower(trim((string)$value));
        return $bulanMap[$key] ?? null;
    }

    /**
     * Import / Upsert Penugasan Mitra from Excel JSON rows data.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes' => 'File harus berformat .xlsx atau .xls.',
            'file.max' => 'Ukuran file maksimal 10MB.',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $allRows = $sheet->toArray(null, true, true, true);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'import' => 'Gagal membaca file Excel: ' . $e->getMessage()
            ]);
        }

        if (count($allRows) < 2) {
            return redirect()->back()->withErrors([
                'import' => 'File Excel kosong atau hanya berisi header tanpa data.'
            ]);
        }

        // Cari baris header secara dinamis
        $headerRow = null;
        $headerRowNum = 1;
        $colMap = [];
        
        foreach ($allRows as $index => $row) {
            $foundKro = false;
            $foundDetil = false;
            $foundSobat = false;
            
            foreach ($row as $colLetter => $val) {
                if ($val !== null && trim((string)$val) !== '') {
                    $clean = strtolower(trim((string)$val));
                    if (str_contains($clean, 'kro') || str_contains($clean, 'kode')) $foundKro = true;
                    if (str_contains($clean, 'detil')) $foundDetil = true;
                    if (str_contains($clean, 'sobat') || str_contains($clean, 'id')) $foundSobat = true;
                }
            }
            
            if ($foundKro && $foundDetil && $foundSobat) {
                $headerRow = $row;
                $headerRowNum = $index;
                break;
            }
        }

        if (!$headerRow) {
             return redirect()->back()->withErrors([
                 'import' => 'Format header tidak ditemukan. Pastikan ada baris dengan kolom "Kode KRO", "Nama Detil", dan "Sobat ID".'
             ]);
        }

        // Hapus baris header dan baris di atasnya
        foreach (range(1, $headerRowNum) as $i) {
            unset($allRows[$i]);
        }

        $headers = array_map(function ($val) {
            return trim(strtolower((string)$val));
        }, $headerRow);

        $colMap = [];
        foreach ($headers as $colLetter => $headerName) {
            if (empty($headerName)) continue;
            if (str_contains($headerName, 'kode') || str_contains($headerName, 'kro')) {
                $colMap['kode_kro'] = $colLetter;
            } elseif (str_contains($headerName, 'nama detil') || str_contains($headerName, 'detil')) {
                $colMap['nama_detil'] = $colLetter;
            } elseif (str_contains($headerName, 'sobat') || str_contains($headerName, 'id')) {
                $colMap['sobat_id'] = $colLetter;
            } elseif ($headerName === 'bulan') {
                $colMap['bulan'] = $colLetter;
            } elseif ($headerName === 'tahun') {
                $colMap['tahun'] = $colLetter;
            } elseif (str_contains($headerName, 'kuota') || str_contains($headerName, 'target')) {
                $colMap['kuota_target'] = $colLetter;
            }
        }

        if (!isset($colMap['kode_kro']) || !isset($colMap['nama_detil']) || !isset($colMap['sobat_id'])) {
             return redirect()->back()->withErrors([
                 'import' => 'Format header tidak sesuai. Pastikan ada kolom "Kode KRO", "Nama Detil", dan "Sobat ID".'
             ]);
        }

        $errors = [];
        $validData = [];

        for ($rowNum = 2; $rowNum <= count($allRows); $rowNum++) {
            $row = $allRows[$rowNum];
            
            $isEmpty = true;
            foreach ($row as $val) {
                if ($val !== null && trim((string)$val) !== '') {
                    $isEmpty = false;
                    break;
                }
            }
            if ($isEmpty) continue;

            $kodeKro   = trim((string)($row[$colMap['kode_kro'] ?? ''] ?? ''));
            $namaDetil = trim((string)($row[$colMap['nama_detil'] ?? ''] ?? ''));
            $sobatId   = trim((string)($row[$colMap['sobat_id'] ?? ''] ?? ''));
            $bulanRaw  = trim((string)($row[$colMap['bulan'] ?? ''] ?? ''));
            $tahunRaw  = trim((string)($row[$colMap['tahun'] ?? ''] ?? ''));
            $kuotaRaw  = trim((string)($row[$colMap['kuota_target'] ?? ''] ?? ''));

            // 1. Validasi & Cari Kegiatan by Kode KRO
            if (empty($kodeKro)) {
                $errors[] = "Baris {$rowNum}: Kode KRO wajib diisi.";
                continue;
            }

            $kegiatan = Kegiatan::where('kode_kegiatan', $kodeKro)->first();
            if (!$kegiatan) {
                $errors[] = "Baris {$rowNum}: Kegiatan dengan Kode KRO '{$kodeKro}' tidak ditemukan.";
                continue;
            }

            // 2. Validasi & Cari DetilKegiatan by kegiatan_id + nama_detil
            if (empty($namaDetil)) {
                $errors[] = "Baris {$rowNum}: Nama Detil wajib diisi.";
                continue;
            }

            $detilKegiatan = DetilKegiatan::where('kegiatan_id', $kegiatan->id)
                ->where('nama_detil', $namaDetil)
                ->first();

            if (!$detilKegiatan) {
                $errors[] = "Baris {$rowNum}: Detil Kegiatan '{$namaDetil}' tidak ditemukan untuk Kode KRO '{$kodeKro}'.";
                continue;
            }

            // 3. Validasi & Cari Mitra by Sobat ID
            if (empty($sobatId)) {
                $errors[] = "Baris {$rowNum}: Sobat ID wajib diisi.";
                continue;
            }

            $mitra = Mitra::where('sobat_id', $sobatId)->first();
            if (!$mitra) {
                $errors[] = "Baris {$rowNum}: Mitra dengan Sobat ID '{$sobatId}' tidak ditemukan.";
                continue;
            }

            // 4. Validasi Bulan (Strict nama bulan -> integer 1-12)
            $bulanInt = $this->parseBulanStrict($bulanRaw);
            if (!$bulanInt) {
                $errors[] = "Baris {$rowNum}: Nama bulan '{$bulanRaw}' tidak dikenali (gunakan nama bulan Indonesia, contoh: 'Agustus').";
                continue;
            }

            // 5. Validasi Tahun
            $tahunInt = is_numeric($tahunRaw) ? (int)$tahunRaw : 0;
            if ($tahunInt < 2000 || $tahunInt > 2100) {
                $errors[] = "Baris {$rowNum}: Tahun ('{$tahunRaw}') tidak valid (harus berupa angka 4 digit).";
                continue;
            }

            // 6. Validasi Kuota Target
            $kuotaVal = is_numeric($kuotaRaw) ? (float)$kuotaRaw : 0;
            if ($kuotaVal <= 0) {
                $errors[] = "Baris {$rowNum}: Kuota Target ('{$kuotaRaw}') harus berupa angka lebih dari 0.";
                continue;
            }

            $validData[] = [
                'kegiatan_id'       => $kegiatan->id,
                'detil_kegiatan_id' => $detilKegiatan->id,
                'mitra_id'          => $mitra->id,
                'bulan'             => $bulanInt,
                'tahun'             => $tahunInt,
                'kuota_target'      => $kuotaVal,
                'status'            => 'ditugaskan',
            ];
        }

        if (count($validData) === 0) {
            $errMessage = 'File Excel tidak berisi data penugasan yang valid. Pastikan format baris sesuai dengan template.';
            if (count($errors) > 0) {
                $errMessage = 'Terjadi kesalahan pada data (contoh: Kode KRO, Sobat ID tidak ditemukan).';
            }
            return redirect()->back()->withErrors([
                'import' => $errMessage,
                'import_list' => array_slice($errors, 0, 50)
            ]);
        }

        DB::transaction(function () use ($validData) {
            foreach ($validData as $data) {
                Penugasan::updateOrCreate(
                    [
                        'detil_kegiatan_id' => $data['detil_kegiatan_id'],
                        'mitra_id'          => $data['mitra_id'],
                        'bulan'             => $data['bulan'],
                        'tahun'             => $data['tahun'],
                    ],
                    $data
                );
            }
        });

        $totalCount = count($validData);
        return redirect()->back()->with('success', "Berhasil meng-import / meng-update {$totalCount} data Penugasan Mitra.");
    }
}
