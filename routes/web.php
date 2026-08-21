<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\SbmlLimitController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\UserController; 
use App\Http\Controllers\PenugasanController;
use App\Http\Controllers\HonorariumController;
use App\Http\Controllers\LaporanHonorController;
use App\Http\Controllers\MonitoringKuotaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\Honorarium;
use App\Models\SbmlLimit;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ==========================================
    // ROUTE UTAMA (ADMIN, OPERATOR, VIEWER, MITRA)
    // ==========================================
    Route::middleware('role:admin,operator,viewer,mitra')->group(function () {
        Route::get('/dashboard', function () {
            $totalMitra = Mitra::where('status_aktif', true)->count();
            $kegiatanAktif = Kegiatan::where('status_aktif', true)->count();
            $honorBulanIni = Honorarium::whereMonth('tanggal_input', date('m'))->whereYear('tanggal_input', date('Y'))->sum('jumlah_honor');
            $jumlahInputHonor = Honorarium::whereMonth('tanggal_input', date('m'))->whereYear('tanggal_input', date('Y'))->count();

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
                ['name' => 'Input Honor', 'value' => $jumlahInputHonor],
            ];

            return Inertia::render('Dashboard', [
                'stats' => [
                    'totalMitra' => $totalMitra,
                    'kegiatanAktif' => $kegiatanAktif,
                    'honorBulanIni' => $honorBulanIni,
                    'jumlahInputHonor' => $jumlahInputHonor,
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

        // ROUTE SBML: ADMIN & OPERATOR BISA MEMBUKA & MELIHAT HALAMAN
        Route::get('/admin/settings', [SbmlLimitController::class, 'index'])->name('sbml.index');

        // User Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    Route::middleware(['auth'])->group(function () {
        Route::post('kegiatan/import', [KegiatanController::class, 'import'])->name('kegiatan.import');
        Route::resource('kegiatan', KegiatanController::class);
        Route::get('/recycle-bin/kegiatan', [KegiatanController::class, 'recycleBin'])->name('kegiatan.recycle-bin');
        Route::post('/recycle-bin/kegiatan/bulk-restore', [KegiatanController::class, 'bulkRestore'])->name('kegiatan.bulk-restore');
        Route::delete('/recycle-bin/kegiatan/bulk-force-delete', [KegiatanController::class, 'bulkForceDelete'])->name('kegiatan.bulk-force-delete');
        Route::post('/recycle-bin/kegiatan/{id}/restore', [KegiatanController::class, 'restore'])->name('kegiatan.restore');
        Route::delete('/recycle-bin/kegiatan/{id}/force-delete', [KegiatanController::class, 'forceDelete'])->name('kegiatan.force-delete');
        Route::post('kegiatan/import', [KegiatanController::class, 'import'])->name('kegiatan.import');
        Route::post('kegiatan/{kegiatan}/duplicate', [KegiatanController::class, 'duplicate'])->name('kegiatan.duplicate');
        Route::post('kegiatan/bulk-destroy', [KegiatanController::class, 'bulkDestroy'])->name('kegiatan.bulk-destroy');
        
        Route::resource('penugasan', PenugasanController::class);
        Route::get('/recycle-bin/penugasan', [PenugasanController::class, 'recycleBin'])->name('penugasan.recycle-bin');
        Route::post('/recycle-bin/penugasan/bulk-restore', [PenugasanController::class, 'bulkRestore'])->name('penugasan.bulk-restore');
        Route::delete('/recycle-bin/penugasan/bulk-force-delete', [PenugasanController::class, 'bulkForceDelete'])->name('penugasan.bulk-force-delete');
        Route::post('/recycle-bin/penugasan/{id}/restore', [PenugasanController::class, 'restore'])->name('penugasan.restore');
        Route::delete('/recycle-bin/penugasan/{id}/force-delete', [PenugasanController::class, 'forceDelete'])->name('penugasan.force-delete');
        Route::post('penugasan/bulk-destroy', [PenugasanController::class, 'bulkDestroy'])->name('penugasan.bulk-destroy');
        Route::post('penugasan/bulk-delete', [PenugasanController::class, 'bulkDestroy'])->name('penugasan.bulkDelete');
        Route::get('api/penugasan/detil-by-kegiatan/{kegiatan_id}', [PenugasanController::class, 'getDetilByKegiatan'])->name('api.penugasan.detil');
        Route::get('api/penugasan/search-mitra', [PenugasanController::class, 'searchMitra'])->name('api.penugasan.search-mitra');
        Route::get('api/penugasan/prev-month-assignments', [PenugasanController::class, 'getPrevMonthPenugasan'])->name('api.penugasan.prev-month');
        Route::resource('honorarium', HonorariumController::class);
        Route::get('/recycle-bin/honorarium', [HonorariumController::class, 'recycleBin'])->name('honorarium.recycle-bin');
        Route::post('/recycle-bin/honorarium/bulk-restore', [HonorariumController::class, 'bulkRestore'])->name('honorarium.bulk-restore');
        Route::delete('/recycle-bin/honorarium/bulk-force-delete', [HonorariumController::class, 'bulkForceDelete'])->name('honorarium.bulk-force-delete');
        Route::post('/recycle-bin/honorarium/{id}/restore', [HonorariumController::class, 'restore'])->name('honorarium.restore');
        Route::delete('/recycle-bin/honorarium/{id}/force-delete', [HonorariumController::class, 'forceDelete'])->name('honorarium.force-delete');
        Route::post('honorarium/{honorarium}/ajukan', [HonorariumController::class, 'ajukanPersetujuan'])->name('honorarium.ajukan');
        Route::post('honorarium/{honorarium}/setujui', [HonorariumController::class, 'setujui'])->name('honorarium.setujui');
        Route::post('honorarium/{honorarium}/tolak', [HonorariumController::class, 'tolak'])->name('honorarium.tolak');
        Route::get('laporan-honor', [LaporanHonorController::class, 'index'])->name('laporan-honor.index');
        Route::get('laporan-honor/export', [LaporanHonorController::class, 'export'])->name('laporan-honor.export');
        Route::get('laporan-honor/{id}', [LaporanHonorController::class, 'show'])->name('laporan-honor.show');
        Route::get('monitoring-kuota', [MonitoringKuotaController::class, 'index'])->name('monitoring-kuota.index');
        Route::get('monitoring-kuota/export', [MonitoringKuotaController::class, 'export'])->name('monitoring-kuota.export');
        Route::get('monitoring-kuota/{id}', [MonitoringKuotaController::class, 'show'])->name('monitoring-kuota.show');
    });

    // ==========================================
    // ROUTE KHUSUS ADMINISTRATOR
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        // ROUTE SBML: HANYA ADMIN YANG BISA MENGUBAH / MENYIMPAN DATA
        Route::put('/admin/settings', [SbmlLimitController::class, 'update'])->name('sbml.update');

        // Master Mitra & Recycle Bin Mitra
        Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');
        Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
        Route::put('/mitra/{mitra}', [MitraController::class, 'update'])->name('mitra.update');
        Route::delete('/mitra/{mitra}', [MitraController::class, 'destroy'])->name('mitra.destroy');
        Route::get('/recycle-bin/mitra', [MitraController::class, 'recycleBin'])->name('mitra.recycle-bin');
        Route::post('/recycle-bin/mitra/{id}/restore', [MitraController::class, 'restore'])->name('mitra.restore');
        Route::delete('/recycle-bin/mitra/{id}/force-delete', [MitraController::class, 'forceDelete'])->name('mitra.force-delete');
    });

    // SBML Routes
    Route::get('/sbml', [SbmlLimitController::class, 'index'])->name('sbml.index');
    Route::post('/sbml', [SbmlLimitController::class, 'update'])->name('sbml.update');

    // Mitra Routes
    Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');
    Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
    Route::put('/mitra/{mitra}', [MitraController::class, 'update'])->name('mitra.update');
    Route::delete('/mitra/{mitra}', [MitraController::class, 'destroy'])->name('mitra.destroy');
    Route::get('/recycle-bin/mitra', [MitraController::class, 'recycleBin'])->name('mitra.recycle-bin');
    Route::post('/recycle-bin/mitra/{id}/restore', [MitraController::class, 'restore'])->name('mitra.restore');
    Route::delete('/recycle-bin/mitra/{id}/force-delete', [MitraController::class, 'forceDelete'])->name('mitra.force-delete');
    // User Routes
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/recycle-bin/users', [UserController::class, 'recycleBin'])->name('users.recycle-bin');
    Route::post('/recycle-bin/users/bulk-restore', [UserController::class, 'bulkRestore'])->name('users.bulk-restore');
    Route::delete('/recycle-bin/users/bulk-force-delete', [UserController::class, 'bulkForceDelete'])->name('users.bulk-force-delete');
    Route::post('/recycle-bin/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('/recycle-bin/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.force-delete');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('user.store');
    Route::get('/users/edit', [UserController::class, 'edit'])->name('users.edit');
});

require __DIR__.'/auth.php';

