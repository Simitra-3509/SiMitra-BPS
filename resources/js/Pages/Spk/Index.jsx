import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    FileText, 
    Plus, 
    ChevronLeft, 
    ChevronRight,
    Download,
    Edit,
    Eye,
    Trash2,
    FileCheck,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import { formatRupiah } from '@/utils/formatters';

export default function Index({ spks, filters }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const canCreate = ['admin', 'administrator', 'ppk'].includes(authUser?.role);

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        bulan: filters.bulan || '',
        tahun: filters.tahun || '',
        status: filters.status || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('spk.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({ search: '', bulan: '', tahun: '', status: '' });
        router.get(route('spk.index'));
    };

    const getStatusBadge = (status) => {
        const config = {
            draft: { text: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: FileText },
            terbit: { text: 'Terbit', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle },
            selesai: { text: 'Selesai', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', icon: FileCheck },
            dibayar: { text: 'Dibayar', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: DollarSign },
            batal: { text: 'Batal', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
        };
        const conf = config[status] || config.draft;
        const Icon = conf.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${conf.color}`}>
                <Icon size={12} />
                <span>{conf.text}</span>
            </div>
        );
    };

    return (
        <AuthenticatedLayout header="Surat Perintah Kerja (SPK)">
            <Head title="SPK" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-[#D9531E]" /> Surat Perintah Kerja (SPK)
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dokumen formal untuk mitra statistik berdasarkan penugasan bulanan.
                        </p>
                    </div>
                    {canCreate && (
                        <Link
                            href={route('spk.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D9531E] hover:bg-[#C44C1C] text-white rounded-lg font-medium transition shadow-sm"
                        >
                            <Plus size={18} />
                            Buat SPK Baru
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <form onSubmit={handleFilter} className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cari Nomor / Mitra
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D9531E] focus:border-transparent"
                                    placeholder="Nomor SPK, nama mitra, SOBAT ID..."
                                />
                            </div>
                        </div>

                        {/* Bulan */}
                        <div className="sm:w-32">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bulan
                            </label>
                            <select
                                value={localFilters.bulan}
                                onChange={(e) => setLocalFilters({ ...localFilters, bulan: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D9531E] focus:border-transparent"
                            >
                                <option value="">Semua</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tahun */}
                        <div className="sm:w-32">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tahun
                            </label>
                            <select
                                value={localFilters.tahun}
                                onChange={(e) => setLocalFilters({ ...localFilters, tahun: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D9531E] focus:border-transparent"
                            >
                                <option value="">Semua</option>
                                {[2025, 2026, 2027].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="sm:w-36">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={localFilters.status}
                                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D9531E] focus:border-transparent"
                            >
                                <option value="">Semua</option>
                                <option value="draft">Draft</option>
                                <option value="terbit">Terbit</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibayar">Dibayar</option>
                                <option value="batal">Batal</option>
                            </select>
                        </div>

                        {/* Button Group */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D9531E] hover:bg-[#C44C1C] text-white rounded-lg font-medium"
                            >
                                <Filter size={16} />
                                Terapkan
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-5 py-4 font-bold text-left">Nomor SPK</th>
                                    <th className="px-5 py-4 font-bold text-left">Mitra</th>
                                    <th className="px-5 py-4 font-bold text-left">Periode</th>
                                    <th className="px-5 py-4 font-bold text-left">Total Nilai</th>
                                    <th className="px-5 py-4 font-bold text-left">Status</th>
                                    <th className="px-5 py-4 font-bold text-left">Tanggal SPK</th>
                                    <th className="px-5 py-4 font-bold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {spks.data.length > 0 ? (
                                    spks.data.map((spk) => (
                                        <tr key={spk.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                                            <td className="px-5 py-4">
                                                <div className="font-mono font-bold text-gray-900 dark:text-white">{spk.nomor_spk || '-'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{spk.ppk_user_id ? 'PPK: ' + spk.nama_ppk_snapshot : '-'}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">{spk.mitra?.nama_lengkap || '-'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{spk.mitra?.sobat_id || '-'}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                                    {new Date(spk.tahun, spk.bulan - 1).toLocaleString('id-ID', { month: 'long' })} {spk.tahun}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {spk.tanggal_mulai} - {spk.tanggal_selesai}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                                                {formatRupiah(spk.total_nilai)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {getStatusBadge(spk.status)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                                {spk.tanggal_spk || '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('spk.show', spk.id)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                        title="Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    {spk.status !== 'terbit' && canCreate && (
                                                        <Link
                                                            href={route('spk.edit', spk.id)}
                                                            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('spk.export-pdf', spk.id)}
                                                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30 rounded-lg transition"
                                                        title="Export PDF"
                                                        target="_blank"
                                                    >
                                                        <Download size={16} />
                                                    </Link>
                                                    {canCreate && (
                                                        <Link
                                                            as="button"
                                                            method="delete"
                                                            href={route('spk.destroy', spk.id)}
                                                            data={{ confirm: 'Yakin hapus SPK ini? Tindakan ini tidak dapat dibatalkan.' }}
                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText size={48} className="text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium">Belum ada SPK</p>
                                                <p className="text-sm">Mulai dengan membuat SPK baru.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {spks.data.length > 0 && (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {spks.from} - {spks.to} dari {spks.total} entri
                            </div>
                            <div className="flex items-center gap-1">
                                {spks.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${link.active
                                                ? 'bg-[#D9531E] text-white'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
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