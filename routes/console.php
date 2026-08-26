<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\PeriodePengisian;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $bulan = (int) now()->month;
    $tahun = (int) now()->year;
    PeriodePengisian::updateOrCreate(
        ['bulan' => $bulan, 'tahun' => $tahun],
        ['status' => 'terkunci', 'dikunci_at' => now()]
    );
})->monthlyOn(16, '00:01');
