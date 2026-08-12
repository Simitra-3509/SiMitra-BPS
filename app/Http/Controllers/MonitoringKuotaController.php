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
            ->leftJoin('akun_kegiatan as ak', 'ak.kegiatan_id', '=', 'k.id')
            ->leftJoin('detil_kegiatan as dk', 'dk.akun_id', '=', 'ak.id')
            ->leftJoin('honoraria as h', 'h.penugasan_id', '=', 'p.id')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pendataan' THEN h.jumlah_honor ELSE 0 END), 0) as terpakai_pendataan,
                COALESCE(SUM(CASE WHEN dk.jenis_sbml = 'pengolahan' THEN h.jumlah_honor ELSE 0 END), 0) as terpakai_pengolahan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pendataan' THEN p.id ELSE NULL END) as transaksi_pendataan,
                COUNT(DISTINCT CASE WHEN dk.jenis_sbml = 'pengolahan' THEN p.id ELSE NULL END) as transaksi_pengolahan
            ")
            ->groupBy('mitras.id');

        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('mitras.nama_lengkap', 'like', "%{$cari}%")
                  ->orWhere('mitras.nik', 'like', "%{$cari}%");
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
                'nik' => $mitra->nik,
                'nama_lengkap' => $mitra->nama_lengkap,
                'terpakai_pendataan' => (float)$mitra->terpakai_pendataan,
                'terpakai_pengolahan' => (float)$mitra->terpakai_pengolahan,
                'transaksi_pendataan' => (int)$mitra->transaksi_pendataan,
                'transaksi_pengolahan' => (int)$mitra->transaksi_pengolahan,
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

        return Inertia::render('MonitoringKuota/Index', [
            'mitras' => $mitras,
            'filters' => $request->only(['bulan', 'tahun', 'jenis_sbml', 'status', 'threshold', 'per_page', 'cari']),
            'limits' => [
                'pendataan' => $batasPendataan,
                'pengolahan' => $batasPengolahan,
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id, Request $request)
    {
        $mitra = Mitra::findOrFail($id);
        
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));
        
        $penugasans = Penugasan::with(['kegiatan.akunKegiatan.detilKegiatan', 'honoraria'])
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
            
            // Cek jenis_sbml dari detil_kegiatan
            $detils = $p->kegiatan?->akunKegiatan->flatMap(fn($a) => $a->detilKegiatan) ?? collect();
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
