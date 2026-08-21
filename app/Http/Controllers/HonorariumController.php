<?php

namespace App\Http\Controllers;

use App\Models\Honorarium;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HonorariumController extends Controller
{
    /**
     * Tampilkan daftar honorarium.
     */
    public function index(Request $request)
    {
        $query = Honorarium::with(['penugasan.mitra', 'penugasan.kegiatan', 'approver']);

        if ($request->filled('jenis_sbml')) {
            $query->whereHas('penugasan.detilKegiatan', function ($q) use ($request) {
                $q->where('jenis_sbml', $request->jenis_sbml);
            });
        }

        if ($request->filled('kegiatan_id')) {
            $query->whereHas('penugasan', function ($q) use ($request) {
                $q->where('kegiatan_id', $request->kegiatan_id);
            });
        }

        if ($request->filled('status_persetujuan')) {
            $query->where('status_persetujuan', $request->status_persetujuan);
        }

        if ($request->filled('cari')) {
            $qText = $request->cari;
            $query->where(function ($q) use ($qText) {
                $q->whereHas('penugasan.mitra', function ($m) use ($qText) {
                    $m->where('nama_lengkap', 'like', "%{$qText}%")
                      ->orWhere('sobat_id', 'like', "%{$qText}%")
                      ->orWhere('nik', 'like', "%{$qText}%");
                })->orWhereHas('penugasan.kegiatan', function ($k) use ($qText) {
                    $k->where('nama_kegiatan', 'like', "%{$qText}%");
                });
            });
        }

        $honorarium = $query->latest()->paginate(15)->withQueryString();
        $semuaKegiatan = Kegiatan::orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan']);

        return Inertia::render('Honorarium/Index', [
            'honorarium'    => $honorarium,
            'semuaKegiatan' => $semuaKegiatan,
            'filters'       => $request->only(['jenis_sbml', 'kegiatan_id', 'status_persetujuan', 'cari']),
        ]);
    }

    /**
     * Tampilkan form tambah honorarium.
     */
    public function create()
    {
        return Inertia::render('Honorarium/Create');
    }

    /**
     * Simpan honorarium baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'penugasan_id'  => 'required|exists:penugasans,id',
            'jumlah_honor'  => 'required|numeric|min:0',
            'tanggal_input' => 'required|date',
            'keterangan'    => 'nullable|string',
        ]);

        $validated['status_persetujuan'] = 'draft';

        Honorarium::create($validated);

        return redirect()->route('honorarium.index')->with('message', 'Honorarium berhasil ditambahkan dengan status Draft.');
    }

    /**
     * Update honorarium.
     */
    public function update(Request $request, Honorarium $honorarium)
    {
        // Otorisasi: Jika disetujui, hanya PPK yang boleh mengedit
        if ($honorarium->status_persetujuan === 'disetujui' && auth()->user()->role !== 'ppk') {
            return redirect()->back()->with('error', 'Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan.');
        }

        $validated = $request->validate([
            'jumlah_honor'  => 'required|numeric|min:0',
            'tanggal_input' => 'required|date',
            'keterangan'    => 'nullable|string',
        ]);

        $honorarium->update($validated);

        return redirect()->route('honorarium.index')->with('message', 'Data honorarium berhasil diperbarui.');
    }

    /**
     * Hapus honorarium.
     */
    public function destroy(Honorarium $honorarium)
    {
        // Otorisasi: Jika disetujui, hanya PPK yang boleh menghapus
        if ($honorarium->status_persetujuan === 'disetujui' && auth()->user()->role !== 'ppk') {
            return redirect()->back()->with('error', 'Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan.');
        }

        $honorarium->delete();

        return redirect()->route('honorarium.index')->with('message', 'Data honorarium berhasil dihapus.');
    }

    /**
     * Operator/Admin: Ajukan persetujuan honor ke PPK.
     */
    public function ajukanPersetujuan(Honorarium $honorarium)
    {
        if ($honorarium->status_persetujuan === 'disetujui') {
            return redirect()->back()->with('error', 'Honorarium ini sudah disetujui PPK.');
        }

        $honorarium->update([
            'status_persetujuan' => 'menunggu_persetujuan',
        ]);

        return redirect()->back()->with('message', 'Honorarium berhasil diajukan ke PPK untuk persetujuan.');
    }

    /**
     * PPK Only: Setujui honorarium.
     */
    public function setujui(Honorarium $honorarium)
    {
        if (auth()->user()->role !== 'ppk') {
            abort(403, 'Hanya PPK yang berhak menyetujui honorarium.');
        }

        $honorarium->update([
            'status_persetujuan' => 'disetujui',
            'approved_by'        => auth()->id(),
            'approved_at'        => now(),
            'catatan_ppk'        => null,
        ]);

        return redirect()->back()->with('message', 'Honorarium berhasil disetujui PPK.');
    }

    /**
     * PPK Only: Tolak honorarium dengan catatan.
     */
    public function tolak(Request $request, Honorarium $honorarium)
    {
        if (auth()->user()->role !== 'ppk') {
            abort(403, 'Hanya PPK yang berhak menolak honorarium.');
        }

        $validated = $request->validate([
            'catatan_ppk' => 'required|string|max:1000',
        ], [
            'catatan_ppk.required' => 'Alasan/catatan penolakan wajib diisi oleh PPK.',
        ]);

        $honorarium->update([
            'status_persetujuan' => 'ditolak',
            'catatan_ppk'        => $validated['catatan_ppk'],
            'approved_by'        => auth()->id(),
            'approved_at'        => now(),
        ]);

        return redirect()->back()->with('message', 'Honorarium telah ditolak dengan catatan PPK.');
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = Honorarium::onlyTrashed()->with(['penugasan.mitra', 'penugasan.kegiatan', 'approver']);

        if ($request->filled('search')) {
            $query->whereHas('penugasan.mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
            });
        }

        $trashedHonorarium = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Honorarium/RecycleBin', [
            'trashedHonorarium' => $trashedHonorarium,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore data honorarium.
     */
    public function restore($id)
    {
        $honorarium = Honorarium::onlyTrashed()->findOrFail($id);
        $honorarium->restore();

        return redirect()->back()->with('success', "Honorarium berhasil dipulihkan dari Recycle Bin.");
    }

    /**
     * Force delete data honorarium.
     */
    public function forceDelete($id)
    {
        $honorarium = Honorarium::onlyTrashed()->findOrFail($id);
        $honorarium->forceDelete();

        return redirect()->back()->with('success', "Honorarium telah dihapus secara permanen.");
    }

    /**
     * Restore multiple resources from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:honoraria,id'
        ]);

        Honorarium::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('success', count($request->ids) . ' honorarium berhasil dipulihkan.');
    }

    /**
     * Force delete multiple resources from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:honoraria,id'
        ]);

        Honorarium::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' honorarium telah dihapus secara permanen.');
    }
}