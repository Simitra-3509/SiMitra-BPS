<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kegiatan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nama_kegiatan',
        'kro',
        'jenis_sbml',
        'bulan',
        'tahun',
        'status_aktif',
    ];

    public function penugasans()
    {
        return $this->hasMany(Penugasan::class);
    }
}