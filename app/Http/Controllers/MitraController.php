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

            $nik = $getVal(['NIK', 'nik', 'Nik']);
            $namaLengkap = $getVal(['Nama Lengkap', 'nama_lengkap', 'Nama', 'nama']);
            $sobatId = $getVal(['Sobat ID', 'sobat_id', 'Sobat_Id', 'sobatid']);
            $noTelepon = $getVal(['No Telepon', 'no_telepon', 'No_Telepon', 'no_hp', 'telepon']);
            $noWhatsapp = $getVal(['No WhatsApp', 'no_whatsapp', 'No_WhatsApp', 'whatsapp', 'wa']);
            $jenisKelamin = $getVal(['Jenis Kelamin', 'jenis_kelamin', 'Jenis_Kelamin', 'jk']);
            $tanggalLahir = $getVal(['Tanggal Lahir', 'tanggal_lahir', 'Tanggal_Lahir', 'tgl_lahir']);
            $alamat = $getVal(['Alamat', 'alamat']);
            $desa = $getVal(['Desa', 'desa', 'kelurahan']);
            $kecamatan = $getVal(['Kecamatan', 'kecamatan']);
            $ijazahTerakhir = $getVal(['Ijazah Terakhir', 'ijazah_terakhir', 'Ijazah_Terakhir', 'ijazah']);
            $keahlian = $getVal(['Keahlian', 'keahlian']);
            $noRekening = $getVal(['No Rekening', 'no_rekening', 'No_Rekening', 'rekening']);
            $namaBank = $getVal(['Nama Bank', 'nama_bank', 'Nama_Bank', 'bank']);

            // 1. Validasi NIK (wajib & tepat 16 digit angka)
            if (empty($nik)) {
                $errors[] = "Baris {$rowNum}: NIK wajib diisi.";
            } elseif (!preg_match('/^\d{16}$/', $nik)) {
                $errors[] = "Baris {$rowNum}: NIK ('{$nik}') harus berupa tepat 16 digit angka.";
            }

            // 2. Validasi Nama Lengkap (wajib)
            if (empty($namaLengkap)) {
                $errors[] = "Baris {$rowNum}: Nama Lengkap wajib diisi.";
            }

            // 3. Validasi Jenis Kelamin (opsional, hanya L atau P)
            if (!empty($jenisKelamin)) {
                $jkUpper = strtoupper($jenisKelamin);
                if (!in_array($jkUpper, ['L', 'P'])) {
                    $errors[] = "Baris {$rowNum}: Jenis Kelamin ('{$jenisKelamin}') hanya boleh 'L' atau 'P'.";
                }
            }

            // 4. Validasi Tanggal Lahir (opsional, format YYYY-MM-DD)
            if (!empty($tanggalLahir)) {
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggalLahir)) {
                    $errors[] = "Baris {$rowNum}: Tanggal Lahir ('{$tanggalLahir}') harus berformat YYYY-MM-DD.";
                }
            }

            $validData[] = [
                'nik' => $nik,
                'nama_lengkap' => $namaLengkap,
                'sobat_id' => $sobatId ?: null,
                'no_telepon' => $noTelepon ?: null,
                'no_whatsapp' => $noWhatsapp ?: null,
                'jenis_kelamin' => !empty($jenisKelamin) ? strtoupper($jenisKelamin) : null,
                'tanggal_lahir' => $tanggalLahir ?: null,
                'alamat' => $alamat ?: null,
                'desa' => $desa ?: null,
                'kecamatan' => $kecamatan ?: null,
                'ijazah_terakhir' => $ijazahTerakhir ?: null,
                'keahlian' => $keahlian ?: null,
                'no_rekening' => $noRekening ?: null,
                'nama_bank' => $namaBank ?: null,
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
                    ['nik' => $data['nik']],
                    $data
                );
            }
        });

        $totalCount = count($validData);
        return redirect()->back()->with('message', "Berhasil meng-import / meng-update {$totalCount} data Mitra.");
    }
}
