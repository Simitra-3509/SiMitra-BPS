<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mitra extends Model
{
    /** @use HasFactory<\Database\Factories\MitraFactory> */
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'nama_lengkap',
        'sobat_id',
        'alamat',
        'kecamatan',
        'no_rekening',
        'nama_bank',
        'nama_pemilik_rekening',
        'catatan',
        'status_aktif',
    ];

    public function penugasans()
    {
        return $this->hasMany(Penugasan::class);
    }
}
