<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Round 3 — Tutup Gap Kolom hasil komparasi database lama vs baru.
     */
    public function up(): void
    {
        // 1. kegiatans
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->foreignId('tim_kerja_id')
                  ->nullable()
                  ->constrained('tim_kerja')
                  ->nullOnDelete();

            $table->foreignId('pic_kegiatan_id')
                  ->nullable()
                  ->constrained('pegawai')
                  ->nullOnDelete();

            $table->foreignId('pj_kegiatan_id')
                  ->nullable()
                  ->constrained('pegawai')
                  ->nullOnDelete();

            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
        });

        // 2. master_kegiatan
        Schema::table('master_kegiatan', function (Blueprint $table) {
            $table->text('keterangan')->nullable();
        });

        // 3. honoraria
        Schema::table('honoraria', function (Blueprint $table) {
            $table->string('jenis_honor')->nullable();
        });

        // 4. sbml_limits
        Schema::table('sbml_limits', function (Blueprint $table) {
            $table->text('keterangan')->nullable();

            $table->foreignId('updated_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sbml_limits', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['keterangan', 'updated_by']);
        });

        Schema::table('honoraria', function (Blueprint $table) {
            $table->dropColumn(['jenis_honor']);
        });

        Schema::table('master_kegiatan', function (Blueprint $table) {
            $table->dropColumn(['keterangan']);
        });

        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropForeign(['tim_kerja_id']);
            $table->dropForeign(['pic_kegiatan_id']);
            $table->dropForeign(['pj_kegiatan_id']);
            $table->dropForeign(['created_by']);
            $table->dropColumn(['tim_kerja_id', 'pic_kegiatan_id', 'pj_kegiatan_id', 'created_by']);
        });
    }
};
