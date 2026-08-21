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
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'sobat_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('sobat_id', 50)->nullable()->after('username');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'sobat_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('sobat_id');
            });
        }
    }
};
