<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\KodeBebanAnggaranService;
use App\Models\KonfigurasiAnggaran;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;

class KodeBebanAnggaranServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed konfigurasi 2026
        KonfigurasiAnggaran::create([
            'tahun_anggaran' => 2026,
            'kode_program' => '054.01.GG',
            'kode_akun' => '521213',
            'komponen_default' => '005',
            'subkomponen_default' => 'A',
            'regex_pattern' => '^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$',
        ]);
    }

    /** @test */
    public function rakit_dengan_default_komponen()
    {
        $service = new KodeBebanAnggaranService();
        
        $result = $service->rakit(2026, '2903.BMA.009');
        
        $this->assertEquals('054.01.GG.2903.BMA.009.005.A.521213', $result['kode_beban_anggaran']);
        $this->assertEquals('005', $result['komponen']);
        $this->assertEquals('A', $result['subkomponen']);
        $this->assertEquals('521213', $result['kode_akun']);
    }

    /** @test */
    public function rakit_dengan_kegiatan_berbeda()
    {
        $service = new KodeBebanAnggaranService();
        
        $result = $service->rakit(2026, '2910.BMA.007');
        
        $this->assertEquals('054.01.GG.2910.BMA.007.005.A.521213', $result['kode_beban_anggaran']);
    }

    /** @test */
    public function normalisasi_spasi_dan_titik()
    {
        $service = new KodeBebanAnggaranService();
        
        $result = $service->rakit(2026, '2903.BMA.009', '005', 'A');
        
        $this->assertEquals('054.01.GG.2903.BMA.009.005.A.521213', $result['kode_beban_anggaran']);
    }

    /** @test */
    public function override_komponen_per_baris()
    {
        $service = new KodeBebanAnggaranService();
        
        $result1 = $service->rakit(2026, '2903.BMA.009', '051', 'A');
        $result2 = $service->rakit(2026, '2903.BMA.009'); // default
        
        $this->assertEquals('054.01.GG.2903.BMA.009.051.A.521213', $result1['kode_beban_anggaran']);
        $this->assertEquals('054.01.GG.2903.BMA.009.005.A.521213', $result2['kode_beban_anggaran']);
    }

    /** @test */
    public function konfigurasi_tahun_berbeda()
    {
        KonfigurasiAnggaran::create([
            'tahun_anggaran' => 2027,
            'kode_program' => '054.02.HH',
            'kode_akun' => '521214',
            'komponen_default' => '006',
            'subkomponen_default' => 'B',
            'regex_pattern' => '^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$',
        ]);

        $service = new KodeBebanAnggaranService();
        
        $result2026 = $service->rakit(2026, '2903.BMA.009');
        $result2027 = $service->rakit(2027, '2903.BMA.009');
        
        $this->assertEquals('054.01.GG.2903.BMA.009.005.A.521213', $result2026['kode_beban_anggaran']);
        $this->assertEquals('054.02.HH.2903.BMA.009.006.B.521214', $result2027['kode_beban_anggaran']);
    }

    /** @test */
    public function ro_sama_dengan_kegiatan_berbeda_tidak_bentrok()
    {
        $service = new KodeBebanAnggaranService();
        
        $result1 = $service->rakit(2026, '2903.BMA.009'); // ro=009
        $result2 = $service->rakit(2026, '2910.BMA.009'); // ro=009 juga, tapi kegiatan berbeda
        
        $this->assertNotEquals($result1['kode_beban_anggaran'], $result2['kode_beban_anggaran']);
        $this->assertStringContainsString('2903', $result1['kode_beban_anggaran']);
        $this->assertStringContainsString('2910', $result2['kode_beban_anggaran']);
    }

    /** @test */
    public function komponen_tidak_valid_ditolak()
    {
        $this->expectException(InvalidArgumentException::class);
        
        $service = new KodeBebanAnggaranService();
        $service->rakit(2026, '2903.BMA.009', '99'); // hanya 2 digit
    }

    /** @test */
    public function subkomponen_tidak_valid_ditolak()
    {
        $this->expectException(InvalidArgumentException::class);
        
        $service = new KodeBebanAnggaranService();
        $service->rakit(2026, '2903.BMA.009', '005', 'AB'); // 2 huruf
    }

    /** @test */
    public function edit_konfigurasi_tidak_mengubah_snapshot()
    {
        $service = new KodeBebanAnggaranService();
        
        // Buat SPK detail dengan snapshot
        $result1 = $service->rakit(2026, '2903.BMA.009');
        
        // Edit konfigurasi
        KonfigurasiAnggaran::where('tahun_anggaran', 2026)->update([
            'komponen_default' => '099',
        ]);
        
        // Snapshot tetap sama
        $this->assertEquals('054.01.GG.2903.BMA.009.005.A.521213', $result1['kode_beban_anggaran']);
        
        // Baru akan pakai konfigurasi baru
        $result2 = $service->rakit(2026, '2903.BMA.009');
        $this->assertEquals('054.01.GG.2903.BMA.009.099.A.521213', $result2['kode_beban_anggaran']);
    }

    /** @test */
    public function parse_kode_kegiatan()
    {
        $service = new KodeBebanAnggaranService();
        
        $result = $service->parseKodeKegiatan('2903.BMA.009');
        
        $this->assertEquals('2903', $result['kegiatan']);
        $this->assertEquals('BMA', $result['kro']);
        $this->assertEquals('009', $result['ro']);
    }

    /** @test */
    public function parse_kode_beban_anggaran()
    {
        $service = new KodeBebanAnggaranService();
        
        $result = $service->parse('054.01.GG.2903.BMA.009.005.A.521213');
        
        $this->assertEquals('054.01.GG', $result['program']);
        $this->assertEquals('2903', $result['kegiatan']);
        $this->assertEquals('BMA', $result['kro']);
        $this->assertEquals('009', $result['ro']);
        $this->assertEquals('005', $result['komponen']);
        $this->assertEquals('A', $result['subkomponen']);
        $this->assertEquals('521213', $result['akun']);
    }
}
