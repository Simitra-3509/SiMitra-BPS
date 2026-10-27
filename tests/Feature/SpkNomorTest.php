<?php

namespace Tests\Feature;

use App\Models\Mitra;
use App\Models\Spk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SpkNomorTest extends TestCase
{
    use RefreshDatabase;

    private User $ppk;
    private Mitra $mitra;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ppk = User::create([
            'name' => 'PPK Uji',
            'username' => 'ppk-nomor-' . uniqid(),
            'password' => bcrypt('password'),
            'role' => 'ppk',
        ]);
        $this->mitra = Mitra::create([
            'nik' => (string) random_int(1000000000000000, 9999999999999999),
            'nama_lengkap' => 'Mitra Uji',
            'sobat_id' => 'SOBAT-' . uniqid(),
        ]);
    }

    private function buat(int $bulan, int $tahun, ?string $nomor = null): Spk
    {
        return Spk::create([
            'mitra_id' => $this->mitra->id,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'tanggal_mulai' => sprintf('%d-%02d-01', $tahun, $bulan),
            'tanggal_selesai' => sprintf('%d-%02d-28', $tahun, $bulan),
            'ppk_user_id' => $this->ppk->id,
            'nama_ppk_snapshot' => 'PPK Uji',
            'nip_ppk_snapshot' => '-',
            'jabatan_ppk_snapshot' => 'PPK',
            'total_nilai' => 100000,
            'status' => 'terbit',
            'nomor_spk' => $nomor,
        ]);
    }

    #[Test]
    public function nomor_pertama_tahun_itu_tanpa_nol_di_depan(): void
    {
        $this->assertSame('1/SPK/07/2026', $this->buat(7, 2026)->nomor_spk);
    }

    #[Test]
    public function bulan_berikutnya_di_tahun_sama_melanjutkan_hitungan(): void
    {
        $this->buat(7, 2026);

        $this->assertSame('2/SPK/08/2026', $this->buat(8, 2026)->nomor_spk);
    }

    #[Test]
    public function tahun_baru_mulai_lagi_dari_satu(): void
    {
        $this->buat(7, 2026);
        $this->buat(8, 2026);

        $this->assertSame('1/SPK/01/2027', $this->buat(1, 2027)->nomor_spk);
    }

    #[Test]
    public function spk_yang_dihapus_tetap_dihitung_agar_nomor_tidak_dipakai_ulang(): void
    {
        $pertama = $this->buat(7, 2026);
        $pertama->delete();

        $this->assertSame('2/SPK/07/2026', $this->buat(7, 2026)->nomor_spk);
    }

    #[Test]
    public function nomor_terbesar_dipakai_walau_bukan_baris_terakhir(): void
    {
        $this->buat(7, 2026, '10/SPK/07/2026');
        $this->buat(7, 2026, '3/SPK/07/2026');

        $this->assertSame('11/SPK/07/2026', $this->buat(7, 2026)->nomor_spk);
    }
}
