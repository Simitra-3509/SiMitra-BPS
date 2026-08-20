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
        'bulan',
        'tahun',
        'status_aktif',
        'kode_kegiatan',
        'satuan_kegiatan',
        'harga_satuan',
        'tanggal_mulai',
        'tanggal_selesai',
        'master_kegiatan_id',
        'jumlah_sampel',
        'total_anggaran',
        'deskripsi',
        'tim_kerja_id',
        'pic_kegiatan_id',
        'pj_kegiatan_id',
        'created_by',
    ];

    public function masterKegiatan()
    {
        return $this->belongsTo(MasterKegiatan::class, 'master_kegiatan_id');
    }

    public function penugasans()
    {
        return $this->hasMany(Penugasan::class);
    }

    public function detilKegiatan()
    {
        return $this->hasMany(DetilKegiatan::class, 'kegiatan_id');
    }
}