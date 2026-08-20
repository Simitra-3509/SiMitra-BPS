<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('detil_kegiatan', function (Blueprint $table) {
            if (!Schema::hasColumn('detil_kegiatan', 'kegiatan_id')) {
                $table->foreignId('kegiatan_id')
                      ->nullable()
                      ->after('akun_id')
                      ->constrained('kegiatans')
                      ->cascadeOnDelete();
            }
        });

        // Backfill data dari akun_kegiatan ke detil_kegiatan
        DB::table('detil_kegiatan')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                if (isset($row->akun_id) && $row->akun_id) {
                    $kegiatanId = DB::table('akun_kegiatan')->where('id', $row->akun_id)->value('kegiatan_id');
                    if ($kegiatanId) {
                        DB::table('detil_kegiatan')->where('id', $row->id)->update(['kegiatan_id' => $kegiatanId]);
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detil_kegiatan', function (Blueprint $table) {
            if (Schema::hasColumn('detil_kegiatan', 'kegiatan_id')) {
                $table->dropForeign(['kegiatan_id']);
                $table->dropColumn('kegiatan_id');
            }
        });
    }
};
