<?php

namespace App\Http\Controllers;

use App\Models\PeriodePengisian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodePengisianController extends Controller
{
    /**
     * Tampilkan daftar periode pengisian penugasan.
     */
    public function index(Request $request)
    {
        $tahun = (int) $request->get('tahun', date('Y'));
        
        $periodeList = PeriodePengisian::with(['pengunci', 'pembuka'])
            ->where('tahun', $tahun)
            ->get();

        $namaBulanList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // Buat data 12 bulan lengkap untuk tahun tersebut
        $bulanMap = $periodeList->keyBy('bulan');
        $fullPeriodes = [];

        for ($b = 1; $b <= 12; $b++) {
            $p = $bulanMap->get($b);
            $fullPeriodes[] = [
                'bulan'        => $b,
                'nama_bulan'   => $namaBulanList[$b],
                'tahun'        => $tahun,
                'status'       => $p ? $p->status : 'terbuka',
                'dikunci_oleh' => $p && $p->pengunci ? ($p->pengunci->name ?? $p->pengunci->username) : null,
                'dikunci_at'   => $p && $p->dikunci_at ? date('d M Y H:i', strtotime($p->dikunci_at)) : null,
                'dibuka_oleh'  => $p && $p->pembuka ? ($p->pembuka->name ?? $p->pembuka->username) : null,
                'dibuka_at'    => $p && $p->dibuka_at ? date('d M Y H:i', strtotime($p->dibuka_at)) : null,
            ];
        }

        $tahunList = range(date('Y') - 2, date('Y') + 2);

        return Inertia::render('PeriodePengisian/Index', [
            'periodes'  => $fullPeriodes,
            'tahun'     => $tahun,
            'tahunList' => array_values($tahunList),
        ]);
    }

    /**
     * PPK Kunci periode tertentu.
     */
    public function kunci(Request $request)
    {
        if (strtolower(auth()->user()->role ?? '') !== 'ppk') {
            abort(403, 'Hanya PPK yang berhak mengunci periode pengisian.');
        }

        $validated = $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
        ]);

        PeriodePengisian::updateOrCreate(
            ['bulan' => $validated['bulan'], 'tahun' => $validated['tahun']],
            [
                'status'       => 'terkunci',
                'dikunci_oleh' => auth()->id(),
                'dikunci_at'   => now(),
            ]
        );

        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ][$validated['bulan']] ?? $validated['bulan'];

        return redirect()->back()->with('success', "Periode pengisian {$namaBulan} {$validated['tahun']} berhasil dikunci oleh PPK.");
    }

    /**
     * PPK Buka kunci periode tertentu.
     */
    public function buka(Request $request)
    {
        if (strtolower(auth()->user()->role ?? '') !== 'ppk') {
            abort(403, 'Hanya PPK yang berhak membuka kunci periode pengisian.');
        }

        $validated = $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
        ]);

        PeriodePengisian::updateOrCreate(
            ['bulan' => $validated['bulan'], 'tahun' => $validated['tahun']],
            [
                'status'      => 'terbuka',
                'dibuka_oleh' => auth()->id(),
                'dibuka_at'   => now(),
            ]
        );

        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ][$validated['bulan']] ?? $validated['bulan'];

        return redirect()->back()->with('success', "Periode pengisian {$namaBulan} {$validated['tahun']} berhasil dibuka kunci oleh PPK.");
    }
}
