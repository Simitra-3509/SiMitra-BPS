<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AkunKegiatan extends Model
{
    use HasFactory;

    protected $table = 'akun_kegiatan';

    protected $fillable = [
        'kegiatan_id',
        'kode_akun',
        'nama_akun',
    ];

    /**
     * Relationship to parent Kegiatan.
     */
    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    /**
     * Relationship to child DetilKegiatan rows.
     */
    public function detilKegiatan(): HasMany
    {
        return $this->hasMany(DetilKegiatan::class, 'akun_id');
    }
}
