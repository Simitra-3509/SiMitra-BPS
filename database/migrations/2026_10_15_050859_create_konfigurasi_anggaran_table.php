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
        Schema::create('konfigurasi_anggaran', function (Blueprint $table) {
            $table->id();
            $table->year('tahun_anggaran')->unique();
            $table->string('kode_program');         // mis. 054.01.GG
            $table->string('kode_akun');            // mis. 521213
            $table->string('komponen_default', 3);  // mis. 005
            $table->string('subkomponen_default', 1);// mis. A
            $table->string('regex_pattern')->default('^\d{3}\.\d{2}\.[A-Z]{2}\.\d{4}\.[A-Z]{3}\.\d{3}\.\d{3}\.[A-Z]\.\d{6}$');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('konfigurasi_anggaran');
    }
};
