<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel baru: master_kegiatan — definisi/template kegiatan BPS.
     * Nama tabel singular snake_case (master_kegiatan) sesuai aturan tabel baru.
     * Menggunakan softDeletes agar riwayat template kegiatan tetap terjaga.
     */
    public function up(): void
    {
        Schema::create('master_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kegiatan')->nullable()->unique(); // kode KRO template
            $table->string('nama_kegiatan'); // nama template kegiatan (mis: Pengolahan Susenas)
            $table->string('satuan_kegiatan')->nullable(); // mis: Dokumen, Responden, Segmen
            $table->decimal('harga_satuan', 15, 2)->nullable(); // harga standar per satuan
            $table->string('kategori_kegiatan')->nullable(); // nilai bebas: Survei, Sensus, Kompilasi, dll
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
        Schema::dropIfExists('master_kegiatan');
    }
};
