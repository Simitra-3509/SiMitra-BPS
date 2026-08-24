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
        $query = Honorarium::with(['penugasan.mitra', 'penugasan.kegiatan', 'penugasan.detilKegiatan', 'approver', 'creator']);

        $user = auth()->user();
        $userRole = strtolower($user->role ?? '');

        // Bagian A — POV PPK: Sembunyikan semua baris berstatus 'draft'
        if ($userRole === 'ppk') {
            $query->where('status_persetujuan', '!=', 'draft');
        }

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
    public function create(Request $request)
    {
        $penugasanId = $request->query('penugasan_id');

        $penugasanList = \App\Models\Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra'])
            ->where('status', '!=', 'dibatalkan')
            ->latest()
            ->get();

        return Inertia::render('Honorarium/Create', [
            'penugasanList'       => $penugasanList,
            'selectedPenugasanId' => $penugasanId ? (int)$penugasanId : null,
        ]);
    }

    /**
     * Simpan honorarium baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'penugasan_id'  => 'required|exists:penugasans,id',
            'jumlah_item'   => 'required|numeric|min:1',
            'tanggal_input' => 'required|date',
            'keterangan'    => 'nullable|string',
        ], [
            'penugasan_id.required'  => 'Penugasan (Kegiatan - Mitra) wajib dipilih.',
            'jumlah_item.required'   => 'Volume (Jumlah Item) wajib diisi.',
            'jumlah_item.min'        => 'Volume minimal 1.',
            'tanggal_input.required' => 'Tanggal input wajib diisi.',
        ]);

        $penugasan = \App\Models\Penugasan::with('detilKegiatan')->findOrFail($request->penugasan_id);

        $kuotaTarget = (float) ($penugasan->kuota_target ?? 0);
        $jumlahItem = (float) $request->jumlah_item;
        $satuanStr = $penugasan->detilKegiatan->satuan ?? 'satuan';

        // Bagian B: Hard Block Validasi Volume vs Kuota Target
        if ($jumlahItem > $kuotaTarget) {
            return redirect()->back()->withErrors([
                'jumlah_item' => "Volume tidak boleh melebihi kuota target ({$kuotaTarget} {$satuanStr}) pada penugasan ini."
            ])->withInput();
        }

        $hargaSatuan = (float) ($penugasan->detilKegiatan->harga_satuan ?? 0);
        $jumlahHonor = $jumlahItem * $hargaSatuan; // Dihitung ulang di server
        $jenisHonor = $penugasan->detilKegiatan->jenis_sbml ?? 'Honorarium';

        Honorarium::create([
            'penugasan_id'          => $penugasan->id,
            'jumlah_item'           => $jumlahItem,
            'harga_satuan_snapshot' => $hargaSatuan,
            'jumlah_honor'          => $jumlahHonor,
            'jenis_honor'           => $jenisHonor,
            'tanggal_input'         => $request->tanggal_input,
            'keterangan'            => $request->keterangan,
            'status_persetujuan'    => 'draft',
            'input_by'              => auth()->id(),
        ]);

        return redirect()->route('honorarium.index')->with('message', 'Honorarium berhasil ditambahkan dengan status Draft.');
    }

    /**
     * Tampilkan form edit honorarium.
     */
    public function edit(Honorarium $honorarium)
    {
        $user = auth()->user();
        $userRole = strtolower($user->role ?? '');
        $isOwner = $honorarium->input_by && (int)$honorarium->input_by === (int)$user->id;
        $isPpk = $userRole === 'ppk';
        $isAdmin = in_array($userRole, ['admin', 'administrator']);

        if ($honorarium->status_persetujuan === 'draft' && !$isOwner && !$isAdmin) {
            return redirect()->back()->with('error', 'Anda hanya dapat mengedit honorarium draft milik Anda sendiri.');
        }

        if ($honorarium->status_persetujuan === 'disetujui' && !$isPpk) {
            return redirect()->back()->with('error', 'Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan.');
        }

        $honorarium->load(['penugasan.kegiatan', 'penugasan.detilKegiatan', 'penugasan.mitra']);

        $penugasanList = \App\Models\Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra'])
            ->where('status', '!=', 'dibatalkan')
            ->latest()
            ->get();

        return Inertia::render('Honorarium/Edit', [
            'honorarium'    => $honorarium,
            'penugasanList' => $penugasanList,
        ]);
    }

    /**
     * Update honorarium.
     */
    public function update(Request $request, Honorarium $honorarium)
    {
        $user = auth()->user();
        $userRole = strtolower($user->role ?? '');
        $isOwner = $honorarium->input_by && (int)$honorarium->input_by === (int)$user->id;
        $isPpk = $userRole === 'ppk';
        $isAdmin = in_array($userRole, ['admin', 'administrator']);

        // Bagian C — Guard Update Otorisasi Role
        if ($honorarium->status_persetujuan === 'draft') {
            if (!$isOwner && !$isAdmin) {
                return redirect()->back()->with('error', 'Anda hanya dapat mengedit honorarium draft milik Anda sendiri.');
            }
        } elseif ($honorarium->status_persetujuan === 'menunggu_persetujuan') {
            if (!$isPpk && !$isAdmin) {
                return redirect()->back()->with('error', 'Honorarium berstatus Menunggu PPK hanya dapat diedit oleh PPK.');
            }
        } elseif ($honorarium->status_persetujuan === 'disetujui') {
            if (!$isPpk) {
                return redirect()->back()->with('error', 'Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan.');
            }
        } elseif ($honorarium->status_persetujuan === 'ditolak') {
            if (!$isPpk && !$isOwner && !$isAdmin) {
                return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk mengedit honorarium ini.');
            }
        }

        $request->validate([
            'jumlah_item'   => 'required|numeric|min:1',
            'tanggal_input' => 'required|date',
            'keterangan'    => 'nullable|string',
        ]);

        $penugasan = \App\Models\Penugasan::with('detilKegiatan')->findOrFail($honorarium->penugasan_id);

        $kuotaTarget = (float) ($penugasan->kuota_target ?? 0);
        $jumlahItem = (float) $request->jumlah_item;
        $satuanStr = $penugasan->detilKegiatan->satuan ?? 'satuan';

        // Bagian B: Hard Block Validasi Volume vs Kuota Target
        if ($jumlahItem > $kuotaTarget) {
            return redirect()->back()->withErrors([
                'jumlah_item' => "Volume tidak boleh melebihi kuota target ({$kuotaTarget} {$satuanStr}) pada penugasan ini."
            ])->withInput();
        }

        $hargaSatuan = (float) ($penugasan->detilKegiatan->harga_satuan ?? 0);
        $jumlahHonor = $jumlahItem * $hargaSatuan; // Dihitung ulang di server

        $honorarium->update([
            'jumlah_item'           => $jumlahItem,
            'harga_satuan_snapshot' => $hargaSatuan,
            'jumlah_honor'          => $jumlahHonor,
            'tanggal_input'         => $request->tanggal_input,
            'keterangan'            => $request->keterangan,
        ]);

        return redirect()->route('honorarium.index')->with('message', 'Data honorarium berhasil diperbarui.');
    }

    /**
     * Hapus honorarium.
     */
    public function destroy(Honorarium $honorarium)
    {
        $user = auth()->user();
        $userRole = strtolower($user->role ?? '');
        $isOwner = $honorarium->input_by && (int)$honorarium->input_by === (int)$user->id;
        $isPpk = $userRole === 'ppk';
        $isAdmin = in_array($userRole, ['admin', 'administrator']);

        if ($honorarium->status_persetujuan === 'disetujui' && !$isPpk) {
            return redirect()->back()->with('error', 'Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan.');
        }

        if ($honorarium->status_persetujuan === 'draft' && !$isOwner && !$isAdmin) {
            return redirect()->back()->with('error', 'Anda hanya dapat menghapus honorarium draft milik Anda sendiri.');
        }

        $honorarium->delete();

        return redirect()->route('honorarium.index')->with('message', 'Data honorarium berhasil dihapus.');
    }

    /**
     * Bagian B — PPK Only: Batalkan persetujuan honorarium.
     */
    public function batalkanPersetujuan(Honorarium $honorarium)
    {
        if (strtolower(auth()->user()->role ?? '') !== 'ppk') {
            abort(403, 'Hanya PPK yang berhak membatalkan persetujuan.');
        }

        if ($honorarium->status_persetujuan !== 'disetujui') {
            return redirect()->back()->with('error', 'Hanya honor dengan status disetujui yang bisa dibatalkan.');
        }

        $honorarium->update([
            'status_persetujuan' => 'menunggu_persetujuan',
            'approved_by'        => null,
            'approved_at'        => null,
            'catatan_ppk'        => null,
        ]);

        return redirect()->back()->with('message', 'Persetujuan honorarium berhasil dibatalkan dan dikembalikan ke status Menunggu PPK.');
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