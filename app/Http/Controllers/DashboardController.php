<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\Penugasan;
use App\Models\SbmlLimit;
use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman utama Dashboard.
     */
    public function index(Request $request): Response
    {
        $userRole = strtolower(auth()->user()->role ?? '');

        $currentMonth = (int) date('m');
        $currentYear = (int) date('Y');

        // 1. Total Mitra yang sedang ada penugasan bulan ini
        $totalMitra = Penugasan::whereNotNull('mitra_id')
            ->whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->distinct('mitra_id')
            ->count('mitra_id');

        // 2. Kegiatan aktif yang sedang dilaksanakan ataupun sedang ditugaskan bulan ini
        $kegiatanAktif = Kegiatan::where('status_aktif', true)
            ->where(function ($query) use ($currentMonth, $currentYear) {
                $query->whereHas('penugasans', function ($pq) use ($currentMonth, $currentYear) {
                    $pq->whereNull('deleted_at')
                       ->where('bulan', $currentMonth)
                       ->where('tahun', $currentYear);
                })
                ->orWhere(function ($q) use ($currentMonth, $currentYear) {
                    $startDate = Carbon::create($currentYear, $currentMonth, 1)->startOfMonth();
                    $endDate = (clone $startDate)->endOfMonth();
                    $q->whereNotNull('tanggal_mulai')
                      ->whereDate('tanggal_mulai', '<=', $endDate)
                      ->whereDate('tanggal_selesai', '>=', $startDate);
                });
            })
            ->count();

        // 3. Honor Mitra Bulan Ini (Rata-rata, Terkecil, Terbesar)
        $mitraHonorBulanIniSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonor = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->avg() : 0;
        $honorTerkecil = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->min() : 0;
        $honorTerbesar = $mitraHonorBulanIniSums->count() > 0 ? (float) $mitraHonorBulanIniSums->max() : 0;

        $honorBulanIni = (float) Penugasan::whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->sum('total_honor');

        $jumlahPenugasanBulanIni = Penugasan::whereNull('deleted_at')
            ->where('bulan', $currentMonth)
            ->where('tahun', $currentYear)
            ->count();

        // 4. Rata-rata honor mitra dalam setahun (tahun berjalan)
        $mitraHonorSetahunSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('tahun', $currentYear)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonorSetahun = $mitraHonorSetahunSums->count() > 0 ? (float) $mitraHonorSetahunSums->avg() : 0;

        // 5. SBML Limits
        $sbmlLimits = SbmlLimit::where('tahun', $currentYear)->get()->keyBy('jenis_kegiatan');
        $sbmlPendataan = (float)($sbmlLimits['pendataan']->batas_maksimal ?? SbmlLimit::where('jenis_kegiatan', 'pendataan')->first()?->batas_maksimal ?? 3085000);
        $sbmlPengolahan = (float)($sbmlLimits['pengolahan']->batas_maksimal ?? SbmlLimit::where('jenis_kegiatan', 'pengolahan')->first()?->batas_maksimal ?? 2854000);

        // 6. Chart Data
        $performaData = [
            ['name' => 'Jan', 'honor' => 0],
            ['name' => 'Feb', 'honor' => 0],
            ['name' => 'Mar', 'honor' => 0],
            ['name' => 'Apr', 'honor' => 0],
            ['name' => 'Mei', 'honor' => 0],
            ['name' => 'Jun', 'honor' => 0],
            ['name' => 'Jul', 'honor' => 0],
            ['name' => 'Agu', 'honor' => (float)$honorBulanIni],
        ];

        $komposisiData = [
            ['name' => 'Mitra', 'value' => $totalMitra],
            ['name' => 'Kegiatan', 'value' => $kegiatanAktif],
            ['name' => 'Penugasan', 'value' => $jumlahPenugasanBulanIni],
        ];

        // 7. Daftar Mitra
        $mitraList = DashboardService::getMitraList('bulanan', $currentYear, $currentMonth, $sbmlPendataan, $sbmlPengolahan);

        return Inertia::render('Dashboard', [
            'userRole' => $userRole,
            'stats' => [
                'totalMitra' => $totalMitra,
                'kegiatanAktif' => $kegiatanAktif,
                'honorBulanIni' => $honorBulanIni,
                'rataRataHonor' => $rataRataHonor,
                'honorTerkecil' => $honorTerkecil,
                'honorTerbesar' => $honorTerbesar,
                'rataRataHonorSetahun' => $rataRataHonorSetahun,
                'jumlahInputHonor' => $jumlahPenugasanBulanIni,
            ],
            'sbml' => [
                'pendataan' => $sbmlPendataan,
                'pengolahan' => $sbmlPengolahan,
            ],
            'chartData' => [
                'performa' => $performaData,
                'komposisi' => $komposisiData,
            ],
            'mitraList' => $mitraList,
        ]);
    }

    /**
     * API untuk filter data Dashboard (AJAX).
     */
    public function filter(Request $request): JsonResponse
    {
        $filter = $request->input('filter', 'bulanan'); // bulanan | tahunan | semua
        $tahun  = (int) $request->input('tahun', date('Y'));
        $bulan  = (int) $request->input('bulan', date('m'));

        if ($filter === 'bulanan') {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at')
                ->where('bulan', $bulan)->where('tahun', $tahun);
            $label = 'Bulan ' . Carbon::create()->month($bulan)->locale('id')->isoFormat('MMMM') . ' ' . $tahun;

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)
                ->where(function ($query) use ($bulan, $tahun) {
                    $query->whereHas('penugasans', function ($pq) use ($bulan, $tahun) {
                        $pq->whereNull('deleted_at')
                           ->where('bulan', $bulan)
                           ->where('tahun', $tahun);
                    })
                    ->orWhere(function ($q) use ($bulan, $tahun) {
                        $startDate = Carbon::create($tahun, $bulan, 1)->startOfMonth();
                        $endDate = (clone $startDate)->endOfMonth();
                        $q->whereNotNull('tanggal_mulai')
                          ->whereDate('tanggal_mulai', '<=', $endDate)
                          ->whereDate('tanggal_selesai', '>=', $startDate);
                    });
                })
                ->count();
        } elseif ($filter === 'tahunan') {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at')
                ->where('tahun', $tahun);
            $label = 'Tahun ' . $tahun;

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->where('tahun', $tahun)
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)
                ->where(function ($query) use ($tahun) {
                    $query->whereHas('penugasans', function ($pq) use ($tahun) {
                        $pq->whereNull('deleted_at')
                           ->where('tahun', $tahun);
                    })
                    ->orWhere(function ($q) use ($tahun) {
                        $startDate = Carbon::create($tahun, 1, 1)->startOfYear();
                        $endDate = (clone $startDate)->endOfYear();
                        $q->whereNotNull('tanggal_mulai')
                          ->whereDate('tanggal_mulai', '<=', $endDate)
                          ->whereDate('tanggal_selesai', '>=', $startDate);
                    });
                })
                ->count();
        } else {
            $honorQuery = DB::table('penugasans')->whereNull('deleted_at');
            $label = 'Semua Waktu';

            $totalMitra = Penugasan::whereNotNull('mitra_id')
                ->whereNull('deleted_at')
                ->distinct('mitra_id')
                ->count('mitra_id');

            $kegiatanAktif = Kegiatan::where('status_aktif', true)->count();
        }

        $mitraHonorSums = (clone $honorQuery)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');

        $rataRataHonor  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->avg() : 0;
        $honorTerkecil  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->min() : 0;
        $honorTerbesar  = $mitraHonorSums->count() > 0 ? (float) $mitraHonorSums->max() : 0;
        $totalHonor     = (float) (clone $honorQuery)->sum('total_honor');
        $jumlahPenugasan = (clone $honorQuery)->count();

        $mitraHonorSetahunSums = DB::table('penugasans')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->selectRaw('SUM(total_honor) as total_honor')
            ->groupBy('mitra_id')
            ->pluck('total_honor');
        $rataRataHonorSetahun = $mitraHonorSetahunSums->count() > 0 ? (float) $mitraHonorSetahunSums->avg() : 0;

        // ---- CHART DATA ----
        $bulanNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

        if ($filter === 'bulanan') {
            $daysInMonth = Carbon::create($tahun, $bulan)->daysInMonth;
            $honorPerHari = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->selectRaw('DAY(created_at) as hari, SUM(total_honor) as total')
                ->groupBy('hari')
                ->pluck('total', 'hari');

            $performaData = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $performaData[] = ['name' => $d . '', 'honor' => (float)($honorPerHari[$d] ?? 0)];
            }
        } elseif ($filter === 'tahunan') {
            $honorPerBulan = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->where('tahun', $tahun)
                ->selectRaw('bulan, SUM(total_honor) as total')
                ->groupBy('bulan')
                ->pluck('total', 'bulan');

            $performaData = [];
            for ($m = 1; $m <= 12; $m++) {
                $performaData[] = ['name' => $bulanNames[$m-1], 'honor' => (float)($honorPerBulan[$m] ?? 0)];
            }
        } else {
            $honorPerTahun = DB::table('penugasans')
                ->whereNull('deleted_at')
                ->selectRaw('tahun, SUM(total_honor) as total')
                ->groupBy('tahun')
                ->orderBy('tahun')
                ->pluck('total', 'tahun');

            $performaData = [];
            foreach ($honorPerTahun as $yr => $total) {
                $performaData[] = ['name' => (string)$yr, 'honor' => (float)$total];
            }
            if (empty($performaData)) {
                $performaData = [['name' => (string)date('Y'), 'honor' => 0]];
            }
        }

        $komposisiData = [
            ['name' => 'Kegiatan', 'value' => $kegiatanAktif],
            ['name' => 'Mitra',    'value' => $totalMitra],
            ['name' => 'Penugasan','value' => $jumlahPenugasan],
        ];

        // ---- SBML LIMITS ----
        $sbmlLimits = SbmlLimit::where('tahun', $tahun)->get()->keyBy('jenis_kegiatan');
        $batasPendataan = (float)($sbmlLimits['pendataan']->batas_maksimal ?? 3085000);
        $batasPengolahan = (float)($sbmlLimits['pengolahan']->batas_maksimal ?? 2854000);

        // ---- DAFTAR MITRA ----
        $mitraList = DashboardService::getMitraList($filter, $tahun, $bulan, $batasPendataan, $batasPengolahan);

        return response()->json([
            'label'    => $label,
            'stats'    => [
                'totalMitra'           => $totalMitra,
                'kegiatanAktif'        => $kegiatanAktif,
                'totalHonor'           => $totalHonor,
                'rataRataHonor'        => $rataRataHonor,
                'honorTerkecil'        => $honorTerkecil,
                'honorTerbesar'        => $honorTerbesar,
                'rataRataHonorSetahun' => $rataRataHonorSetahun,
                'jumlahInputHonor'     => $jumlahPenugasan,
            ],
            'chartData' => [
                'performa'  => $performaData,
                'komposisi' => $komposisiData,
            ],
            'mitraList' => $mitraList,
            'sbml'      => [
                'pendataan'  => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ],
        ]);
    }
}
