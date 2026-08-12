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
            $table->enum('jenis_sbml', ['pendataan', 'pengolahan'])->nullable()->after('nama_detil');
            $table->enum('frekuensi_penugasan', ['bulanan', 'triwulanan', 'tahunan'])->nullable()->after('jenis_sbml');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detil_kegiatan', function (Blueprint $table) {
            $table->dropColumn(['jenis_sbml', 'frekuensi_penugasan']);
        });
    }
};
