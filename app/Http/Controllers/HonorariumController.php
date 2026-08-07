<?php

namespace App\Http\Controllers;

use App\Models\Honorarium;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HonorariumController extends Controller
{
    /**
     * Tampilkan daftar honorarium.
     */
    public function index(Request $request)
    {
        $query = Honorarium::query();

        // TODO: Implementasi filter berdasarkan Jenis SBML, Kegiatan, dan search text

        $honorarium = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Honorarium/Index', [
            'honorarium' => $honorarium,
            'filters'    => $request->only(['jenis_sbml', 'kegiatan_id', 'cari']),
        ]);
    }

    /**
     * Tampilkan form tambah honorarium.
     */
    public function create()
    {
        return Inertia::render('Honorarium/Create');
    }
}