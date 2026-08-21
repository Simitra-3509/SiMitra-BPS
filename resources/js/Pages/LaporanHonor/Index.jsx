import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
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

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};

const getBulanName = (m) => {
    const list = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return m ? list[m - 1] : '-';
};

const Index = ({ data, summary, filters, mitraList }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    const [dataFilter, setDataFilter] = useState({
        bulan_kegiatan: filters?.bulan_kegiatan || '',
        tahun_kegiatan: filters?.tahun_kegiatan || '',
        tanggal_mulai: filters?.tanggal_mulai || '',
        tanggal_selesai: filters?.tanggal_selesai || '',
        bulan_bayar: filters?.bulan_bayar || '',
        tahun_bayar: filters?.tahun_bayar || '',
        status_pembayaran: filters?.status_pembayaran || '',
        mitra_id: filters?.mitra_id || '',
        jenis_sbml: filters?.jenis_sbml || '',
        cari: filters?.cari || '',
        per_page: filters?.per_page || 10
    });

    const handleFilterChange = (field, value) => {
        setDataFilter(prev => ({ ...prev, [field]: value }));
    };

    const applyFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('laporan-honor.index'), dataFilter, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        const emptyFilter = {
            bulan_kegiatan: '', tahun_kegiatan: '', tanggal_mulai: '', tanggal_selesai: '',
            bulan_bayar: '', tahun_bayar: '', status_pembayaran: '',
            mitra_id: '', jenis_sbml: '', cari: '', per_page: 10
        };
        setDataFilter(emptyFilter);
        router.get(route('laporan-honor.index'), emptyFilter, { preserveState: true, replace: true });
    };

    const activeFiltersCount = Object.keys(dataFilter).filter(k => k !== 'per_page' && dataFilter[k] !== '').length;

    const exportExcel = () => {
        const queryParams = new URLSearchParams();
        Object.entries(dataFilter).forEach(([key, value]) => {
            if (value !== '' && value !== null && key !== 'per_page' && key !== 'cari') {
                queryParams.append(key, value);
            }
        });
        if (dataFilter.cari) queryParams.append('cari', dataFilter.cari);
        
        window.location.href = `${route('laporan-honor.export')}?${queryParams.toString()}`;
    };

    return (
        <>
            <Head title="Laporan Detail Honor Mitra" />

            <div className="space-y-6">
                
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Detail Honor Mitra</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi lengkap honorarium yang diterima setiap mitra</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={exportExcel}
                            className="px-4 py-2 bg-[#00AA55] hover:bg-[#008844] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-md cursor-pointer"
                        >
                            <FileSpreadsheet size={18} /> Export Excel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-[#0080FF] hover:bg-[#0066CC] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-md cursor-pointer"
                        >
                            <FileText size={18} /> Cetak PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4">
                    {/* Top Row Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.total_mitra || 0}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Mitra</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.total_transaksi || 0}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Transaksi</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{formatRupiah(summary.total_honor)}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Honor</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-yellow-500 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{formatRupiah(summary.rata_rata)}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Rata-rata / Mitra</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatRupiah(summary.total_honor_pendataan)}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">Total Honor Pendataan</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-cyan-400 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 dark:text-cyan-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatRupiah(summary.total_honor_pengolahan)}</h3>
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
                            {isFilterOpen ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                    </div>

                    {isFilterOpen && (
                        <form onSubmit={applyFilter} className="space-y-6 pt-2">
                            {/* Periode Pelaksanaan */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarDays size={18} className="text-[#D9531E]" /> PERIODE PELAKSANAAN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan Kegiatan</label>
                                        <select value={dataFilter.bulan_kegiatan} onChange={e => handleFilterChange('bulan_kegiatan', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
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
                                        <select value={dataFilter.tahun_kegiatan} onChange={e => handleFilterChange('tahun_kegiatan', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Tahun</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                                        <input type="date" value={dataFilter.tanggal_mulai} onChange={e => handleFilterChange('tanggal_mulai', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                                        <input type="date" value={dataFilter.tanggal_selesai} onChange={e => handleFilterChange('tanggal_selesai', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]" />
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
                                        <select value={dataFilter.bulan_bayar} onChange={e => handleFilterChange('bulan_bayar', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
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
                                        <select value={dataFilter.tahun_bayar} onChange={e => handleFilterChange('tahun_bayar', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Tahun</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status Pembayaran</label>
                                        <select value={dataFilter.status_pembayaran} onChange={e => handleFilterChange('status_pembayaran', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
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
                                        <select value={dataFilter.mitra_id} onChange={e => handleFilterChange('mitra_id', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
                                            <option value="">Semua Mitra</option>
                                            {mitraList && mitraList.map(m => (
                                                <option key={m.id} value={m.id}>{m.nama_lengkap}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis SBML</label>
                                        <select value={dataFilter.jenis_sbml} onChange={e => handleFilterChange('jenis_sbml', e.target.value)} className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]">
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
                                                    value={dataFilter.cari}
                                                    onChange={e => handleFilterChange('cari', e.target.value)}
                                                    placeholder="Ketik nama kegiatan..."
                                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E]"
                                                />
                                                <button type="submit" className="px-4 py-2 bg-[#D9531E] text-white rounded-r-lg hover:bg-orange-600 transition flex items-center">
                                                    <Search size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                <span className="text-xs text-gray-400 dark:text-gray-500">{activeFiltersCount} filter aktif</span>
                                <button type="button" onClick={resetFilter} className="px-4 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1.5">
                                    <RefreshCw size={14} /> Reset Semua Filter
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            Show
                            <select 
                                value={dataFilter.per_page}
                                onChange={e => {
                                    handleFilterChange('per_page', e.target.value);
                                    setTimeout(() => applyFilter(), 100);
                                }}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded pr-8 py-1 text-sm focus:ring-[#D9531E] focus:border-[#D9531E]"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="all">All</option>
                            </select>
                            entries
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4 font-bold">NO</th>
                                    <th className="px-6 py-4 font-bold">NAMA MITRA</th>
                                    <th className="px-6 py-4 font-bold">PERIODE</th>
                                    <th className="px-6 py-4 font-bold text-center">JENIS SBML</th>
                                    <th className="px-6 py-4 font-bold text-center">JML TRANSAKSI</th>
                                    <th className="px-6 py-4 font-bold text-right">TOTAL PENCAIRAN</th>
                                    <th className="px-6 py-4 font-bold text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.length > 0 ? (
                                    data.data.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 dark:text-gray-300">{(data.current_page - 1) * (data.per_page === 'all' ? data.total : data.per_page) + i + 1}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{item.nama_mitra}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{getBulanName(item.bulan)} {item.tahun}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white ${item.jenis_sbml === 'pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                                    {item.jenis_sbml || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center dark:text-gray-300">{item.jml_transaksi}</td>
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-white text-right">{formatRupiah(item.total_pencairan)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Link href={route('laporan-honor.show', item.mitra_id)} className="px-3 py-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-500/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center mx-auto gap-1 w-max">
                                                    <Search size={14} /> Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data honorarium yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {data.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {data.from || 0} ke {data.to || 0} dari {data.total} data
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {data.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${link.active ? 'bg-[#F26522] text-white font-semibold shadow-sm' : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
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
