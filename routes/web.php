<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\SbmlLimitController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\UserController; 
use App\Http\Controllers\PenugasanController;
use App\Http\Controllers\LaporanHonorController;
use App\Http\Controllers\MonitoringKuotaController;
use App\Http\Controllers\PeriodePengisianController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\Penugasan;
use App\Models\SbmlLimit;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ==========================================
    // 1. DASHBOARD & PROFILE (SEMUA USER TERAUTENTIKASI)
    // ==========================================
    Route::get('/dashboard', function () {
        $userRole = strtolower(auth()->user()->role ?? '');

        // 3. Honor Mitra Bulan Ini (Rata-rata, Terkecil, Terbesar)
        $currentMonth = (int) date('m');
        $currentYear = (int) date('Y');

        // 1. Total Mitra yang sedang ada penugasan bulan ini
        $totalMitra = Penugasan::whereNotNull('mitra_id')
            ->whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->distinct('mitra_id')
            ->count('mitra_id');

        // 2. Kegiatan aktif yang sedang dilaksanakan ataupun sedang ditugaskan bulan ini
        $kegiatanAktif = Kegiatan::where('status_aktif', true)
            ->where(function ($query) use ($currentMonth, $currentYear) {
                $query->whereHas('penugasans', function ($pq) use ($currentMonth, $currentYear) {
                    $pq->whereNull('deleted_at')
                       ->where('bulan', $currentMonth)
                       ->where('tahun', $currentYear);
                })
                ->orWhere(function ($q) use ($currentMonth, $currentYear) {
                    $startDate = \Carbon\Carbon::create($currentYear, $currentMonth, 1)->startOfMonth();
                    $endDate = (clone $startDate)->endOfMonth();
                    $q->whereNotNull('tanggal_mulai')
                      ->whereDate('tanggal_mulai', '<=', $endDate)
                      ->whereDate('tanggal_selesai', '>=', $startDate);
                });
            })
            ->count();

        $mitraHonorBulanIniSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonor = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->avg() : 0;
        $honorTerkecil = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->min() : 0;
        $honorTerbesar = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->max() : 0;

        $honorBulanIni = (float) Penugasan::where('bulan', (int)date('m'))->where('tahun', (int)date('Y'))->sum('total_honor');
        $jumlahPenugasanBulanIni = Penugasan::where('bulan', (int)date('m'))->where('tahun', (int)date('Y'))->count();

        // 4. Rata-rata honor mitra dalam setahun (tahun berjalan)
        $currentYear = (int) date('Y');
        $mitraHonorSetahunSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('tahun', $currentYear)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonorSetahun = $mitraHonorSetahunSums->count() > 0 ? (float) $mitraHonorSetahunSums->avg() : 0;

        $sbmlPendataan = SbmlLimit::where('jenis_kegiatan', 'pendataan')->first()?->batas_maksimal ?? 0;
        $sbmlPengolahan = SbmlLimit::where('jenis_kegiatan', 'pengolahan')->first()?->batas_maksimal ?? 0;

        $performaData = [
            ['name' => 'Jan', 'honor' => 0],
            ['name' => 'Feb', 'honor' => 0],
            ['name' => 'Mar', 'honor' => 0],
            ['name' => 'Apr', 'honor' => 0],
            ['name' => 'Mei', 'honor' => 0],
            ['name' => 'Jun', 'honor' => 0],
            ['name' => 'Jul', 'honor' => 0],
            ['name' => 'Agu', 'honor' => (float)$honorBulanIni],
        ];

        $komposisiData = [
            ['name' => 'Mitra', 'value' => $totalMitra],
            ['name' => 'Kegiatan', 'value' => $kegiatanAktif],
            ['name' => 'Penugasan', 'value' => $jumlahPenugasanBulanIni],
        ];

        $mitraList = \App\Services\DashboardService::getMitraList('bulanan', $currentYear, $currentMonth, (float)$sbmlPendataan, (float)$sbmlPengolahan);

        return Inertia::render('Dashboard', [
            'userRole' => $userRole,
            'stats' => [
                'totalMitra' => $totalMitra,
                'kegiatanAktif' => $kegiatanAktif,
                'honorBulanIni' => $honorBulanIni,
                'rataRataHonor' => $rataRataHonor,
                'honorTerkecil' => $honorTerkecil,
                'honorTerbesar' => $honorTerbesar,
                'rataRataHonorSetahun' => $rataRataHonorSetahun,
                'jumlahInputHonor' => $jumlahPenugasanBulanIni,
            ],
            'sbml' => [
                'pendataan' => $sbmlPendataan,
                'pengolahan' => $sbmlPengolahan,
            ],
            'chartData' => [
                'performa' => $performaData,
                'komposisi' => $komposisiData,
            ],
            'mitraList' => $mitraList,
        ]);
    })->name('dashboard');

    // ==========================================
    // API: DASHBOARD FILTER (AJAX)
    // ==========================================
    Route::get('/api/dashboard-filter', function (\Illuminate\Http\Request $request) {
        $filter = $request->input('filter', 'bulanan'); // bulanan | tahunan | semua
        $tahun  = (int) $request->input('tahun', date('Y'));
        $bulan  = (int) $request->input('bulan', date('m'));

        if ($filter === 'bulanan') {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at')
                ->where('bulan', $bulan)->where('tahun', $tahun);
            $label = 'Bulan ' . \Carbon\Carbon::create()->month($bulan)->locale('id')->isoFormat('MMMM') . ' ' . $tahun;

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)
                ->where(function ($query) use ($bulan, $tahun) {
                    $query->whereHas('penugasans', function ($pq) use ($bulan, $tahun) {
                        $pq->whereNull('deleted_at')
                           ->where('bulan', $bulan)
                           ->where('tahun', $tahun);
                    })
                    ->orWhere(function ($q) use ($bulan, $tahun) {
                        $startDate = \Carbon\Carbon::create($tahun, $bulan, 1)->startOfMonth();
                        $endDate = (clone $startDate)->endOfMonth();
                        $q->whereNotNull('tanggal_mulai')
                          ->whereDate('tanggal_mulai', '<=', $endDate)
                          ->whereDate('tanggal_selesai', '>=', $startDate);
                    });
                })
                ->count();
        } elseif ($filter === 'tahunan') {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at')
                ->where('tahun', $tahun);
            $label = 'Tahun ' . $tahun;

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->where('tahun', $tahun)
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)
                ->where(function ($query) use ($tahun) {
                    $query->whereHas('penugasans', function ($pq) use ($tahun) {
                        $pq->whereNull('deleted_at')
                           ->where('tahun', $tahun);
                    })
                    ->orWhere(function ($q) use ($tahun) {
                        $startDate = \Carbon\Carbon::create($tahun, 1, 1)->startOfYear();
                        $endDate = (clone $startDate)->endOfYear();
                        $q->whereNotNull('tanggal_mulai')
                          ->whereDate('tanggal_mulai', '<=', $endDate)
                          ->whereDate('tanggal_selesai', '>=', $startDate);
                    });
                })
                ->count();
        } else {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at');
            $label = 'Semua Waktu';

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)->count();
        }

        $mitraHonorSums = (clone $honorQuery)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonor  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->avg() : 0;
        $honorTerkecil  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->min() : 0;
        $honorTerbesar  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->max() : 0;
        $totalHonor     = (float) (clone $honorQuery)->sum('total_honor');
        $jumlahPenugasan = (clone $honorQuery)->count();

        $mitraHonorSetahunSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');
        $rataRataHonorSetahun = $mitraHonorSetahunSums->count() > 0 ? (float) $mitraHonorSetahunSums->avg() : 0;

        // ---- CHART DATA ----
        $bulanNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

        if ($filter === 'bulanan') {
            // Performa: hari-hari dalam bulan tsb
            $daysInMonth = \Carbon\Carbon::create($tahun, $bulan)->daysInMonth;
            $honorPerHari = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->selectRaw('DAY(created_at) as hari, SUM(total_honor) as total')
                ->groupBy('hari')
                ->pluck('total', 'hari');

            $performaData = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $performaData[] = ['name' => $d . '', 'honor' => (float)($honorPerHari[$d] ?? 0)];
            }
        } elseif ($filter === 'tahunan') {
            // Performa: bulan per bulan dalam tahun
            $honorPerBulan = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->where('tahun', $tahun)
                ->selectRaw('bulan, SUM(total_honor) as total')
                ->groupBy('bulan')
                ->pluck('total', 'bulan');

            $performaData = [];
            for ($m = 1; $m <= 12; $m++) {
                $performaData[] = ['name' => $bulanNames[$m-1], 'honor' => (float)($honorPerBulan[$m] ?? 0)];
            }
        } else {
            // Performa: per tahun
            $honorPerTahun = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->selectRaw('tahun, SUM(total_honor) as total')
                ->groupBy('tahun')
                ->orderBy('tahun')
                ->pluck('total', 'tahun');

            $performaData = [];
            foreach ($honorPerTahun as $yr => $total) {
                $performaData[] = ['name' => (string)$yr, 'honor' => (float)$total];
            }
            if (empty($performaData)) {
                $performaData = [['name' => (string)date('Y'), 'honor' => 0]];
            }
        }

        $komposisiData = [
            ['name' => 'Kegiatan', 'value' => $kegiatanAktif],
            ['name' => 'Mitra',    'value' => $totalMitra],
            ['name' => 'Penugasan','value' => $jumlahPenugasan],
        ];

        $sbmlLimits = SbmlLimit::where('tahun', $tahun)->get()->keyBy('jenis_kegiatan');
        $batasPendataan = (float)($sbmlLimits['pendataan']->batas_maksimal ?? 3085000);
        $batasPengolahan = (float)($sbmlLimits['pengolahan']->batas_maksimal ?? 2854000);

        $mitraList = \App\Services\DashboardService::getMitraList($filter, $tahun, $bulan, $batasPendataan, $batasPengolahan);

        return response()->json([
            'label'    => $label,
            'stats'    => [
                'totalMitra'           => $totalMitra,
                'kegiatanAktif'        => $kegiatanAktif,
                'totalHonor'           => $totalHonor,
                'rataRataHonor'        => $rataRataHonor,
                'honorTerkecil'        => $honorTerkecil,
                'honorTerbesar'        => $honorTerbesar,
                'rataRataHonorSetahun' => $rataRataHonorSetahun,
                'jumlahInputHonor'     => $jumlahPenugasan,
            ],
            'chartData' => [
                'performa'  => $performaData,
                'komposisi' => $komposisiData,
            ],
            'mitraList' => $mitraList,
            'sbml'      => [
                'pendataan'  => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ],
        ]);
    })->name('api.dashboard-filter');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    // ==========================================
    // 2. KHUSUS ADMIN (ALL ACCESS / USER MGMT / SBML SETTINGS)
    // ==========================================
    Route::middleware('role:admin,administrator')->group(function () {
        // Pengaturan SBML (Batas SBML)
        Route::get('/admin/settings', [SbmlLimitController::class, 'index'])->name('sbml.index');
        Route::put('/admin/settings', [SbmlLimitController::class, 'update'])->name('sbml.update');
        Route::get('/sbml', [SbmlLimitController::class, 'index']);
        Route::post('/sbml', [SbmlLimitController::class, 'update']);

        // Manajemen User
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('user.store');
        Route::get('/users/edit', [UserController::class, 'edit'])->name('users.edit');

        // Recycle Bin User (HANYA ADMIN)
        Route::get('/recycle-bin/users', [UserController::class, 'recycleBin'])->name('users.recycle-bin');
        Route::post('/recycle-bin/users/bulk-restore', [UserController::class, 'bulkRestore'])->name('users.bulk-restore');
        Route::delete('/recycle-bin/users/bulk-force-delete', [UserController::class, 'bulkForceDelete'])->name('users.bulk-force-delete');
        Route::post('/recycle-bin/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('/recycle-bin/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.force-delete');
    });


    // ==========================================
    // 3. MASTER MITRA & RECYCLE BIN MITRA
    // ==========================================
    // Lihat & Cari Mitra (Semua Role Terautentikasi)
    Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');

    // Modifikasi Data Mitra & Recycle Bin (HANYA ADMIN)
    Route::middleware('role:admin,administrator')->group(function () {
        Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
        Route::put('/mitra/{mitra}', [MitraController::class, 'update'])->name('mitra.update');
        Route::delete('/mitra/{mitra}', [MitraController::class, 'destroy'])->name('mitra.destroy');
        Route::post('/mitra/import', [MitraController::class, 'import'])->name('mitra.import');
        Route::post('/mitra/bulk-destroy', [MitraController::class, 'bulkDestroy'])->name('mitra.bulk-destroy');

        // Recycle Bin Mitra (HANYA ADMIN)
        Route::get('/recycle-bin/mitra', [MitraController::class, 'recycleBin'])->name('mitra.recycle-bin');
        Route::post('/recycle-bin/mitra/bulk-restore', [MitraController::class, 'bulkRestore'])->name('mitra.bulk-restore');
        Route::delete('/recycle-bin/mitra/bulk-force-delete', [MitraController::class, 'bulkForceDelete'])->name('mitra.bulk-force-delete');
        Route::delete('/recycle-bin/mitra/empty', [MitraController::class, 'emptyRecycleBin'])->name('mitra.empty-recycle-bin');
        Route::post('/recycle-bin/mitra/restore-all', [MitraController::class, 'restoreAll'])->name('mitra.restore-all');
        Route::post('/recycle-bin/mitra/{id}/restore', [MitraController::class, 'restore'])->name('mitra.restore');
        Route::delete('/recycle-bin/mitra/{id}/force-delete', [MitraController::class, 'forceDelete'])->name('mitra.force-delete');
    });


    // ==========================================
    // 4. MASTER KEGIATAN & RECYCLE BIN KEGIATAN (PPK & ADMIN)
    // ==========================================
    Route::middleware('role:ppk,admin,administrator')->group(function () {
        Route::get('kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index');
        Route::get('kegiatan/create', [KegiatanController::class, 'create'])->name('kegiatan.create');
        Route::post('kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');
        Route::get('kegiatan/{kegiatan}', [KegiatanController::class, 'show'])->name('kegiatan.show');
        Route::get('kegiatan/{kegiatan}/edit', [KegiatanController::class, 'edit'])->name('kegiatan.edit');
        Route::put('kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->name('kegiatan.update');
        Route::delete('kegiatan/{kegiatan}', [KegiatanController::class, 'destroy'])->name('kegiatan.destroy');
        Route::post('kegiatan/import', [KegiatanController::class, 'import'])->name('kegiatan.import');
        Route::post('kegiatan/{kegiatan}/duplicate', [KegiatanController::class, 'duplicate'])->name('kegiatan.duplicate');
        Route::post('kegiatan/bulk-destroy', [KegiatanController::class, 'bulkDestroy'])->name('kegiatan.bulk-destroy');

        // Recycle Bin Kegiatan (OPERATOR, PPK, ADMIN)
        Route::get('/recycle-bin/kegiatan', [KegiatanController::class, 'recycleBin'])->name('kegiatan.recycle-bin');
        Route::post('/recycle-bin/kegiatan/bulk-restore', [KegiatanController::class, 'bulkRestore'])->name('kegiatan.bulk-restore');
        Route::delete('/recycle-bin/kegiatan/bulk-force-delete', [KegiatanController::class, 'bulkForceDelete'])->name('kegiatan.bulk-force-delete');
        Route::post('/recycle-bin/kegiatan/{id}/restore', [KegiatanController::class, 'restore'])->name('kegiatan.restore');
        Route::delete('/recycle-bin/kegiatan/{id}/force-delete', [KegiatanController::class, 'forceDelete'])->name('kegiatan.force-delete');
    });


    // ==========================================
    // 5. PENUGASAN MITRA & RECYCLE BIN PENUGASAN (OPERATOR, PPK, ADMIN)
    // ==========================================
    Route::middleware('role:operator,ppk,admin,administrator')->group(function () {
        Route::get('penugasan', [PenugasanController::class, 'index'])->name('penugasan.index');
        Route::get('penugasan/create', [PenugasanController::class, 'create'])->name('penugasan.create');
        Route::post('penugasan', [PenugasanController::class, 'store'])->name('penugasan.store');
        Route::get('penugasan/{penugasan}', [PenugasanController::class, 'show'])->name('penugasan.show');
        Route::get('penugasan/{penugasan}/edit', [PenugasanController::class, 'edit'])->name('penugasan.edit');
        Route::put('penugasan/{penugasan}', [PenugasanController::class, 'update'])->name('penugasan.update');
        Route::delete('penugasan/{penugasan}', [PenugasanController::class, 'destroy'])->name('penugasan.destroy');
        Route::post('penugasan/import', [PenugasanController::class, 'import'])->name('penugasan.import');
        Route::post('penugasan/bulk-destroy', [PenugasanController::class, 'bulkDestroy'])->name('penugasan.bulk-destroy');
        Route::post('penugasan/bulk-delete', [PenugasanController::class, 'bulkDestroy'])->name('penugasan.bulkDelete');
        Route::get('api/penugasan/detil-by-kegiatan/{kegiatan_id}', [PenugasanController::class, 'getDetilByKegiatan'])->name('api.penugasan.detil');
        Route::get('api/penugasan/search-mitra', [PenugasanController::class, 'searchMitra'])->name('api.penugasan.search-mitra');
        Route::post('api/penugasan/bulk-lookup-mitra', [PenugasanController::class, 'bulkLookupMitra'])->name('api.penugasan.bulk-lookup-mitra');
        Route::get('api/penugasan/prev-month-assignments', [PenugasanController::class, 'getPrevMonthPenugasan'])->name('api.penugasan.prev-month');

        // Recycle Bin Penugasan (OPERATOR, PPK, ADMIN)
        Route::get('/recycle-bin/penugasan', [PenugasanController::class, 'recycleBin'])->name('penugasan.recycle-bin');
        Route::post('/recycle-bin/penugasan/bulk-restore', [PenugasanController::class, 'bulkRestore'])->name('penugasan.bulk-restore');
        Route::delete('/recycle-bin/penugasan/bulk-force-delete', [PenugasanController::class, 'bulkForceDelete'])->name('penugasan.bulk-force-delete');
        Route::post('/recycle-bin/penugasan/{id}/restore', [PenugasanController::class, 'restore'])->name('penugasan.restore');
        Route::delete('/recycle-bin/penugasan/{id}/force-delete', [PenugasanController::class, 'forceDelete'])->name('penugasan.force-delete');
    });


    // ==========================================
    // 6. KHUSUS PPK: KUNCI & BUKA PERIODE PENGISIAN
    // ==========================================
    Route::middleware('role:ppk')->group(function () {
        Route::get('/periode-pengisian', [PeriodePengisianController::class, 'index'])->name('periode.index');
        Route::post('/periode-pengisian/kunci', [PeriodePengisianController::class, 'kunci'])->name('periode.kunci');
        Route::post('/periode-pengisian/buka', [PeriodePengisianController::class, 'buka'])->name('periode.buka');
    });


    // ==========================================
    // 7. LAPORAN HONOR & MONITORING KUOTA SBML (PPK & ADMIN)
    // ==========================================
    Route::middleware('role:ppk,admin,administrator')->group(function () {
        Route::get('laporan-honor', [LaporanHonorController::class, 'index'])->name('laporan-honor.index');
        Route::get('laporan-honor/export', [LaporanHonorController::class, 'export'])->name('laporan-honor.export');
        Route::get('laporan-honor/{id}', [LaporanHonorController::class, 'show'])->name('laporan-honor.show');

        Route::get('monitoring-kuota', [MonitoringKuotaController::class, 'index'])->name('monitoring-kuota.index');
        Route::get('monitoring-kuota/export', [MonitoringKuotaController::class, 'export'])->name('monitoring-kuota.export');
        Route::get('monitoring-kuota/{id}', [MonitoringKuotaController::class, 'show'])->name('monitoring-kuota.show');
    });

});

require __DIR__.'/auth.php';

