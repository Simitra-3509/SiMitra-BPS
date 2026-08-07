<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel baru: saran — fitur pengajuan saran/masukan dari staf internal.
     * Dependency: users (sudah ada sejak awal).
     *
     * user_id: NOT NULL + restrictOnDelete()
     *   - Hanya staff yang login yang bisa membuat saran (tidak ada mode anonim).
     *   - restrictOnDelete: user yang pernah submit saran TIDAK BISA di-hard-delete
     *     selama masih ada saran miliknya — konsisten dengan filosofi recycle bin
     *     (data tidak boleh hilang tanpa disengaja).
     *   - Soft-delete user tidak memengaruhi FK ini.
     *
     * Tidak ada softDeletes pada tabel ini (sesuai spesifikasi).
     */
    public function up(): void
    {
        Schema::create('saran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->restrictOnDelete(); // NOT NULL + RESTRICT: cegah hapus user yg punya saran
            $table->string('kategori')->nullable();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('prioritas', ['rendah', 'sedang', 'tinggi'])->default('sedang');
            $table->enum('status', ['baru', 'diproses', 'selesai'])->default('baru');
            $table->text('tanggapan')->nullable(); // balasan/respons dari admin
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saran');
    }
};
