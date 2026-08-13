<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\AkunKegiatan;
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
        $query = Kegiatan::with('akunKegiatan.detilKegiatan');

        if ($request->filled('jenis_sbml')) {
            $query->whereHas('akunKegiatan.detilKegiatan', function ($q) use ($request) {
                $q->where('jenis_sbml', $request->jenis_sbml);
            });
        }

        if ($request->filled('status')) {
            $query->where('status_aktif', $request->status);
        }

        if ($request->filled('cari')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_kegiatan', 'like', '%' . $request->cari . '%')
                  ->orWhere('kro', 'like', '%' . $request->cari . '%')
                  ->orWhere('kode_kegiatan', 'like', '%' . $request->cari . '%');
            });
        }

        $kegiatan = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Kegiatan/Index', [
            'kegiatan'      => $kegiatan,
            'kegiatanCount' => $kegiatan->total(),
            'filters'       => $request->only(['jenis_sbml', 'bulan', 'status', 'tahun', 'cari'])
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
            'nama_kegiatan' => 'required|string|max:255',
            'nomor_kro' => 'nullable|string|max:100',
            'kro' => 'nullable|string|max:100',
            'bulan' => 'nullable|string|max:50',
            'tahun' => 'nullable|integer',
            'satuan' => 'nullable|string|max:50',
            'harga_satuan' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tanggal_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'deskripsi' => 'nullable|string',

            // Validasi bertingkat Akun & Detil
            'akun' => 'required|array|min:1',
            'akun.*.nama_akun' => 'required|string|max:255',
            'akun.*.kode_akun' => 'nullable|string|max:50',
            'akun.*.detil' => 'required|array|min:1',
            'akun.*.detil.*.nama_detil' => 'required|string|max:255',
            'akun.*.detil.*.jenis_sbml' => 'required|string|in:pendataan,pengolahan',
            'akun.*.detil.*.frekuensi_penugasan' => 'nullable|string|in:bulanan,triwulanan,tahunan',
            'akun.*.detil.*.satuan' => 'required|string|max:50',
            'akun.*.detil.*.jumlah' => 'required|numeric|min:0.01',
            'akun.*.detil.*.harga_satuan' => 'required|numeric|min:0',
        ], [
            'nama_kegiatan.required' => 'Nama kegiatan wajib diisi.',
            'akun.required' => 'Minimal 1 Akun kegiatan harus diisi.',
            'akun.min' => 'Minimal 1 Akun kegiatan harus diisi.',
            'akun.*.nama_akun.required' => 'Nama Akun wajib diisi.',
            'akun.*.detil.required' => 'Tiap Akun wajib memiliki minimal 1 Detil rincian.',
            'akun.*.detil.min' => 'Tiap Akun wajib memiliki minimal 1 Detil rincian.',
            'akun.*.detil.*.nama_detil.required' => 'Nama Detil rincian wajib diisi.',
            'akun.*.detil.*.jenis_sbml.required' => 'Jenis SBML pada Detil wajib dipilih.',
            'akun.*.detil.*.satuan.required' => 'Satuan Detil wajib diisi.',
            'akun.*.detil.*.jumlah.required' => 'Jumlah volume wajib diisi.',
            'akun.*.detil.*.harga_satuan.required' => 'Harga satuan wajib diisi.',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $totalAnggaran = 0;
            foreach ($validated['akun'] as $akunData) {
                foreach ($akunData['detil'] as $detilData) {
                    $totalAnggaran += (float)$detilData['jumlah'] * (float)$detilData['harga_satuan'];
                }
            }

            $kegiatan = Kegiatan::create([
                'nama_kegiatan' => $validated['nama_kegiatan'],
                'kro' => $validated['nomor_kro'] ?? $validated['kro'] ?? null,
                'bulan' => $validated['bulan'] ?? date('F'),
                'tahun' => $validated['tahun'] ?? date('Y'),
                'status_aktif' => true,
                'satuan_kegiatan' => $validated['satuan'] ?? null,
                'harga_satuan' => $validated['harga_satuan'] ?? null,
                'tanggal_mulai' => $validated['tgl_mulai'] ?? $validated['tanggal_mulai'] ?? null,
                'tanggal_selesai' => $validated['tgl_selesai'] ?? $validated['tanggal_selesai'] ?? null,
                'deskripsi' => $validated['deskripsi'] ?? null,
                'total_anggaran' => $totalAnggaran,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['akun'] as $akunData) {
                $akun = AkunKegiatan::create([
                    'kegiatan_id' => $kegiatan->id,
                    'kode_akun' => !empty($akunData['kode_akun']) ? trim($akunData['kode_akun']) : null,
                    'nama_akun' => trim($akunData['nama_akun']),
                ]);

                foreach ($akunData['detil'] as $detilData) {
                    $jumlah = (float)$detilData['jumlah'];
                    $hargaSatuan = (float)$detilData['harga_satuan'];
                    $total = $jumlah * $hargaSatuan;

                    DetilKegiatan::create([
                        'akun_id' => $akun->id,
                        'nama_detil' => trim($detilData['nama_detil']),
                        'jenis_sbml' => strtolower($detilData['jenis_sbml'] ?? 'pendataan'),
                        'frekuensi_penugasan' => !empty($detilData['frekuensi_penugasan']) ? strtolower($detilData['frekuensi_penugasan']) : 'bulanan',
                        'satuan' => trim($detilData['satuan']),
                        'jumlah' => $jumlah,
                        'harga_satuan' => $hargaSatuan,
                        'total' => $total,
                    ]);
                }
            }
        });

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil ditambahkan beserta rincian Akun & Detil.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        $kegiatan->load('akunKegiatan.detilKegiatan');

        $grandTotal = 0;
        foreach ($kegiatan->akunKegiatan as $akun) {
            foreach ($akun->detilKegiatan as $detil) {
                $grandTotal += (float)($detil->total ?? ($detil->jumlah * $detil->harga_satuan));
            }
        }

        return Inertia::render('Kegiatan/Show', [
            'kegiatan' => $kegiatan,
            'grandTotal' => $grandTotal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kegiatan $kegiatan)
    {
        $kegiatan->load('akunKegiatan.detilKegiatan');

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
            'nama_kegiatan' => 'required|string|max:255',
            'nomor_kro' => 'nullable|string|max:100',
            'kro' => 'nullable|string|max:100',
            'bulan' => 'nullable|string|max:50',
            'tahun' => 'nullable|integer',
            'satuan' => 'nullable|string|max:50',
            'harga_satuan' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tanggal_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'deskripsi' => 'nullable|string',

            // Validasi bertingkat Akun & Detil
            'akun' => 'required|array|min:1',
            'akun.*.nama_akun' => 'required|string|max:255',
            'akun.*.kode_akun' => 'nullable|string|max:50',
            'akun.*.detil' => 'required|array|min:1',
            'akun.*.detil.*.nama_detil' => 'required|string|max:255',
            'akun.*.detil.*.jenis_sbml' => 'required|string|in:pendataan,pengolahan',
            'akun.*.detil.*.frekuensi_penugasan' => 'nullable|string|in:bulanan,triwulanan,tahunan',
            'akun.*.detil.*.satuan' => 'required|string|max:50',
            'akun.*.detil.*.jumlah' => 'required|numeric|min:0.01',
            'akun.*.detil.*.harga_satuan' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $kegiatan) {
            $totalAnggaran = 0;
            foreach ($validated['akun'] as $akunData) {
                foreach ($akunData['detil'] as $detilData) {
                    $totalAnggaran += (float)$detilData['jumlah'] * (float)$detilData['harga_satuan'];
                }
            }

            $kegiatan->update([
                'nama_kegiatan' => $validated['nama_kegiatan'],
                'kro' => $validated['nomor_kro'] ?? $validated['kro'] ?? null,
                'bulan' => $validated['bulan'] ?? $kegiatan->bulan,
                'tahun' => $validated['tahun'] ?? $kegiatan->tahun,
                'satuan_kegiatan' => $validated['satuan'] ?? $kegiatan->satuan_kegiatan,
                'harga_satuan' => $validated['harga_satuan'] ?? $kegiatan->harga_satuan,
                'tanggal_mulai' => $validated['tgl_mulai'] ?? $validated['tanggal_mulai'] ?? $kegiatan->tanggal_mulai,
                'tanggal_selesai' => $validated['tgl_selesai'] ?? $validated['tanggal_selesai'] ?? $kegiatan->tanggal_selesai,
                'deskripsi' => $validated['deskripsi'] ?? $kegiatan->deskripsi,
                'total_anggaran' => $totalAnggaran,
            ]);

            $kegiatan->akunKegiatan()->delete();

            foreach ($validated['akun'] as $akunData) {
                $akun = AkunKegiatan::create([
                    'kegiatan_id' => $kegiatan->id,
                    'kode_akun' => !empty($akunData['kode_akun']) ? trim($akunData['kode_akun']) : null,
                    'nama_akun' => trim($akunData['nama_akun']),
                ]);

                foreach ($akunData['detil'] as $detilData) {
                    $jumlah = (float)$detilData['jumlah'];
                    $hargaSatuan = (float)$detilData['harga_satuan'];
                    $total = $jumlah * $hargaSatuan;

                    DetilKegiatan::create([
                        'akun_id' => $akun->id,
                        'nama_detil' => trim($detilData['nama_detil']),
                        'jenis_sbml' => strtolower($detilData['jenis_sbml'] ?? 'pendataan'),
                        'frekuensi_penugasan' => !empty($detilData['frekuensi_penugasan']) ? strtolower($detilData['frekuensi_penugasan']) : 'bulanan',
                        'satuan' => trim($detilData['satuan']),
                        'jumlah' => $jumlah,
                        'harga_satuan' => $hargaSatuan,
                        'total' => $total,
                    ]);
                }
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

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan berhasil dihapus');
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
     * Duplicate the specified resource in storage.
     */
    public function duplicate(Request $request, Kegiatan $kegiatan)
    {
        $request->validate([
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'required|date',
            'status_aktif' => 'required|boolean',
        ]);

        $kegiatan->load('akunKegiatan.detilKegiatan');

        DB::transaction(function () use ($request, $kegiatan) {
            $newKegiatan = $kegiatan->replicate();
            
            $bulanIndo = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];
            
            $mulai = \Carbon\Carbon::parse($request->tgl_mulai);
            $selesai = \Carbon\Carbon::parse($request->tgl_selesai);

            $newKegiatan->tanggal_mulai = $mulai->format('Y-m-d');
            $newKegiatan->tanggal_selesai = $selesai->format('Y-m-d');
            $newKegiatan->bulan = $bulanIndo[$mulai->month] ?? date('F');
            $newKegiatan->tahun = $mulai->year;
            $newKegiatan->status_aktif = $request->status_aktif;
            $newKegiatan->nama_kegiatan = $kegiatan->nama_kegiatan . ' (' . ($bulanIndo[$mulai->month] ?? $mulai->format('M')) . ' ' . $mulai->year . ')';
            $newKegiatan->created_by = auth()->id();
            $newKegiatan->save();

            // Duplikat relasi Akun & Detil
            foreach ($kegiatan->akunKegiatan as $akun) {
                $newAkun = $akun->replicate();
                $newAkun->kegiatan_id = $newKegiatan->id;
                $newAkun->save();

                foreach ($akun->detilKegiatan as $detil) {
                    $newDetil = $detil->replicate();
                    $newDetil->akun_id = $newAkun->id;
                    $newDetil->save();
                }
            }
        });

        return redirect()->route('kegiatan.index')->with('message', 'Kegiatan beserta Akun & Detil berhasil diduplikasi');
    }
}