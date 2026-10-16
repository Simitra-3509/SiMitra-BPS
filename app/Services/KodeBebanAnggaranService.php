<?php

namespace App\Services;

use App\Models\KonfigurasiAnggaran;
use App\Models\Kegiatan;
use InvalidArgumentException;

class KodeBebanAnggaranService
{
    /**
     * Rakit kode beban anggaran lengkap dari komponen-komponen.
     *
     * @param int $tahunAnggaran
     * @param string $kodeKegiatan Format: 2903.BMA.009
     * @param string|null $komponen Override (default dari konfigurasi)
     * @param string|null $subkomponen Override (default dari konfigurasi)
     * @return array{kode_beban_anggaran: string, komponen: string, subkomponen: string, kode_akun: string}
     * @throws InvalidArgumentException jika konfigurasi atau format tidak valid
     */
    public function rakit(int $tahunAnggaran, string $kodeKegiatan, ?string $komponen = null, ?string $subkomponen = null): array
    {
        // 1. Ambil konfigurasi tahun anggaran
        $config = KonfigurasiAnggaran::where('tahun_anggaran', $tahunAnggaran)->first();
        if (!$config) {
            throw new InvalidArgumentException("Konfigurasi anggaran untuk tahun {$tahunAnggaran} tidak ditemukan.");
        }

        // 2. Validasi dan parse kode_kegiatan
        $parsed = $this->parseKodeKegiatan($kodeKegiatan);
        if (!$parsed) {
            throw new InvalidArgumentException("Format kode_kegiatan tidak valid: {$kodeKegiatan}. Harus format: 2903.BMA.009");
        }

        // 3. Gunakan komponen/subkomponen dari parameter atau default
        $komponenFinal = $this->normalisasiKomponen($komponen ?? $config->komponen_default);
        $subkomponenFinal = $this->normalisasiSubkomponen($subkomponen ?? $config->subkomponen_default);

        // 4. Validasi komponen/subkomponen
        $this->validasiKomponen($komponenFinal);
        $this->validasiSubkomponen($subkomponenFinal);

        // 5. Rakit kode lengkap: program.kegiatan.kro.ro.komponen.subkomponen.akun
        $kode = sprintf(
            '%s.%s.%s.%s.%s.%s.%s',
            $config->kode_program,      // 054.01.GG
            $parsed['kegiatan'],         // 2903
            $parsed['kro'],              // BMA
            $parsed['ro'],               // 009
            $komponenFinal,              // 005
            $subkomponenFinal,           // A
            $config->kode_akun           // 521213
        );

        // 6. Normalisasi hasil akhir
        $kode = $this->normalisasi($kode);

        // 7. Validasi dengan regex dari konfigurasi
        $this->validasiDenganRegex($kode, $config->regex_pattern);

        return [
            'kode_beban_anggaran' => $kode,
            'komponen' => $komponenFinal,
            'subkomponen' => $subkomponenFinal,
            'kode_akun' => $config->kode_akun,
        ];
    }

    /**
     * Parse kode_kegiatan menjadi segmen.
     *
     * @param string $kodeKegiatan
     * @return array{kegiatan: string, kro: string, ro: string}|null
     */
    public function parseKodeKegiatan(string $kodeKegiatan): ?array
    {
        if (!preg_match('/^(\d{4})\.([A-Z]{3})\.(\d{3})$/', $kodeKegiatan, $matches)) {
            return null;
        }

        return [
            'kegiatan' => $matches[1],
            'kro' => $matches[2],
            'ro' => $matches[3],
        ];
    }

    /**
     * Normalisasi string: hapus spasi, titik tunggal berlebih.
     */
    public function normalisasi(string $kode): string
    {
        // Hapus spasi
        $kode = preg_replace('/\s+/', '', $kode);
        // Hapus titik ganda
        $kode = preg_replace('/\.+/', '.', $kode);
        // Hapus titik di awal/akhir
        $kode = trim($kode, '.');

        return $kode;
    }

    /**
     * Normalisasi komponen: trim, uppercase.
     */
    protected function normalisasiKomponen(string $komponen): string
    {
        return strtoupper(trim($komponen));
    }

    /**
     * Normalisasi subkomponen: trim, uppercase.
     */
    protected function normalisasiSubkomponen(string $subkomponen): string
    {
        return strtoupper(trim($subkomponen));
    }

    /**
     * Validasi komponen: tepat 3 digit.
     *
     * @throws InvalidArgumentException
     */
    protected function validasiKomponen(string $komponen): void
    {
        if (!preg_match('/^\d{3}$/', $komponen)) {
            throw new InvalidArgumentException("Komponen harus 3 digit angka. Diberikan: {$komponen}");
        }
    }

    /**
     * Validasi subkomponen: 1 huruf kapital.
     *
     * @throws InvalidArgumentException
     */
    protected function validasiSubkomponen(string $subkomponen): void
    {
        if (!preg_match('/^[A-Z]$/', $subkomponen)) {
            throw new InvalidArgumentException("Subkomponen harus 1 huruf kapital. Diberikan: {$subkomponen}");
        }
    }

    /**
     * Validasi kode dengan regex dari konfigurasi.
     *
     * @throws InvalidArgumentException
     */
    protected function validasiDenganRegex(string $kode, string $pattern): void
    {
        // Escape delimiter untuk PHP
        $pattern = '/' . $pattern . '/';

        if (!preg_match($pattern, $kode)) {
            throw new InvalidArgumentException("Kode beban anggaran tidak sesuai pola: {$kode}");
        }
    }

    /**
     * Parse kode beban anggaran menjadi segmen.
     *
     * @param string $kode
     * @return array|null
     */
    public function parse(string $kode): ?array
    {
        $kode = $this->normalisasi($kode);

        // Pattern untuk 2026: 054.01.GG.2903.BMA.009.005.A.521213
        // 3+6 token = 9 segmen dipisah titik
        $segments = explode('.', $kode);
        if (count($segments) !== 9) {
            return null;
        }

        return [
            'program' => $segments[0] . '.' . $segments[1] . '.' . $segments[2], // 054.01.GG
            'kegiatan' => $segments[3],    // 2903
            'kro' => $segments[4],         // BMA
            'ro' => $segments[5],          // 009
            'komponen' => $segments[6],    // 005
            'subkomponen' => $segments[7], // A
            'akun' => $segments[8],        // 521213
        ];
    }
}
