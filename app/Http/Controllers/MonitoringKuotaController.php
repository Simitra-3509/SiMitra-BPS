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
            ->leftJoin('kegiatans as k', function($join) {
                $join->on('p.kegiatan_id', '=', 'k.id')
                     ->whereNull('k.deleted_at');
            })
            ->leftJoin('detil_kegiatan as dk', 'dk.kegiatan_id', '=', 'k.id')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pendataan' THEN p.total_honor ELSE 0 END), 0) as terpakai_pendataan,
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pengolahan' THEN p.total_honor ELSE 0 END), 0) as terpakai_pengolahan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pendataan' THEN p.id ELSE NULL END) as transaksi_pendataan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pengolahan' THEN p.id ELSE NULL END) as transaksi_pengolahan
            ")
            ->groupBy('mitras.id');

        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('mitras.nama_lengkap', 'like', "%{$cari}%")
                  ->orWhere('mitras.sobat_id', 'like', "%{$cari}%");
            });
        }

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

            $sisaPendataan = max(0, $batasPendataan - (float)$mitra->terpakai_pendataan);
            $sisaPengolahan = max(0, $batasPengolahan - (float)$mitra->terpakai_pengolahan);

            return [
                'id' => $mitra->id,
                'sobat_id' => $mitra->sobat_id,
                'nama_lengkap' => $mitra->nama_lengkap,
                'terpakai_pendataan' => (float)$mitra->terpakai_pendataan,
                'terpakai_pengolahan' => (float)$mitra->terpakai_pengolahan,
                'sisa_pendataan' => $sisaPendataan,
                'sisa_pengolahan' => $sisaPengolahan,
                'transaksi_pendataan' => (int)$mitra->transaksi_pendataan,
                'transaksi_pengolahan' => (int)$mitra->transaksi_pengolahan,
                'usage_pendataan' => round($usagePendataan, 1),
                'usage_pengolahan' => round($usagePengolahan, 1),
                'usage_pendataan_pct' => round($usagePendataan, 1),
                'usage_pengolahan_pct' => round($usagePengolahan, 1),
                'status_pendataan' => $statusPendataan,
                'status_pengolahan' => $statusPengolahan,
            ];
        });

        // Hitung stats ringkasan dashboard sebelum filtering status
        $stats = [
            'total' => $processedMitras->count(),
            'normal' => $processedMitras->filter(fn($m) => $m['status_pendataan'] === 'OK' && $m['status_pengolahan'] === 'OK')->count(),
            'warning' => $processedMitras->filter(fn($m) => $m['status_pendataan'] === 'Warning' || $m['status_pengolahan'] === 'Warning')->count(),
            'kritis' => $processedMitras->filter(fn($m) => $m['status_pendataan'] === 'Kritis' || $m['status_pengolahan'] === 'Kritis')->count(),
        ];

        // Filtering berdasarkan status
        if ($status !== 'semua') {
            $statusNormalized = strtolower($status);
            $processedMitras = $processedMitras->filter(function($mitra) use ($statusNormalized) {
                return strtolower($mitra['status_pendataan']) === $statusNormalized || strtolower($mitra['status_pengolahan']) === $statusNormalized;
            });
        }

        // Manual Pagination
        $page = $request->input('page', 1);
        $perPage = (int) $perPage;
        $offset = ($page - 1) * $perPage;
        
        $paginatedItems = $processedMitras->slice($offset, $perPage)->values();
        
        $mitras = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedItems,
            $processedMitras->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $stats = [
            'total' => $processedMitras->count(),
            'normal' => $processedMitras->filter(function($m) { return $m['status_pendataan'] === 'OK' && $m['status_pengolahan'] === 'OK'; })->count(),
            'warning' => $processedMitras->filter(function($m) { return $m['status_pendataan'] === 'Warning' || $m['status_pengolahan'] === 'Warning'; })->count(),
            'kritis' => $processedMitras->filter(function($m) { return $m['status_pendataan'] === 'Kritis' || $m['status_pengolahan'] === 'Kritis'; })->count(),
        ];

        return Inertia::render('MonitoringKuota/Index', [
            'data' => $mitras,
            'mitras' => $mitras,
            'filters' => $request->only(['bulan', 'tahun', 'jenis_sbml', 'status', 'threshold', 'per_page', 'cari']),
            'stats' => $stats,
            'batas' => [
                'pendataan' => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ],
            'limits' => [
                'pendataan' => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ]
        ]);
    }

    public function export(Request $request)
    {
        $bulan = $request->input('bulan', Carbon::now()->month);
        $tahun = $request->input('tahun', Carbon::now()->year);
        $jenisSbml = $request->input('jenis_sbml', 'semua');
        $status = $request->input('status', 'semua');
        $threshold = $request->input('threshold', 80);
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
            ->leftJoin('kegiatans as k', function($join) {
                $join->on('p.kegiatan_id', '=', 'k.id')
                     ->whereNull('k.deleted_at');
            })
            ->leftJoin('detil_kegiatan as dk', 'dk.kegiatan_id', '=', 'k.id')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pendataan' THEN p.total_honor ELSE 0 END), 0) as terpakai_pendataan,
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pengolahan' THEN p.total_honor ELSE 0 END), 0) as terpakai_pengolahan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pendataan' THEN p.id ELSE NULL END) as transaksi_pendataan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pengolahan' THEN p.id ELSE NULL END) as transaksi_pengolahan
            ")
            ->groupBy('mitras.id');

        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('mitras.nama_lengkap', 'like', "%{$cari}%")
                  ->orWhere('mitras.sobat_id', 'like', "%{$cari}%");
            });
        }

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

            return [
                'id' => $mitra->id,
                'sobat_id' => $mitra->sobat_id,
                'nama_lengkap' => $mitra->nama_lengkap,
                'terpakai_pendataan' => (float)$mitra->terpakai_pendataan,
                'terpakai_pengolahan' => (float)$mitra->terpakai_pengolahan,
                'sisa_pendataan' => max(0, $batasPendataan - $mitra->terpakai_pendataan),
                'sisa_pengolahan' => max(0, $batasPengolahan - $mitra->terpakai_pengolahan),
                'transaksi_pendataan' => (int)$mitra->transaksi_pendataan,
                'transaksi_pengolahan' => (int)$mitra->transaksi_pengolahan,
                'usage_pendataan' => round($usagePendataan, 1),
                'usage_pengolahan' => round($usagePengolahan, 1),
                'usage_pendataan_pct' => round($usagePendataan, 1),
                'usage_pengolahan_pct' => round($usagePengolahan, 1),
                'status_pendataan' => $statusPendataan,
                'status_pengolahan' => $statusPengolahan,
            ];
        });

        // Filtering berdasarkan status
        if ($status !== 'semua') {
            $processedMitras = $processedMitras->filter(function($mitra) use ($status) {
                return $mitra['status_pendataan'] === $status || $mitra['status_pengolahan'] === $status;
            });
        }

        $fileName = 'Monitoring_Kuota_Mitra_' . date('Y-m-d_His') . '.csv';
        
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = array(
            'No', 
            'Nama Mitra', 
            'Sobat ID', 
            'Honor Pendataan', 
            'Sisa Pendataan', 
            'Persentase Pendataan', 
            'Status Pendataan', 
            'Honor Pengolahan', 
            'Sisa Pengolahan', 
            'Persentase Pengolahan', 
            'Status Pengolahan'
        );

        $callback = function() use($processedMitras, $columns, $batasPendataan, $batasPengolahan) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            $no = 1;
            foreach ($processedMitras as $row) {
                fputcsv($file, array(
                    $no++,
                    $row['nama_lengkap'],
                    $row['sobat_id'],
                    $row['terpakai_pendataan'],
                    $batasPendataan - $row['terpakai_pendataan'],
                    $row['usage_pendataan_pct'] . '%',
                    $row['status_pendataan'],
                    $row['terpakai_pengolahan'],
                    $batasPengolahan - $row['terpakai_pengolahan'],
                    $row['usage_pengolahan_pct'] . '%',
                    $row['status_pengolahan'],
                ));
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display the specified resource.
     */
    public function show($id, Request $request)
    {
        $mitra = Mitra::findOrFail($id);
        
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));
        
        $penugasans = Penugasan::with(['kegiatan.detilKegiatan'])
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
            if (!$p->kegiatan) continue;
            
            $honorTotal = $p->total_honor ?? 0;
            
            // Cek jenis_sbml dari detil_kegiatan
            $detils = $p->kegiatan?->detilKegiatan ?? collect();
            $hasPengolahan = $detils->contains(fn($d) => strtolower($d->jenis_sbml) === 'pengolahan');
            
            if ($hasPengolahan) {
                $terpakaiPengolahan += $honorTotal;
            } else {
                $terpakaiPendataan += $honorTotal;
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
