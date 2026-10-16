<?php

namespace App\Http\Controllers;

use App\Models\KonfigurasiAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class KonfigurasiAnggaranController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('role:admin,administrator', only: ['index', 'create', 'store', 'edit', 'update', 'destroy']),
        ];
    }

    public function index(Request $request)
    {
        $configs = KonfigurasiAnggaran::orderByDesc('tahun_anggaran')->paginate(10);

        return Inertia::render('KonfigurasiAnggaran/Index', [
            'configs' => $configs,
        ]);
    }

    public function create()
    {
        return Inertia::render('KonfigurasiAnggaran/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun_anggaran' => 'required|integer|min:2000|max:2100|unique:konfigurasi_anggaran,tahun_anggaran',
            'kode_program' => 'required|string|regex:/^\d{3}\.\d{2}\.[A-Z]{2}$/',
            'kode_akun' => 'required|string|regex:/^\d{6}$/',
            'komponen_default' => 'required|string|regex:/^\d{3}$/',
            'subkomponen_default' => 'required|string|regex:/^[A-Z]$/',
            'regex_pattern' => 'nullable|string',
        ]);

        KonfigurasiAnggaran::create($request->all());

        return redirect()->route('konfigurasi-anggaran.index')->with('success', 'Konfigurasi anggaran berhasil ditambahkan.');
    }

    public function edit(KonfigurasiAnggaran $konfigurasiAnggaran)
    {
        return Inertia::render('KonfigurasiAnggaran/Edit', [
            'config' => $konfigurasiAnggaran,
        ]);
    }

    public function update(Request $request, KonfigurasiAnggaran $konfigurasiAnggaran)
    {
        $request->validate([
            'kode_program' => 'required|string|regex:/^\d{3}\.\d{2}\.[A-Z]{2}$/',
            'kode_akun' => 'required|string|regex:/^\d{6}$/',
            'komponen_default' => 'required|string|regex:/^\d{3}$/',
            'subkomponen_default' => 'required|string|regex:/^[A-Z]$/',
            'regex_pattern' => 'nullable|string',
        ]);

        $konfigurasiAnggaran->update($request->all());

        return redirect()->route('konfigurasi-anggaran.index')->with('success', 'Konfigurasi anggaran berhasil diperbarui.');
    }

    public function destroy(KonfigurasiAnggaran $konfigurasiAnggaran)
    {
        $konfigurasiAnggaran->delete();

        return redirect()->route('konfigurasi-anggaran.index')->with('success', 'Konfigurasi anggaran berhasil dihapus.');
    }
}
