<?php

namespace App\Jobs;

use App\Models\Spk;
use App\Services\SpkDocxService;
use App\Services\ActivityLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateSpkJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public readonly int $spkId,
        public readonly string $format = 'pdf',
    ) {}

    public function handle(): void
    {
        $spk = Spk::with(['mitra', 'ppk', 'details.kegiatan'])->findOrFail($this->spkId);

        $filename = 'SPK-' . str_replace(['/', '\\'], '-', $spk->nomor_spk) . '-' . $spk->mitra->nama_lengkap;
        $path = storage_path("app/public/spk/{$filename}.{$this->format}");

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        if ($this->format === 'docx') {
            $phpWord = SpkDocxService::generate($spk);
            $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($path);
        } else {
            Pdf::loadView('pdf.spk', compact('spk'))
                ->setPaper('a4', 'portrait')
                ->save($path);
        }

        ActivityLogger::log("Generate {$this->format} SPK {$spk->nomor_spk}");
    }
}
