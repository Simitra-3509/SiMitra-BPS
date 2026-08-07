<?php

namespace App\Http\Controllers;

use App\Models\SbmlLimit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SbmlLimitController extends Controller
{
    public function index()
    {
        // Ambil data batas maksimal untuk pendataan dan pengolahan dari database
        $sbmlPendataan = SbmlLimit::where('jenis_kegiatan', 'pendataan')->first()?->batas_maksimal ?? 3085000;
        $sbmlPengolahan = SbmlLimit::where('jenis_kegiatan', 'pengolahan')->first()?->batas_maksimal ?? 2854000;

        return Inertia::render('Admin/SbmlSettings', [
            'sbml' => [
                'pendataan' => $sbmlPendataan,
                'pengolahan' => $sbmlPengolahan,
            ]
        ]);
    }

    public function update(Request $request)
    {
        // Proteksi di level controller (hanya role admin yang diizinkan memperbarui data)
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah data ini.');
        }

        $request->validate([
            'pendataan' => 'required|numeric',
            'pengolahan' => 'required|numeric',
        ]);

        // Simpan atau perbarui nilai batas maksimal
        SbmlLimit::updateOrCreate(
            ['jenis_kegiatan' => 'pendataan'],
            ['batas_maksimal' => $request->pendataan]
        );

        SbmlLimit::updateOrCreate(
            ['jenis_kegiatan' => 'pengolahan'],
            ['batas_maksimal' => $request->pengolahan]
        );

        return redirect()->back()->with('message', 'Pengaturan SBML berhasil diperbarui');
    }
}