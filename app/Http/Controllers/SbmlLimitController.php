<?php

namespace App\Http\Controllers;

use App\Models\SbmlLimit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SbmlLimitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $currentYear = date('Y');
        
        $sbmlPendataan = SbmlLimit::where('jenis_kegiatan', 'pendataan')
            ->where('tahun', $currentYear)
            ->first()?->batas_maksimal ?? 3085000;
            
        $sbmlPengolahan = SbmlLimit::where('jenis_kegiatan', 'pengolahan')
            ->where('tahun', $currentYear)
            ->first()?->batas_maksimal ?? 2854000;

        $history = SbmlLimit::orderBy('tahun', 'desc')->get();

        return Inertia::render('Sbml/Index', [
            'limits' => [
                'pendataan' => (float)$sbmlPendataan,
                'pengolahan' => (float)$sbmlPengolahan,
                'tahun' => (int)$currentYear,
            ],
            'history' => $history,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'pendataan' => 'required|numeric|min:0',
            'pengolahan' => 'required|numeric|min:0',
            'tahun' => 'nullable|integer|min:2020|max:2099',
        ]);

        $tahun = $validated['tahun'] ?? date('Y');

        SbmlLimit::updateOrCreate(
            ['jenis_kegiatan' => 'pendataan', 'tahun' => $tahun],
            ['batas_maksimal' => $validated['pendataan']]
        );

        SbmlLimit::updateOrCreate(
            ['jenis_kegiatan' => 'pengolahan', 'tahun' => $tahun],
            ['batas_maksimal' => $validated['pengolahan']]
        );

        return redirect()->back()->with('success', 'Konfigurasi batas SBML berhasil diperbarui!');
    }
}

