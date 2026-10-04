<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spks', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_spk')->unique()->nullable();
            $table->date('tanggal_spk')->nullable();
            $table->foreignId('mitra_id')->constrained('mitras')->cascadeOnDelete();
            $table->integer('bulan');
            $table->integer('tahun');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->foreignId('ppk_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama_ppk_snapshot');
            $table->string('nip_ppk_snapshot');
            $table->string('jabatan_ppk_snapshot')->default('Pejabat Pembuat Komitmen');
            $table->decimal('total_nilai', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, terbit, selesai, dibayar, batal
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spks');
    }
};
