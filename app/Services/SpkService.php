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
            $formattedMonth = str_pad((string)$bulan, 2, '0', STR_PAD_LEFT);
            
            // Dapatkan nomor urut tertinggi untuk tahun/bulan tersebut
            $lastSpk = Spk::where('tahun', $tahun)
                ->where('bulan', $bulan)
                ->whereNotNull('nomor_spk')
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $counter = 1;
            if ($lastSpk && preg_match('/^(\d+)\/SPK\//', $lastSpk->nomor_spk, $matches)) {
                $counter = ((int) $matches[1]) + 1;
            }

            return sprintf('%04d/SPK/%s/%d', $counter, $formattedMonth, $tahun);
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
}
