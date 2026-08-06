<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kegiatan extends Model
{
    /** @use HasFactory<\Database\Factories\KegiatanFactory> */
    use HasFactory, SoftDeletes;
    
    protected $guarded = ['id'];

    public function penugasans()
    {
        return $this->hasMany(Penugasan::class);
    }
}
