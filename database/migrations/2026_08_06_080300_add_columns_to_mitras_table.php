<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modifikasi tabel: mitras — tambah kolom profil & link akun login.
     * Dependency: users (sudah ada sejak awal — tidak ada dependency baru di sini).
     *
     * user_id bersifat nullable & unique:
     *   - Nullable  → mitra boleh tidak punya akun login (tamu/offline).
     *   - Unique    → satu akun hanya bisa di-link ke satu mitra.
     *   - nullOnDelete → kalau user di-hard-delete, link diputus; data mitra & histori honor TETAP ADA.
     *   - Soft-delete user TIDAK memengaruhi FK (recycle bin bisa restore tanpa perbaikan manual).
     */
    public function up(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->foreignId('user_id')
                  ->nullable()
                  ->unique()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('kode_mitra')->nullable()->unique(); // kode tampilan human-readable
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('desa')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('ijazah_terakhir')->nullable();
            $table->string('keahlian')->nullable();
            $table->string('no_whatsapp')->nullable();
            $table->string('foto_profil')->nullable(); // path file relatif dari storage
        });
    }

    /**
     * Reverse the migrations.
     * Urutan drop: FK → index unik → kolom (MySQL requirement).
     */
    public function down(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique('mitras_user_id_unique');
            $table->dropUnique('mitras_kode_mitra_unique');
            $table->dropColumn([
                'user_id',
                'kode_mitra',
                'jenis_kelamin',
                'tanggal_lahir',
                'desa',
                'kecamatan',
                'ijazah_terakhir',
                'keahlian',
                'no_whatsapp',
                'foto_profil',
            ]);
        });
    }
};
