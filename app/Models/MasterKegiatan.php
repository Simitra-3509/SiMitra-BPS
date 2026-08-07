<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MasterKegiatan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'master_kegiatan';
    protected $guarded = ['id'];

    public function kegiatans()
    {
        return $this->hasMany(Kegiatan::class, 'master_kegiatan_id');
    }
}
