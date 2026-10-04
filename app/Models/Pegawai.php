<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pegawai extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pegawai';

    protected $fillable = [
        'nama_pegawai',
        'nip',
        'tim_kerja_id',
        'jabatan',
        'email',
        'no_hp',
        'status_aktif',
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'pegawai_id');
    }
}
