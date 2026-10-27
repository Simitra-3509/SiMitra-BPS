<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\Mitra;
use App\Models\Spk;
use App\Models\SpkDetail;
use App\Models\User;
use App\Services\SpkDocxService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use ZipArchive;

class SpkDocxTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function cetakan_word_tidak_memuat_baris_nip_ppk(): void
    {
        $ppk = User::create([
            'name' => 'PPK Uji',
            'username' => 'ppk_docx',
            'password' => 'password',
            'role' => 'ppk',
        ]);
        $mitra = Mitra::create([
            'nik' => (string) random_int(1000000000000000, 9999999999999999),
            'nama_lengkap' => 'Mitra Uji',
            'sobat_id' => 'SOBAT-' . uniqid(),
        ]);
        $kegiatan = Kegiatan::create([
            'nama_kegiatan' => 'Kegiatan Uji',
            'status_aktif' => true,
        ]);
        $spk = Spk::create([
            'mitra_id' => $mitra->id,
            'bulan' => 7,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-31',
            'ppk_user_id' => $ppk->id,
            'nama_ppk_snapshot' => 'PPK Uji',
            'nip_ppk_snapshot' => '-',
            'jabatan_ppk_snapshot' => 'Pejabat Pembuat Komitmen',
            'total_nilai' => 500000,
            'status' => 'draft',
        ]);
        SpkDetail::create([
            'spk_id' => $spk->id,
            'kegiatan_id' => $kegiatan->id,
            'uraian_tugas' => 'Petugas pendataan lapangan',
            'tanggal_mulai_detail' => '2026-07-01',
            'tanggal_selesai_detail' => '2026-07-31',
            'volume' => 10,
            'satuan' => 'Dok',
            'harga_satuan' => 50000,
            'nilai' => 500000,
        ]);
        $spk->load(['mitra', 'ppk', 'details.kegiatan']);

        $phpWord = SpkDocxService::generate($spk);
        $file = tempnam(sys_get_temp_dir(), 'spk_') . '.docx';
        \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007')->save($file);

        $zip = new ZipArchive();
        $this->assertTrue($zip->open($file) === true);
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();
        @unlink($file);

        $this->assertStringContainsString('PIHAK PERTAMA', $xml);
        $this->assertStringNotContainsString('NIP.', $xml);
    }
}
