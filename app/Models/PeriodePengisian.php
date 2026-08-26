<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodePengisian extends Model
{
    use HasFactory;

    protected $table = 'periode_pengisian';

    protected $fillable = [
        'bulan',
        'tahun',
        'status',
        'dikunci_oleh',
        'dibuka_oleh',
        'dikunci_at',
        'dibuka_at',
    ];

    public function pengunci()
    {
        return $this->belongsTo(User::class, 'dikunci_oleh');
    }

    public function pembuka()
    {
        return $this->belongsTo(User::class, 'dibuka_oleh');
    }
}
