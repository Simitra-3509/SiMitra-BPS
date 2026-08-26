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
            'filters'       => $request->only(['jenis_sbml', 'bulan', 'tahun', 'status', 'cari'])
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
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['ppk', 'admin', 'administrator'])) {
            abort(403, 'Hanya PPK dan Admin yang berhak menambah atau mengubah data kegiatan.');
        }
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

        return redirect()->route('kegiatan.index')->with('success', "Kegiatan '{$kegiatan->nama_kegiatan}' berhasil disimpan beserta rincian Detil Belanja.");
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
        if (!in_array(strtolower(auth()->user()->role ?? ''), ['ppk', 'admin', 'administrator'])) {
            abort(403, 'Hanya PPK dan Admin yang berhak menambah atau mengubah data kegiatan.');
        }
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

        return redirect()->route('kegiatan.index')->with('success', "Perubahan data kegiatan '{$kegiatan->nama_kegiatan}' berhasil disimpan.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $nama = $kegiatan->nama_kegiatan;
        $kegiatan->delete();

        return redirect()->route('kegiatan.index')->with('success', "Kegiatan '{$nama}' berhasil dipindahkan ke Recycle Bin.");
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
        $nama = $kegiatan->nama_kegiatan;
        $kegiatan->restore();

        return redirect()->back()->with('success', "Kegiatan '{$nama}' berhasil dipulihkan dari Recycle Bin.");
    }

    /**
     * Force delete data kegiatan.
     */
    public function forceDelete($id)
    {
        $kegiatan = Kegiatan::onlyTrashed()->findOrFail($id);
        $nama = $kegiatan->nama_kegiatan;
        $kegiatan->forceDelete();

        return redirect()->back()->with('success', "Kegiatan '{$nama}' telah dihapus secara permanen.");
    }

    /**
     * Restore multiple resources from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:kegiatans,id'
        ]);

        Kegiatan::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('success', count($request->ids) . ' kegiatan berhasil dipulihkan.');
    }

    /**
     * Force delete multiple resources from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:kegiatans,id'
        ]);

        Kegiatan::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' kegiatan telah dihapus secara permanen.');
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

        return redirect()->route('kegiatan.index')->with('success', "Kegiatan '{$kegiatan->nama_kegiatan}' beserta Detil Belanja berhasil diduplikasi.");
    }

    /**
    /**
     * Import data kegiatan beserta detil belanja dari file CSV/Excel.
     */
    public function import(Request $request)
    {
        $rows = $request->input('rows', []);

        if (empty($rows) && $request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());

            if (in_array($extension, ['csv', 'txt'])) {
                $handle = fopen($file->getRealPath(), 'r');
                $header = null;
                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($row) === 1 && str_contains($row[0], ';')) {
                        $row = explode(';', $row[0]);
                    }
                    if (!$header) {
                        $header = array_map(function ($h) {
                            return strtolower(trim(preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $h)));
                        }, $row);
                    } else {
                        if (count($row) === count($header)) {
                            $rows[] = array_combine($header, array_map('trim', $row));
                        }
                    }
                }
                fclose($handle);
            }
        }

        if (empty($rows)) {
            return redirect()->back()->with('error', 'File import kosong atau data tidak dapat dibaca.');
        }

        $importedKegiatans = 0;
        $importedDetils = 0;

        // Helper: konversi nilai tanggal Excel (serial number, string, dll) ke format Y-m-d
        $parseExcelDate = function ($value) {
            if (empty($value) && $value !== 0) return null;
            // Sudah format YYYY-MM-DD
            if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
                return \Carbon\Carbon::parse($value)->format('Y-m-d');
            }
            // Excel serial number (angka bulat > 1000)
            if (is_numeric($value) && intval($value) == $value && intval($value) > 1000) {
                // Epoch Excel = 1899-12-30
                return \Carbon\Carbon::create(1899, 12, 30)->addDays(intval($value))->format('Y-m-d');
            }
            // String tanggal lain, coba parse
            try {
                return \Carbon\Carbon::parse((string)$value)->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        };

        DB::transaction(function () use ($rows, $parseExcelDate, &$importedKegiatans, &$importedDetils) {
            $grouped = [];
            foreach ($rows as $row) {
                $kodeKro = $row['Kode KRO'] ?? $row['kode kro'] ?? $row['kode_kro'] ?? $row['kro'] ?? $row['kode_kegiatan'] ?? '';
                $namaKegiatan = $row['Nama Kegiatan'] ?? $row['nama kegiatan'] ?? $row['nama_kegiatan'] ?? '';

                if (empty($namaKegiatan)) continue;

                // Kelompokkan berdasarkan KRO / Nama Kegiatan
                $groupKey = !empty($kodeKro) ? trim($kodeKro) . '|' . trim($namaKegiatan) : md5(trim($namaKegiatan));

                if (!isset($grouped[$groupKey])) {
                    $rawMulai   = $row['Tanggal Mulai']   ?? $row['tanggal mulai']   ?? $row['tanggal_mulai']   ?? $row['tgl_mulai']   ?? null;
                    $rawSelesai = $row['Tanggal Selesai'] ?? $row['tanggal selesai'] ?? $row['tanggal_selesai'] ?? $row['tgl_selesai'] ?? null;
                    $grouped[$groupKey] = [
                        'kode_kro'      => trim($kodeKro),
                        'nama_kegiatan' => trim($namaKegiatan),
                        'tgl_mulai'     => $parseExcelDate($rawMulai),
                        'tgl_selesai'   => $parseExcelDate($rawSelesai),
                        'detils'        => []
                    ];
                }

                $namaDetil = $row['Nama Detil'] ?? $row['nama detil'] ?? $row['nama_detil'] ?? '';
                if (!empty($namaDetil)) {
                    $grouped[$groupKey]['detils'][] = [
                        'nama_detil' => trim($namaDetil),
                        'jenis_sbml' => strtolower($row['Jenis SBML'] ?? $row['jenis sbml'] ?? $row['jenis_sbml'] ?? 'pendataan'),
                        'frekuensi_penugasan' => strtolower($row['Frekuensi'] ?? $row['frekuensi'] ?? $row['frekuensi_penugasan'] ?? 'bulanan'),
                        'satuan' => trim($row['Satuan'] ?? $row['satuan'] ?? 'DOK'),
                        'jumlah' => (float)($row['Jumlah'] ?? $row['jumlah'] ?? 1),
                        'harga_satuan' => (float)($row['Harga Satuan'] ?? $row['harga satuan'] ?? $row['harga_satuan'] ?? 0),
                    ];
                }
            }

            foreach ($grouped as $group) {
                $totalAnggaranGroup = 0;
                foreach ($group['detils'] as $d) {
                    $totalAnggaranGroup += $d['jumlah'] * $d['harga_satuan'];
                }

                // Cari atau buat kegiatan baru (mencegah Kegiatan ganda/dobel)
                $kegiatan = Kegiatan::firstOrCreate(
                    [
                        'nama_kegiatan' => $group['nama_kegiatan'],
                    ],
                    [
                        'kode_kegiatan' => !empty($group['kode_kro']) ? $group['kode_kro'] : null,
                        'tanggal_mulai' => !empty($group['tgl_mulai']) ? $group['tgl_mulai'] : null,
                        'tanggal_selesai' => !empty($group['tgl_selesai']) ? $group['tgl_selesai'] : null,
                        'status_aktif' => true,
                        'total_anggaran' => $totalAnggaranGroup,
                        'created_by' => auth()->id(),
                    ]
                );

                if ($kegiatan->wasRecentlyCreated) {
                    $importedKegiatans++;
                } else {
                    // Update total anggaran jika kegiatan sudah ada
                    $kegiatan->total_anggaran += $totalAnggaranGroup;
                    if (!empty($group['kode_kro'])) $kegiatan->kode_kegiatan = $group['kode_kro'];
                    if (!empty($group['tgl_mulai'])) $kegiatan->tanggal_mulai = $group['tgl_mulai'];
                    if (!empty($group['tgl_selesai'])) $kegiatan->tanggal_selesai = $group['tgl_selesai'];
                    $kegiatan->save();
                }

                // Tambahkan semua baris detil ke Kegiatan tersebut
                foreach ($group['detils'] as $d) {
                    DetilKegiatan::create([
                        'kegiatan_id' => $kegiatan->id,
                        'nama_detil' => $d['nama_detil'],
                        'jenis_sbml' => in_array($d['jenis_sbml'], ['pendataan', 'pengolahan']) ? $d['jenis_sbml'] : 'pendataan',
                        'frekuensi_penugasan' => in_array($d['frekuensi_penugasan'], ['bulanan', 'triwulanan', 'tahunan']) ? $d['frekuensi_penugasan'] : 'bulanan',
                        'satuan' => $d['satuan'],
                        'jumlah' => $d['jumlah'],
                        'harga_satuan' => $d['harga_satuan'],
                        'total' => $d['jumlah'] * $d['harga_satuan'],
                    ]);
                    $importedDetils++;
                }
            }
        });

        return redirect()->route('kegiatan.index')->with('success', "Berhasil mengimpor {$importedKegiatans} kegiatan beserta {$importedDetils} rincian detil belanja.");
    }
}