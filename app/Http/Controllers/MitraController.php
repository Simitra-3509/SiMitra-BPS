<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $kecamatan = $request->input('kecamatan', 'semua');
        $desa = $request->input('desa', 'semua');
        $perPageInput = $request->input('per_page', 20);

        $query = Mitra::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
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
            ->when($kecamatan !== 'semua', function ($query) use ($kecamatan) {
                $query->where('kecamatan', 'like', "%{$kecamatan}%");
            })
            ->when($desa !== 'semua', function ($query) use ($desa) {
                $query->where('alamat', 'like', "%{$desa}%");
            })
            ->latest();

        $perPage = $perPageInput === 'semua' ? $query->count() : (int) $perPageInput;
        $perPage = $perPage > 0 ? $perPage : 1;

        $mitras = $query->paginate($perPage)->withQueryString();

        $deletedCount = Mitra::onlyTrashed()->count();
        
        $desaByKecamatan = Mitra::whereNotNull('kecamatan')
            ->whereNotNull('alamat')
            ->select('kecamatan', 'alamat')
            ->distinct()
            ->get()
            ->groupBy('kecamatan')
            ->map(function ($items) {
                return $items->pluck('alamat')->map(function ($alamat) {
                    return trim(str_ireplace('Desa ', '', $alamat));
                })->filter()->unique()->sort()->values();
            });

        $kecamatanList = $desaByKecamatan->keys()->sort()->values();

        return Inertia::render('Mitra/Index', [
            'mitras' => $mitras,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'kecamatan' => $kecamatan,
                'desa' => $desa,
                'per_page' => $perPageInput,
            ],
            'kecamatanList' => $kecamatanList,
            'desaByKecamatan' => $desaByKecamatan,
            'deletedCount' => $deletedCount,
        ]);
    }

    /**
     * Store a newly created Mitra.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'required|string|unique:mitras,sobat_id',
            'no_rekening' => 'nullable|string',
            'nama_bank' => 'nullable|string',
            'nama_pemilik_rekening' => 'nullable|string',
            'alamat' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'catatan' => 'nullable|string',
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
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'required|string|unique:mitras,sobat_id,' . $mitra->id,
            'no_rekening' => 'nullable|string',
            'nama_bank' => 'nullable|string',
            'nama_pemilik_rekening' => 'nullable|string',
            'alamat' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'catatan' => 'nullable|string',
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
     * Bulk soft delete multiple Mitras.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:mitras,id',
        ]);

        Mitra::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('message', count($request->ids) . ' data Mitra berhasil dipindahkan ke Recycle Bin.');
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
                $query->where('nama_lengkap', 'like', "%{$search}%")
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

    /**
     * Import / Upsert Mitra from uploaded Excel file (.xlsx).
     * File is parsed server-side using PhpSpreadsheet for reliability.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes' => 'File harus berformat .xlsx atau .xls.',
            'file.max' => 'Ukuran file maksimal 10MB.',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $allRows = $sheet->toArray(null, true, true, true);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'import' => 'Gagal membaca file Excel: ' . $e->getMessage()
            ]);
        }

        if (count($allRows) < 2) {
            return redirect()->back()->withErrors([
                'import' => 'File Excel kosong atau hanya berisi header tanpa data.'
            ]);
        }

        // Cari baris header secara dinamis (baris pertama yang mengandung kata 'sobat' atau 'nama')
        $headerRow = null;
        $headerRowNum = 1;
        $colMap = [];
        
        foreach ($allRows as $index => $row) {
            $foundSobat = false;
            $foundNama = false;
            
            foreach ($row as $colLetter => $val) {
                if ($val !== null && trim((string)$val) !== '') {
                    $clean = strtolower(trim(preg_replace('/\s+/', ' ', (string)$val)));
                    if (str_contains($clean, 'sobat') || str_contains($clean, 'nik')) $foundSobat = true;
                    if (str_contains($clean, 'nama')) $foundNama = true;
                }
            }
            
            if ($foundSobat && $foundNama) {
                $headerRow = $row;
                $headerRowNum = $index;
                break;
            }
        }

        if (!$headerRow) {
            return redirect()->back()->withErrors([
                'import' => 'Format header tidak ditemukan. Pastikan file Excel Anda memiliki baris header dengan kolom "Sobat ID" dan "Nama Lengkap".'
            ]);
        }

        // Hapus baris header dan baris-baris di atasnya dari data yang akan diimpor
        foreach (range(1, $headerRowNum) as $i) {
            unset($allRows[$i]);
        }

        // Bangun mapping kolom: nomor kolom -> nama header (dinormalisasi)
        foreach ($headerRow as $colLetter => $headerVal) {
            if ($headerVal !== null && trim((string)$headerVal) !== '') {
                $clean = strtolower(trim(preg_replace('/\s+/', ' ', (string)$headerVal)));
                $colMap[$colLetter] = $clean;
            }
        }

        $cleanLoc = function ($val) {
            if (!$val) return '';
            return trim(preg_replace('/^\(\d+\)\s*/', '', (string)$val));
        };

        $errors = [];
        $validData = [];
        $rowNum = 1;

        foreach ($allRows as $row) {
            $rowNum++;

            // Bangun associative array dari kolom
            $assoc = [];
            foreach ($colMap as $colLetter => $headerName) {
                $assoc[$headerName] = isset($row[$colLetter]) ? trim((string)$row[$colLetter]) : '';
            }

            $getVal = function ($keys) use ($assoc) {
                foreach ((array)$keys as $k) {
                    $cleanK = strtolower(trim(preg_replace('/\s+/', ' ', (string)$k)));
                    if (isset($assoc[$cleanK]) && $assoc[$cleanK] !== '') {
                        return $assoc[$cleanK];
                    }
                }
                return '';
            };

            $nik = $getVal(['nik']);
            $sobatId = $getVal(['sobat id', 'sobat_id', 'sobatid']);
            if (empty($sobatId) && !empty($nik)) {
                $sobatId = $nik;
            }

            $namaLengkap = $getVal(['nama lengkap', 'nama_lengkap', 'nama']);

            // Skip baris yang benar-benar kosong
            if (empty($sobatId) && empty($namaLengkap)) {
                continue;
            }

            $namaBank = $getVal(['nama bank', 'nama_bank', 'bank']);
            $noRekening = $getVal(['no rekening', 'no_rekening', 'rekening']);
            $namaPemilikRekening = $getVal(['nama pemilik rekening', 'nama_pemilik_rekening', 'pemilik rekening', 'nama_pemilik']);
            if (empty($namaPemilikRekening)) {
                $namaPemilikRekening = $namaLengkap;
            }

            $alamatRaw = $getVal(['alamat']);
            $desaRaw = $cleanLoc($getVal(['desa', 'kelurahan', 'alamat desa/kel', 'alamat desa', 'alamat_desa']));
            $alamat = $alamatRaw ?: ($desaRaw ? "Desa {$desaRaw}" : null);

            $kecamatan = $cleanLoc($getVal(['kecamatan', 'alamat kecamatan', 'alamat_kecamatan']));
            $catatan = $getVal(['catatan', 'keahlian']);

            if (empty($sobatId)) {
                $errors[] = "Baris {$rowNum}: Sobat ID wajib diisi.";
            }
            if (empty($namaLengkap)) {
                $errors[] = "Baris {$rowNum}: Nama Lengkap wajib diisi.";
            }

            $validData[] = [
                'sobat_id' => (string)$sobatId,
                'nama_lengkap' => $namaLengkap,
                'nama_bank' => $namaBank ?: null,
                'no_rekening' => $noRekening ?: null,
                'nama_pemilik_rekening' => $namaPemilikRekening ?: null,
                'alamat' => $alamat ?: null,
                'kecamatan' => $kecamatan ?: null,
                'catatan' => $catatan ?: null,
                'status_aktif' => 1,
            ];
        }

        if (count($validData) === 0) {
            $errMessage = 'File Excel tidak berisi data yang valid untuk diimpor. Pastikan format kolom sesuai dengan template.';
            if (count($errors) > 0) {
                $errMessage = 'Terjadi kesalahan pada data (contoh: baris kosong atau Sobat ID tidak ditemukan).';
            }
            return redirect()->back()->withErrors([
                'import' => $errMessage,
                'import_list' => array_slice($errors, 0, 50)
            ]);
        }

        // Deduplicate by sobat_id
        $uniqueData = collect($validData)->keyBy('sobat_id')->values()->all();

        if (count($uniqueData) === 0) {
            return redirect()->back()->withErrors([
                'import' => 'Tidak ada data valid ditemukan. Pastikan kolom "Sobat ID" dan "Nama Lengkap" terisi.'
            ]);
        }

        $now = now()->toDateTimeString();
        $upsertData = array_map(function ($item) use ($now) {
            return array_merge($item, [
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        }, $uniqueData);

        DB::transaction(function () use ($upsertData) {
            foreach (array_chunk($upsertData, 500) as $chunk) {
                Mitra::upsert(
                    $chunk,
                    ['sobat_id'],
                    ['nama_lengkap', 'nama_bank', 'no_rekening', 'nama_pemilik_rekening', 'alamat', 'kecamatan', 'catatan', 'status_aktif', 'deleted_at', 'updated_at']
                );
            }
        });

        $totalCount = count($uniqueData);
        return redirect()->back()->with('message', "Berhasil meng-import / meng-update {$totalCount} data Mitra.");
    }

    /**
     * Restore multiple mitras from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:mitras,id'
        ]);

        Mitra::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('message', count($request->ids) . ' Mitra berhasil dipulihkan.');
    }

    /**
     * Force delete multiple mitras from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:mitras,id'
        ]);

        Mitra::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('message', count($request->ids) . ' Mitra telah dihapus secara permanen.');
    }

    /**
     * Empty all mitras from recycle bin.
     */
    public function emptyRecycleBin()
    {
        $count = Mitra::onlyTrashed()->count();
        Mitra::onlyTrashed()->forceDelete();

        return redirect()->back()->with('message', "{$count} Mitra di Recycle Bin telah dihapus secara permanen.");
    }

    /**
     * Restore all mitras from recycle bin.
     */
    public function restoreAll()
    {
        $count = Mitra::onlyTrashed()->count();
        Mitra::onlyTrashed()->restore();

        return redirect()->back()->with('message', "{$count} Mitra di Recycle Bin telah dipulihkan.");
    }
}
