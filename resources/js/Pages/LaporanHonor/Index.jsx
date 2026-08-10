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
                        <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <FileSpreadsheet size={16} /> Export Excel
                        </button>
                        <button className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <FileText size={16} /> Cetak PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4">
                    {/* Top Row Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-orange-100 text-orange-500 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">2</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Total Mitra</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">2</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Total Transaksi</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-500 rounded-lg">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Rp 5.1M</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Total Honor</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Rp 2,550K</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Rata-rata</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-orange-100 text-orange-500 rounded-lg">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Rp 0</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Total Honor Pendataan</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border-l-4 border-cyan-400 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-cyan-100 text-cyan-500 rounded-lg">
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Rp 5.100.000</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">Total Honor Pengolahan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h2 className="text-[#D9531E] font-bold flex items-center gap-2">
                            <Filter size={18} /> Filter Data
                        </h2>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="text-orange-500 text-xs font-semibold px-3 py-1 border border-orange-200 rounded-md hover:bg-orange-50 transition"
                        >
                            Toggle
                        </button>
                    </div>

                    {isFilterOpen && (
                        <div className="space-y-6 pt-2">
                            {/* Periode Pelaksanaan */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarDays size={18} className="text-[#D9531E]" /> PERIODE PELAKSANAAN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bulan Kegiatan</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Kegiatan</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                        <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] text-gray-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                                        <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Periode Pembayaran */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Wallet size={18} className="text-[#D9531E]" /> PERIODE PEMBAYARAN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bulan Bayar</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Bayar</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Mitra & Kegiatan */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Users size={18} className="text-[#D9531E]" /> MITRA & KEGIATAN
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Nama Mitra</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua Mitra</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Jenis SBML</label>
                                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option>Semua Jenis</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-6 flex items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Cari Kegiatan</label>
                                            <div className="flex">
                                                <input 
                                                    type="text" 
                                                    placeholder="Ketik nama kegiatan..."
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]"
                                                />
                                                <button className="px-4 py-2 bg-[#D9531E] text-white rounded-r-lg hover:bg-orange-600 transition flex items-center">
                                                    <Search size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                                <span className="text-xs text-gray-400">0 filter aktif</span>
                                <button className="px-4 py-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center gap-1.5">
                                    <RefreshCw size={14} /> Reset Semua Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Data (Dummy) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            Show
                            <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-[#D9531E] focus:border-[#D9531E]">
                                <option>50</option>
                            </select>
                            entries
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            Search:
                            <input type="text" className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-[#D9531E] focus:border-[#D9531E]" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
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
                                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">1</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">Budi Santoso</td>
                                    <td className="px-6 py-4 text-gray-500">Mei 2026</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">Pengolahan</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">1</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 text-right">Rp 2.700.000</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="px-3 py-1.5 text-xs font-semibold text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center justify-center mx-auto gap-1">
                                            <Search size={14} /> Detail
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">2</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">Xander Halim</td>
                                    <td className="px-6 py-4 text-gray-500">Mei 2026</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">Pengolahan</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">1</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 text-right">Rp 2.400.000</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="px-3 py-1.5 text-xs font-semibold text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center justify-center mx-auto gap-1">
                                            <Search size={14} /> Detail
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
