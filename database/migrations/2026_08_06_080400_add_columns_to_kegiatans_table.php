<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modifikasi tabel: kegiatans — tambah metadata & info keuangan per kegiatan.
     * Tidak ada dependency baru pada tabel lain di migration ini.
     *
     * harga_satuan: decimal(15,2) — konsisten dengan pola desimal uang di seluruh sistem.
     * Nilai per-satuan ini akan di-snapshot ke honoraria.harga_satuan_snapshot
     * saat honor diinput (agar histori tidak berubah jika harga_satuan di-update).
     */
    public function up(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->string('kode_kegiatan')->nullable()->unique(); // kode KRO kegiatan
            $table->string('satuan_kegiatan')->nullable(); // mis: Dokumen, Responden, Segmen
            $table->decimal('harga_satuan', 15, 2)->nullable(); // honor per satuan, decimal(15,2)
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropUnique('kegiatans_kode_kegiatan_unique');
            $table->dropColumn([
                'kode_kegiatan',
                'satuan_kegiatan',
                'harga_satuan',
                'tanggal_mulai',
                'tanggal_selesai',
            ]);
        });
    }
};
