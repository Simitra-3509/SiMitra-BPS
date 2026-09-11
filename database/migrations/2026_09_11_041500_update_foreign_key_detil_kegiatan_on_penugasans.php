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
            // Drop foreign key lama dengan onDelete('set null')
            $table->dropForeign(['detil_kegiatan_id']);

            // Buat foreign key baru dengan onDelete('restrict')
            // Mencegah detil_kegiatan dihapus jika masih ada penugasan mitra yang merujuk padanya
            $table->foreign('detil_kegiatan_id')
                ->references('id')
                ->on('detil_kegiatan')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropForeign(['detil_kegiatan_id']);

            $table->foreign('detil_kegiatan_id')
                ->references('id')
                ->on('detil_kegiatan')
                ->onDelete('set null');
        });
    }
};
