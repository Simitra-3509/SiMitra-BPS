<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\KonfigurasiAnggaran;
use App\Models\MasterKegiatan;
use App\Models\Mitra;
use App\Models\Spk;
use App\Models\SpkDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SpkStoreKodeBebanTest extends TestCase
{
    use RefreshDatabase;

    private User $ppk;
    private Mitra $mitra;

    protected function setUp(): void
    {
        parent::setUp();

        // Tanpa UserFactory: factory bawaan Breeze tidak cocok dengan skema users.
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
    }

    private function buatKegiatan(string $kode): Kegiatan
    {
        $master = MasterKegiatan::create([
            'kode_kegiatan' => $kode . '-M' . uniqid(),
            'nama_kegiatan' => 'Master ' . $kode,
            'satuan_kegiatan' => 'Dokumen',
            'harga_satuan' => 50000,
            'kategori_kegiatan' => 'Survei',
        ]);

        return Kegiatan::create([
            'master_kegiatan_id' => $master->id,
            'nama_kegiatan' => 'Kegiatan ' . $kode,
            'kode_kegiatan' => $kode,
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

    private function payload(array $kegiatans, string $status): array
    {
        $details = [];
        foreach ($kegiatans as $k) {
            $details[] = [
                'kegiatan_id' => $k->id,
                'uraian_tugas' => 'Honor petugas',
                'tanggal_mulai_detail' => '2026-11-01',
                'tanggal_selesai_detail' => '2026-11-30',
                'volume' => 10,
                'satuan' => 'Dokumen',
                'harga_satuan' => 50000,
                'nilai' => 500000,
            ];
        }

        return [
            'mitra_id' => $this->mitra->id,
            'bulan' => 11,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-11-01',
            'tanggal_selesai' => '2026-11-30',
            'status' => $status,
            'details' => $details,
        ];
    }

    #[Test]
    public function draft_tanpa_konfigurasi_tersimpan_dengan_kode_kosong_dan_peringatan(): void
    {
        $k = $this->buatKegiatan('2903.BMA.009');

        $response = $this->actingAs($this->ppk)->post(route('spk.store'), $this->payload([$k], 'draft'));

        $response->assertRedirect(route('spk.index'));
        $response->assertSessionHas('success');
        $response->assertSessionHas('warning');
        $this->assertSame(1, Spk::count());
        $this->assertSame(1, SpkDetail::count());
        $this->assertNull(SpkDetail::first()->kode_beban_anggaran);
    }

    #[Test]
    public function terbit_tanpa_konfigurasi_ditolak_dan_tidak_menyimpan_apa_pun(): void
    {
        $k = $this->buatKegiatan('2903.BMA.009');

        $response = $this->actingAs($this->ppk)->post(route('spk.store'), $this->payload([$k], 'terbit'));

        $response->assertSessionHasErrors('details');
        $this->assertSame(0, Spk::withTrashed()->count());
        $this->assertSame(0, SpkDetail::count());
    }

    #[Test]
    public function draft_dengan_konfigurasi_menyimpan_kode_sembilan_segmen(): void
    {
        $this->isiKonfigurasi2026();
        $k = $this->buatKegiatan('2903.BMA.009');

        $response = $this->actingAs($this->ppk)->post(route('spk.store'), $this->payload([$k], 'draft'));

        $response->assertSessionMissing('warning');
        $detail = SpkDetail::firstOrFail();
        $this->assertSame('054.01.GG.2903.BMA.009.005.A.521213', $detail->kode_beban_anggaran);
        $this->assertSame('521213', $detail->akun_anggaran);
    }

    #[Test]
    public function terbit_dengan_konfigurasi_menerbitkan_dan_memberi_nomor(): void
    {
        $this->isiKonfigurasi2026();
        $k = $this->buatKegiatan('2903.BMA.009');

        $this->actingAs($this->ppk)->post(route('spk.store'), $this->payload([$k], 'terbit'));

        $spk = Spk::firstOrFail();
        $this->assertSame('terbit', $spk->status);
        $this->assertSame('0001/SPK/11/2026', $spk->nomor_spk);
        $this->assertSame(1, $spk->details()->count());
    }

    #[Test]
    public function satu_baris_gagal_rakit_membatalkan_penerbitan_seluruh_spk(): void
    {
        $this->isiKonfigurasi2026();
        $valid = $this->buatKegiatan('2903.BMA.009');
        $rusak = $this->buatKegiatan('KRO-SE2026'); // format kode seperti data seeder

        $response = $this->actingAs($this->ppk)->post(route('spk.store'), $this->payload([$valid, $rusak], 'terbit'));

        $response->assertSessionHasErrors('details');
        $this->assertSame(0, Spk::withTrashed()->count());
        $this->assertSame(0, SpkDetail::count());
    }
}
