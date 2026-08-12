<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetilKegiatan extends Model
{
    use HasFactory;

    protected $table = 'detil_kegiatan';

    protected $fillable = [
        'akun_id',
        'nama_detil',
        'jenis_sbml',
        'frekuensi_penugasan',
        'satuan',
        'jumlah',
        'harga_satuan',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'decimal:2',
            'harga_satuan' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * Automatically recalculate total before saving.
     */
    protected static function booted(): void
    {
        static::saving(function (DetilKegiatan $detil) {
            if (isset($detil->jumlah) && isset($detil->harga_satuan)) {
                $detil->total = (float)$detil->jumlah * (float)$detil->harga_satuan;
            }
        });
    }

    /**
     * Relationship to parent AkunKegiatan.
     */
    public function akunKegiatan(): BelongsTo
    {
        return $this->belongsTo(AkunKegiatan::class, 'akun_id');
    }
}
