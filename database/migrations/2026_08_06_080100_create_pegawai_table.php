<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel baru: pegawai — data pegawai/staf BPS yang mengelola aplikasi.
     * Dependency: tim_kerja (harus sudah ada sebelum migration ini dijalankan).
     * Pakai softDeletes agar riwayat penugasan & link users.pegawai_id tetap utuh
     * saat pegawai dinonaktifkan (recycle bin dapat meng-restore tanpa perbaikan manual).
     */
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pegawai');
            $table->string('nip')->unique();
            $table->foreignId('tim_kerja_id')
                  ->nullable()
                  ->constrained('tim_kerja')
                  ->nullOnDelete(); // hard-delete tim_kerja -> null, soft-delete tidak memengaruhi FK
            $table->string('jabatan')->nullable();
            $table->string('email')->nullable();
            $table->string('no_hp')->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
