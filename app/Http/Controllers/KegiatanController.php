<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Kegiatan::with('detilKegiatan');

        if ($request->filled('jenis_sbml')) {
            $query->whereHas('detilKegiatan', function ($q) use ($request) {
                $q->where('jenis_sbml', $request->jenis_sbml);
            });
        }

        if ($request->filled('status')) {
            $query->where('status_aktif', $request->status);
        }

        if ($request->filled('cari')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_kegiatan', 'like', '%' . $request->cari . '%')
                  ->orWhere('kode_kegiatan', 'like', '%' . $request->cari . '%');
            });
        }

        $kegiatan = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Kegiatan/Index', [
            'kegiatan'      => $kegiatan,
            'kegiatanCount' => $kegiatan->total(),
            'filters'       => $request->only(['jenis_sbml', 'status', 'cari'])
        ]);
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kegiatan'   => 'required|string|max:255',
            'kode_kegiatan'   => 'nullable|string|max:100',
            'tanggal_mulai'   => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'deskripsi'       => 'nullable|string',

            // Validasi Detil Belanja
            'detil'                       => 'required|array|min:1',
            'detil.*.nama_detil'          => 'required|string|max:255',
            'detil.*.jenis_sbml'          => 'required|string|in:pendataan,pengolahan',
            'detil.*.frekuensi_penugasan' => 'nullable|string|in:bulanan,triwulanan,tahunan',
            'detil.*.satuan'              => 'required|string|max:50',
            'detil.*.jumlah'              => 'required|numeric|min:0.01',
            'detil.*.harga_satuan'        => 'required|numeric|min:0',
        ], [
            'nama_kegiatan.required'        => 'Nama kegiatan wajib diisi.',
            'detil.required'                => 'Minimal 1 Detil rincian belanja wajib diisi.',
            'detil.min'                     => 'Minimal 1 Detil rincian belanja wajib diisi.',
            'detil.*.nama_detil.required'   => 'Nama Detil rincian wajib diisi.',
            'detil.*.jenis_sbml.required'   => 'Jenis SBML pada Detil wajib dipilih.',
            'detil.*.satuan.required'       => 'Satuan Detil wajib diisi.',
            'detil.*.jumlah.required'       => 'Jumlah volume wajib diisi.',
            'detil.*.harga_satuan.required' => 'Harga satuan wajib diisi.',
        ]);

        DB::transaction(function () use ($validated) {
            $totalAnggaran = 0;
            foreach ($validated['detil'] as $detilData) {
                $totalAnggaran += (float)$detilData['jumlah'] * (float)$detilData['harga_satuan'];
            }

            $kegiatan = Kegiatan::create([
                'nama_kegiatan'   => trim($validated['nama_kegiatan']),
                'kode_kegiatan'   => !empty($validated['kode_kegiatan']) ? trim($validated['kode_kegiatan']) : null,
                'tanggal_mulai'   => $validated['tanggal_mulai'] ?? null,
                'tanggal_selesai' => $validated['tanggal_selesai'] ?? null,
                'status_aktif'    => true,
                'deskripsi'       => $validated['deskripsi'] ?? null,
                'total_anggaran'  => $totalAnggaran,
                'created_by'      => auth()->id(),
            ]);

            foreach ($validated['detil'] as $detilData) {
                $jumlah = (float)$detilData['jumlah'];
                $hargaSatuan = (float)$detilData['harga_satuan'];
                $total = $jumlah * $hargaSatuan;

                DetilKegiatan::create([
                    'kegiatan_id'         => $kegiatan->id,
                    'nama_detil'          => trim($detilData['nama_detil']),
                    'jenis_sbml'          => strtolower($detilData['jenis_sbml'] ?? 'pendataan'),
                    'frekuensi_penugasan' => !empty($detilData['frekuensi_penugasan']) ? strtolower($detilData['frekuensi_penugasan']) : 'bulanan',
                    'satuan'              => trim($detilData['satuan']),
                    'jumlah'              => $jumlah,
                    'harga_satuan'        => $hargaSatuan,
                    'total'               => $total,
                ]);
            }
        });

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil ditambahkan beserta rincian Detil Belanja.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        $kegiatan->load('detilKegiatan');

        $grandTotal = 0;
        foreach ($kegiatan->detilKegiatan as $detil) {
            $grandTotal += (float)($detil->total ?? ($detil->jumlah * $detil->harga_satuan));
        }

        return Inertia::render('Kegiatan/Show', [
            'kegiatan'   => $kegiatan,
            'grandTotal' => $grandTotal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kegiatan $kegiatan)
    {
        $kegiatan->load('detilKegiatan');

        return Inertia::render('Kegiatan/Edit', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'nama_kegiatan'   => 'required|string|max:255',
            'kode_kegiatan'   => 'nullable|string|max:100',
            'tanggal_mulai'   => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'deskripsi'       => 'nullable|string',

            'detil'                       => 'required|array|min:1',
            'detil.*.nama_detil'          => 'required|string|max:255',
            'detil.*.jenis_sbml'          => 'required|string|in:pendataan,pengolahan',
            'detil.*.frekuensi_penugasan' => 'nullable|string|in:bulanan,triwulanan,tahunan',
            'detil.*.satuan'              => 'required|string|max:50',
            'detil.*.jumlah'              => 'required|numeric|min:0.01',
            'detil.*.harga_satuan'        => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $kegiatan) {
            $totalAnggaran = 0;
            foreach ($validated['detil'] as $detilData) {
                $totalAnggaran += (float)$detilData['jumlah'] * (float)$detilData['harga_satuan'];
            }

            $kegiatan->update([
                'nama_kegiatan'   => trim($validated['nama_kegiatan']),
                'kode_kegiatan'   => !empty($validated['kode_kegiatan']) ? trim($validated['kode_kegiatan']) : null,
                'tanggal_mulai'   => $validated['tanggal_mulai'] ?? $kegiatan->tanggal_mulai,
                'tanggal_selesai' => $validated['tanggal_selesai'] ?? $kegiatan->tanggal_selesai,
                'deskripsi'       => $validated['deskripsi'] ?? $kegiatan->deskripsi,
                'total_anggaran'  => $totalAnggaran,
            ]);

            $kegiatan->detilKegiatan()->delete();

            foreach ($validated['detil'] as $detilData) {
                $jumlah = (float)$detilData['jumlah'];
                $hargaSatuan = (float)$detilData['harga_satuan'];
                $total = $jumlah * $hargaSatuan;

                DetilKegiatan::create([
                    'kegiatan_id'         => $kegiatan->id,
                    'nama_detil'          => trim($detilData['nama_detil']),
                    'jenis_sbml'          => strtolower($detilData['jenis_sbml'] ?? 'pendataan'),
                    'frekuensi_penugasan' => !empty($detilData['frekuensi_penugasan']) ? strtolower($detilData['frekuensi_penugasan']) : 'bulanan',
                    'satuan'              => trim($detilData['satuan']),
                    'jumlah'              => $jumlah,
                    'harga_satuan'        => $hargaSatuan,
                    'total'               => $total,
                ]);
            }
        });

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $kegiatan->delete();

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:kegiatans,id'
        ]);

        Kegiatan::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', count($request->ids) . ' kegiatan berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = Kegiatan::onlyTrashed()->with('detilKegiatan');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_kegiatan', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_kegiatan', 'like', '%' . $request->search . '%');
            });
        }

        $kegiatans = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Kegiatan/RecycleBin', [
            'kegiatans' => $kegiatans,
            'filters'   => $request->only(['search']),
        ]);
    }

    /**
     * Restore data kegiatan.
     */
    public function restore($id)
    {
        $kegiatan = Kegiatan::onlyTrashed()->findOrFail($id);
        $kegiatan->restore();

        return redirect()->back()->with('message', 'Kegiatan berhasil dipulihkan.');
    }

    /**
     * Force delete data kegiatan.
     */
    public function forceDelete($id)
    {
        $kegiatan = Kegiatan::onlyTrashed()->findOrFail($id);
        $kegiatan->forceDelete();

        return redirect()->back()->with('message', 'Kegiatan berhasil dihapus secara permanen.');
    }

    /**
     * Duplicate the specified resource in storage.
     */
    public function duplicate(Request $request, Kegiatan $kegiatan)
    {
        $request->validate([
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date',
            'status_aktif'    => 'required|boolean',
        ]);

        $kegiatan->load('detilKegiatan');

        DB::transaction(function () use ($request, $kegiatan) {
            $newKegiatan = $kegiatan->replicate();
            
            $mulai = \Carbon\Carbon::parse($request->tanggal_mulai);
            $selesai = \Carbon\Carbon::parse($request->tanggal_selesai);

            $newKegiatan->tanggal_mulai = $mulai->format('Y-m-d');
            $newKegiatan->tanggal_selesai = $selesai->format('Y-m-d');
            $newKegiatan->status_aktif = $request->status_aktif;
            $newKegiatan->nama_kegiatan = $kegiatan->nama_kegiatan . ' (' . $mulai->format('M Y') . ')';
            $newKegiatan->created_by = auth()->id();
            $newKegiatan->save();

            // Duplikat detil
            foreach ($kegiatan->detilKegiatan as $detil) {
                $newDetil = $detil->replicate();
                $newDetil->kegiatan_id = $newKegiatan->id;
                $newDetil->save();
            }
        });

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan beserta Detil Belanja berhasil diduplikasi.');
    }
}