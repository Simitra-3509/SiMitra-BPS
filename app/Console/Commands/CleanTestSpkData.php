<?php

namespace App\Console\Commands;

use App\Models\Spk;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanTestSpkData extends Command
{
    /**
     * Nama & signature command.
     *
     * --only-null-kode : hanya hapus SPK yang punya minimal satu detail dengan
     *                    kode_beban_anggaran kosong (hasil uji coba sebelum fitur
     *                    rakit kode anggaran diperbaiki).
     * --force          : lewati konfirmasi interaktif (untuk dipakai di script/CI).
     */
    protected $signature = 'spk:clean-test-data
                            {--only-null-kode : Hanya hapus SPK yang punya detail dengan kode_beban_anggaran kosong}
                            {--force : Lewati konfirmasi, langsung hapus}';

    protected $description = 'Menghapus permanen SPK beserta detailnya. Dipakai untuk membersihkan data uji coba '
        . 'sebelum sistem go-live. PERINGATAN: ini hard-delete (bukan soft delete) dan tidak bisa dibatalkan.';

    public function handle(): int
    {
        $query = Spk::withTrashed()->with(['mitra', 'details']);

        if ($this->option('only-null-kode')) {
            $query->whereHas('details', function ($q) {
                $q->whereNull('kode_beban_anggaran');
            });
        }

        $spks = $query->orderBy('id')->get();

        if ($spks->isEmpty()) {
            $this->info('Tidak ada SPK yang cocok dengan kriteria. Tidak ada yang dihapus.');

            return self::SUCCESS;
        }

        $this->warn("Ditemukan {$spks->count()} SPK yang akan DIHAPUS PERMANEN (beserta seluruh detailnya):");
        $this->table(
            ['ID', 'Nomor SPK', 'Mitra', 'Bulan/Tahun', 'Status', 'Jml Detail', 'Detail kode_beban NULL'],
            $spks->map(fn (Spk $spk) => [
                $spk->id,
                $spk->nomor_spk ?? '-',
                $spk->mitra->nama_lengkap ?? '-',
                "{$spk->bulan}/{$spk->tahun}",
                $spk->status,
                $spk->details->count(),
                $spk->details->whereNull('kode_beban_anggaran')->count(),
            ])
        );

        if (! $this->option('force') && ! $this->confirm('Lanjutkan penghapusan permanen data di atas?', false)) {
            $this->info('Dibatalkan. Tidak ada data yang dihapus.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($spks) {
            foreach ($spks as $spk) {
                $spk->details()->delete();
                $spk->forceDelete();
            }
        });

        $this->info("Berhasil menghapus permanen {$spks->count()} SPK beserta detailnya.");

        return self::SUCCESS;
    }
}
