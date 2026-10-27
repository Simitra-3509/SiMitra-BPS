<?php

namespace Tests\Feature;

use App\Models\DetilKegiatan;
use App\Models\Kegiatan;
use App\Models\KonfigurasiAnggaran;
use App\Models\MasterKegiatan;
use App\Models\Mitra;
use App\Models\Penugasan;
use App\Models\Spk;
use App\Models\SpkDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SpkDashboardTest extends TestCase
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
            'username' => 'ppk_uji',
            'password' => 'password',
            'role' => 'ppk',
        ]);

        $this->mitra = Mitra::create([
            'nama_lengkap' => 'Mitra Uji',
            'sobat_id' => '9990001',
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
    }

    private function isiKonfigurasi2026(): void
    {
        KonfigurasiAnggaran::create([
            'tahun_anggaran' => 2026,
            'kode_program' => '054.01.GG',
            'kode_akun' => '521213',
            'komponen_default' => '005',
            'subkomponen_default' => 'A',
            'regex_pattern' => '^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$',
        ]);
    }

    private function buatPenugasan(int $bulan, int $tahun): Penugasan
    {
        $detil = DetilKegiatan::create([
            'kegiatan_id' => $this->kegiatan->id,
            'nama_detil' => 'Petugas pendataan lapangan survei harga',
            'jenis_sbml' => 'pendataan',
            'satuan' => 'Dok',
            'jumlah' => 10,
            'harga_satuan' => 50000,
        ]);

        return Penugasan::create([
            'mitra_id' => $this->mitra->id,
            'kegiatan_id' => $this->kegiatan->id,
            'detil_kegiatan_id' => $detil->id,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'kuota_target' => 10,
            'harga_satuan_snapshot' => 50000,
            'total_honor' => 500000,
            'tanggal_mulai' => sprintf('%d-%02d-01', $tahun, $bulan),
            'tanggal_selesai' => sprintf('%d-%02d-28', $tahun, $bulan),
        ]);
    }

    private function url(array $tambahan = []): string
    {
        return route('spk.generate-and-download', array_merge([
            'mitra_id' => $this->mitra->id,
            'bulan' => 11,
            'tahun' => 2026,
            'format' => 'pdf',
        ], $tambahan));
    }

    #[Test]
    public function tanpa_bulan_atau_tahun_ditolak_dan_tidak_membuat_spk(): void
    {
        $this->isiKonfigurasi2026();
        $this->buatPenugasan(11, 2026);

        $response = $this->actingAs($this->ppk)->get($this->url(['bulan' => '', 'tahun' => '']));

        $response->assertSessionHas('error');
        $this->assertSame(0, Spk::withTrashed()->count());
    }

    #[Test]
    public function tanpa_konfigurasi_ditolak_dan_tidak_membuat_apa_pun(): void
    {
        $this->buatPenugasan(11, 2026);

        $response = $this->actingAs($this->ppk)->get($this->url());

        $response->assertSessionHas('error');
        $this->assertSame(0, Spk::withTrashed()->count());
        $this->assertSame(0, SpkDetail::count());
    }

    #[Test]
    public function dengan_konfigurasi_membuat_spk_terbit_dengan_kode_lengkap(): void
    {
        $this->isiKonfigurasi2026();
        $this->buatPenugasan(11, 2026);

        $this->actingAs($this->ppk)->get($this->url())->assertOk();

        $spk = Spk::firstOrFail();
        $this->assertSame('terbit', $spk->status);
        $this->assertSame('1/SPK/11/2026', $spk->nomor_spk);
        $detail = SpkDetail::firstOrFail();
        $this->assertSame('2903.BMA.009', $detail->kode_anggaran);
        $this->assertSame('054.01.GG.2903.BMA.009.005.A.521213', $detail->kode_beban_anggaran);
    }

    #[Test]
    public function klik_ganda_tidak_membuat_spk_kedua_untuk_periode_yang_sama(): void
    {
        $this->isiKonfigurasi2026();
        $this->buatPenugasan(11, 2026);

        $this->actingAs($this->ppk)->get($this->url())->assertOk();
        $this->actingAs($this->ppk)->get($this->url())->assertOk();

        $this->assertSame(1, Spk::withTrashed()->count());
        $this->assertSame(1, SpkDetail::count());
    }

    #[Test]
    public function hanya_penugasan_pada_periode_yang_dipilih_ikut(): void
    {
        $this->isiKonfigurasi2026();
        $this->buatPenugasan(10, 2026);
        $this->buatPenugasan(11, 2026);

        $this->actingAs($this->ppk)->get($this->url())->assertOk();

        $this->assertSame(1, SpkDetail::count());
        $this->assertSame(11, (int) Spk::firstOrFail()->bulan);
    }

    #[Test]
    public function ppk_pada_spk_adalah_user_yang_sedang_login(): void
    {
        $this->isiKonfigurasi2026();
        $this->buatPenugasan(11, 2026);
        $lain = User::create([
            'name' => 'PPK Lain',
            'username' => 'ppk_lain',
            'password' => 'password',
            'role' => 'ppk',
        ]);

        $this->actingAs($lain)->get($this->url())->assertOk();

        $this->assertSame($lain->id, Spk::firstOrFail()->ppk_user_id);
    }
}
