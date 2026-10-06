<?php

use Illuminate\Support\Facades\Route;
use App\Models\Spk;
use App\Http\Controllers\SpkController;
use Illuminate\Http\Request;

Route::get('/spk/create-from-penugasan/{penugasanId}', function ($penugasanId) {
    // Logic: fetch penugasan -> map ke structure Create.jsx -> render
    $penugasan = \App\Models\Penugasan::findOrFail($penugasanId);
    $mitra = $penugasan->mitra;
    
    // Auto-fill structure
    $spkData = [
        'mitra_id' => $mitra->id,
        'bulan' => $penugasan->bulan,
        'tahun' => $penugasan->tahun,
        'details' => [[
            'kegiatan_id' => $penugasan->kegiatan_id,
            'uraian_tugas' => $penugasan->kegiatan->nama_kegiatan,
            'tanggal_mulai_detail' => $penugasan->tanggal_mulai,
            'tanggal_selesai_detail' => $penugasan->tanggal_selesai,
            'volume' => $penugasan->kuota_target,
            'satuan' => $penugasan->detilKegiatan->satuan ?? 'Dokumen',
            'harga_satuan' => $penugasan->harga_satuan_snapshot,
            'nilai' => $penugasan->total_honor,
        ]]
    ];

    return Inertia\Inertia::render('Spk/Create', [
        'mitras' => \App\Models\Mitra::where('status_aktif', true)->get(),
        'kegiatans' => \App\Models\Kegiatan::where('status_aktif', true)->get(),
        'autoFill' => $spkData
    ]);
})->name('spk.create-from-penugasan');
