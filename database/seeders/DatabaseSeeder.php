<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mitra;
use App\Models\MasterKegiatan;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Penugasan;
use App\Models\Honorarium;
use App\Models\SbmlLimit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        User::create([
            'name' => 'Operator Si-Mitra',
            'username' => 'operator',
            'password' => Hash::make('password'),
            'role' => 'Operator',
        ]);

        User::create([
            'name' => 'PPK Si-Mitra',
            'username' => 'ppk',
            'password' => Hash::make('password'),
            'role' => 'PPK',
        ]);

        // Sbml Limits
        SbmlLimit::create(['jenis_kegiatan' => 'pendataan', 'batas_maksimal' => 3085000, 'tahun' => 2026]);
        SbmlLimit::create(['jenis_kegiatan' => 'pengolahan', 'batas_maksimal' => 2854000, 'tahun' => 2026]);

        // Master Kegiatans
        $master1 = MasterKegiatan::create([
            'kode_kegiatan' => 'KRO-SE2026',
            'nama_kegiatan' => 'Sensus Ekonomi 2026',
            'satuan_kegiatan' => 'Responden',
            'harga_satuan' => 50000,
            'kategori_kegiatan' => 'Sensus',
        ]);

        $master2 = MasterKegiatan::create([
            'kode_kegiatan' => 'KRO-SAKERNAS-2026',
            'nama_kegiatan' => 'Survei Angkatan Kerja Nasional 2026',
            'satuan_kegiatan' => 'Dokumen',
            'harga_satuan' => 35000,
            'kategori_kegiatan' => 'Survei',
        ]);

        // Kegiatans 1 (Sensus Ekonomi 2026)
        $kegiatan1 = Kegiatan::create([
            'master_kegiatan_id' => $master1->id,
            'nama_kegiatan' => 'Sensus Ekonomi 2026',
            'kode_kegiatan' => $master1->kode_kegiatan,
            'tanggal_mulai' => '2026-08-01',
            'tanggal_selesai' => '2026-08-31',
            'total_anggaran' => 125000000,
            'deskripsi' => 'Kegiatan Sensus Ekonomi 2026 (Pendataan Lapangan dan Pengolahan Data)',
            'status_aktif' => true,
            'created_by' => $admin->id,
        ]);

        // Detil Rincian for Kegiatan 1
        $detil1 = DetilKegiatan::create([
            'kegiatan_id' => $kegiatan1->id,
            'nama_detil' => 'Honor Petugas Pendataan Lapangan SE2026',
            'jenis_sbml' => 'pendataan',
            'frekuensi_penugasan' => 'bulanan',
            'satuan' => 'Responden',
            'jumlah' => 1500,
            'harga_satuan' => 50000,
            'total' => 75000000,
        ]);

        $detil2 = DetilKegiatan::create([
            'kegiatan_id' => $kegiatan1->id,
            'nama_detil' => 'Honor Petugas Pengolahan Data SE2026',
            'jenis_sbml' => 'pengolahan',
            'frekuensi_penugasan' => 'bulanan',
            'satuan' => 'Dokumen',
            'jumlah' => 2000,
            'harga_satuan' => 25000,
            'total' => 50000000,
        ]);

        // Kegiatan 2 (Sakernas)
        $kegiatan2 = Kegiatan::create([
            'master_kegiatan_id' => $master2->id,
            'nama_kegiatan' => 'Survei Angkatan Kerja Nasional 2026',
            'kode_kegiatan' => $master2->kode_kegiatan,
            'tanggal_mulai' => '2026-08-01',
            'tanggal_selesai' => '2026-08-31',
            'total_anggaran' => 28000000,
            'deskripsi' => 'Kegiatan Pendataan Sakernas 2026',
            'status_aktif' => true,
            'created_by' => $admin->id,
        ]);

        $detil3 = DetilKegiatan::create([
            'kegiatan_id' => $kegiatan2->id,
            'nama_detil' => 'Honor Petugas Pendataan Sakernas',
            'jenis_sbml' => 'pendataan',
            'frekuensi_penugasan' => 'bulanan',
            'satuan' => 'Dokumen',
            'jumlah' => 800,
            'harga_satuan' => 35000,
            'total' => 28000000,
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

            $selectedKegiatan = $i % 2 == 0 ? $kegiatan1 : $kegiatan2;
            $selectedDetil = $i % 2 == 0 ? $detil1 : $detil3;

            $penugasan = Penugasan::create([
                'mitra_id' => $mitra->id,
                'kegiatan_id' => $selectedKegiatan->id,
                'detil_kegiatan_id' => $selectedDetil->id,
                'bulan' => date('m'),
                'tahun' => date('Y'),
                'kuota_target' => rand(10, 50),
                'status' => 'draft',
            ]);

            if ($i <= 5) {
                Honorarium::create([
                    'penugasan_id' => $penugasan->id,
                    'jumlah_honor' => rand(500000, 2000000),
                    'tanggal_input' => now(),
                    'keterangan' => 'Honor bulan berjalan',
                    'status_persetujuan' => 'draft',
                ]);
            }
        }
    }
}
