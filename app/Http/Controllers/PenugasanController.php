<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\Mitra;
use App\Http\Requests\StorePenugasanRequest;
use App\Http\Requests\UpdatePenugasanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenugasanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Penugasan::with(['mitra', 'kegiatan', 'honoraria'])
            ->whereNull('deleted_at');

        // Filter jenis_sbml (kolom di DB: jenis_kegiatan)
        if ($request->filled('jenis_sbml')) {
            $query->whereHas('kegiatan', fn($q) =>
                $q->where('jenis_kegiatan', $request->jenis_sbml)
            );
        }

        // Filter kegiatan_id
        if ($request->filled('kegiatan_id')) {
            $query->where('kegiatan_id', $request->kegiatan_id);
        }

        // Filter status honor
        if ($request->filled('status_honor')) {
            if ($request->status_honor === 'sudah') {
                $query->whereHas('honoraria');
            } elseif ($request->status_honor === 'belum') {
                $query->whereDoesntHave('honoraria');
            }
        }

        // Search nama/NIK mitra atau nama kegiatan
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('mitra', fn($m) =>
                    $m->where('nama', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                )->orWhereHas('kegiatan', fn($k) =>
                    $k->where('nama_kegiatan', 'like', "%{$search}%")
                );
            });
        }

        $penugasan = $query->latest()->paginate(15)->withQueryString();

        // Kegiatan aktif tanpa mitra (untuk warning banner)
        $kegiatanTanpaMitra = Kegiatan::where('status_aktif', true)
            ->whereDoesntHave('penugasans')
            ->get(['id', 'nama_kegiatan', 'jenis_kegiatan']);

        // Data untuk filter dropdown
        $semuaKegiatan = Kegiatan::where('status_aktif', true)
            ->get(['id', 'nama_kegiatan']);

        return Inertia::render('Penugasan/Index', [
            'penugasan'         => $penugasan,
            'kegiatanTanpaMitra' => $kegiatanTanpaMitra,
            'semuaKegiatan'     => $semuaKegiatan,
            'filters'           => $request->only(['jenis_sbml', 'kegiatan_id', 'status_honor', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kegiatan = Kegiatan::where('status_aktif', true)->get(['id', 'nama_kegiatan', 'jenis_kegiatan']);
        $mitra    = Mitra::where('status_aktif', true)->get(['id', 'nama', 'nik']);

        return Inertia::render('Penugasan/Create', [
            'kegiatan' => $kegiatan,
            'mitra'    => $mitra,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kegiatan_id' => 'required|exists:kegiatans,id',
            'mitra_id'    => 'required|exists:mitras,id',
        ], [
            'kegiatan_id.required' => 'Kegiatan wajib dipilih.',
            'mitra_id.required'    => 'Mitra wajib dipilih.',
        ]);

        // Cegah duplikasi penugasan
        $exists = Penugasan::where('kegiatan_id', $request->kegiatan_id)
            ->where('mitra_id', $request->mitra_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['mitra_id' => 'Mitra ini sudah ditugaskan ke kegiatan tersebut.']);
        }

        Penugasan::create([
            'kegiatan_id' => $request->kegiatan_id,
            'mitra_id'    => $request->mitra_id,
        ]);

        return redirect()->route('penugasan.index')
            ->with('success', 'Penugasan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Penugasan $penugasan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Penugasan $penugasan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePenugasanRequest $request, Penugasan $penugasan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Penugasan $penugasan)
    {
        $penugasan->delete();

        return back()->with('success', 'Penugasan berhasil dihapus.');
    }

    /**
     * Bulk delete multiple penugasan records.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id',
        ]);

        Penugasan::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' penugasan berhasil dihapus.');
    }
}
