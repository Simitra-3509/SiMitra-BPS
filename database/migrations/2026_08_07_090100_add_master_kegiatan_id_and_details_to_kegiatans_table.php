<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modifikasi tabel: kegiatans — tambah master_kegiatan_id, jumlah_sampel, total_anggaran, deskripsi.
     * Serta jalankan data backfill untuk menyalin data existing kegiatans ke master_kegiatan
     * dan menghubungkan foreign key master_kegiatan_id.
     *
     * Catatan: Kolom kode_kegiatan, satuan_kegiatan, dan harga_satuan di kegiatans SEMENTARA
     * tetap dipertahankan sampai aplikasi disesuaikan di refactoring berikutnya (Round D).
     */
    public function up(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->foreignId('master_kegiatan_id')
                  ->nullable()
                  ->constrained('master_kegiatan')
                  ->nullOnDelete();

            $table->unsignedInteger('jumlah_sampel')->nullable();
            $table->decimal('total_anggaran', 15, 2)->nullable();
            $table->text('deskripsi')->nullable();
        });

        // Migration Data Backfill (menggunakan DB::table() biasa tanpa Eloquent)
        $existingKegiatans = DB::table('kegiatans')->get();

        foreach ($existingKegiatans as $kegiatan) {
            $kode = !empty($kegiatan->kode_kegiatan) ? $kegiatan->kode_kegiatan : null;

            $masterId = DB::table('master_kegiatan')->insertGetId([
                'kode_kegiatan'     => $kode,
                'nama_kegiatan'     => $kegiatan->nama_kegiatan,
                'satuan_kegiatan'   => $kegiatan->satuan_kegiatan ?? null,
                'harga_satuan'      => $kegiatan->harga_satuan ?? null,
                'kategori_kegiatan' => null,
                'status_aktif'      => $kegiatan->status_aktif ?? true,
                'created_at'        => $kegiatan->created_at ?? now(),
                'updated_at'        => $kegiatan->updated_at ?? now(),
            ]);

            DB::table('kegiatans')
                ->where('id', $kegiatan->id)
                ->update(['master_kegiatan_id' => $masterId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropForeign(['master_kegiatan_id']);
            $table->dropColumn([
                'master_kegiatan_id',
                'jumlah_sampel',
                'total_anggaran',
                'deskripsi',
            ]);
        });
    }
};
