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
            if (Schema::hasColumn('detil_kegiatan', 'akun_id')) {
                $table->dropForeign(['akun_id']);
                $table->dropColumn('akun_id');
            }
        });

        Schema::dropIfExists('akun_kegiatan');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('akun_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kegiatan_id')->constrained('kegiatans')->cascadeOnDelete();
            $table->string('kode_akun')->default('521213');
            $table->string('nama_akun')->default('Belanja Honor Output Kegiatan');
            $table->timestamps();
        });

        Schema::table('detil_kegiatan', function (Blueprint $table) {
            if (!Schema::hasColumn('detil_kegiatan', 'akun_id')) {
                $table->foreignId('akun_id')->nullable()->after('kegiatan_id')->constrained('akun_kegiatan')->nullOnDelete();
            }
        });
    }
};
