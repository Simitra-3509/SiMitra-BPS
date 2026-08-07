<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mitra;
use App\Models\MasterKegiatan;
use App\Models\Kegiatan;
use App\Models\Penugasan;
use App\Models\Honorarium;
use App\Models\SbmlLimit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Sbml Limits
        SbmlLimit::create(['jenis_kegiatan' => 'pendataan', 'batas_maksimal' => 3085000, 'tahun' => 2026]);
        SbmlLimit::create(['jenis_kegiatan' => 'pengolahan', 'batas_maksimal' => 2854000, 'tahun' => 2026]);

        // Master Kegiatans
        $master1 = MasterKegiatan::create([
            'kode_kegiatan' => 'KRO-SE2026-PEND',
            'nama_kegiatan' => 'Sensus Ekonomi 2026 (Pendataan)',
            'satuan_kegiatan' => 'Responden',
            'harga_satuan' => 50000,
            'kategori_kegiatan' => 'Sensus',
        ]);

        $master2 = MasterKegiatan::create([
            'kode_kegiatan' => 'KRO-SE2026-PENG',
            'nama_kegiatan' => 'Sensus Ekonomi 2026 (Pengolahan)',
            'satuan_kegiatan' => 'Dokumen',
            'harga_satuan' => 25000,
            'kategori_kegiatan' => 'Sensus',
        ]);

        $master3 = MasterKegiatan::create([
            'kode_kegiatan' => 'KRO-SAKERNAS-PEND',
            'nama_kegiatan' => 'Survei Angkatan Kerja Nasional',
            'satuan_kegiatan' => 'Dokumen',
            'harga_satuan' => 35000,
            'kategori_kegiatan' => 'Survei',
        ]);

        // Kegiatans
        $kegiatan1 = Kegiatan::create([
            'master_kegiatan_id' => $master1->id,
            'nama_kegiatan' => 'Sensus Ekonomi 2026 (Pendataan)',
            'jenis_kegiatan' => 'pendataan',
            'kode_kegiatan' => $master1->kode_kegiatan,
            'satuan_kegiatan' => $master1->satuan_kegiatan,
            'harga_satuan' => $master1->harga_satuan,
            'jumlah_sampel' => 1500,
            'total_anggaran' => 75000000,
            'deskripsi' => 'Kegiatan pencacahan lapangan Sensus Ekonomi 2026',
        ]);

        $kegiatan2 = Kegiatan::create([
            'master_kegiatan_id' => $master2->id,
            'nama_kegiatan' => 'Sensus Ekonomi 2026 (Pengolahan)',
            'jenis_kegiatan' => 'pengolahan',
            'kode_kegiatan' => $master2->kode_kegiatan,
            'satuan_kegiatan' => $master2->satuan_kegiatan,
            'harga_satuan' => $master2->harga_satuan,
            'jumlah_sampel' => 2000,
            'total_anggaran' => 50000000,
            'deskripsi' => 'Kegiatan pengolahan dan entri data Sensus Ekonomi 2026',
        ]);

        $kegiatan3 = Kegiatan::create([
            'master_kegiatan_id' => $master3->id,
            'nama_kegiatan' => 'Survei Angkatan Kerja Nasional',
            'jenis_kegiatan' => 'pendataan',
            'kode_kegiatan' => $master3->kode_kegiatan,
            'satuan_kegiatan' => $master3->satuan_kegiatan,
            'harga_satuan' => $master3->harga_satuan,
            'jumlah_sampel' => 800,
            'total_anggaran' => 28000000,
            'deskripsi' => 'Kegiatan pendataan Sakernas',
        ]);

        $sampleMitras = [
            ['nama' => 'Ahmad Suryadi', 'sobat' => '723511', 'rek' => '39161904675', 'bank' => 'Mandiri', 'hp' => '081283072330', 'status' => false],
            ['nama' => 'Budi Santoso', 'sobat' => '276426', 'rek' => '27077174981', 'bank' => 'BNI', 'hp' => '081229509063', 'status' => true],
            ['nama' => 'Candra Pratama', 'sobat' => '175784', 'rek' => '19865031799', 'bank' => 'Danamon', 'hp' => '081256375965', 'status' => true],
            ['nama' => 'Dedi Hidayat', 'sobat' => '451209', 'rek' => '66084594857', 'bank' => 'BRI', 'hp' => '081390196166', 'status' => true],
            ['nama' => 'Eka Putri', 'sobat' => '882103', 'rek' => '54128903112', 'bank' => 'BCA', 'hp' => '085211904581', 'status' => true],
            ['nama' => 'Fajar Nugraha', 'sobat' => '310495', 'rek' => '89104523177', 'bank' => 'Mandiri', 'hp' => '087812903412', 'status' => true],
            ['nama' => 'Gita Gutawa', 'sobat' => '619284', 'rek' => '41209581290', 'bank' => 'BNI', 'hp' => '081290451289', 'status' => false],
        ];

        for ($i = 1; $i <= 27; $i++) {
            $sample = $sampleMitras[($i - 1) % count($sampleMitras)];
            $mitra = Mitra::create([
                'nik' => '3509' . str_pad($i, 12, '0', STR_PAD_LEFT),
                'nama_lengkap' => $i <= count($sampleMitras) ? $sample['nama'] : $sample['nama'] . ' (' . $i . ')',
                'sobat_id' => $sample['sobat'],
                'no_rekening' => $sample['rek'],
                'nama_bank' => $sample['bank'],
                'no_telepon' => $sample['hp'],
                'alamat' => 'Kabupaten Jember',
                'status_aktif' => $sample['status'],
            ]);

            $penugasan = Penugasan::create([
                'mitra_id' => $mitra->id,
                'kegiatan_id' => $i % 2 == 0 ? $kegiatan1->id : $kegiatan2->id,
                'bulan' => date('m'),
                'tahun' => date('Y'),
                'kuota_target' => rand(10, 50),
            ]);

            if ($i <= 5) {
                Honorarium::create([
                    'penugasan_id' => $penugasan->id,
                    'jumlah_honor' => rand(500000, 2000000),
                    'tanggal_input' => now(),
                    'keterangan' => 'Honor bulan berjalan',
                ]);
            }
        }
    }
}
