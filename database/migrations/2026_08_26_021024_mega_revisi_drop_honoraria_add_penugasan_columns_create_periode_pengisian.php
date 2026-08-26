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
        // A.1 Drop tabel honoraria & notifications (unused)
        Schema::dropIfExists('honoraria');
        Schema::dropIfExists('notifications');

        // A.2 Tambah kolom ke penugasans
        Schema::table('penugasans', function (Blueprint $table) {
            $table->decimal('harga_satuan_snapshot', 15, 2)->nullable()->after('kuota_target');
            $table->decimal('total_honor', 15, 2)->nullable()->after('harga_satuan_snapshot');
        });

        // A.3 Buat tabel periode_pengisian
        Schema::create('periode_pengisian', function (Blueprint $table) {
            $table->id();
            $table->integer('bulan'); // 1-12
            $table->year('tahun');
            $table->enum('status', ['terbuka', 'terkunci'])->default('terbuka');
            $table->foreignId('dikunci_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dibuka_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dikunci_at')->nullable();
            $table->timestamp('dibuka_at')->nullable();
            $table->timestamps();
            $table->unique(['bulan', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periode_pengisian');

        Schema::table('penugasans', function (Blueprint $table) {
            $table->dropColumn(['harga_satuan_snapshot', 'total_honor']);
        });
    }
};
