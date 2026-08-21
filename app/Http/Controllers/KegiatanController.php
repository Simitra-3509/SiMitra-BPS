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
     * Native XLSX parser using ZipArchive & SimpleXML
     */
    private function parseXlsx($filePath)
    {
        $rows = [];
        $zip = new \ZipArchive();
        if ($zip->open($filePath) === true) {
            $sharedStrings = [];
            if (($sharedStringsIndex = $zip->locateName('xl/sharedStrings.xml')) !== false) {
                $xmlStr = $zip->getFromIndex($sharedStringsIndex);
                $xml = @simplexml_load_string($xmlStr);
                if ($xml && isset($xml->si)) {
                    foreach ($xml->si as $val) {
                        if (isset($val->t)) {
                            $sharedStrings[] = (string)$val->t;
                        } elseif (isset($val->r)) {
                            $textArr = [];
                            foreach ($val->r as $r) {
                                $textArr[] = (string)($r->t ?? '');
                            }
                            $sharedStrings[] = implode('', $textArr);
                        } else {
                            $sharedStrings[] = '';
                        }
                    }
                }
            }

            $sheetIndex = $zip->locateName('xl/worksheets/sheet1.xml');
            if ($sheetIndex !== false) {
                $xmlStr = $zip->getFromIndex($sheetIndex);
                $xml = @simplexml_load_string($xmlStr);
                if ($xml && isset($xml->sheetData->row)) {
                    foreach ($xml->sheetData->row as $r) {
                        $rowCells = [];
                        foreach ($r->c as $c) {
                            $cellValue = (string)($c->v ?? '');
                            $type = (string)($c['t'] ?? '');
                            if ($type === 's' && isset($sharedStrings[(int)$cellValue])) {
                                $cellValue = $sharedStrings[(int)$cellValue];
                            }
                            $rowCells[] = trim($cellValue);
                        }
                        if (!empty(array_filter($rowCells))) {
                            $rows[] = $rowCells;
                        }
                    }
                }
            }
            $zip->close();
        }
        return $rows;
    }

    /**
     * Import kegiatan from Excel / CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();
        
        $kegiatansData = [];

        if ($extension === 'xlsx' || $extension === 'xls') {
            $rawRows = $this->parseXlsx($path);
            if (!empty($rawRows)) {
                $header = array_shift($rawRows);
                $cleanHeader = array_map(function($h) {
                    return strtolower(trim(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace(' ', '_', $h))));
                }, $header);

                foreach ($rawRows as $row) {
                    if (count($row) >= count($cleanHeader)) {
                        $kegiatansData[] = array_combine(
                            array_slice($cleanHeader, 0, count($row)),
                            array_slice($row, 0, count($cleanHeader))
                        );
                    }
                }
            }
        } elseif ($extension === 'csv') {
            if (($handle = fopen($path, 'r')) !== false) {
                $header = fgetcsv($handle, 1000, ',');
                if ($header && count($header) == 1 && str_contains($header[0], ';')) {
                    rewind($handle);
                    $header = fgetcsv($handle, 1000, ';');
                }
                
                $cleanHeader = array_map(function($h) {
                    return strtolower(trim(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace(' ', '_', $h))));
                }, $header ?? []);

                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($row) === 1 && str_contains($row[0], ';')) {
                        $row = explode(';', $row[0]);
                    }
                    if (count($row) >= count($cleanHeader)) {
                        $rowData = array_combine(array_slice($cleanHeader, 0, count($row)), array_slice($row, 0, count($cleanHeader)));
                        $kegiatansData[] = $rowData;
                    }
                }
                fclose($handle);
            }
        }

        if (empty($kegiatansData)) {
            return redirect()->back()->withErrors(['file' => 'Tidak ada data kegiatan yang valid untuk diimport atau format file salah.']);
        }

        // Kelompokkan berdasarkan nama_kegiatan
        $groupedKegiatans = [];
        foreach ($kegiatansData as $row) {
            $namaKegiatan = trim($row['nama_kegiatan'] ?? $row['kegiatan'] ?? '');
            if (empty($namaKegiatan)) continue;

            $key = strtolower(str_replace(' ', '_', $namaKegiatan));
            if (!isset($groupedKegiatans[$key])) {
                $tglMulai = $this->parseExcelDate($row['tanggal_mulai'] ?? $row['tgl_mulai'] ?? null);
                $tglSelesai = $this->parseExcelDate($row['tanggal_selesai'] ?? $row['tgl_selesai'] ?? null);

                $groupedKegiatans[$key] = [
                    'nama_kegiatan' => $namaKegiatan,
                    'kode_kegiatan' => trim($row['kode_kegiatan'] ?? $row['kode'] ?? $row['kro'] ?? ''),
                    'tanggal_mulai' => $tglMulai,
                    'tanggal_selesai' => $tglSelesai,
                    'deskripsi' => trim($row['deskripsi'] ?? ''),
                    'detil' => []
                ];
            }

            $namaDetil = trim($row['nama_detil'] ?? $row['detil'] ?? $row['rincian'] ?? '');
            if (!empty($namaDetil)) {
                $groupedKegiatans[$key]['detil'][] = [
                    'nama_detil' => $namaDetil,
                    'jenis_sbml' => strtolower(trim($row['jenis_sbml'] ?? 'pendataan')),
                    'frekuensi_penugasan' => strtolower(trim($row['frekuensi_penugasan'] ?? $row['frekuensi'] ?? 'bulanan')),
                    'satuan' => trim($row['satuan'] ?? 'O-K'),
                    'jumlah' => floatval(str_replace(',', '.', $row['jumlah'] ?? $row['volume'] ?? 1)),
                    'harga_satuan' => floatval(str_replace(',', '.', $row['harga_satuan'] ?? $row['harga'] ?? 0)),
                ];
            }
        }

        if (empty($groupedKegiatans)) {
            return redirect()->back()->withErrors(['file' => 'Format file tidak sesuai, kolom nama_kegiatan dan nama_detil tidak ditemukan.']);
        }

        DB::transaction(function () use ($groupedKegiatans) {
            foreach ($groupedKegiatans as $kegData) {
                // Hitung total anggaran
                $totalAnggaran = 0;
                foreach ($kegData['detil'] as $detilData) {
                    $totalAnggaran += $detilData['jumlah'] * $detilData['harga_satuan'];
                }

                $kegiatan = Kegiatan::create([
                    'nama_kegiatan'   => $kegData['nama_kegiatan'],
                    'kode_kegiatan'   => !empty($kegData['kode_kegiatan']) ? $kegData['kode_kegiatan'] : null,
                    'tanggal_mulai'   => $kegData['tanggal_mulai'],
                    'tanggal_selesai' => $kegData['tanggal_selesai'],
                    'status_aktif'    => true,
                    'deskripsi'       => $kegData['deskripsi'],
                    'total_anggaran'  => $totalAnggaran,
                    'created_by'      => auth()->id(),
                ]);

                foreach ($kegData['detil'] as $detilData) {
                    $jenisSbml = in_array($detilData['jenis_sbml'], ['pendataan', 'pengolahan']) ? $detilData['jenis_sbml'] : 'pendataan';
                    $frekuensi = in_array($detilData['frekuensi_penugasan'], ['bulanan', 'triwulanan', 'tahunan']) ? $detilData['frekuensi_penugasan'] : 'bulanan';
                    $satuan = !empty($detilData['satuan']) ? $detilData['satuan'] : 'O-K';
                    
                    DetilKegiatan::create([
                        'kegiatan_id'         => $kegiatan->id,
                        'nama_detil'          => $detilData['nama_detil'],
                        'jenis_sbml'          => $jenisSbml,
                        'frekuensi_penugasan' => $frekuensi,
                        'satuan'              => $satuan,
                        'jumlah'              => $detilData['jumlah'],
                        'harga_satuan'        => $detilData['harga_satuan'],
                        'total'               => $detilData['jumlah'] * $detilData['harga_satuan'],
                    ]);
                }
            }
        });

        $count = count($groupedKegiatans);
        return redirect()->back()->with('success', "Berhasil mengimport {$count} data Kegiatan beserta detilnya.");
    }

    private function parseExcelDate($dateValue)
    {
        if (empty($dateValue)) return null;
        if (is_numeric($dateValue)) {
            $unix_date = ($dateValue - 25569) * 86400;
            return gmdate("Y-m-d", $unix_date);
        }
        try {
            return \Carbon\Carbon::parse($dateValue)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}