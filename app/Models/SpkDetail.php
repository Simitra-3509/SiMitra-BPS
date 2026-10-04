<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpkDetail extends Model
{
    protected $fillable = [
        'spk_id',
        'kegiatan_id',
        'uraian_tugas',
        'tanggal_mulai_detail',
        'tanggal_selesai_detail',
        'volume',
        'satuan',
        'harga_satuan',
        'nilai',
        'kode_anggaran',
        'akun_anggaran',
    ];

    protected $casts = [
        'tanggal_mulai_detail' => 'date',
        'tanggal_selesai_detail' => 'date',
        'harga_satuan' => 'decimal:2',
        'nilai' => 'decimal:2',
    ];

    public function spk(): BelongsTo
    {
        return $this->belongsTo(Spk::class);
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class);
    }
}
