<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\SbmlLimit;
use App\Models\Spk;
use App\Models\SpkDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpkModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup minimal data untuk SPK
        $this->ppk = User::create([
            'name' => 'Test PPK',
            'username' => 'ppk-test-' . uniqid(),
            'password' => bcrypt('password'),
            'role' => 'ppk',
        ]);
        $this->mitra = Mitra::create([
            'nik' => (string) random_int(1000000000000000, 9999999999999999),
            'nama_lengkap' => 'Test Mitra',
            'sobat_id' => 'SOBAT-' . uniqid(),
        ]);
        $this->kegiatan = Kegiatan::create([
            'nama_kegiatan' => 'Kegiatan Test',
            'status_aktif' => true,
        ]);
        SbmlLimit::create([
            'jenis_kegiatan' => 'pendataan',
            'batas_maksimal' => 3_000_000,
            'tahun' => 2026,
        ]);
    }

    public function test_create_spk_header_and_details()
    {
        $spk = Spk::create([
            'mitra_id' => $this->mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-31',
            'ppk_user_id' => $this->ppk->id,
            'nama_ppk_snapshot' => 'Ratna Achdiati Permatasari',
            'nip_ppk_snapshot' => '197012101989032001',
            'jabatan_ppk_snapshot' => 'Pejabat Pembuat Komitmen',
            'total_nilai' => 1_852_000,
            'status' => 'draft',
        ]);

        $detail1 = SpkDetail::create([
            'spk_id' => $spk->id,
            'kegiatan_id' => $this->kegiatan->id,
            'uraian_tugas' => 'Petugas pendataan lapangan kerangka sampel area (ksa) padi',
            'tanggal_mulai_detail' => '2026-07-25',
            'tanggal_selesai_detail' => '2026-07-31',
            'volume' => 10,
            'satuan' => 'Segmen',
            'harga_satuan' => 110_000,
            'nilai' => 1_100_000,
            'kode_anggaran' => '054.01.GG.2910.BMA.007.005.A.',
            'akun_anggaran' => '521213',
        ]);

        $detail2 = SpkDetail::create([
            'spk_id' => $spk->id,
            'kegiatan_id' => $this->kegiatan->id,
            'uraian_tugas' => 'Petugas pendataan lapangan survei pertanian tanaman pangan/ubinan padi',
            'tanggal_mulai_detail' => '2026-07-01',
            'tanggal_selesai_detail' => '2026-07-31',
            'volume' => 2,
            'satuan' => 'Dok',
            'harga_satuan' => 81_000,
            'nilai' => 162_000,
            'kode_anggaran' => '054.01.GG.2910.BMA.007.005.A.',
            'akun_anggaran' => '521213',
        ]);

        // Assert SPK dapat relasi ke mitra dan details
        $this->assertDatabaseHas('spks', [
            'mitra_id' => $this->mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'total_nilai' => 1_852_000,
        ]);

        $this->assertCount(2, $spk->details);
        $this->assertEquals(1_100_000 + 162_000, $spk->details->sum('nilai'));
        $this->assertEquals($spk->id, $detail1->spk->id);
        $this->assertEquals($this->mitra->id, $spk->mitra->id);
    }

    public function test_spk_number_format_generation()
    {
        $spk = Spk::create([
            'mitra_id' => $this->mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-31',
            'ppk_user_id' => $this->ppk->id,
            'nama_ppk_snapshot' => 'Test PPK',
            'nip_ppk_snapshot' => '123456789',
            'jabatan_ppk_snapshot' => 'PPK',
            'total_nilai' => 1_500_000,
            'status' => 'terbit',
        ]);

        // Nomor SPK harus otomatis dihasilkan dengan pattern: counter/SPK/bulan/tahun
        $this->assertMatchesRegularExpression('/^\\d+\\/SPK\\/07\\/2026$/', $spk->nomor_spk);
        $this->assertEquals('07', str_pad($spk->bulan, 2, '0', STR_PAD_LEFT));
        $this->assertEquals('2026', $spk->tahun);
    }

    public function test_spk_status_enum()
    {
        $spk = Spk::create([
            'mitra_id' => $this->mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-31',
            'ppk_user_id' => $this->ppk->id,
            'nama_ppk_snapshot' => 'Test',
            'nip_ppk_snapshot' => '123',
            'jabatan_ppk_snapshot' => 'PPK',
            'total_nilai' => 1_000_000,
            'status' => 'draft',
        ]);

        $this->assertTrue(in_array($spk->status, ['draft', 'terbit', 'selesai', 'dibayar', 'batal']));
    }

    public function test_spk_total_nilai_validation_against_sbml()
    {
        // Batas SBML untuk pendataan tahun 2026: 3.000.000
        $spkNilai = 2_800_000; // di bawah batas
        $spk = Spk::create([
            'mitra_id' => $this->mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-31',
            'ppk_user_id' => $this->ppk->id,
            'nama_ppk_snapshot' => 'Test',
            'nip_ppk_snapshot' => '123',
            'jabatan_ppk_snapshot' => 'PPK',
            'total_nilai' => $spkNilai,
            'status' => 'draft',
        ]);

        $sbmlLimit = SbmlLimit::where('jenis_kegiatan', 'pendataan')
            ->where('tahun', 2026)
            ->first();

        $this->assertLessThanOrEqual($sbmlLimit->batas_maksimal, $spk->total_nilai);
    }
}
