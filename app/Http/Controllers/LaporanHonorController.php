<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanHonorController extends Controller
{
    /**
     * Tampilkan halaman laporan honor.
     */
    public function index(Request $request)
    {
        return Inertia::render('LaporanHonor/Index');
    }
}
