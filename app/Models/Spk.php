<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Spk extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nomor_spk',
        'tanggal_spk',
        'mitra_id',
        'bulan',
        'tahun',
        'tanggal_mulai',
        'tanggal_selesai',
        'ppk_user_id',
        'nama_ppk_snapshot',
        'nip_ppk_snapshot',
        'jabatan_ppk_snapshot',
        'total_nilai',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_spk' => 'date',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'total_nilai' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function (Spk $spk) {
            if ($spk->status === 'terbit' && empty($spk->nomor_spk)) {
                $spk->nomor_spk = \App\Services\SpkService::generateNomorSpk($spk->bulan, $spk->tahun);
                if (empty($spk->tanggal_spk)) {
                    $spk->tanggal_spk = now()->toDateString();
                }
            }
        });

        static::updating(function (Spk $spk) {
            if ($spk->isDirty('status') && $spk->status === 'terbit' && empty($spk->nomor_spk)) {
                $spk->nomor_spk = \App\Services\SpkService::generateNomorSpk($spk->bulan, $spk->tahun);
                if (empty($spk->tanggal_spk)) {
                    $spk->tanggal_spk = now()->toDateString();
                }
            }
        });
    }

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    public function ppk(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ppk_user_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(SpkDetail::class);
    }
}
