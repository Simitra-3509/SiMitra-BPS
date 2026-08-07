<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modifikasi tabel: users — tambah kolom role & pegawai_id.
     * Dependency: pegawai (harus sudah ada sebelum migration ini dijalankan).
     *
     * CATATAN posisi kolom:
     *   - role idealnya setelah 'password' — pengurutan kolom via ->after()
     *     hanya didukung MySQL/MariaDB, TIDAK didukung SQLite.
     *     Pada SQLite, kolom akan ditambahkan di akhir tabel secara fungsional
     *     tapi tidak berpengaruh pada query maupun validasi.
     *   - pegawai_id ditambahkan setelah role.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'operator', 'viewer', 'mitra'])
                      ->notNull()
                      ->default('operator')
                      ->after('password'); // MySQL/MariaDB only — diabaikan di SQLite
            }

            if (!Schema::hasColumn('users', 'pegawai_id')) {
                $table->foreignId('pegawai_id')
                      ->nullable()
                      ->constrained('pegawai')
                      ->nullOnDelete() // hard-delete pegawai -> null; soft-delete tidak memengaruhi FK
                      ->after('role'); // MySQL/MariaDB only
            }
        });
    }

    /**
     * Reverse the migrations.
     * Catatan MySQL: harus drop FK sebelum drop kolom.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['pegawai_id']);
            $table->dropColumn(['role', 'pegawai_id']);
        });
    }
};
