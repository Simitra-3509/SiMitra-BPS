<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Revisi schema mitras: drop kolom lama, tambah kolom baru, unique sobat_id.
     */
    public function up(): void
    {
        // Step 1: Drop kolom-kolom yang tidak terpakai
        if (Schema::hasColumn('mitras', 'nik')) {
            Schema::table('mitras', function (Blueprint $table) {
                // Drop unique constraint on nik sebelum drop kolom
                // Gunakan index name langsung atau exception handling
                try {
                    $table->dropUnique('mitras_nik_unique');
                } catch (\Exception $e) {
                    // Ignore if doesn't exist
                }

                $table->dropColumn([
                    'nik',
                    'no_telepon',
                    'jenis_kelamin',
                    'tanggal_lahir',
                    'desa',
                    'ijazah_terakhir',
                    'keahlian',
                    'no_whatsapp',
                ]);
            });
        }

        // Step 2: Tambah kolom baru + jadikan sobat_id UNIQUE
        Schema::table('mitras', function (Blueprint $table) {
            if (!Schema::hasColumn('mitras', 'nama_pemilik_rekening')) {
                $table->string('nama_pemilik_rekening')->nullable()->after('nama_bank');
            }
            if (!Schema::hasColumn('mitras', 'catatan')) {
                $table->string('catatan')->nullable()->after('nama_pemilik_rekening');
            }
            // Jadikan unique jika belum ada indexnya
            $indexes = Schema::getIndexes('mitras');
            $hasUnique = false;
            foreach ($indexes as $index) {
                if ($index['name'] === 'mitras_sobat_id_unique' || (in_array('sobat_id', $index['columns']) && $index['unique'])) {
                    $hasUnique = true;
                    break;
                }
            }
            if (!$hasUnique) {
                $table->unique('sobat_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->dropUnique(['sobat_id']);
            $table->dropColumn(['nama_pemilik_rekening', 'catatan']);
        });

        Schema::table('mitras', function (Blueprint $table) {
            $table->string('nik', 16)->unique()->after('id');
            $table->string('no_telepon')->nullable()->after('sobat_id');
            $table->string('jenis_kelamin', 1)->nullable()->after('no_telepon');
            $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            $table->string('desa')->nullable()->after('alamat');
            $table->string('ijazah_terakhir')->nullable()->after('kecamatan');
            $table->string('keahlian')->nullable()->after('ijazah_terakhir');
            $table->string('no_whatsapp')->nullable()->after('no_telepon');
        });
    }
};
