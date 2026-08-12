<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('akun_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kegiatan_id')
                  ->constrained('kegiatans')
                  ->cascadeOnDelete();
            $table->string('kode_akun')->nullable();
            $table->string('nama_akun');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('akun_kegiatan');
    }
};
