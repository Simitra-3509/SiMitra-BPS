<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\KonfigurasiAnggaran;
use App\Models\MasterKegiatan;
use App\Models\Mitra;
use App\Models\Penugasan;
use App\Models\Spk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SpkWordNonaktifTest extends TestCase
{
    use RefreshDatabase;

    private User $ppk;
    private Mitra $mitra;
    private Kegiatan $kegiatan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ppk = User::create([
            'name' => 'PPK Uji',
            'username' => 'ppk_word',
            'password' => 'password',
            'role' => 'ppk',
        ]);

        $this->mitra = Mitra::create([
            'nama_lengkap' => 'Mitra Uji',
            'sobat_id' => '9990002',
            'desa' => 'Kabupaten Jember',
            'status_aktif' => true,
        ]);

        $master = MasterKegiatan::create([
            'kode_kegiatan' => 'M-' . uniqid(),
            'nama_kegiatan' => 'Master Uji',
            'satuan_kegiatan' => 'Dokumen',
            'harga_satuan' => 50000,
            'kategori_kegiatan' => 'Survei',
        ]);

        $this->kegiatan = Kegiatan::create([
            'master_kegiatan_id' => $master->id,
            'nama_kegiatan' => 'Publikasi/Laporan Statistik Harga',
            'kode_kegiatan' => '2903.BMA.009',
            'tanggal_mulai' => '2026-11-01',
            'tanggal_selesai' => '2026-11-30',
            'total_anggaran' => 1000000,
            'deskripsi' => 'Uji',
            'status_aktif' => true,
            'created_by' => $this->ppk->id,
        ]);

        KonfigurasiAnggaran::create([
            'tahun_anggaran' => 2026,
            'kode_program' => '054.01.GG',
            'kode_akun' => '521213',
            'komponen_default' => '005',
            'subkomponen_default' => 'A',
            'regex_pattern' => '^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$',
        ]);

        Penugasan::create([
            'mitra_id' => $this->mitra->id,
            'kegiatan_id' => $this->kegiatan->id,
            'bulan' => 11,
            'tahun' => 2026,
            'kuota_target' => 10,
            'harga_satuan_snapshot' => 50000,
            'total_honor' => 500000,
            'tanggal_mulai' => '2026-11-01',
            'tanggal_selesai' => '2026-11-09',
        ]);
    }

    #[Test]
    public function permintaan_word_ditolak_tanpa_membuat_spk(): void
    {
        $response = $this->actingAs($this->ppk)->post(route('spk.generate-and-download', [
            'mitra_id' => $this->mitra->id,
            'bulan' => 11,
            'tahun' => 2026,
            'format' => 'docx',
        ]));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Unduh Word tidak tersedia.');
        $this->assertSame(0, Spk::withTrashed()->count());
    }

    #[Test]
    public function permintaan_pdf_tetap_berjalan(): void
    {
        $response = $this->actingAs($this->ppk)->post(route('spk.generate-and-download', [
            'mitra_id' => $this->mitra->id,
            'bulan' => 11,
            'tahun' => 2026,
            'format' => 'pdf',
        ]));

        $response->assertOk();
        $this->assertSame(1, Spk::count());
        $this->assertSame('1/SPK/11/2026', Spk::first()->nomor_spk);
    }
}
