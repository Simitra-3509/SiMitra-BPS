<?php

namespace App\Services;

use App\Models\Penugasan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use App\Models\PeriodePengisian;
use App\Models\SbmlLimit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PenugasanService
{
    /**
     * Validasi apakah periode masih terbuka untuk ditulis.
     * Throw RuntimeException jika terkunci (kecuali PPK).
     */
    public function validasiPeriode(int $bulan, int $tahun, string $userRole): void
    {
        $periode = PeriodePengisian::where('bulan', $bulan)->where('tahun', $tahun)->first();
        if ($periode && $periode->status === 'terkunci' && $userRole !== 'ppk') {
            throw new \RuntimeException("Periode {$bulan}/{$tahun} sudah dikunci. Hubungi PPK untuk membuka kunci.");
        }
    }

    /**
     * Validasi bahwa tanggal_mulai dan tanggal_selesai berada dalam rentang bulan yang dipilih.
     * Return ['field' => 'pesan'] jika tidak valid, null jika valid.
     */
    public function validasiTanggal(?string $tglMulai, ?string $tglSelesai, int $bulan, int $tahun): ?array
    {
        if ($tglMulai) {
            $dtMulai = Carbon::parse($tglMulai);
            if ($dtMulai->month !== $bulan || $dtMulai->year !== $tahun) {
                return ['tanggal_mulai' => 'Tanggal mulai dan tanggal selesai harus berada pada bulan yang dipilih.'];
            }
        }
        if ($tglSelesai) {
            $dtSelesai = Carbon::parse($tglSelesai);
            if ($dtSelesai->month !== $bulan || $dtSelesai->year !== $tahun) {
                return ['tanggal_selesai' => 'Tanggal mulai dan tanggal selesai harus berada pada bulan yang dipilih.'];
            }
        }
        return null;
    }

    /**
     * Hitung harga_satuan_snapshot dan total_honor dari DetilKegiatan + kuota_target.
     */
    public function hitungHonor(DetilKegiatan $detil, float $kuotaTarget): array
    {
        $hargaSatuan = (float) ($detil->harga_satuan ?? 0);
        return [
            'harga_satuan_snapshot' => $hargaSatuan,
            'total_honor'           => $kuotaTarget * $hargaSatuan,
        ];
    }

    /**
     * Simpan batch penugasan baru dalam satu DB::transaction dengan locking.
     * Mencegah race condition (lockForUpdate) dan deadlock (sort by mitra id).
     *
     * @param  array  $mitras  [['id' => int, 'kuota_target' => float], ...]
     * @return int    Jumlah record yang berhasil dibuat
     * @throws \Exception  jika validasi DIPA / duplikasi / SBML gagal
     */
    public function storeBatch(
        int $kegiatanId,
        int $detilKegiatanId,
        int $bulan,
        int $tahun,
        array $mitras,
        ?string $tglMulai = null,
        ?string $tglSelesai = null
    ): int {
        $count = 0;

        DB::transaction(function () use (
            $kegiatanId, $detilKegiatanId, $bulan, $tahun,
            $mitras, $tglMulai, $tglSelesai, &$count
        ) {
            // 1. Lock baris DetilKegiatan agar request paralel menunggu antrean
            $detil       = DetilKegiatan::where('id', $detilKegiatanId)->lockForUpdate()->firstOrFail();
            $hargaSatuan = (float) ($detil->harga_satuan ?? 0);
            $jenisSbml   = $detil->jenis_sbml;
            $jumlahDipa  = (float) ($detil->jumlah ?? 0);

            // 2. Validasi Kuota DIPA dengan Lock
            $kuotaTerpakai = (float) Penugasan::where('detil_kegiatan_id', $detilKegiatanId)
                ->lockForUpdate()
                ->sum('kuota_target');

            $kuotaBaru = collect($mitras)->sum(fn ($m) => (float) ($m['kuota_target'] ?? 0));

            if ($jumlahDipa > 0 && ($kuotaTerpakai + $kuotaBaru) > $jumlahDipa) {
                $sisa = max(0, $jumlahDipa - $kuotaTerpakai);
                throw new \Exception(
                    'Total kuota penugasan akan melebihi target DIPA untuk detil ini.'
                    . ' Target DIPA: '            . number_format($jumlahDipa,    0, ',', '.')
                    . ', sudah terpakai: '        . number_format($kuotaTerpakai, 0, ',', '.')
                    . ', sisa: '                  . number_format($sisa,          0, ',', '.')
                    . '. Input Anda menambahkan: '. number_format($kuotaBaru,     0, ',', '.') . '.'
                );
            }

            // 3. Urutkan ID mitra untuk mencegah deadlock saat multi-user
            $sortedMitras = collect($mitras)->sortBy('id')->values()->all();

            foreach ($sortedMitras as $mitraItem) {
                $mitraId        = $mitraItem['id'];
                $kuotaTarget    = (float) ($mitraItem['kuota_target'] ?? 1);
                $totalHonorBaru = $kuotaTarget * $hargaSatuan;

                // Lock Mitra (eksklusif InnoDB)
                $mitra     = Mitra::where('id', $mitraId)->lockForUpdate()->first();
                $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';

                // Cek duplikasi
                $exists = Penugasan::where('detil_kegiatan_id', $detilKegiatanId)
                    ->where('mitra_id', $mitraId)
                    ->where('bulan', $bulan)
                    ->where('tahun', $tahun)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw new \Exception(
                        "Mitra {$namaMitra} sudah ditugaskan ke detil ini pada periode {$bulan}/{$tahun}."
                    );
                }

                // Validasi SBML per bidang dengan Lock
                if ($jenisSbml) {
                    $totalTerpakai = (float) Penugasan::where('mitra_id', $mitraId)
                        ->where('bulan', $bulan)
                        ->where('tahun', $tahun)
                        ->whereHas('detilKegiatan', fn ($q) => $q->where('jenis_sbml', $jenisSbml))
                        ->lockForUpdate()
                        ->sum('total_honor');

                    $sbmlLimit = SbmlLimit::where('jenis_kegiatan', $jenisSbml)
                        ->where('tahun', $tahun)
                        ->first();

                    if ($sbmlLimit) {
                        $batasSbml = (float) $sbmlLimit->batas_maksimal;
                        if (($totalTerpakai + $totalHonorBaru) > $batasSbml) {
                            $sisa = max(0, $batasSbml - $totalTerpakai);
                            throw new \Exception(
                                "Total honor mitra {$namaMitra} untuk {$jenisSbml} bulan {$bulan}/{$tahun}"
                                . ' akan melebihi batas SBML (Rp '  . number_format($batasSbml,    0, ',', '.') . ').'
                                . ' Sudah terpakai: Rp '             . number_format($totalTerpakai, 0, ',', '.')
                                . ', sisa: Rp '                      . number_format($sisa,          0, ',', '.') . '.'
                            );
                        }
                    }
                }

                // Bersihkan data sampah lama (agar tidak bentrok UNIQUE constraint MySQL)
                Penugasan::onlyTrashed()
                    ->where('detil_kegiatan_id', $detilKegiatanId)
                    ->where('mitra_id', $mitraId)
                    ->where('bulan', $bulan)
                    ->where('tahun', $tahun)
                    ->forceDelete();

                Penugasan::create([
                    'kegiatan_id'           => $kegiatanId,
                    'detil_kegiatan_id'     => $detilKegiatanId,
                    'mitra_id'              => $mitraId,
                    'bulan'                 => $bulan,
                    'tahun'                 => $tahun,
                    'kuota_target'          => $kuotaTarget,
                    'harga_satuan_snapshot' => $hargaSatuan,
                    'total_honor'           => $totalHonorBaru,
                    'tanggal_mulai'         => $tglMulai,
                    'tanggal_selesai'       => $tglSelesai,
                    'status'                => 'ditugaskan',
                ]);

                $count++;
            }
        });

        return $count;
    }

    /**
     * Update satu penugasan dalam DB::transaction dengan locking.
     * Memvalidasi SBML (exclude current id) dan kuota DIPA sebelum update.
     *
     * @throws \Exception jika validasi SBML / DIPA gagal
     */
    public function updateSingle(
        array $validated,
        Penugasan $penugasan,
        int $detilId,
        int $mitraId,
        float $kuotaTarget,
        int $bulanNum,
        int $tahunNum
    ): void {
        DB::transaction(function () use (
            $validated, $penugasan, $detilId, $mitraId,
            $kuotaTarget, $bulanNum, $tahunNum
        ) {
            // 1. Lock penugasan yang sedang diedit
            $penugasanLocked = Penugasan::where('id', $penugasan->id)->lockForUpdate()->firstOrFail();

            // 2. Lock DetilKegiatan
            $detil          = DetilKegiatan::where('id', $detilId)->lockForUpdate()->firstOrFail();
            $hargaSatuan    = (float) ($detil->harga_satuan ?? 0);
            $totalHonorBaru = $kuotaTarget * $hargaSatuan;
            $jenisSbml      = $detil->jenis_sbml;

            // 3. Lock Mitra
            $mitra     = Mitra::where('id', $mitraId)->lockForUpdate()->first();
            $namaMitra = $mitra ? $mitra->nama_lengkap : 'Mitra';

            // 4. Validasi SBML dengan Lock (exclude current penugasan)
            if ($jenisSbml) {
                $totalTerpakai = (float) Penugasan::where('mitra_id', $mitraId)
                    ->where('bulan', $bulanNum)
                    ->where('tahun', $tahunNum)
                    ->where('id', '!=', $penugasanLocked->id)
                    ->whereHas('detilKegiatan', fn ($q) => $q->where('jenis_sbml', $jenisSbml))
                    ->lockForUpdate()
                    ->sum('total_honor');

                $sbmlLimit = SbmlLimit::where('jenis_kegiatan', $jenisSbml)
                    ->where('tahun', $tahunNum)
                    ->first();

                if ($sbmlLimit) {
                    $batasSbml = (float) $sbmlLimit->batas_maksimal;
                    if (($totalTerpakai + $totalHonorBaru) > $batasSbml) {
                        $sisa = max(0, $batasSbml - $totalTerpakai);
                        throw new \Exception(
                            "Total honor mitra {$namaMitra} untuk {$jenisSbml} bulan {$bulanNum}/{$tahunNum}"
                            . ' akan melebihi batas SBML (Rp '  . number_format($batasSbml,    0, ',', '.') . ').'
                            . ' Sudah terpakai: Rp '             . number_format($totalTerpakai, 0, ',', '.')
                            . ', sisa: Rp '                      . number_format($sisa,          0, ',', '.') . '.'
                        );
                    }
                }
            }

            // 5. Validasi Kuota DIPA dengan Lock (exclude current penugasan)
            $jumlahDipa = (float) ($detil->jumlah ?? 0);
            if ($jumlahDipa > 0) {
                $kuotaTerpakai = (float) Penugasan::where('detil_kegiatan_id', $detilId)
                    ->where('id', '!=', $penugasanLocked->id)
                    ->lockForUpdate()
                    ->sum('kuota_target');

                if (($kuotaTerpakai + $kuotaTarget) > $jumlahDipa) {
                    $sisa = max(0, $jumlahDipa - $kuotaTerpakai);
                    throw new \Exception(
                        'Kuota target melebihi sisa DIPA untuk detil ini.'
                        . ' Target DIPA: '                   . number_format($jumlahDipa,    0, ',', '.')
                        . ', sudah terpakai (mitra lain): '  . number_format($kuotaTerpakai, 0, ',', '.')
                        . ', sisa tersedia: '                . number_format($sisa,          0, ',', '.') . '.'
                    );
                }
            }

            // 6. Simpan dengan snapshot harga terbaru
            $validated['harga_satuan_snapshot'] = $hargaSatuan;
            $validated['total_honor']           = $totalHonorBaru;

            $penugasanLocked->update($validated);
        });
    }

    /**
     * Hitung sisa kuota SBML untuk satu atau lebih mitra pada periode dan jenis tertentu.
     * Digunakan oleh endpoint API checkMitraSbml().
     *
     * @param  int[]  $mitraIds
     * @return array  Keyed by mitra_id
     */
    public function checkSbmlBatch(array $mitraIds, string $jenisSbml, int $bulan, int $tahun): array
    {
        if (empty($mitraIds)) {
            return [];
        }

        $sbmlLimit = SbmlLimit::where('jenis_kegiatan', $jenisSbml)
            ->where('tahun', $tahun)
            ->first();

        $batasMaksimal = $sbmlLimit
            ? (float) $sbmlLimit->batas_maksimal
            : ($jenisSbml === 'pengolahan' ? 2854000 : 3085000);

        $penugasanSums = Penugasan::whereIn('mitra_id', $mitraIds)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->where('status', '!=', 'Batal')
            ->whereHas('detilKegiatan', fn ($q) => $q->where('jenis_sbml', $jenisSbml))
            ->groupBy('mitra_id')
            ->selectRaw('mitra_id, SUM(total_honor) as total_terpakai')
            ->pluck('total_terpakai', 'mitra_id')
            ->toArray();

        $result = [];
        foreach ($mitraIds as $mId) {
            $terpakai = (float) ($penugasanSums[$mId] ?? 0);
            $sisa     = max(0, $batasMaksimal - $terpakai);
            $pct      = $batasMaksimal > 0 ? round(($terpakai / $batasMaksimal) * 100, 1) : 0;

            $status = 'Aman';
            if ($pct >= 100) {
                $status = 'Kritis';
            } elseif ($pct >= 80) {
                $status = 'Peringatan';
            }

            $result[$mId] = [
                'mitra_id'       => $mId,
                'batas_maksimal' => $batasMaksimal,
                'terpakai'       => $terpakai,
                'sisa_kuota'     => $sisa,
                'persentase'     => $pct,
                'status'         => $status,
            ];
        }

        return $result;
    }

    /**
     * Ambil data penugasan pada suatu periode untuk fitur "Salin dari bulan sebelumnya".
     */
    public function getPrevMonthData(int $detilId, int $bulan, int $tahun): array
    {
        $namaBulanList = [
            1  => 'Januari',   2  => 'Februari', 3  => 'Maret',    4  => 'April',
            5  => 'Mei',       6  => 'Juni',      7  => 'Juli',     8  => 'Agustus',
            9  => 'September', 10 => 'Oktober',   11 => 'November', 12 => 'Desember',
        ];

        $prevPenugasan = Penugasan::with('mitra')
            ->where('detil_kegiatan_id', $detilId)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->get();

        $data = $prevPenugasan->map(fn ($item) => [
            'mitra_id'     => $item->mitra_id,
            'sobat_id'     => $item->mitra->sobat_id     ?? '-',
            'nama_lengkap' => $item->mitra->nama_lengkap ?? 'Mitra',
            'kuota_target' => $item->kuota_target,
        ]);

        return [
            'prev_bulan_nama' => $namaBulanList[$bulan] ?? '',
            'prev_tahun'      => $tahun,
            'data'            => $data,
        ];
    }
}
