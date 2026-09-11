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
        Schema::table('detil_kegiatan', function (Blueprint $table) {
            // Index komposit untuk mempercepat filter dan kalkulasi kuota SBML (pendataan/pengolahan)
            $table->index(['kegiatan_id', 'jenis_sbml'], 'idx_detil_kegiatan_kegiatan_sbml');
        });

        Schema::table('penugasans', function (Blueprint $table) {
            // Index kolom status untuk mempercepat filter status penugasan (Aktif, Batal, dll)
            $table->index('status', 'idx_penugasans_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detil_kegiatan', function (Blueprint $table) {
            $table->dropIndex('idx_detil_kegiatan_kegiatan_sbml');
        });

        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropIndex('idx_penugasans_status');
        });
    }
};
