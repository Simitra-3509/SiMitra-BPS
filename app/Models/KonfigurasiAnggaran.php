<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KonfigurasiAnggaran extends Model
{
    protected $table = 'konfigurasi_anggaran';

    protected $fillable = [
        'tahun_anggaran',
        'kode_program',
        'kode_akun',
        'komponen_default',
        'subkomponen_default',
        'regex_pattern',
    ];

    protected $casts = [
        'tahun_anggaran' => 'integer',
    ];
}
