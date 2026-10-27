<?php

namespace App\Services;

use App\Models\Spk;
use Illuminate\Support\Facades\DB;

class SpkService
{
    /**
     * Generate the next SPK number for the given month and year.
     * Pattern: {counter}/SPK/{MM}/{YYYY}
     */
    public static function generateNomorSpk(int $bulan, int $tahun): string
    {
        return DB::transaction(function () use ($bulan, $tahun) {
            $formattedMonth = str_pad((string) $bulan, 2, '0', STR_PAD_LEFT);

            // Urutan direset tiap tahun (bukan tiap bulan), mengikuti nomor SPK kantor.
            // SPK yang dihapus (soft delete) tetap dihitung supaya nomor tidak dipakai ulang.
            // Nomor terbesar dicari secara numerik, bukan dari baris terakhir.
            $counter = Spk::withTrashed()
                ->where('tahun', $tahun)
                ->whereNotNull('nomor_spk')
                ->lockForUpdate()
                ->pluck('nomor_spk')
                ->map(fn ($nomor) => preg_match('/^(\d+)\/SPK\//', $nomor, $m) ? (int) $m[1] : 0)
                ->max() ?? 0;

            return sprintf('%d/SPK/%s/%d', $counter + 1, $formattedMonth, $tahun);
        });
    }

    public static function terbilang(float $angka): string
    {
        $bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
        $angka = floor(abs($angka));

        if ($angka < 12) return $bilangan[$angka];
        if ($angka < 20) return self::terbilang($angka - 10) . ' Belas';
        if ($angka < 100) return self::terbilang(floor($angka / 10)) . ' Puluh ' . self::terbilang($angka % 10);
        if ($angka < 200) return 'Seratus ' . self::terbilang($angka - 100);
        if ($angka < 1000) return self::terbilang(floor($angka / 100)) . ' Ratus ' . self::terbilang($angka % 100);
        if ($angka < 2000) return 'Seribu ' . self::terbilang($angka - 1000);
        if ($angka < 1000000) return self::terbilang(floor($angka / 1000)) . ' Ribu ' . self::terbilang($angka % 1000);
        if ($angka < 1000000000) return self::terbilang(floor($angka / 1000000)) . ' Juta ' . self::terbilang($angka % 1000000);
        return self::terbilang(floor($angka / 1000000000)) . ' Milyar ' . self::terbilang($angka % 1000000000);
    }

    /**
     * Indonesian day name
     */
    public static function hariIndo(\Carbon\Carbon $date): string
    {
        $hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return $hari[$date->dayOfWeek];
    }

    /**
     * Format date range: "D Bulan s.d. D Bulan YYYY" or "D Bulan s.d. D Bulan YYYY" (if cross-month)
     */
    public static function formatJangkaWaktu(\Carbon\Carbon $start, \Carbon\Carbon $end): string
    {
        $startDay = $start->day;
        $startMonth = self::bulanIndo($start->month);
        $endDay = $end->day;
        $endMonth = self::bulanIndo($end->month);
        $year = $end->year;

        if ($start->month === $end->month && $start->year === $end->year) {
            return "{$startDay} s.d. {$endDay} {$endMonth} {$year}";
        } elseif ($start->year === $end->year) {
            return "{$startDay} {$startMonth} s.d. {$endDay} {$endMonth} {$year}";
        } else {
            return "{$startDay} {$startMonth} {$start->year} s.d. {$endDay} {$endMonth} {$year}";
        }
    }

    private static function bulanIndo(int $bulan): string
    {
        $bulanNama = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return $bulanNama[$bulan - 1] ?? '';
    }
}
