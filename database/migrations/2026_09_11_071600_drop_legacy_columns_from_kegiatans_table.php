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
        Schema::table('kegiatans', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('kegiatans', 'satuan_kegiatan')) {
                $columnsToDrop[] = 'satuan_kegiatan';
            }
            if (Schema::hasColumn('kegiatans', 'harga_satuan')) {
                $columnsToDrop[] = 'harga_satuan';
            }
            if (Schema::hasColumn('kegiatans', 'jumlah_sampel')) {
                $columnsToDrop[] = 'jumlah_sampel';
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
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->string('satuan_kegiatan')->nullable()->after('kode_kegiatan');
            $table->decimal('harga_satuan', 15, 2)->nullable()->after('satuan_kegiatan');
            $table->unsignedInteger('jumlah_sampel')->nullable()->after('master_kegiatan_id');
        });
    }
};
