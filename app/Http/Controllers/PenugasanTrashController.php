<?php

namespace App\Http\Controllers;

use App\Models\Penugasan;
use App\Models\PeriodePengisian;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PenugasanTrashController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role:operator,ppk,admin,administrator'),
        ];
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = Penugasan::onlyTrashed()->with(['kegiatan', 'detilKegiatan', 'mitra']);

        if ($request->filled('search')) {
            $query->whereHas('mitra', function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('sobat_id', 'like', '%' . $request->search . '%');
            });
        }

        $penugasans = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Penugasan/RecycleBin', [
            'penugasans' => $penugasans,
            'filters'    => $request->only(['search']),
        ]);
    }

    /**
     * Restore satu penugasan dari Recycle Bin.
     */
    public function restore($id)
    {
        $userRole  = strtolower(auth()->user()->role ?? '');
        $penugasan = Penugasan::onlyTrashed()->with('mitra')->findOrFail($id);

        $bulanNum = (int) $penugasan->bulan;
        $tahunNum = (int) $penugasan->tahun;
        $periode  = PeriodePengisian::where('bulan', $bulanNum)->where('tahun', $tahunNum)->first();

        if ($periode && $periode->status === 'terkunci' && $userRole !== 'ppk') {
            return redirect()->back()->withErrors([
                'restore' => "Periode {$bulanNum}/{$tahunNum} sudah dikunci oleh PPK. Penugasan tidak dapat dipulihkan.",
            ]);
        }

        $activeExists = Penugasan::where('detil_kegiatan_id', $penugasan->detil_kegiatan_id)
            ->where('mitra_id', $penugasan->mitra_id)
            ->where('bulan', $penugasan->bulan)
            ->where('tahun', $penugasan->tahun)
            ->exists();

        if ($activeExists) {
            $namaMitra = $penugasan->mitra->nama_lengkap ?? 'Mitra';
            return redirect()->back()->withErrors([
                'restore' => "Penugasan untuk {$namaMitra} periode {$penugasan->bulan}/{$penugasan->tahun} tidak dapat dipulihkan karena sudah ada data penugasan aktif yang sama.",
            ]);
        }

        $penugasan->restore();

        return redirect()->back()->with('success', 'Penugasan mitra berhasil dipulihkan dari Recycle Bin.');
    }

    /**
     * Hard delete satu penugasan dari Recycle Bin.
     */
    public function forceDelete($id)
    {
        $penugasan = Penugasan::onlyTrashed()->findOrFail($id);
        $penugasan->forceDelete();

        return redirect()->back()->with('success', 'Penugasan mitra telah dihapus secara permanen.');
    }

    /**
     * Restore banyak penugasan sekaligus dari Recycle Bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id',
        ]);

        $trashed       = Penugasan::onlyTrashed()->with('mitra')->whereIn('id', $request->ids)->get();
        $restoredCount = 0;
        $skipped       = [];

        foreach ($trashed as $p) {
            $activeExists = Penugasan::where('detil_kegiatan_id', $p->detil_kegiatan_id)
                ->where('mitra_id', $p->mitra_id)
                ->where('bulan', $p->bulan)
                ->where('tahun', $p->tahun)
                ->exists();

            if ($activeExists) {
                $skipped[] = $p->mitra->nama_lengkap ?? "ID: {$p->mitra_id}";
            } else {
                $p->restore();
                $restoredCount++;
            }
        }

        if (count($skipped) > 0) {
            $skippedNames = implode(', ', array_unique($skipped));
            return redirect()->back()->with(
                'warning',
                "{$restoredCount} penugasan berhasil dipulihkan. Penugasan untuk ({$skippedNames}) dilewati karena sudah ada data aktif yang sama."
            );
        }

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra berhasil dipulihkan.');
    }

    /**
     * Hard delete banyak penugasan sekaligus dari Recycle Bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:penugasans,id',
        ]);

        Penugasan::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' penugasan mitra telah dihapus secara permanen.');
    }
}
