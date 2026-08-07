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
    Schema::create('kegiatans', function (Blueprint $table) {
        $table->id();
        $table->string('nama_kegiatan');
        $table->string('kro')->nullable();
        $table->string('jenis_sbml'); // e.g. pendataan, pengolahan
        $table->integer('bulan');     // 1 - 12
        $table->integer('tahun');     // e.g. 2026
        $table->boolean('status_aktif')->default(true);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kegiatans');
    }
};
