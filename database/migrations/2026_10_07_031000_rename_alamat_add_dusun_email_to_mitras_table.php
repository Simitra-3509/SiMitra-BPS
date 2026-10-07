<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename alamat → desa, tambah kolom dusun dan email.
     */
    public function up(): void
    {
        // Rename alamat -> desa (jika belum di-rename)
        if (Schema::hasColumn('mitras', 'alamat') && !Schema::hasColumn('mitras', 'desa')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->renameColumn('alamat', 'desa');
            });
        }

        // Tambah dusun (nullable, setelah desa)
        if (!Schema::hasColumn('mitras', 'dusun')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->string('dusun')->nullable()->after('desa');
            });
        }

        // Tambah email (nullable, setelah kecamatan)
        if (!Schema::hasColumn('mitras', 'email')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->string('email')->nullable()->after('kecamatan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('mitras', 'email')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }

        if (Schema::hasColumn('mitras', 'dusun')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->dropColumn('dusun');
            });
        }

        if (Schema::hasColumn('mitras', 'desa') && !Schema::hasColumn('mitras', 'alamat')) {
            Schema::table('mitras', function (Blueprint $table) {
                $table->renameColumn('desa', 'alamat');
            });
        }
    }
};
