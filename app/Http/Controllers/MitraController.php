<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MitraController extends Controller
{
    /**
     * Display a listing of active Mitras.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'semua');
        $bank = $request->input('bank', 'semua');
        $perPageInput = $request->input('per_page', 20);

        $query = Mitra::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nik', 'like', "%{$search}%")
                      ->orWhere('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('sobat_id', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'semua', function ($query) use ($status) {
                if ($status === 'aktif') {
                    $query->where('status_aktif', true);
                } elseif ($status === 'nonaktif') {
                    $query->where('status_aktif', false);
                }
            })
            ->when($bank !== 'semua', function ($query) use ($bank) {
                $query->where('nama_bank', $bank);
            })
            ->latest();

        $perPage = $perPageInput === 'semua' ? $query->count() : (int) $perPageInput;
        $perPage = $perPage > 0 ? $perPage : 1;

        $mitras = $query->paginate($perPage)->withQueryString();

        $deletedCount = Mitra::onlyTrashed()->count();
        $banksList = Mitra::whereNotNull('nama_bank')->distinct()->pluck('nama_bank');

        return Inertia::render('Mitra/Index', [
            'mitras' => $mitras,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'bank' => $bank,
                'per_page' => $perPageInput,
            ],
            'banksList' => $banksList,
            'deletedCount' => $deletedCount,
        ]);
    }

    /**
     * Store a newly created Mitra.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|numeric|digits:16|unique:mitras,nik',
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'nullable|string',
            'no_rekening' => 'nullable|string',
            'nama_bank' => 'nullable|string',
            'no_telepon' => 'nullable|string',
            'alamat' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        Mitra::create($validated);

        return redirect()->back()->with('message', 'Mitra berhasil ditambahkan.');
    }

    /**
     * Update the specified Mitra.
     */
    public function update(Request $request, Mitra $mitra)
    {
        $validated = $request->validate([
            'nik' => 'required|numeric|digits:16|unique:mitras,nik,' . $mitra->id,
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'nullable|string',
            'no_rekening' => 'nullable|string',
            'nama_bank' => 'nullable|string',
            'no_telepon' => 'nullable|string',
            'alamat' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        $mitra->update($validated);

        return redirect()->back()->with('message', 'Data Mitra berhasil diperbarui.');
    }

    /**
     * Soft delete the specified Mitra.
     */
    public function destroy(Mitra $mitra)
    {
        $mitra->delete();

        return redirect()->back()->with('message', 'Mitra dipindahkan ke Recycle Bin.');
    }

    /**
     * Display a listing of soft deleted Mitras.
     */
    public function recycleBin(Request $request)
    {
        $search = $request->input('search');
        $perPageInput = $request->input('per_page', 20);

        $query = Mitra::onlyTrashed()
            ->when($search, function ($query, $search) {
                $query->where('nik', 'like', "%{$search}%")
                      ->orWhere('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('sobat_id', 'like', "%{$search}%");
            })
            ->latest('deleted_at');

        $perPage = $perPageInput === 'semua' ? $query->count() : (int) $perPageInput;
        $perPage = $perPage > 0 ? $perPage : 1;

        $trashedMitras = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Mitra/RecycleBin', [
            'mitras' => $trashedMitras,
            'filters' => [
                'search' => $search,
                'per_page' => $perPageInput,
            ]
        ]);
    }

    /**
     * Restore a soft deleted Mitra.
     */
    public function restore($id)
    {
        $mitra = Mitra::onlyTrashed()->findOrFail($id);
        $mitra->restore();

        return redirect()->back()->with('message', 'Mitra berhasil dipulihkan.');
    }

    /**
     * Permanently delete a soft deleted Mitra.
     */
    public function forceDelete($id)
    {
        $mitra = Mitra::onlyTrashed()->findOrFail($id);
        $mitra->forceDelete();

        return redirect()->back()->with('message', 'Mitra dihapus secara permanen.');
    }
}
