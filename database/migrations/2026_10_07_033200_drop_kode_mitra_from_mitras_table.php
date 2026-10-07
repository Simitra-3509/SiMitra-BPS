<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop kolom kode_mitra dari tabel mitras.
     * Kolom ini tidak dipakai di kode manapun (controller, view, import).
     */
    public function up(): void
    {
        if (Schema::hasColumn('mitras', 'kode_mitra')) {
            Schema::table('mitras', function (Blueprint $table) {
                // Drop unique index dulu sebelum drop kolom
                try {
                    $table->dropUnique('mitras_kode_mitra_unique');
                } catch (\Exception $e) {
                    // Ignore jika index tidak ada
                }
                $table->dropColumn('kode_mitra');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('mitras', 'kode_mitra')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->string('kode_mitra')->nullable()->unique()->after('user_id');
            });
        }
    }
};
