<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Http\Requests\StoreKegiatanRequest;
use App\Http\Requests\UpdateKegiatanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Kegiatan::query();

        // Filter berdasarkan jenis_sbml (dari form Jenis SBML)
        if ($request->filled('jenis_sbml')) {
            $query->where('jenis_sbml', $request->jenis_sbml);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_aktif', $request->status);
        }

        // Filter pencarian teks (hanya Nama Kegiatan, karena KRO belum ada di tabel)
        if ($request->filled('cari')) {
            $query->where('nama_kegiatan', 'like', '%' . $request->cari . '%');
        }

        $kegiatan = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Kegiatan/Index', [
            'kegiatan'      => $kegiatan,
            'kegiatanCount' => $kegiatan->total(),
            'filters'       => $request->only(['jenis_sbml', 'bulan', 'status', 'tahun', 'cari'])
        ]);
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:kegiatans,id'
        ]);

        Kegiatan::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', count($request->ids) . ' kegiatan berhasil dihapus.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Kegiatan/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKegiatanRequest $request)
    {
        Kegiatan::create($request->validated());

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        return Inertia::render('Kegiatan/Show', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kegiatan $kegiatan)
    {
        return Inertia::render('Kegiatan/Edit', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateKegiatanRequest $request, Kegiatan $kegiatan)
    {
        $kegiatan->update($request->validated());

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $kegiatan->delete();

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil dihapus');
    }
}