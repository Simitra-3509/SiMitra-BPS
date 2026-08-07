<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    /**
     * Tampilkan daftar kegiatan.
     */
    public function index(Request $request)
    {
        $query = Kegiatan::query();

        // Fitur Pencarian berdasarkan nama kegiatan atau KRO
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_kegiatan', 'like', '%' . $request->search . '%')
                  ->orWhere('kro', 'like', '%' . $request->search . '%');
            });
        }

        // Fitur Filter Bulan
        if ($request->filled('bulan')) {
            $query->where('bulan', $request->bulan);
        }

        // Fitur Filter Tahun
        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        $kegiatan = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Kegiatan/Index', [
            'kegiatan' => $kegiatan,
            'filters'  => $request->only(['search', 'bulan', 'tahun']),
        ]);
    }

    /**
     * Simpan kegiatan baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:255',
            'kro'           => 'required|string|max:100',
            'jenis_sbml'    => 'required|string',
            'bulan'         => 'required|integer|between:1,12',
            'tahun'         => 'required|integer',
            'status_aktif'  => 'required|boolean',
        ]);

        Kegiatan::create($validated);

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil ditambahkan');
    }

    /**
     * Update data kegiatan.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:255',
            'kro'           => 'required|string|max:100',
            'jenis_sbml'    => 'required|string',
            'bulan'         => 'required|integer|between:1,12',
            'tahun'         => 'required|integer',
            'status_aktif'  => 'required|boolean',
        ]);

        $kegiatan->update($validated);

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil diperbarui');
    }

    /**
     * Hapus kegiatan (Soft Delete).
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $kegiatan->delete();

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil dihapus');
    }
}