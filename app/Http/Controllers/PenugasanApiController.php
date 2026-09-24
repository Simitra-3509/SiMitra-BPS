<?php

namespace App\Http\Controllers;

use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Services\PenugasanService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PenugasanApiController extends Controller implements HasMiddleware
{
    public function __construct(protected PenugasanService $penugasanService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('role:operator,ppk,admin,administrator'),
        ];
    }

    /**
     * API: Fetch Detil Belanja by Kegiatan ID
     */
    public function getDetilByKegiatan($kegiatan_id)
    {
        $detilList = DetilKegiatan::where('kegiatan_id', $kegiatan_id)
            ->withSum('penugasans', 'kuota_target')
            ->get()
            ->map(function ($detil) {
                $detil->total_kuota_terpakai = (float) ($detil->penugasans_sum_kuota_target ?? 0);
                return $detil;
            });

        return response()->json($detilList);
    }

    /**
     * API: Search Mitra (by Sobat ID / Nama Lengkap / Kecamatan)
     */
    public function searchMitra(Request $request)
    {
        $q         = trim($request->get('q', ''));
        $kecamatan = trim($request->get('kecamatan', ''));
        $query     = Mitra::where('status_aktif', true);

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('sobat_id',     'like', "%{$q}%")
                    ->orWhere('nama_lengkap', 'like', "%{$q}%")
                    ->orWhere('alamat',       'like', "%{$q}%")
                    ->orWhere('kecamatan',    'like', "%{$q}%");
            });
        }

        if ($kecamatan !== '' && $kecamatan !== 'semua') {
            $query->where('kecamatan', 'like', "%{$kecamatan}%");
        }

        $mitraList = $query->orderBy('nama_lengkap')->limit(50)
            ->get(['id', 'sobat_id', 'nama_lengkap', 'alamat', 'kecamatan']);

        return response()->json($mitraList);
    }

    /**
     * API: Bulk Lookup Mitra by Sobat IDs
     */
    public function bulkLookupMitra(Request $request)
    {
        $request->validate([
            'sobat_ids'   => 'required|array|min:1',
            'sobat_ids.*' => 'required|string',
        ]);

        $rawSobatIds = array_map('trim', $request->sobat_ids);
        $sobatIds    = array_unique(array_filter($rawSobatIds));

        $mitras = Mitra::where('status_aktif', true)
            ->whereIn('sobat_id', $sobatIds)
            ->get(['id', 'sobat_id', 'nama_lengkap', 'alamat', 'kecamatan']);

        $foundSobatIds    = $mitras->pluck('sobat_id')->toArray();
        $notFoundSobatIds = array_values(array_diff($sobatIds, $foundSobatIds));

        return response()->json([
            'mitras'              => $mitras,
            'not_found_sobat_ids' => $notFoundSobatIds,
        ]);
    }

    /**
     * API: Check SBML Quota — delegate ke PenugasanService::checkSbmlBatch()
     */
    public function checkMitraSbml(Request $request)
    {
        $bulan     = (int) $request->get('bulan', date('m'));
        $tahun     = (int) $request->get('tahun', date('Y'));
        $jenisSbml = strtolower(trim($request->get('jenis_sbml', 'pendataan')));
        $mitraIds  = $request->get('mitra_ids', []);

        if (is_string($mitraIds)) {
            $mitraIds = explode(',', $mitraIds);
        }
        $mitraIds = array_filter(array_map('intval', (array) $mitraIds));

        return response()->json(
            $this->penugasanService->checkSbmlBatch($mitraIds, $jenisSbml, $bulan, $tahun)
        );
    }

    /**
     * API: Fetch Prev Month Penugasan — delegate ke PenugasanService::getPrevMonthData()
     */
    public function getPrevMonthPenugasan(Request $request)
    {
        $detilId = $request->get('detil_kegiatan_id');
        $bulan   = (int) $request->get('bulan');
        $tahun   = (int) $request->get('tahun');

        if (!$detilId || !$bulan || !$tahun) {
            return response()->json([]);
        }

        return response()->json(
            $this->penugasanService->getPrevMonthData((int) $detilId, $bulan, $tahun)
        );
    }
}
