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
        Schema::create('sbml_limits', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis_kegiatan', ['pendataan', 'pengolahan']);
            $table->decimal('batas_maksimal', 15, 2);
            $table->year('tahun');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sbml_limits');
    }
};
