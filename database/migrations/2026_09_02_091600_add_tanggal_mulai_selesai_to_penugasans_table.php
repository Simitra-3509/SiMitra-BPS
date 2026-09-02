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
            if (!Schema::hasColumn('penugasans', 'tanggal_mulai')) {
                $table->date('tanggal_mulai')->nullable()->after('tahun');
            }
            if (!Schema::hasColumn('penugasans', 'tanggal_selesai')) {
                $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasans', function (Blueprint $table) {
            if (Schema::hasColumn('penugasans', 'tanggal_mulai')) {
                $table->dropColumn('tanggal_mulai');
            }
            if (Schema::hasColumn('penugasans', 'tanggal_selesai')) {
                $table->dropColumn('tanggal_selesai');
            }
        });
    }
};
