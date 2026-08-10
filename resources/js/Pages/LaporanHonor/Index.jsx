import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    FileSpreadsheet, 
    FileText, 
    Users, 
    CreditCard, 
    Wallet, 
    TrendingUp, 
    ClipboardList,
    ClipboardCheck,
    Filter, 
    Search,
    RefreshCw,
    CalendarDays
} from 'lucide-react';

const Index = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    return (
        <>
            <Head title="Laporan Detail Honor Mitra" />

            <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-simitra-orange to-purple-600 rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Detail Honor Mitra</h1>
                        <p className="text-sm text-orange-100 mt-1">Informasi lengkap honorarium yang diterima setiap mitra</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
                            <FileSpreadsheet size={16} /> Export Excel
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
                            <FileText size={16} /> Cetak PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4">
                    {/* Top Row Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-orange-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">2</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Mitra</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">2</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Transaksi</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-blue-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp 5.1M</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Honor</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-yellow-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp 2,550K</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Rata-rata</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-orange-400 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp 0</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Honor Pendataan</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-cyan-400 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 dark:text-cyan-400 rounded-lg">
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp 5.100.000</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Honor Pengolahan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Data */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                        <h2 className="text-[#D9531E] font-bold flex items-center gap-2">
                            <Filter size={18} /> Filter Data
                        </h2>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="text-orange-500 dark:text-orange-400 text-xs font-semibold px-3 py-1 border border-orange-200 dark:border-orange-900/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition"
                        >
                            Toggle
                        </button>
                    </div>

                    {isFilterOpen && (
                        <div className="space-y-6 pt-2">
                            {/* Periode Pelaksanaan */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarDays size={18} className="text-[#D9531E]" /> PERIODE PELAKSANAAN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan Kegiatan</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Bulan</option>
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
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun Kegiatan</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Tahun</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                                        <input type="date" className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                                        <input type="date" className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]" />
                                    </div>
                                </div>
                            </div>

                            {/* Periode Pembayaran */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Wallet size={18} className="text-[#D9531E]" /> PERIODE PEMBAYARAN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan Bayar</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Bulan</option>
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
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun Bayar</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Tahun</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status Pembayaran</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Status</option>
                                            <option value="sudah_dibayar">Sudah Dibayar</option>
                                            <option value="belum_dibayar">Belum Dibayar</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Mitra & Kegiatan */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Users size={18} className="text-[#D9531E]" /> MITRA & KEGIATAN
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Mitra</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua Mitra</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis SBML</label>
                                        <select className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Jenis</option>
                                            <option value="pendataan">Pendataan</option>
                                            <option value="pengolahan">Pengolahan</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-6 flex items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cari Kegiatan</label>
                                            <div className="flex">
                                                <input 
                                                    type="text" 
                                                    placeholder="Ketik nama kegiatan..."
                                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]"
                                                />
                                                <button className="px-4 py-2 bg-[#D9531E] text-white rounded-r-lg hover:bg-orange-600 transition flex items-center">
                                                    <Search size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                <span className="text-xs text-gray-400 dark:text-gray-500">0 filter aktif</span>
                                <button className="px-4 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1.5">
                                    <RefreshCw size={14} /> Reset Semua Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Data (Dummy) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            Show
                            <select className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded pr-8 py-1 text-sm focus:ring-[#D9531E] focus:border-[#D9531E]">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="all">All</option>
                            </select>
                            entries
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            Search:
                            <input type="text" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-[#D9531E] focus:border-[#D9531E]" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4 font-bold">NO</th>
                                    <th className="px-6 py-4 font-bold">NAMA MITRA</th>
                                    <th className="px-6 py-4 font-bold">PERIODE</th>
                                    <th className="px-6 py-4 font-bold">JENIS KEGIATAN</th>
                                    <th className="px-6 py-4 font-bold text-center">JML TRANSAKSI</th>
                                    <th className="px-6 py-4 font-bold text-right">TOTAL PENCAIRAN</th>
                                    <th className="px-6 py-4 font-bold text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 dark:text-gray-300">1</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">Budi Santoso</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Mei 2026</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white bg-[#3dbcc9]">Pengolahan</span>
                                    </td>
                                    <td className="px-6 py-4 text-center dark:text-gray-300">1</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white text-right">Rp 2.700.000</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('laporan-honor.show', 1)} className="px-3 py-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-500/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center mx-auto gap-1 w-max">
                                            <Search size={14} /> Detail
                                        </Link>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition border-b border-gray-50 dark:border-gray-700">
                                    <td className="px-6 py-4 dark:text-gray-300">2</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">Xander Halim</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Mei 2026</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white bg-[#3dbcc9]">Pengolahan</span>
                                    </td>
                                    <td className="px-6 py-4 text-center dark:text-gray-300">1</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white text-right">Rp 2.400.000</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('laporan-honor.show', 2)} className="px-3 py-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-500/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center mx-auto gap-1 w-max">
                                            <Search size={14} /> Detail
                                        </Link>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition border-b border-gray-50 dark:border-gray-700">
                                    <td className="px-6 py-4 dark:text-gray-300">3</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">Dewi Sartika</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Mei 2026</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white bg-[#F26522]">Pendataan</span>
                                    </td>
                                    <td className="px-6 py-4 text-center dark:text-gray-300">3</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white text-right">Rp 3.500.000</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('laporan-honor.show', 3)} className="px-3 py-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-500/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center mx-auto gap-1 w-max">
                                            <Search size={14} /> Detail
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan 1 ke 3 dari 3 data
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto">
                            <button disabled className="px-3 py-1 rounded-md text-sm whitespace-nowrap bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 opacity-50 cursor-not-allowed">&laquo; Previous</button>
                            <button className="px-3 py-1 rounded-md text-sm whitespace-nowrap bg-[#F26522] text-white font-semibold shadow-sm">1</button>
                            <button className="px-3 py-1 rounded-md text-sm whitespace-nowrap bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
                            <button className="px-3 py-1 rounded-md text-sm whitespace-nowrap bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
                            <button className="px-3 py-1 rounded-md text-sm whitespace-nowrap bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Next &raquo;</button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

Index.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Laporan Detail Honor Mitra">
        {page}
    </AuthenticatedLayout>
);

export default Index;
