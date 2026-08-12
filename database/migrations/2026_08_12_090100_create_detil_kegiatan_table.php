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
        Schema::create('detil_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('akun_id')
                  ->constrained('akun_kegiatan')
                  ->cascadeOnDelete();
            $table->string('nama_detil');
            $table->string('satuan');
            $table->decimal('jumlah', 10, 2);
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('total', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detil_kegiatan');
    }
};
