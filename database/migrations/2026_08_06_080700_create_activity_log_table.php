<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel baru: activity_log — rekam jejak aktivitas user di sistem.
     * Dependency: users (sudah ada sejak awal).
     *
     * user_id: nullable + nullOnDelete()
     *   - Nullable: aksi sistem/background job yang tidak terikat user tertentu
     *     bisa tetap dicatat (user_id = null).
     *   - nullOnDelete: kalau user di-hard-delete, log tetap ada tapi user_id jadi null
     *     (histori aktivitas dipertahankan untuk audit trail).
     *   - Soft-delete user tidak memengaruhi FK ini.
     *
     * Tidak ada softDeletes pada tabel ini (sesuai spesifikasi).
     * ip_address: varchar(45) — menampung IPv4 maupun IPv6 (maks 45 karakter).
     */
    public function up(): void
    {
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete(); // hard-delete user -> null; log tetap ada untuk audit
            $table->string('aktivitas');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};
