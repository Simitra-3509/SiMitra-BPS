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
        // 1. Tambah kolom detil_kegiatan_id (nullable) jika belum ada
        if (!Schema::hasColumn('penugasans', 'detil_kegiatan_id')) {
            Schema::table('penugasans', function (Blueprint $table) {
                $table->foreignId('detil_kegiatan_id')
                      ->nullable()
                      ->after('kegiatan_id')
                      ->constrained('detil_kegiatan')
                      ->nullOnDelete();
            });
        }

        // 2. Tambah index biasa pada kegiatan_id agar FK constraint penugasans_kegiatan_id_foreign tetap terlindungi
        Schema::table('penugasans', function (Blueprint $table) {
            $table->index('kegiatan_id', 'penugasans_kegiatan_id_index');
        });

        // 3. Drop UNIQUE constraint lama (penugasans_unique_assignment)
        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropUnique('penugasans_unique_assignment');
        });

        // 4. Tambah UNIQUE constraint baru berbasis detil_kegiatan_id
        Schema::table('penugasans', function (Blueprint $table) {
            $table->unique(['detil_kegiatan_id', 'mitra_id', 'bulan', 'tahun'], 'penugasans_unique_detil_assignment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropUnique('penugasans_unique_detil_assignment');
        });

        Schema::table('penugasans', function (Blueprint $table) {
            $table->unique(['kegiatan_id', 'mitra_id', 'bulan', 'tahun'], 'penugasans_unique_assignment');
        });

        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropIndex('penugasans_kegiatan_id_index');
        });

        if (Schema::hasColumn('penugasans', 'detil_kegiatan_id')) {
            Schema::table('penugasans', function (Blueprint $table) {
                $table->dropForeign(['detil_kegiatan_id']);
                $table->dropColumn('detil_kegiatan_id');
            });
        }
    }
};
