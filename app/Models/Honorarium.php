<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Honorarium extends Model
{
    /** @use HasFactory<\Database\Factories\HonorariumFactory> */
    use HasFactory, SoftDeletes;
    
    protected $guarded = ['id'];

    public function penugasan()
    {
        return $this->belongsTo(Penugasan::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
