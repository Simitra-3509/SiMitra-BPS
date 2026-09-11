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
        Schema::table('penugasans', function (Blueprint $table) {
            $table->index(['tahun', 'bulan', 'mitra_id', 'deleted_at'], 'idx_penugasans_periode_mitra');
            $table->index(['mitra_id', 'tahun', 'bulan'], 'idx_penugasans_mitra_periode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropIndex('idx_penugasans_periode_mitra');
            $table->dropIndex('idx_penugasans_mitra_periode');
        });
    }
};
