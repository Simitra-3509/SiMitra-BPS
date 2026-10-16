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
        Schema::table('spk_details', function (Blueprint $table) {
            $table->string('komponen', 3)->nullable()->after('akun_anggaran');
            $table->string('subkomponen', 1)->nullable()->after('komponen');
            $table->string('kode_beban_anggaran')->nullable()->after('subkomponen');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spk_details', function (Blueprint $table) {
            $table->dropColumn(['komponen', 'subkomponen', 'kode_beban_anggaran']);
        });
    }
};
