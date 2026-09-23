<?php

namespace App\Services;

use App\Models\Penugasan;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class PenugasanImportService
{
    /**
     * Import / Upsert Penugasan Mitra dari file Excel (.xlsx / .xls).
     *
     * @return array{count: int, errors: string[]}
     * @throws \Exception  jika file tidak bisa dibaca
     */
    public function import(UploadedFile $file): array
    {
        // ── 1. Baca file Excel ────────────────────────────────────────────────
        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $sheet       = $spreadsheet->getActiveSheet();
            $allRows     = $sheet->toArray(null, true, true, true);
        } catch (\Exception $e) {
            throw new \Exception('Gagal membaca file Excel: ' . $e->getMessage());
        }

        if (count($allRows) < 2) {
            throw new \Exception('File Excel kosong atau hanya berisi header tanpa data.');
        }

        // ── 2. Deteksi baris header secara dinamis ────────────────────────────
        $headerRow    = null;
        $headerRowNum = 1;

        foreach ($allRows as $index => $row) {
            $foundKro   = false;
            $foundDetil = false;
            $foundSobat = false;

            foreach ($row as $val) {
                if ($val !== null && trim((string) $val) !== '') {
                    $clean = strtolower(trim((string) $val));
                    if (str_contains($clean, 'kro') || str_contains($clean, 'kode')) $foundKro   = true;
                    if (str_contains($clean, 'detil'))                               $foundDetil = true;
                    if (str_contains($clean, 'sobat') || str_contains($clean, 'id')) $foundSobat = true;
                }
            }

            if ($foundKro && $foundDetil && $foundSobat) {
                $headerRow    = $row;
                $headerRowNum = $index;
                break;
            }
        }

        if (!$headerRow) {
            throw new \Exception('Format header tidak ditemukan. Pastikan ada baris dengan kolom "Kode KRO", "Nama Detil", dan "Sobat ID".');
        }

        // ── 3. Hapus baris header dan baris di atasnya ────────────────────────
        foreach (range(1, $headerRowNum) as $i) {
            unset($allRows[$i]);
        }

        // ── 4. Map kolom huruf → field name ──────────────────────────────────
        $headers = array_map(fn ($v) => trim(strtolower((string) $v)), $headerRow);
        $colMap  = [];

        foreach ($headers as $colLetter => $headerName) {
            if (empty($headerName)) continue;
            if (str_contains($headerName, 'kode') || str_contains($headerName, 'kro')) {
                $colMap['kode_kro'] = $colLetter;
            } elseif (str_contains($headerName, 'nama detil') || str_contains($headerName, 'detil')) {
                $colMap['nama_detil'] = $colLetter;
            } elseif (str_contains($headerName, 'sobat') || str_contains($headerName, 'id')) {
                $colMap['sobat_id'] = $colLetter;
            } elseif ($headerName === 'bulan') {
                $colMap['bulan'] = $colLetter;
            } elseif ($headerName === 'tahun') {
                $colMap['tahun'] = $colLetter;
            } elseif (str_contains($headerName, 'kuota') || str_contains($headerName, 'target')) {
                $colMap['kuota_target'] = $colLetter;
            } elseif (str_contains($headerName, 'tanggal mulai') || $headerName === 'mulai') {
                $colMap['tanggal_mulai'] = $colLetter;
            } elseif (str_contains($headerName, 'tanggal selesai') || $headerName === 'selesai') {
                $colMap['tanggal_selesai'] = $colLetter;
            }
        }

        if (!isset($colMap['kode_kro']) || !isset($colMap['nama_detil']) || !isset($colMap['sobat_id'])) {
            throw new \Exception('Format header tidak sesuai. Pastikan ada kolom "Kode KRO", "Nama Detil", dan "Sobat ID".');
        }

        // ── 5. Validasi tiap baris data ───────────────────────────────────────
        $errors    = [];
        $validData = [];

        foreach (array_values($allRows) as $idx => $row) {
            $rowNum = $idx + 2; // nomor baris yang user-friendly (mulai dari 2)

            // Skip baris kosong
            $isEmpty = true;
            foreach ($row as $val) {
                if ($val !== null && trim((string) $val) !== '') {
                    $isEmpty = false;
                    break;
                }
            }
            if ($isEmpty) continue;

            $kodeKro   = trim((string) ($row[$colMap['kode_kro']    ?? ''] ?? ''));
            $namaDetil = trim((string) ($row[$colMap['nama_detil']  ?? ''] ?? ''));
            $sobatId   = trim((string) ($row[$colMap['sobat_id']    ?? ''] ?? ''));
            $bulanRaw  = trim((string) ($row[$colMap['bulan']       ?? ''] ?? ''));
            $tahunRaw  = trim((string) ($row[$colMap['tahun']       ?? ''] ?? ''));
            $kuotaRaw  = trim((string) ($row[$colMap['kuota_target']?? ''] ?? ''));

            // Fix bug: ambil tanggal langsung dari colMap (sebelumnya pakai $getVal yang tidak terdefinisi)
            $tanggalMulaiRaw   = isset($colMap['tanggal_mulai'])   ? trim((string) ($row[$colMap['tanggal_mulai']]   ?? '')) : '';
            $tanggalSelesaiRaw = isset($colMap['tanggal_selesai']) ? trim((string) ($row[$colMap['tanggal_selesai']] ?? '')) : '';

            // 1. Kegiatan
            if (empty($kodeKro)) {
                $errors[] = "Baris {$rowNum}: Kode KRO wajib diisi.";
                continue;
            }
            $kegiatan = Kegiatan::where('kode_kegiatan', $kodeKro)->first();
            if (!$kegiatan) {
                $errors[] = "Baris {$rowNum}: Kegiatan dengan Kode KRO '{$kodeKro}' tidak ditemukan.";
                continue;
            }

            // 2. DetilKegiatan
            if (empty($namaDetil)) {
                $errors[] = "Baris {$rowNum}: Nama Detil wajib diisi.";
                continue;
            }
            $detilKegiatan = DetilKegiatan::where('kegiatan_id', $kegiatan->id)
                ->where('nama_detil', $namaDetil)
                ->first();
            if (!$detilKegiatan) {
                $errors[] = "Baris {$rowNum}: Detil Kegiatan '{$namaDetil}' tidak ditemukan untuk Kode KRO '{$kodeKro}'.";
                continue;
            }

            // 3. Mitra
            if (empty($sobatId)) {
                $errors[] = "Baris {$rowNum}: Sobat ID wajib diisi.";
                continue;
            }
            $mitra = Mitra::where('sobat_id', $sobatId)->first();
            if (!$mitra) {
                $errors[] = "Baris {$rowNum}: Mitra dengan Sobat ID '{$sobatId}' tidak ditemukan.";
                continue;
            }

            // 4. Bulan
            $bulanInt = $this->parseBulanStrict($bulanRaw);
            if (!$bulanInt) {
                $errors[] = "Baris {$rowNum}: Nama bulan '{$bulanRaw}' tidak dikenali (gunakan nama bulan Indonesia, contoh: 'Agustus').";
                continue;
            }

            // 5. Tahun
            $tahunInt = is_numeric($tahunRaw) ? (int) $tahunRaw : 0;
            if ($tahunInt < 2000 || $tahunInt > 2100) {
                $errors[] = "Baris {$rowNum}: Tahun ('{$tahunRaw}') tidak valid (harus berupa angka 4 digit).";
                continue;
            }

            // 6. Kuota Target
            $kuotaVal = is_numeric($kuotaRaw) ? (float) $kuotaRaw : 0;
            if ($kuotaVal <= 0) {
                $errors[] = "Baris {$rowNum}: Kuota Target ('{$kuotaRaw}') harus berupa angka lebih dari 0.";
                continue;
            }

            // 7. Tanggal Mulai (opsional)
            $tglMulai   = null;
            $tglSelesai = null;

            if (!empty($tanggalMulaiRaw)) {
                try {
                    $dtMulai = Carbon::parse($tanggalMulaiRaw);
                    if ($dtMulai->month !== $bulanInt || $dtMulai->year !== $tahunInt) {
                        $errors[] = "Baris {$rowNum}: Tanggal mulai harus berada dalam rentang bulan dan tahun yang diinput.";
                        continue;
                    }
                    $tglMulai = $dtMulai->format('Y-m-d');
                } catch (\Exception) {
                    $errors[] = "Baris {$rowNum}: Format tanggal mulai tidak valid.";
                    continue;
                }
            }

            // 8. Tanggal Selesai (opsional)
            if (!empty($tanggalSelesaiRaw)) {
                try {
                    $dtSelesai = Carbon::parse($tanggalSelesaiRaw);
                    if ($dtSelesai->month !== $bulanInt || $dtSelesai->year !== $tahunInt) {
                        $errors[] = "Baris {$rowNum}: Tanggal selesai harus berada dalam rentang bulan dan tahun yang diinput.";
                        continue;
                    }
                    $tglSelesai = $dtSelesai->format('Y-m-d');
                } catch (\Exception) {
                    $errors[] = "Baris {$rowNum}: Format tanggal selesai tidak valid.";
                    continue;
                }
            }

            if ($tglMulai && $tglSelesai && $tglMulai > $tglSelesai) {
                $errors[] = "Baris {$rowNum}: Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.";
                continue;
            }

            $validData[] = [
                'kegiatan_id'       => $kegiatan->id,
                'detil_kegiatan_id' => $detilKegiatan->id,
                'mitra_id'          => $mitra->id,
                'bulan'             => $bulanInt,
                'tahun'             => $tahunInt,
                'kuota_target'      => $kuotaVal,
                'tanggal_mulai'     => $tglMulai,
                'tanggal_selesai'   => $tglSelesai,
                'status'            => 'ditugaskan',
            ];
        }

        // ── 6. Persist valid data ─────────────────────────────────────────────
        if (!empty($validData)) {
            DB::transaction(function () use ($validData) {
                foreach ($validData as $data) {
                    // withTrashed() agar data Recycle Bin diaktifkan ulang
                    // dan tidak menabrak UNIQUE constraint MySQL
                    Penugasan::withTrashed()->updateOrCreate(
                        [
                            'detil_kegiatan_id' => $data['detil_kegiatan_id'],
                            'mitra_id'          => $data['mitra_id'],
                            'bulan'             => $data['bulan'],
                            'tahun'             => $data['tahun'],
                        ],
                        array_merge($data, ['deleted_at' => null])
                    );
                }
            });
        }

        return [
            'count'  => count($validData),
            'errors' => $errors,
        ];
    }

    /**
     * Parse nilai bulan (angka atau nama) menjadi integer 1–12.
     * Return null jika tidak dikenali.
     */
    private function parseBulanStrict(mixed $value): ?int
    {
        if (is_numeric($value) && (int) $value >= 1 && (int) $value <= 12) {
            return (int) $value;
        }

        $bulanMap = [
            'januari'   => 1,  'februari'  => 2,  'maret'    => 3,  'april'    => 4,
            'mei'       => 5,  'juni'      => 6,  'juli'     => 7,  'agustus'  => 8,
            'september' => 9,  'oktober'   => 10, 'november' => 11, 'desember' => 12,
            'january'   => 1,  'february'  => 2,  'march'    => 3,  'may'      => 5,
            'june'      => 6,  'july'      => 7,  'august'   => 8,  'october'  => 10,
            'december'  => 12,
        ];

        return $bulanMap[strtolower(trim((string) $value))] ?? null;
    }
}
