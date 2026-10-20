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
        'tanggal_mulai',
        'tanggal_selesai',
        'master_kegiatan_id',
        'total_anggaran',
        'deskripsi',
        'tim_kerja_id',
        'pic_kegiatan_id',
        'pj_kegiatan_id',
        'created_by',
    ];

    /**
     * Parse kode_kegiatan menjadi segmen kegiatan.kro.ro.
     * Format: 2903.BMA.009 -> ['kegiatan' => '2903', 'kro' => 'BMA', 'ro' => '009']
     * @return array{kegiatan: string, kro: string, ro: string}|null
     */
    public function parseKodeKegiatan(): ?array
    {
        if (!$this->kode_kegiatan) {
            return null;
        }

        if (!preg_match('/^(\d{4})\.([A-Z]{3})\.(\d{3})$/', $this->kode_kegiatan, $matches)) {
            return null;
        }

        return [
            'kegiatan' => $matches[1],
            'kro' => $matches[2],
            'ro' => $matches[3],
        ];
    }

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