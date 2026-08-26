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
            $table->date('tanggal_mulai')->nullable()->after('kegiatan_id');
            $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
            $table->dropColumn(['bulan', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasans', function (Blueprint $table) {
            $table->integer('bulan')->nullable();
            $table->year('tahun')->nullable();
            $table->dropColumn(['tanggal_mulai', 'tanggal_selesai']);
        });
    }
};
