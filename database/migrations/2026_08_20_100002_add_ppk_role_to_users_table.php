<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("UPDATE users SET role = LOWER(role)");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','operator','viewer','mitra','ppk') NOT NULL DEFAULT 'operator'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'operator'");
    }
};
