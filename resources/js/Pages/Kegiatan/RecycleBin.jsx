import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Search, RotateCcw, Trash2, ArrowLeft, Folder, CheckCircle2 } from 'lucide-react';

export default function RecycleBin({ kegiatans, filters }) {
    const { flash } = usePage().props;
    const flashMessage = flash?.message || flash?.success;
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kegiatan.recycle-bin'), { search }, { preserveState: true });
    };

    const handleRestore = (id) => {
        if (confirm('Apakah Anda yakin ingin memulihkan data Kegiatan ini?')) {
            router.post(route('kegiatan.restore', id));
        }
    };

    const handleForceDelete = (id) => {
        if (confirm('PERINGATAN: Data Kegiatan ini akan dihapus secara PERMANEN beserta seluruh rinciannya! Apakah Anda yakin?')) {
            router.delete(route('kegiatan.force-delete', id));
        }
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <AuthenticatedLayout header="Recycle Bin — Kegiatan Terhapus">
            <Head title="Recycle Bin Kegiatan - SIMITRA LITE" />

            <div className="space-y-6">
                {/* Flash Message */}
                {flashMessage && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 size={18} />
                        </div>
                        <span className="text-sm font-semibold">{flashMessage}</span>
                    </div>
                )}

                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link
                            href={route('kegiatan.index')}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <ArrowLeft size={16} /> Kembali ke Daftar Kegiatan
                        </Link>

                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:w-64">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari Kode KRO / Nama Kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 text-sm border rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D9531E]"
                                />
                                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="bg-[#D9531E] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total Kegiatan Terhapus: <strong className="text-red-500 font-bold text-sm">{kegiatans?.total || 0}</strong>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase text-xs font-bold border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4">Kode KRO</th>
                                    <th className="px-6 py-4">Nama Kegiatan</th>
                                    <th className="px-6 py-4">Total Anggaran</th>
                                    <th className="px-6 py-4">Tanggal Dihapus</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {kegiatans?.data && kegiatans.data.length > 0 ? (
                                    kegiatans.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                                                {item.kode_kegiatan || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {item.nama_kegiatan}
                                                <span className="block text-xs font-normal text-gray-500">
                                                    {(item.detil_kegiatan || []).length} rincian Detil belanja
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatRupiah(item.total_anggaran)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(item.deleted_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleRestore(item.id)}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                    title="Pulihkan Kegiatan"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(item.id)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                    title="Hapus Permanen"
                                                >
                                                    <Trash2 size={14} /> Hapus Permanen
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Folder size={32} className="text-gray-300 dark:text-gray-600" />
                                                <p className="text-sm">Recycle Bin kosong. Tidak ada data Kegiatan terhapus.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {kegiatans?.links && kegiatans.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-1">
                            {kegiatans.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                        link.active
                                            ? 'bg-[#D9531E] text-white font-bold'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
