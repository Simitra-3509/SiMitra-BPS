import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ArrowLeft, ShieldAlert, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';

const Create = () => {
    return (
        <>
            <Head title="Input Honorarium" />

            <div className="space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Input Honorarium</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Catat pembayaran honor mitra</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Panel: Form */}
                    <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <form className="space-y-6">
                            
                            {/* Penugasan */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Penugasan (Kegiatan - Mitra) <span className="text-red-500">*</span>
                                </label>
                                <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition">
                                    <option value="">-- Pilih Penugasan --</option>
                                    {/* Opsi dari database */}
                                </select>
                            </div>

                            {/* Volume & Harga Satuan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Volume <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <input 
                                            type="number" 
                                            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition" 
                                        />
                                        <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                            Satuan
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Harga Satuan</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                            Rp
                                        </span>
                                        <input 
                                            type="text" 
                                            value="0" 
                                            readOnly 
                                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-0" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tanggal Mulai & Selesai */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                                        Tanggal Mulai Kegiatan
                                    </label>
                                    <input 
                                        type="date" 
                                        readOnly
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-0 transition" 
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Otomatis dari data kegiatan</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                                        Tanggal Selesai Kegiatan
                                    </label>
                                    <input 
                                        type="date" 
                                        readOnly
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-0 transition" 
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Otomatis dari data kegiatan</p>
                                </div>
                            </div>

                            {/* Total Honor */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Honor (Kalkulasi Otomatis)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                        Rp
                                    </span>
                                    <input 
                                        type="text" 
                                        value="0" 
                                        readOnly 
                                        className="w-full px-3.5 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-0" 
                                    />
                                </div>
                            </div>

                            {/* Tanggal, Bulan, Tahun */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                                        Tanggal Input <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        defaultValue="2026-07-08"
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Bulan Bayar <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        defaultValue="8"
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition"
                                    >
                                        <option value="1">Januari</option>
                                        <option value="2">Februari</option>
                                        <option value="3">Maret</option>
                                        <option value="4">April</option>
                                        <option value="5">Mei</option>
                                        <option value="6">Juni</option>
                                        <option value="7">Juli</option>
                                        <option value="8">Agustus</option>
                                        <option value="9">September</option>
                                        <option value="10">Oktober</option>
                                        <option value="11">November</option>
                                        <option value="12">Desember</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Tahun Bayar <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        defaultValue="2026"
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                    </select>
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Keterangan</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Keterangan tambahan (opsional)"
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition"
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                                <Link
                                    href={route('honorarium.index')}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Kembali
                                </Link>
                                <button
                                    type="button"
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-[#c24617] transition flex items-center gap-2 shadow-sm"
                                >
                                    <CheckCircle size={18} /> Simpan Honor
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Panel: Validasi Info */}
                    <div className="lg:col-span-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-[#D9531E] p-4 flex items-center gap-2 text-white font-semibold">
                            <ShieldAlert size={20} /> Validasi SBML Real-Time
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 space-y-4">
                            <div className="bg-[#fff9e6] border border-[#fde08b] text-[#8a6d3b] p-4 rounded-lg flex items-start gap-3">
                                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm font-medium leading-relaxed">
                                    Sistem akan memvalidasi apakah honor yang diinput melebihi batas SBML mitra.
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-1">
                                Pilih penugasan dan isi volume untuk melihat kuota secara real-time.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

Create.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Input Honorarium">
        {page}
    </AuthenticatedLayout>
);

export default Create;
