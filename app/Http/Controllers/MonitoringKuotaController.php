<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mitra;
use App\Models\SbmlLimit;
use App\Models\Penugasan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class MonitoringKuotaController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->input('bulan', Carbon::now()->month);
        $tahun = $request->input('tahun', Carbon::now()->year);
        $jenisSbml = $request->input('jenis_sbml', 'semua');
        $status = $request->input('status', 'semua');
        $threshold = $request->input('threshold', 80);
        $perPage = $request->input('per_page', 10);
        $cari = $request->input('cari', '');

        // Dapatkan batas SBML tahun terpilih
        $sbmlLimits = SbmlLimit::where('tahun', $tahun)->get()->keyBy('jenis_kegiatan');
        $batasPendataan = $sbmlLimits['pendataan']->batas_maksimal ?? 3085000;
        $batasPengolahan = $sbmlLimits['pengolahan']->batas_maksimal ?? 2854000;

        $query = Mitra::query()
            ->select('mitras.*')
            ->leftJoin('penugasans as p', function($join) use ($bulan, $tahun) {
                $join->on('p.mitra_id', '=', 'mitras.id')
                     ->where('p.bulan', '=', $bulan)
                     ->where('p.tahun', '=', $tahun);
            })
            ->leftJoin('kegiatans as k', 'p.kegiatan_id', '=', 'k.id')
            ->leftJoin('honoraria as h', 'h.penugasan_id', '=', 'p.id')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN k.jenis_sbml = 'pendataan' THEN h.jumlah_honor ELSE 0 END), 0) as terpakai_pendataan,
                COALESCE(SUM(CASE WHEN k.jenis_sbml = 'pengolahan' THEN h.jumlah_honor ELSE 0 END), 0) as terpakai_pengolahan,
                SUM(CASE WHEN k.jenis_sbml = 'pendataan' THEN 1 ELSE 0 END) as transaksi_pendataan,
                SUM(CASE WHEN k.jenis_sbml = 'pengolahan' THEN 1 ELSE 0 END) as transaksi_pengolahan
            ")
            ->groupBy('mitras.id');

        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('mitras.nama_lengkap', 'like', "%{$cari}%")
                  ->orWhere('mitras.nik', 'like', "%{$cari}%");
            });
        }

        // Kita gunakan get() saja untuk saat ini karena kita butuh filter status berdasarkan hasil kalkulasi
        // Idealnya jika data sangat besar, filter status dipindah ke klausa HAVING
        
        $allMitras = $query->get();
        
        // Post-processing untuk menentukan status
        $processedMitras = $allMitras->map(function($mitra) use ($batasPendataan, $batasPengolahan, $threshold) {
            $usagePendataan = $batasPendataan > 0 ? ($mitra->terpakai_pendataan / $batasPendataan) * 100 : 0;
            $usagePengolahan = $batasPengolahan > 0 ? ($mitra->terpakai_pengolahan / $batasPengolahan) * 100 : 0;
            
            $statusPendataan = 'OK';
            if ($usagePendataan >= 100) $statusPendataan = 'Kritis';
            elseif ($usagePendataan >= $threshold) $statusPendataan = 'Warning';
            
            $statusPengolahan = 'OK';
            if ($usagePengolahan >= 100) $statusPengolahan = 'Kritis';
            elseif ($usagePengolahan >= $threshold) $statusPengolahan = 'Warning';
            
            $mitra->usage_pendataan = $usagePendataan;
            $mitra->usage_pengolahan = $usagePengolahan;
            $mitra->status_pendataan = $statusPendataan;
            $mitra->status_pengolahan = $statusPengolahan;
            $mitra->sisa_pendataan = $batasPendataan - $mitra->terpakai_pendataan;
            $mitra->sisa_pengolahan = $batasPengolahan - $mitra->terpakai_pengolahan;
            
            // Overall status logic for filtering
            $mitra->overall_status = 'OK';
            if ($statusPendataan === 'Kritis' || $statusPengolahan === 'Kritis') $mitra->overall_status = 'Kritis';
            elseif ($statusPendataan === 'Warning' || $statusPengolahan === 'Warning') $mitra->overall_status = 'Warning';
            
            return $mitra;
        });

        // Filter by status if not "semua"
        if ($status !== 'semua') {
            $processedMitras = $processedMitras->filter(function($mitra) use ($status) {
                return strtolower($mitra->overall_status) === strtolower($status);
            });
        }
        
        // Hitung statistik dashboard
        $totalMitra = $processedMitras->count();
        $kuotaNormal = $processedMitras->where('overall_status', 'OK')->count();
        $peringatan = $processedMitras->where('overall_status', 'Warning')->count();
        $kritis = $processedMitras->where('overall_status', 'Kritis')->count();

        // Manual Pagination
        $page = $request->input('page', 1);
        $paginatedItems = $processedMitras->slice(($page - 1) * $perPage, $perPage)->values();
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedItems, 
            $processedMitras->count(), 
            $perPage, 
            $page, 
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('MonitoringKuota/Index', [
            'data' => $paginator,
            'filters' => $request->only(['bulan', 'tahun', 'jenis_sbml', 'status', 'threshold', 'per_page', 'cari']),
            'stats' => [
                'total' => $totalMitra,
                'normal' => $kuotaNormal,
                'warning' => $peringatan,
                'kritis' => $kritis,
            ],
            'batas' => [
                'pendataan' => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ]
        ]);
    }

    public function show($id, Request $request)
    {
        $bulan = $request->input('bulan', Carbon::now()->month);
        $tahun = $request->input('tahun', Carbon::now()->year);
        
        $mitra = Mitra::findOrFail($id);
        
        $penugasans = Penugasan::with(['kegiatan', 'honoraria'])
            ->where('mitra_id', $id)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->get();
            
        $sbmlLimits = SbmlLimit::where('tahun', $tahun)->get()->keyBy('jenis_kegiatan');
        $batasPendataan = $sbmlLimits['pendataan']->batas_maksimal ?? 3085000;
        $batasPengolahan = $sbmlLimits['pengolahan']->batas_maksimal ?? 2854000;
        
        $terpakaiPendataan = 0;
        $terpakaiPengolahan = 0;
        
        foreach ($penugasans as $p) {
            $honorTotal = $p->honoraria->sum('jumlah_honor');
            $p->total_honor = $honorTotal;
            if ($p->kegiatan && $p->kegiatan->jenis_sbml === 'pendataan') {
                $terpakaiPendataan += $honorTotal;
            } else if ($p->kegiatan && $p->kegiatan->jenis_sbml === 'pengolahan') {
                $terpakaiPengolahan += $honorTotal;
            }
        }
        
        return Inertia::render('MonitoringKuota/Show', [
            'mitra' => $mitra,
            'penugasans' => $penugasans,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'ringkasan' => [
                'pendataan' => [
                    'batas' => $batasPendataan,
                    'terpakai' => $terpakaiPendataan,
                    'sisa' => $batasPendataan - $terpakaiPendataan,
                ],
                'pengolahan' => [
                    'batas' => $batasPengolahan,
                    'terpakai' => $terpakaiPengolahan,
                    'sisa' => $batasPengolahan - $terpakaiPengolahan,
                ]
            ]
        ]);
    }
}
