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
        Schema::table('mitras', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('mitras', 'nama_pemilik_rekening')) {
                $columnsToDrop[] = 'nama_pemilik_rekening';
            }
            if (Schema::hasColumn('mitras', 'nama_bank')) {
                $columnsToDrop[] = 'nama_bank';
            }
            if (Schema::hasColumn('mitras', 'no_rekening')) {
                $columnsToDrop[] = 'no_rekening';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->string('no_rekening')->nullable()->after('sobat_id');
            $table->string('nama_bank')->nullable()->after('no_rekening');
            $table->string('nama_pemilik_rekening')->nullable()->after('nama_bank');
        });
    }
};
