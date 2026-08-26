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
        $totalMitra = Mitra::where('status_aktif', true)->count();
        $kegiatanAktif = Kegiatan::where('status_aktif', true)->count();
        $honorBulanIni = (float) Penugasan::where('bulan', (int)date('m'))->where('tahun', (int)date('Y'))->sum('total_honor');
        $jumlahPenugasanBulanIni = Penugasan::where('bulan', (int)date('m'))->where('tahun', (int)date('Y'))->count();

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

        return Inertia::render('Dashboard', [
            'userRole' => $userRole,
            'stats' => [
                'totalMitra' => $totalMitra,
                'kegiatanAktif' => $kegiatanAktif,
                'honorBulanIni' => $honorBulanIni,
                'jumlahInputHonor' => $jumlahPenugasanBulanIni,
            ],
            'sbml' => [
                'pendataan' => $sbmlPendataan,
                'pengolahan' => $sbmlPengolahan,
            ],
            'chartData' => [
                'performa' => $performaData,
                'komposisi' => $komposisiData,
            ]
        ]);
    })->name('dashboard');

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
    // 3. MASTER MITRA & RECYCLE BIN MITRA (OPERATOR & ADMIN)
    // ==========================================
    Route::middleware('role:operator,admin,administrator')->group(function () {
        Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');
        Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
        Route::put('/mitra/{mitra}', [MitraController::class, 'update'])->name('mitra.update');
        Route::delete('/mitra/{mitra}', [MitraController::class, 'destroy'])->name('mitra.destroy');
        Route::post('/mitra/import', [MitraController::class, 'import'])->name('mitra.import');

        // Recycle Bin Mitra (OPERATOR & ADMIN)
        Route::get('/recycle-bin/mitra', [MitraController::class, 'recycleBin'])->name('mitra.recycle-bin');
        Route::post('/recycle-bin/mitra/{id}/restore', [MitraController::class, 'restore'])->name('mitra.restore');
        Route::delete('/recycle-bin/mitra/{id}/force-delete', [MitraController::class, 'forceDelete'])->name('mitra.force-delete');
    });


    // ==========================================
    // 4. MASTER KEGIATAN & RECYCLE BIN KEGIATAN (OPERATOR, PPK, ADMIN)
    // ==========================================
    Route::middleware('role:operator,ppk,admin,administrator')->group(function () {
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

