<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mitra extends Model
{
    /** @use HasFactory<\Database\Factories\MitraFactory> */
    use HasFactory, SoftDeletes;
    
    protected $guarded = ['id'];

    public function penugasans()
    {
        return $this->hasMany(Penugasan::class);
    }
}
