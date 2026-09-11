<?php

namespace App\Services;

use App\Models\Kegiatan;
use App\Models\Penugasan;
use App\Models\SbmlLimit;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Dapatkan daftar mitra beserta rincian penugasan dan status SBML sesuai filter.
     */
    public static function getMitraList(string $filter, int $tahun, int $bulan, float $batasPendataan, float $batasPengolahan): array
    {
        $penugasanQuery = Penugasan::with([
            'mitra',
            'kegiatan.masterKegiatan',
            'detilKegiatan'
        ])->whereNull('deleted_at');

        if ($filter === 'bulanan') {
            $penugasanQuery->where('bulan', $bulan)->where('tahun', $tahun);
        } elseif ($filter === 'tahunan') {
            $penugasanQuery->where('tahun', $tahun);
        }

        $penugasans = $penugasanQuery->get();
        $grouped = $penugasans->groupBy('mitra_id');

        $mitraList = [];

        foreach ($grouped as $mitraId => $items) {
            $firstItem = $items->first();
            $mitra = $firstItem->mitra;
            if (!$mitra) continue;

            $totalHonor = (float) $items->sum('total_honor');
            $terpakaiPendataan = 0;
            $terpakaiPengolahan = 0;
            $kegiatanList = [];

            foreach ($items as $item) {
                $dk = $item->detilKegiatan;
                $k = $item->kegiatan;
                $jenisSbml = strtolower($dk?->jenis_sbml ?? ($k?->detilKegiatan?->first()?->jenis_sbml ?? 'pendataan'));
                $itemHonor = (float)($item->total_honor ?? 0);

                if ($jenisSbml === 'pengolahan') {
                    $terpakaiPengolahan += $itemHonor;
                } else {
                    $terpakaiPendataan += $itemHonor;
                }

                $bulanNama = Carbon::create()->month($item->bulan)->locale('id')->isoFormat('MMMM');

                $kegiatanList[] = [
                    'id' => $item->id,
                    'kegiatan_id' => $item->kegiatan_id,
                    'nama_kegiatan' => $k?->nama_kegiatan ?? 'Kegiatan Tidak Diketahui',
                    'kode_kegiatan' => $k?->kode_kegiatan ?? '-',
                    'detil_kegiatan' => $dk?->nama_detil ?? null,
                    'jenis_sbml' => $jenisSbml,
                    'bulan' => $item->bulan,
                    'tahun' => $item->tahun,
                    'periode_teks' => $bulanNama . ' ' . $item->tahun,
                    'kuota_target' => (int)($item->kuota_target ?? 0),
                    'satuan' => $k?->satuan_kegiatan ?? ($dk?->satuan ?? 'Satuan'),
                    'harga_satuan' => (float)($item->harga_satuan_snapshot ?? $dk?->harga_satuan ?? $k?->harga_satuan ?? 0),
                    'total_honor' => $itemHonor,
                    'tanggal_mulai' => $item->tanggal_mulai?->format('d/m/Y') ?? ($k?->tanggal_mulai ? Carbon::parse($k->tanggal_mulai)->format('d/m/Y') : null),
                    'tanggal_selesai' => $item->tanggal_selesai?->format('d/m/Y') ?? ($k?->tanggal_selesai ? Carbon::parse($k->tanggal_selesai)->format('d/m/Y') : null),
                ];
            }

            $melewatiSbml = false;
            $statusSbml = 'normal'; // normal | warning | kritis
            $alasanSbml = '';
            $melewatiPendataan = false;
            $melewatiPengolahan = false;
            $maxPendataanSebulan = 0;
            $maxPengolahanSebulan = 0;

            if ($filter === 'bulanan') {
                $maxPendataanSebulan = $terpakaiPendataan;
                $maxPengolahanSebulan = $terpakaiPengolahan;
                $melewatiPendataan = $terpakaiPendataan > $batasPendataan;
                $melewatiPengolahan = $terpakaiPengolahan > $batasPengolahan;

                if ($melewatiPendataan || $melewatiPengolahan) {
                    $melewatiSbml = true;
                    $statusSbml = 'kritis';
                    $alasan = [];
                    if ($melewatiPendataan) {
                        $alasan[] = 'Pendataan Rp ' . number_format($terpakaiPendataan, 0, ',', '.') . ' (Batas Rp ' . number_format($batasPendataan, 0, ',', '.') . ')';
                    }
                    if ($melewatiPengolahan) {
                        $alasan[] = 'Pengolahan Rp ' . number_format($terpakaiPengolahan, 0, ',', '.') . ' (Batas Rp ' . number_format($batasPengolahan, 0, ',', '.') . ')';
                    }
                    $alasanSbml = implode(' & ', $alasan);
                } elseif ($terpakaiPendataan >= 0.8 * $batasPendataan || $terpakaiPengolahan >= 0.8 * $batasPengolahan) {
                    $statusSbml = 'warning';
                    $alasanSbml = 'Mendekati batas SBML (≥ 80%)';
                }
            } elseif ($filter === 'tahunan') {
                $byBulan = $items->groupBy('bulan');
                $exceededMonths = [];
                foreach ($byBulan as $bln => $bItems) {
                    $bPendataan = 0;
                    $bPengolahan = 0;
                    foreach ($bItems as $bi) {
                        $bJenis = strtolower($bi->detilKegiatan?->jenis_sbml ?? ($bi->kegiatan?->detilKegiatan?->first()?->jenis_sbml ?? 'pendataan'));
                        if ($bJenis === 'pengolahan') $bPengolahan += (float)($bi->total_honor ?? 0);
                        else $bPendataan += (float)($bi->total_honor ?? 0);
                    }
                    if ($bPendataan > $maxPendataanSebulan) $maxPendataanSebulan = $bPendataan;
                    if ($bPengolahan > $maxPengolahanSebulan) $maxPengolahanSebulan = $bPengolahan;

                    if ($bPendataan > $batasPendataan) $melewatiPendataan = true;
                    if ($bPengolahan > $batasPengolahan) $melewatiPengolahan = true;

                    if ($bPendataan > $batasPendataan || $bPengolahan > $batasPengolahan) {
                        $blnName = Carbon::create()->month($bln)->locale('id')->isoFormat('MMMM');
                        $exceededMonths[] = $blnName;
                    }
                }
                if (!empty($exceededMonths)) {
                    $melewatiSbml = true;
                    $statusSbml = 'kritis';
                    $alasanSbml = 'Melewati batas SBML di bulan: ' . implode(', ', $exceededMonths);
                } elseif ($maxPendataanSebulan >= 0.8 * $batasPendataan || $maxPengolahanSebulan >= 0.8 * $batasPengolahan) {
                    $statusSbml = 'warning';
                    $alasanSbml = 'Mendekati batas SBML pada salah satu bulan (≥ 80%)';
                }
            } else {
                // Semua waktu
                $byBulanTahun = $items->groupBy(fn($i) => $i->tahun . '-' . $i->bulan);
                $exceededPeriods = [];
                foreach ($byBulanTahun as $pt => $pItems) {
                    $pPendataan = 0;
                    $pPengolahan = 0;
                    foreach ($pItems as $pi) {
                        $pJenis = strtolower($pi->detilKegiatan?->jenis_sbml ?? ($pi->kegiatan?->detilKegiatan?->first()?->jenis_sbml ?? 'pendataan'));
                        if ($pJenis === 'pengolahan') $pPengolahan += (float)($pi->total_honor ?? 0);
                        else $pPendataan += (float)($pi->total_honor ?? 0);
                    }
                    if ($pPendataan > $maxPendataanSebulan) $maxPendataanSebulan = $pPendataan;
                    if ($pPengolahan > $maxPengolahanSebulan) $maxPengolahanSebulan = $pPengolahan;

                    if ($pPendataan > $batasPendataan) $melewatiPendataan = true;
                    if ($pPengolahan > $batasPengolahan) $melewatiPengolahan = true;

                    if ($pPendataan > $batasPendataan || $pPengolahan > $batasPengolahan) {
                        $exceededPeriods[] = $pt;
                    }
                }
                if (!empty($exceededPeriods)) {
                    $melewatiSbml = true;
                    $statusSbml = 'kritis';
                    $alasanSbml = 'Melewati batas SBML pada ' . count($exceededPeriods) . ' periode';
                } elseif ($maxPendataanSebulan >= 0.8 * $batasPendataan || $maxPengolahanSebulan >= 0.8 * $batasPengolahan) {
                    $statusSbml = 'warning';
                    $alasanSbml = 'Mendekati batas SBML pada salah satu periode (≥ 80%)';
                }
            }

            $mitraList[] = [
                'id' => $mitra->id,
                'sobat_id' => $mitra->sobat_id ?: '-',
                'nama_lengkap' => $mitra->nama_lengkap,
                'kecamatan' => $mitra->kecamatan ?: '-',
                'total_honor' => $totalHonor,
                'terpakai_pendataan' => $terpakaiPendataan,
                'terpakai_pengolahan' => $terpakaiPengolahan,
                'max_pendataan_sebulan' => $maxPendataanSebulan,
                'max_pengolahan_sebulan' => $maxPengolahanSebulan,
                'melewati_pendataan' => $melewatiPendataan,
                'melewati_pengolahan' => $melewatiPengolahan,
                'jumlah_kegiatan' => $items->count(),
                'melewati_sbml' => $melewatiSbml,
                'status_sbml' => $statusSbml,
                'alasan_sbml' => $alasanSbml,
                'kegiatans' => $kegiatanList,
            ];
        }

        // Urutkan: Melewati SBML paling atas, lalu total_honor DESC
        usort($mitraList, function($a, $b) {
            if ($a['melewati_sbml'] !== $b['melewati_sbml']) {
                return $b['melewati_sbml'] <=> $a['melewati_sbml'];
            }
            return $b['total_honor'] <=> $a['total_honor'];
        });

        return $mitraList;
    }
}
