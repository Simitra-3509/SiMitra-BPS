<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\SbmlLimitController;
use App\Http\Controllers\KegiatanController; 
use App\Http\Controllers\PenugasanController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\Honorarium;
use App\Models\SbmlLimit;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ==========================================
    // ROUTE UNTUK ADMIN DAN OPERATOR
    // ==========================================
    Route::middleware('role:admin,operator')->group(function () {
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
        Route::resource('kegiatan', KegiatanController::class);
        Route::post('kegiatan/bulk-destroy', [KegiatanController::class, 'bulkDestroy'])->name('kegiatan.bulk-destroy');
        Route::resource('penugasan', PenugasanController::class);
        Route::post('penugasan/bulk-destroy', [PenugasanController::class, 'bulkDestroy'])->name('penugasan.bulk-destroy');
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

});

require __DIR__.'/auth.php';