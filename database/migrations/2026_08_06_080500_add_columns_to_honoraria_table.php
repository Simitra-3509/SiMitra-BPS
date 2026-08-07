<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modifikasi tabel: honoraria — tambah detail kalkulasi honor per satuan.
     * Tidak ada dependency baru pada tabel lain di migration ini.
     *
     * Kolom yang TIDAK diubah: jumlah_honor (decimal 15,2) — tetap dipakai
     * sebagai nilai akhir yang disimpan/ditampilkan.
     *
     * Logika bisnis (di Controller/Model, BUKAN di sini):
     *   jumlah_honor = jumlah_item × harga_satuan_snapshot
     *
     * harga_satuan_snapshot: snapshot nilai kegiatans.harga_satuan saat input honor,
     * sehingga histori tidak berubah walau harga satuan kegiatan diperbarui nanti.
     */
    public function up(): void
    {
        Schema::table('honoraria', function (Blueprint $table) {
            $table->unsignedInteger('jumlah_item')->nullable(); // jumlah satuan yang dikerjakan
            $table->decimal('harga_satuan_snapshot', 15, 2)->nullable(); // snapshot decimal(15,2), konsisten
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('honoraria', function (Blueprint $table) {
            $table->dropColumn(['jumlah_item', 'harga_satuan_snapshot']);
        });
    }
};
