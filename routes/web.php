<?php

use App\Http\Controllers\ProfileController;
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
})->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\MitraController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Mitra Routes
    Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');
    Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
    Route::put('/mitra/{mitra}', [MitraController::class, 'update'])->name('mitra.update');
    Route::delete('/mitra/{mitra}', [MitraController::class, 'destroy'])->name('mitra.destroy');
    Route::get('/recycle-bin/mitra', [MitraController::class, 'recycleBin'])->name('mitra.recycle-bin');
    Route::post('/recycle-bin/mitra/{id}/restore', [MitraController::class, 'restore'])->name('mitra.restore');
    Route::delete('/recycle-bin/mitra/{id}/force-delete', [MitraController::class, 'forceDelete'])->name('mitra.force-delete');
});

require __DIR__.'/auth.php';
