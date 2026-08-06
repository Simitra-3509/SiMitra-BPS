<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel baru: tim_kerja — kelompok/tim pengerjaan kegiatan BPS.
     * Pakai softDeletes agar data historis tetap terjaga saat tim dinonaktifkan.
     */
    public function up(): void
    {
        Schema::create('tim_kerja', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tim');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tim_kerja');
    }
};
