<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penugasan extends Model
{
    /** @use HasFactory<\Database\Factories\PenugasanFactory> */
    use HasFactory, SoftDeletes;
    
    protected $guarded = ['id'];

    public function mitra()
    {
        return $this->belongsTo(Mitra::class);
    }

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }

    public function honoraria()
    {
        return $this->hasMany(Honorarium::class);
    }
}
