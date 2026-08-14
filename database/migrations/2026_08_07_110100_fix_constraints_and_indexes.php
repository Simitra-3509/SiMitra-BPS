<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Round 4 — Perbaikan Constraint & Index hasil audit SQL dump.
     */
    public function up(): void
    {
        // A. PERBAIKAN KRITIS
        // 1. Drop UNIQUE constraint pada kegiatans.kode_kegiatan
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropUnique('kegiatans_kode_kegiatan_unique');
        });

        // 2. Tambah UNIQUE constraint composite pada penugasans (kegiatan_id, mitra_id, bulan, tahun)
        Schema::table('penugasans', function (Blueprint $table) {
            $table->unique(['kegiatan_id', 'mitra_id', 'bulan', 'tahun'], 'penugasans_unique_assignment');
        });

        // 3. Tambah UNIQUE constraint composite pada sbml_limits (jenis_kegiatan, tahun)
        Schema::table('sbml_limits', function (Blueprint $table) {
            $table->unique(['jenis_kegiatan', 'tahun'], 'sbml_limits_unique_jenis_tahun');
        });

        // B. INDEX PERFORMA
        Schema::table('honoraria', function (Blueprint $table) {
            $table->index('tanggal_input');
        });

        Schema::table('kegiatans', function (Blueprint $table) {
            $table->index('status_aktif');
        });

        Schema::table('master_kegiatan', function (Blueprint $table) {
            $table->index('status_aktif');
        });

        Schema::table('mitras', function (Blueprint $table) {
            $table->index('kecamatan');
        });

        Schema::table('saran', function (Blueprint $table) {
            $table->index('status');
            $table->index('kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saran', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['kategori']);
        });

        Schema::table('mitras', function (Blueprint $table) {
            $table->dropIndex(['kecamatan']);
        });

        Schema::table('master_kegiatan', function (Blueprint $table) {
            $table->dropIndex(['status_aktif']);
        });

        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropIndex(['status_aktif']);
            $table->unique('kode_kegiatan', 'kegiatans_kode_kegiatan_unique');
        });

        Schema::table('honoraria', function (Blueprint $table) {
            $table->dropIndex(['tanggal_input']);
        });

        Schema::table('sbml_limits', function (Blueprint $table) {
            $table->dropUnique('sbml_limits_unique_jenis_tahun');
        });

        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropUnique('penugasans_unique_assignment');
        });
    }
};
