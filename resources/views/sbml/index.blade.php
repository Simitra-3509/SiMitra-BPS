@extends('layouts.app')

@section('title', 'Pengaturan SBML')

@section('content')
<div class="container-fluid px-4 py-3">
    <!-- Header Halaman -->
    <div class="mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Pengaturan SBML</h2>
        <p class="text-sm text-gray-500">Konfigurasi batas maksimal honor mitra per bulan</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card Utama: Konfigurasi Batas SBML -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Header Card -->
            <div class="bg-[#D9531E] px-4 py-3 text-white font-medium flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Konfigurasi Batas SBML</span>
            </div>

            <div class="p-6">
                <!-- Banner Mode Lihat Saja (Khusus Non-Admin / Operator) -->
                @if(auth()->user()->role !== 'admin')
                <div class="bg-[#E0F7FA] text-[#00838F] p-4 rounded-md mb-6 flex items-center gap-2 border border-[#B2EBF2]">
                    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm"><strong>Mode Lihat Saja</strong> - Hanya Administrator yang dapat mengubah pengaturan SBML.</span>
                </div>
                @endif

                <form action="{{ route('sbml.update') }}" method="POST">
                    @csrf
                    @method('PUT')

                    <!-- Input Batas SBML Pendataan -->
                    <div class="mb-5">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Batas SBML Pendataan</label>
                        <div class="flex rounded-md shadow-sm">
                            <span class="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                Rp
                            </span>
                            <input type="text" name="batas_pendataan" 
                                value="{{ number_format($sbml->batas_pendataan ?? 3085000, 0, ',', '.') }}" 
                                class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-50 text-gray-700 focus:ring-orange-500 focus:border-orange-500 text-base" 
                                {{ auth()->user()->role !== 'admin' ? 'disabled' : '' }}>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Batas maksimal honor mitra untuk kegiatan Pendataan per bulan</p>
                    </div>

                    <!-- Input Batas SBML Pengolahan -->
                    <div class="mb-5">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Batas SBML Pengolahan</label>
                        <div class="flex rounded-md shadow-sm">
                            <span class="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                Rp
                            </span>
                            <input type="text" name="batas_pengolahan" 
                                value="{{ number_format($sbml->batas_pengolahan ?? 2854000, 0, ',', '.') }}" 
                                class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-50 text-gray-700 focus:ring-orange-500 focus:border-orange-500 text-base" 
                                {{ auth()->user()->role !== 'admin' ? 'disabled' : '' }}>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Batas maksimal honor mitra untuk kegiatan Pengolahan per bulan</p>
                    </div>

                    <!-- Tombol Simpan (Hanya muncul untuk Admin) -->
                    @if(auth()->user()->role === 'admin')
                    <div class="mt-6 flex justify-end">
                        <button type="submit" class="bg-[#D9531E] hover:bg-orange-700 text-white font-medium px-5 py-2 rounded-md shadow-sm text-sm">
                            Simpan Perubahan
                        </button>
                    </div>
                    @endif
                </form>
            </div>
        </div>

        <!-- Card Samping: Informasi SBML -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit">
            <div class="flex items-center gap-2 mb-4 text-gray-700">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="font-semibold text-gray-800">Informasi</h3>
            </div>

            <div class="border-t border-gray-100 pt-3">
                <h4 class="text-sm font-bold text-[#D9531E] mb-1">Apa itu SBML?</h4>
                <p class="text-xs text-gray-600 leading-relaxed mb-4">
                    SBML (Standar Biaya Masukan Lainnya) adalah batas maksimal honor yang dapat diberikan kepada mitra dalam satu bulan berdasarkan jenis kegiatan.
                </p>

                <h4 class="text-sm font-bold text-[#D9531E] mb-1">Jenis Kegiatan</h4>
                <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li><strong class="text-gray-700">Pendataan:</strong> Kegiatan pengumpulan data di lapangan</li>
                    <li><strong class="text-gray-700">Pengolahan:</strong> Kegiatan pengolahan/entri data di kantor</li>
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection