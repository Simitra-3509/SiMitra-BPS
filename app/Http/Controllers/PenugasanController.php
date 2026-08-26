<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Http\Requests\UpdatePenugasanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PenugasanController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role:operator', only: [
                'create', 'store', 'edit', 'update', 'destroy', 
                'bulkDestroy', 'restore', 'forceDelete', 
                'bulkRestore', 'bulkForceDelete'
            ]),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Penugasan::with(['kegiatan', 'detilKegiatan', 'mitra']);

        if ($request->filled('kegiatan_id')) {
            $query->where('kegiatan_id', $request->kegiatan_id);
        }

        if ($request->filled('detil_kegiatan_id')) {
            $query->where('detil_kegiatan_id', $request->detil_kegiatan_id);
        }

        if ($request->filled('tanggal_mulai')) {
            $query->where('tanggal_mulai', '>=', $request->tanggal_mulai);
        }

        if ($request->filled('tanggal_selesai')) {
            $query->where('tanggal_selesai', '<=', $request->tanggal_selesai);
        }

        if ($request->filled('search')) {
            $query->whereHas('mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%')
                  ->orWhere('nik', 'like', '%' . $request->search . '%');
            });
        }

        $penugasan = $query->latest()->paginate(15)->withQueryString();
        $semuaKegiatan = Kegiatan::orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan']);

        return Inertia::render('Penugasan/Index', [
            'penugasan'     => $penugasan,
            'semuaKegiatan' => $semuaKegiatan,
            'filters'       => $request->only(['kegiatan_id', 'detil_kegiatan_id', 'tanggal_mulai', 'tanggal_selesai', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kegiatan = Kegiatan::where('status_aktif', true)->orderBy('nama_kegiatan')->get(['id', 'nama_kegiatan', 'kode_kegiatan']);

        return Inertia::render('Penugasan/Create', [
            'kegiatan'     => $kegiatan,
            'kegiatanList' => $kegiatan,
        ]);
    }

    /**
     * API: Fetch Detil Belanja by Kegiatan ID
     */
    public function getDetilByKegiatan($kegiatan_id)
    {
        $detilList = DetilKegiatan::where('kegiatan_id', $kegiatan_id)->get();
        return response()->json($detilList);
    }

    /**
     * API: Search Mitra (by Sobat ID / Nama Lengkap)
     */
    public function searchMitra(Request $request)
    {
        $q = trim($request->get('q', ''));
        $query = Mitra::where('status_aktif', true);

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('sobat_id', 'like', "%{$q}%")
                    ->orWhere('nama_lengkap', 'like', "%{$q}%");
            });
        }

        $mitraList = $query->orderBy('nama_lengkap')->limit(20)->get(['id', 'sobat_id', 'nama_lengkap']);
        return response()->json($mitraList);
    }

    /**
     * Helper: Parse Date String to Get Previous Month Range
     * We don't have this function anymore.
     */

    /**
     * API: Fetch Prev Month Penugasan for Copy Button
     */
    public function getPrevMonthPenugasan(Request $request)
    {
        $detilId = $request->get('detil_kegiatan_id');
        $tanggalMulai = $request->get('tanggal_mulai');

        if (!$detilId || !$tanggalMulai) {
            return response()->json([]);
        }

        // Hitung tanggal mulai bulan sebelumnya
        $prevMulai = date('Y-m-d', strtotime('-1 month', strtotime($tanggalMulai)));

        // Cari penugasan dengan tanggal mulai yang sama di bulan sebelumnya
        $prevPenugasan = Penugasan::with('mitra')
            ->where('detil_kegiatan_id', $detilId)
            ->where('tanggal_mulai', $prevMulai)
            ->get();

        $result = $prevPenugasan->map(function ($item) {
            return [
                'mitra_id'     => $item->mitra_id,
                'sobat_id'     => $item->mitra->sobat_id ?? '-',
                'nama_lengkap' => $item->mitra->nama_lengkap ?? 'Mitra',
                'kuota_target' => $item->kuota_target,
            ];
        });

        $namaBulanList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        $prevBulanNum = (int)date('n', strtotime($prevMulai));

        return response()->json([
            'prev_bulan_nama' => $namaBulanList[$prevBulanNum],
            'prev_tahun'      => date('Y', strtotime($prevMulai)),
            'data'            => $result,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kegiatan_id'           => 'required|exists:kegiatans,id',
            'detil_kegiatan_id'     => 'required|exists:detil_kegiatan,id',
            'tanggal_mulai'         => 'required|date',
            'tanggal_selesai'       => 'required|date|after_or_equal:tanggal_mulai',
            'mitras'                => 'required|array|min:1',
            'mitras.*.id'           => 'required|exists:mitras,id',
            'mitras.*.kuota_target' => 'required|numeric|min:1',
        ], [
            'kegiatan_id.required'           => 'Kegiatan wajib dipilih.',
            'detil_kegiatan_id.required'     => 'Detil rincian wajib dipilih.',
            'tanggal_mulai.required'         => 'Tanggal mulai wajib diisi.',
            'tanggal_selesai.required'       => 'Tanggal selesai wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama dengan atau lebih besar dari tanggal mulai.',
            'mitras.required'                => 'Minimal 1 mitra harus dipilih.',
            'mitras.min'                     => 'Minimal 1 mitra harus dipilih.',
            'mitras.*.kuota_target.required' => 'Kuota per mitra wajib diisi.',
            'mitras.*.kuota_target.min'      => 'Kuota per mitra minimal 1.',
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->mitras as $mitraItem) {
                    $exists = Penugasan::where('detil_kegiatan_id', $request->detil_kegiatan_id)
                        ->where('mitra_id', $mitraItem['id'])
                        ->where('tanggal_mulai', $request->tanggal_mulai)
                        ->where('tanggal_selesai', $request->tanggal_selesai)
                        ->exists();

                    if ($exists) {
                        $mitra = Mitra::find($mitraItem['id']);
                        $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';
                        throw new \Exception("Mitra {$namaMitra} sudah ditugaskan ke detil ini pada periode {$request->tanggal_mulai} s/d {$request->tanggal_selesai}.");
                    }

                    Penugasan::create([
                        'kegiatan_id'       => $request->kegiatan_id,
                        'detil_kegiatan_id' => $request->detil_kegiatan_id,
                        'mitra_id'          => $mitraItem['id'],
                        'tanggal_mulai'     => $request->tanggal_mulai,
                        'tanggal_selesai'   => $request->tanggal_selesai,
                        'kuota_target'      => $mitraItem['kuota_target'] ?? 1,
                        'status'            => 'ditugaskan',
                    ]);
                }
            });
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['mitras' => 'Terjadi duplikasi penugasan: Mitra sudah ditugaskan ke detil ini pada periode yang sama.']);
        } catch (\Exception $e) {
            return back()->withErrors(['mitras' => $e->getMessage()]);
        }

        return redirect()->route('penugasan.index')
            ->with('success', count($request->mitras) . ' penugasan mitra berhasil ditambahkan.');
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
        $penugasan->load(['kegiatan', 'mitra']);
        $kegiatan = Kegiatan::where('status_aktif', true)->get(['id', 'nama_kegiatan']);
        $mitra    = Mitra::where('status_aktif', true)->get(['id', 'nama_lengkap', 'sobat_id']);

        return Inertia::render('Penugasan/Edit', [
            'penugasan' => $penugasan,
            'kegiatan'  => $kegiatan,
            'mitra'     => $mitra,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePenugasanRequest $request, Penugasan $penugasan)
    {
        $penugasan->update($request->validated());

        return redirect()->route('penugasan.index')->with('success', 'Perubahan data penugasan mitra berhasil disimpan.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Penugasan $penugasan)
    {
        $penugasan->delete();

        return back()->with('success', '1 penugasan mitra berhasil dipindahkan ke Recycle Bin.');
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

        return back()->with('success', count($request->ids) . ' data penugasan mitra berhasil dipindahkan ke Recycle Bin.');
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = Penugasan::onlyTrashed()->with(['kegiatan', 'detilKegiatan', 'mitra']);

        if ($request->filled('search')) {
            $query->whereHas('mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
            });
        }

        $penugasans = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Penugasan/RecycleBin', [
            'penugasans' => $penugasans,
            'filters'    => $request->only(['search']),
        ]);
    }

    /**
     * Restore data penugasan.
     */
    public function restore($id)
    {
        $penugasan = Penugasan::onlyTrashed()->findOrFail($id);
        $penugasan->restore();

        return redirect()->back()->with('success', 'Penugasan mitra berhasil dipulihkan dari Recycle Bin.');
    }

    /**
     * Force delete data penugasan.
     */
    public function forceDelete($id)
    {
        $penugasan = Penugasan::onlyTrashed()->findOrFail($id);
        $penugasan->forceDelete();

        return redirect()->back()->with('success', 'Penugasan mitra telah dihapus secara permanen.');
    }

    /**
     * Restore multiple resources from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id'
        ]);

        Penugasan::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra berhasil dipulihkan.');
    }

    /**
     * Force delete multiple resources from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id'
        ]);

        Penugasan::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra telah dihapus secara permanen.');
    }
}
