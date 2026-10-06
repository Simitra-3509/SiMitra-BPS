<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spk_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spk_id')->constrained('spks')->cascadeOnDelete();
            $table->foreignId('kegiatan_id')->constrained('kegiatans')->cascadeOnDelete();
            $table->text('uraian_tugas');
            $table->date('tanggal_mulai_detail');
            $table->date('tanggal_selesai_detail');
            $table->integer('volume');
            $table->string('satuan');
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('nilai', 15, 2);
            $table->string('kode_anggaran')->nullable();
            $table->string('akun_anggaran')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spk_details');
    }
};
