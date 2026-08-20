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
        Schema::table('honoraria', function (Blueprint $table) {
            $afterCol = Schema::hasColumn('honoraria', 'total_honor') ? 'total_honor' : 'jumlah_honor';

            if (!Schema::hasColumn('honoraria', 'status_persetujuan')) {
                $table->enum('status_persetujuan', ['draft', 'menunggu_persetujuan', 'disetujui', 'ditolak'])
                      ->default('draft')
                      ->after($afterCol);
            }

            if (!Schema::hasColumn('honoraria', 'approved_by')) {
                $table->foreignId('approved_by')
                      ->nullable()
                      ->after('status_persetujuan')
                      ->constrained('users')
                      ->nullOnDelete();
            }

            if (!Schema::hasColumn('honoraria', 'approved_at')) {
                $table->timestamp('approved_at')
                      ->nullable()
                      ->after('approved_by');
            }

            if (!Schema::hasColumn('honoraria', 'catatan_ppk')) {
                $table->text('catatan_ppk')
                      ->nullable()
                      ->after('approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('honoraria', function (Blueprint $table) {
            if (Schema::hasColumn('honoraria', 'approved_by')) {
                $table->dropForeign(['approved_by']);
            }
            $table->dropColumn(array_filter([
                Schema::hasColumn('honoraria', 'status_persetujuan') ? 'status_persetujuan' : null,
                Schema::hasColumn('honoraria', 'approved_by') ? 'approved_by' : null,
                Schema::hasColumn('honoraria', 'approved_at') ? 'approved_at' : null,
                Schema::hasColumn('honoraria', 'catatan_ppk') ? 'catatan_ppk' : null,
            ]));
        });
    }
};
