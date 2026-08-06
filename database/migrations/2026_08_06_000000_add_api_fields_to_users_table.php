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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'nama_lengkap')) {
                $table->string('nama_lengkap')->nullable();
            }
            if (!Schema::hasColumn('users', 'sobat_id')) {
                $table->string('sobat_id')->nullable();
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('Admin');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('Aktif');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nama_lengkap', 'sobat_id', 'role', 'status']);
        });
    }
};
