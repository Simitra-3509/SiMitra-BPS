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
        $bank = $request->input('bank', 'semua');
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
     * Import / Upsert Mitra from Excel JSON rows data.
     */
    public function import(Request $request)
    {
        $rows = $request->input('rows');

        if (!$rows || !is_array($rows) || count($rows) === 0) {
            return redirect()->back()->withErrors([
                'import' => 'File Excel kosong atau tidak berisi data yang dapat dibaca.'
            ]);
        }

        $errors = [];
        $validData = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Row 1 is header

            $getVal = function ($keys) use ($row) {
                foreach ((array)$keys as $k) {
                    if (array_key_exists($k, $row) && $row[$k] !== null && $row[$k] !== '') {
                        return trim((string)$row[$k]);
                    }
                }
                return '';
            };

            $sobatId = $getVal(['Sobat ID', 'sobat_id', 'Sobat_Id', 'sobatid']);
            $namaLengkap = $getVal(['Nama Lengkap', 'nama_lengkap', 'Nama', 'nama']);
            $namaBank = $getVal(['Nama Bank', 'nama_bank', 'Nama_Bank', 'bank']);
            $noRekening = $getVal(['No Rekening', 'no_rekening', 'No_Rekening', 'rekening']);
            $namaPemilikRekening = $getVal(['Nama Pemilik Rekening', 'nama_pemilik_rekening', 'Pemilik Rekening']);
            $alamat = $getVal(['Alamat', 'alamat']);
            $kecamatan = $getVal(['Kecamatan', 'kecamatan']);
            $catatan = $getVal(['Catatan', 'catatan']);

            // 1. Validasi Sobat ID (wajib)
            if (empty($sobatId)) {
                $errors[] = "Baris {$rowNum}: Sobat ID wajib diisi.";
            }

            // 2. Validasi Nama Lengkap (wajib)
            if (empty($namaLengkap)) {
                $errors[] = "Baris {$rowNum}: Nama Lengkap wajib diisi.";
            }

            $validData[] = [
                'sobat_id' => $sobatId ?: null,
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

        // All-or-Nothing Transaction: jika ada error validasi di 1 baris pun, batalkan seluruhnya
        if (count($errors) > 0) {
            return redirect()->back()->withErrors([
                'import_list' => $errors
            ]);
        }

        DB::transaction(function () use ($validData) {
            foreach ($validData as $data) {
                Mitra::updateOrCreate(
                    ['sobat_id' => $data['sobat_id']],
                    $data
                );
            }
        });

        $totalCount = count($validData);
        return redirect()->back()->with('message', "Berhasil meng-import / meng-update {$totalCount} data Mitra.");
    }
}
