import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Users, CheckCircle, AlertTriangle, XCircle, FileSpreadsheet, Search, Gauge } from 'lucide-react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

const getBulanList = () => {
    return [
        { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maret' },
        { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
        { id: 7, name: 'Juli' }, { id: 8, name: 'Agustus' }, { id: 9, name: 'September' },
        { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'Desember' },
    ];
};

export default function Index({ 
    data = { data: [], from: 0, to: 0, total: 0, current_page: 1, last_page: 1, links: [] }, 
    filters = {}, 
    stats = { total: 0, normal: 0, warning: 0, kritis: 0 }, 
    batas = { pendataan: 3085000, pengolahan: 2854000 } 
}) {
    const [bulan, setBulan] = useState(filters?.bulan || new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(filters?.tahun || new Date().getFullYear());
    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || 'semua');
    const [status, setStatus] = useState(filters?.status || 'semua');
    const [threshold, setThreshold] = useState(filters?.threshold || 80);
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [cari, setCari] = useState(filters?.cari || '');

    const applyFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('monitoring-kuota.index'),
            { bulan, tahun, jenis_sbml: jenisSbml, status, threshold, per_page: perPage, cari },
            { preserveState: true, replace: true }
        );
    };

    const exportExcel = () => {
        const queryParams = new URLSearchParams();
        const activeFilters = { bulan, tahun, jenis_sbml: jenisSbml, status, threshold, cari };
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null) {
                queryParams.append(key, value);
            }
        });
        window.location.href = `${route('monitoring-kuota.export')}?${queryParams.toString()}`;
    };

    const StatusBadge = ({ type }) => {
        if (type === 'OK') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">OK</span>;
        if (type === 'Warning') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Warning</span>;
        if (type === 'Kritis') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Kritis</span>;
        return null;
    };

    const getBulanName = (m) => {
        const bln = getBulanList().find(b => b.id == m);
        return bln ? bln.name : '';
    };

    return (
        <AuthenticatedLayout header="Monitoring Kuota SBML">
            <Head title="Monitoring Kuota SBML" />

            <div className="space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Gauge className="text-gray-500 dark:text-gray-400" />
                            Monitoring Kuota SBML
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dashboard real-time penggunaan kuota mitra per bulan</p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={exportExcel}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#00AA55] hover:bg-[#008844] rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer"
                        >
                            <FileSpreadsheet size={18} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-gray-300 dark:border-l-gray-600 border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 flex justify-between items-center group cursor-pointer">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Mitra</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
                        </div>
                        <Users size={28} className="text-[#F26522] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-emerald-500 border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 flex justify-between items-center group cursor-pointer">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Kuota Normal</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.normal}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-all duration-300">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-amber-400 border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 flex justify-between items-center group cursor-pointer">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Peringatan (&gt;{threshold}%)</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.warning}</h3>
                        </div>
                        <div className="h-10 w-10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-red-500 border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 flex justify-between items-center group cursor-pointer">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Kritis (100%)</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.kritis}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-red-500 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-all duration-300">
                            <XCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <form className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 items-end" onSubmit={applyFilter}>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-2 px-3"
                            >
                                <option value="semua">Semua Bulan</option>
                                {getBulanList().map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun</label>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-2 px-3"
                            >
                                <option value="semua">Semua Tahun</option>
                                {[2024, 2025, 2026, 2027].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis SBML</label>
                            <select
                                value={jenisSbml}
                                onChange={(e) => setJenisSbml(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-2 px-3"
                            >
                                <option value="semua">Semua</option>
                                <option value="pendataan">Pendataan</option>
                                <option value="pengolahan">Pengolahan</option>
                            </select>
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-2 px-3"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="ok">OK</option>
                                <option value="warning">Warning</option>
                                <option value="kritis">Kritis</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold Alert (%)</label>
                            <select
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-2 px-3"
                            >
                                <option value={80}>80% (Default)</option>
                                <option value={90}>90%</option>
                                <option value={95}>95%</option>
                            </select>
                        </div>
                        
                        {/* Submit button is necessary to trigger filtering when select changes if we don't use useEffect, but we'll use a small button */}
                        <div className="col-span-12 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#F26522] text-white text-sm font-semibold rounded-md hover:bg-[#d9531e] transition-colors"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Detail Kuota per Mitra</h2>
                        </div>
                        <div className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            Periode: {getBulanName(bulan)} {tahun}
                        </div>
                    </div>
                    
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Show</span>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(e.target.value);
                                    setTimeout(() => applyFilter(), 100);
                                }}
                                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md py-1 pl-2 pr-8 text-sm focus:border-[#F26522] focus:ring-[#F26522]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span>entries</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={14} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari nama/NIK mitra..."
                                    value={cari}
                                    onChange={(e) => setCari(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') applyFilter(); }}
                                    className="w-full sm:w-64 pl-9 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#F26522] focus:ring-[#F26522] rounded-md shadow-sm text-sm py-1.5"
                                />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                Menampilkan {data.from || 0}-{data.to || 0} dari {data.total} mitra
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-12 text-center">NO</th>
                                    <th className="p-4">MITRA</th>
                                    <th className="p-4">NIK</th>
                                    <th className="p-4 text-center">JENIS SBML</th>
                                    <th className="p-4 text-right">BATAS PAGU</th>
                                    <th className="p-4 text-right">TERPAKAI</th>
                                    <th className="p-4 text-right">SISA KUOTA</th>
                                    <th className="p-4 text-center">USAGE %</th>
                                    <th className="p-4 text-center">STATUS</th>
                                    <th className="p-4 text-center">TRANSAKSI</th>
                                    <th className="p-4 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                {data.data.length > 0 ? (
                                    data.data.map((item, index) => {
                                        const showPendataan = jenisSbml === 'semua' || jenisSbml === 'pendataan';
                                        const showPengolahan = jenisSbml === 'semua' || jenisSbml === 'pengolahan';
                                        const totalRows = (showPendataan ? 1 : 0) + (showPengolahan ? 1 : 0);
                                        
                                        return (
                                        <React.Fragment key={item.id}>
                                            {showPendataan && (
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <td className="p-4 text-center font-bold align-top" rowSpan={totalRows}>
                                                    {(data.current_page - 1) * perPage + index + 1}
                                                </td>
                                                <td className="p-4 font-bold text-gray-900 dark:text-white align-top" rowSpan={totalRows}>{item.nama_lengkap}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 align-top" rowSpan={totalRows}>{item.nik}</td>
                                                
                                                <td className="p-4 text-center">
                                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded text-white bg-[#F26522] uppercase tracking-wide">PENDATAAN</span>
                                                </td>
                                                <td className="p-4 text-right font-semibold">{formatRupiah(batas.pendataan)}</td>
                                                <td className="p-4 text-right font-semibold text-orange-500">{formatRupiah(item.terpakai_pendataan)}</td>
                                                <td className="p-4 text-right font-semibold">{formatRupiah(item.sisa_pendataan)}</td>
                                                <td className="p-4 text-center">
                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 max-w-[100px] mx-auto">
                                                        <div className={`h-2.5 rounded-full ${item.status_pendataan === 'Kritis' ? 'bg-red-500' : (item.status_pendataan === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500')}`} style={{ width: `${Math.min(item.usage_pendataan, 100)}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <StatusBadge type={item.status_pendataan} />
                                                </td>
                                                <td className="p-4 text-center font-semibold">{item.transaksi_pendataan}</td>
                                                <td className="p-4 text-center align-middle" rowSpan={totalRows}>
                                                    <Link
                                                        href={route('monitoring-kuota.show', {id: item.id, bulan: bulan, tahun: tahun})}
                                                        className="px-3 py-1.5 text-xs font-semibold text-[#D9531E] border border-[#D9531E] dark:border-orange-500 dark:text-orange-400 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center gap-1 mx-auto w-max"
                                                    >
                                                        <Search size={14} /> Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                            )}
                                            {showPengolahan && (
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-t-0">
                                                {/* Only render rowSpan cells if this is the first visible row for this mitra (i.e. pendataan was hidden) */}
                                                {!showPendataan && (
                                                    <>
                                                    <td className="p-4 text-center font-bold align-top" rowSpan={totalRows}>
                                                        {(data.current_page - 1) * perPage + index + 1}
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-900 dark:text-white align-top" rowSpan={totalRows}>{item.nama_lengkap}</td>
                                                    <td className="p-4 text-gray-500 dark:text-gray-400 align-top" rowSpan={totalRows}>{item.nik}</td>
                                                    </>
                                                )}
                                                <td className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
                                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded text-white bg-[#3dbcc9] uppercase tracking-wide">PENGOLAHAN</span>
                                                </td>
                                                <td className="p-4 text-right font-semibold border-t border-gray-100 dark:border-gray-700">{formatRupiah(batas.pengolahan)}</td>
                                                <td className="p-4 text-right font-semibold text-orange-500 border-t border-gray-100 dark:border-gray-700">{formatRupiah(item.terpakai_pengolahan)}</td>
                                                <td className="p-4 text-right font-semibold border-t border-gray-100 dark:border-gray-700">{formatRupiah(item.sisa_pengolahan)}</td>
                                                <td className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 max-w-[100px] mx-auto">
                                                        <div className={`h-2.5 rounded-full ${item.status_pengolahan === 'Kritis' ? 'bg-red-500' : (item.status_pengolahan === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500')}`} style={{ width: `${Math.min(item.usage_pengolahan, 100)}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
                                                    <StatusBadge type={item.status_pengolahan} />
                                                </td>
                                                <td className="p-4 text-center font-semibold border-t border-gray-100 dark:border-gray-700">{item.transaksi_pengolahan}</td>
                                                {!showPendataan && (
                                                <td className="p-4 text-center align-middle" rowSpan={totalRows}>
                                                    <Link
                                                        href={route('monitoring-kuota.show', {id: item.id, bulan: bulan, tahun: tahun})}
                                                        className="px-3 py-1.5 text-xs font-semibold text-[#D9531E] border border-[#D9531E] dark:border-orange-500 dark:text-orange-400 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition flex items-center justify-center gap-1 mx-auto w-max"
                                                    >
                                                        <Search size={14} /> Detail
                                                    </Link>
                                                </td>
                                                )}
                                            </tr>
                                            )}
                                        </React.Fragment>
                                        )})
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {data.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800">
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
        </AuthenticatedLayout>
    );
}
