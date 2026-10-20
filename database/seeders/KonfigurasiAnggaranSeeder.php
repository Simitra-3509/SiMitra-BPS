<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KonfigurasiAnggaran;

class KonfigurasiAnggaranSeeder extends Seeder
{
    public function run(): void
    {
        KonfigurasiAnggaran::updateOrCreate(
            ['tahun_anggaran' => 2026],
            [
                'kode_program' => '054.01.GG',
                'kode_akun' => '521213',
                'komponen_default' => '005',
                'subkomponen_default' => 'A',
                'regex_pattern' => '^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$',
            ]
        );
    }
}
