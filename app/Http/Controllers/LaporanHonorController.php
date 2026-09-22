<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Mitra;
use App\Models\Penugasan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LaporanHonorController extends Controller
{
    /**
     * Tampilkan halaman laporan honor.
     */
    public function index(Request $request)
    {
        $bulanKeg = $request->input('bulan_kegiatan', '');
        $tahunKeg = $request->input('tahun_kegiatan', '');
        $tglMulai = $request->input('tanggal_mulai', '');
        $tglSelesai = $request->input('tanggal_selesai', '');
        
        $mitraId = $request->input('mitra_id', '');
        $jenisSbml = $request->input('jenis_sbml', '');
        $cari = $request->input('cari', '');
        $perPage = $request->input('per_page', 10);

        // Base Query dari Penugasan (karena Honor otomatis dihitung di Penugasan)
        $query = DB::table('penugasans as p')
            ->join('mitras as m', 'p.mitra_id', '=', 'm.id')
            ->join('kegiatans as k', 'p.kegiatan_id', '=', 'k.id')
            ->join('detil_kegiatan as dk', 'p.detil_kegiatan_id', '=', 'dk.id')
            ->whereNull('p.deleted_at')
            ->whereNull('m.deleted_at')
            ->whereNull('k.deleted_at');

        // Apply Filters
        if ($bulanKeg) $query->where('p.bulan', $bulanKeg);
        if ($tahunKeg) $query->where('p.tahun', $tahunKeg);
        if ($tglMulai) $query->where('k.tanggal_mulai', '>=', $tglMulai);
        if ($tglSelesai) $query->where('k.tanggal_selesai', '<=', $tglSelesai);
        
        if ($mitraId) $query->where('p.mitra_id', $mitraId);
        if ($jenisSbml) $query->where('dk.jenis_sbml', $jenisSbml);
        
        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('k.nama_kegiatan', 'like', "%{$cari}%")
                  ->orWhere('m.nama_lengkap', 'like', "%{$cari}%");
            });
        }

        // Summary Aggregations
        $summaryQuery = clone $query;
        $totalHonor = (float) $summaryQuery->sum('p.total_honor');
        
        $totalMitraQuery = clone $query;
        $totalMitra = $totalMitraQuery->distinct('p.mitra_id')->count('p.mitra_id');
        
        $totalTransaksiQuery = clone $query;
        $totalTransaksi = $totalTransaksiQuery->count('p.id');
        
        $pendataanQuery = clone $query;
        $totalHonorPendataan = (float) $pendataanQuery->where('dk.jenis_sbml', 'pendataan')->sum('p.total_honor');
        
        $pengolahanQuery = clone $query;
        $totalHonorPengolahan = (float) $pengolahanQuery->where('dk.jenis_sbml', 'pengolahan')->sum('p.total_honor');
        
        $rataRata = $totalMitra > 0 ? $totalHonor / $totalMitra : 0;

        // Fetch Paginated List grouped by Mitra, Bulan, Tahun, Jenis SBML
        $listQuery = $query->select(
            'm.id as mitra_id',
            'm.nama_lengkap as nama_mitra',
            'p.bulan',
            'p.tahun',
            'dk.jenis_sbml',
            DB::raw('COUNT(p.id) as jml_transaksi'),
            DB::raw('SUM(p.total_honor) as total_pencairan')
        )
        ->groupBy('m.id', 'm.nama_lengkap', 'p.bulan', 'p.tahun', 'dk.jenis_sbml')
        ->orderByDesc('p.tahun')
        ->orderByDesc('p.bulan')
        ->orderBy('m.nama_lengkap');

        if ($perPage === 'all') {
            $data = $listQuery->get();
            $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
                $data,
                $data->count(),
                $data->count() > 0 ? $data->count() : 1,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $paginated = $listQuery->paginate((int) $perPage)->withQueryString();
        }

        $mitraList = Mitra::select('id', 'nama_lengkap')->where('status_aktif', true)->orderBy('nama_lengkap')->get();

        return Inertia::render('LaporanHonor/Index', [
            'data' => $paginated,
            'summary' => [
                'total_mitra'            => $totalMitra,
                'total_transaksi'        => $totalTransaksi,
                'total_honor'            => $totalHonor,
                'rata_rata'              => $rataRata,
                'total_honor_pendataan'  => $totalHonorPendataan,
                'total_honor_pengolahan' => $totalHonorPengolahan,
            ],
            'filters' => $request->only([
                'bulan_kegiatan', 'tahun_kegiatan', 'tanggal_mulai', 'tanggal_selesai',
                'mitra_id', 'jenis_sbml', 'cari', 'per_page'
            ]),
            'mitraList' => $mitraList
        ]);
    }

    /**
     * Export data honor ke CSV.
     */
    public function export(Request $request)
    {
        $bulanKeg = $request->input('bulan_kegiatan', '');
        $tahunKeg = $request->input('tahun_kegiatan', '');
        $tglMulai = $request->input('tanggal_mulai', '');
        $tglSelesai = $request->input('tanggal_selesai', '');
        
        $mitraId = $request->input('mitra_id', '');
        $jenisSbml = $request->input('jenis_sbml', '');
        $cari = $request->input('cari', '');

        $query = DB::table('penugasans as p')
            ->join('mitras as m', 'p.mitra_id', '=', 'm.id')
            ->join('kegiatans as k', 'p.kegiatan_id', '=', 'k.id')
            ->join('detil_kegiatan as dk', 'p.detil_kegiatan_id', '=', 'dk.id')
            ->whereNull('p.deleted_at')
            ->whereNull('m.deleted_at')
            ->whereNull('k.deleted_at');

        if ($bulanKeg) $query->where('p.bulan', $bulanKeg);
        if ($tahunKeg) $query->where('p.tahun', $tahunKeg);
        if ($tglMulai) $query->where('k.tanggal_mulai', '>=', $tglMulai);
        if ($tglSelesai) $query->where('k.tanggal_selesai', '<=', $tglSelesai);
        
        if ($mitraId) $query->where('p.mitra_id', $mitraId);
        if ($jenisSbml) $query->where('dk.jenis_sbml', $jenisSbml);
        
        if ($cari) {
            $query->where(function($q) use ($cari) {
                $q->where('k.nama_kegiatan', 'like', "%{$cari}%")
                  ->orWhere('m.nama_lengkap', 'like', "%{$cari}%");
            });
        }

        $listQuery = $query->select(
            'm.nama_lengkap as nama_mitra',
            'p.bulan',
            'p.tahun',
            'dk.jenis_sbml',
            DB::raw('COUNT(p.id) as jml_transaksi'),
            DB::raw('SUM(p.total_honor) as total_pencairan')
        )
        ->groupBy('m.id', 'm.nama_lengkap', 'p.bulan', 'p.tahun', 'dk.jenis_sbml')
        ->orderByDesc('p.tahun')
        ->orderByDesc('p.bulan')
        ->orderBy('m.nama_lengkap');

        $data = $listQuery->get();

        $fileName = 'Laporan_Honor_Mitra_' . date('Y-m-d_His') . '.csv';
        
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = array('No', 'Nama Mitra', 'Bulan', 'Tahun', 'Jenis SBML', 'Jumlah Penugasan', 'Total Honor');

        $callback = function() use($data, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            $no = 1;
            foreach ($data as $row) {
                fputcsv($file, array(
                    $no++,
                    $row->nama_mitra,
                    $row->bulan,
                    $row->tahun,
                    $row->jenis_sbml,
                    $row->jml_transaksi,
                    $row->total_pencairan
                ));
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Tampilkan halaman detail laporan honor mitra.
     */
    public function show($id, Request $request)
    {
        $mitra = Mitra::findOrFail($id);

        $bulan = (int) $request->input('bulan', Carbon::now()->month);
        $tahun = (int) $request->input('tahun', Carbon::now()->year);
        $jenisSbml = $request->input('jenis_sbml', '');

        $query = Penugasan::with(['kegiatan', 'detilKegiatan'])
            ->where('mitra_id', $id)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->where('status', '!=', 'Batal');

        if ($jenisSbml && $jenisSbml !== 'semua') {
            $query->whereHas('detilKegiatan', function ($q) use ($jenisSbml) {
                $q->where('jenis_sbml', $jenisSbml);
            });
        }

        $penugasans = $query->orderBy('tanggal_selesai', 'desc')->get();

        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $periodeTeks = ($namaBulan[$bulan] ?? "Bulan $bulan") . " " . $tahun;

        $rincian = $penugasans->map(function ($p) use ($namaBulan) {
            $tgl = $p->tanggal_selesai ?? $p->kegiatan?->tanggal_selesai;
            $tglFormatted = '-';
            if ($tgl) {
                $c = Carbon::parse($tgl);
                $tglFormatted = $c->format('d') . ' ' . ($namaBulan[$c->month] ?? $c->format('M')) . ' ' . $c->format('Y');
            }

            return [
                'id' => $p->id,
                'nama_kegiatan' => $p->kegiatan?->nama_kegiatan ?? '-',
                'nama_detil' => $p->detilKegiatan?->nama_detil ?? '-',
                'jenis_sbml' => ucfirst($p->detilKegiatan?->jenis_sbml ?? 'Pendataan'),
                'tanggal_selesai' => $tglFormatted,
                'volume' => (int) $p->kuota_target,
                'satuan' => $p->detilKegiatan?->satuan ?? 'Dokumen',
                'harga_satuan' => (float) ($p->detilKegiatan?->harga_satuan ?? 0),
                'total' => (float) $p->total_honor,
                'status' => $p->status ?? 'Aktif',
            ];
        });

        $totalPencairan = (float) $penugasans->sum('total_honor');
        $jumlahTransaksi = $penugasans->count();

        return Inertia::render('LaporanHonor/Show', [
            'id' => $id,
            'mitra' => [
                'id' => $mitra->id,
                'nama_lengkap' => $mitra->nama_lengkap,
                'sobat_id' => $mitra->sobat_id ?? '-',
                'npwp' => $mitra->npwp ?? '-',
                'nik' => $mitra->nik ?? '-',
                'email' => $mitra->email ?? '-',
                'jenis_kelamin' => $mitra->jenis_kelamin ?? '-',
                'alamat_domisili' => $mitra->alamat_domisili ?? '-',
                'kecamatan' => $mitra->kecamatan ?? '-',
                'desa' => $mitra->desa ?? '-',
            ],
            'periode' => $periodeTeks,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'jenis_sbml' => $jenisSbml ? ucfirst($jenisSbml) : 'Semua',
            'rincian' => $rincian,
            'total_pencairan' => $totalPencairan,
            'jumlah_transaksi' => $jumlahTransaksi,
        ]);
    }
}
