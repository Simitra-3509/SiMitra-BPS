import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function RecycleBin({ mitras, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mitra.recycle-bin'), { search }, { preserveState: true });
    };

    const handleRestore = (id) => {
        if (confirm('Apakah Anda yakin ingin memulihkan data Mitra ini?')) {
            router.post(route('mitra.restore', id));
        }
    };

    const handleForceDelete = (id) => {
        if (confirm('PERINGATAN: Data ini akan dihapus secara PERMANEN dan tidak dapat dikembalikan! Apakah Anda yakin?')) {
            router.delete(route('mitra.force-delete', id));
        }
    };

    return (
        <AuthenticatedLayout header="Recycle Bin — Mitra Terhapus">
            <Head title="Recycle Bin Mitra" />

            <div className="space-y-6">
                {/* Flash Message */}
                {flash?.message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {flash.message}
                    </div>
                )}

                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link
                            href={route('mitra.index')}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} /> Kembali ke Master Mitra
                        </Link>

                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:w-64">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari NIK / Nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-simitra-orange"
                                />
                                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="bg-simitra-dark hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total Data Terhapus: <strong className="text-red-500 font-bold text-sm">{mitras.total}</strong>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4">NIK</th>
                                    <th className="px-6 py-4">Nama Lengkap</th>
                                    <th className="px-6 py-4">Alamat</th>
                                    <th className="px-6 py-4">Tanggal Dihapus</th>
                                    <th className="px-6 py-4 text-right">Aksi Pulihkan / Hapus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {mitras.data.length > 0 ? (
                                    mitras.data.map((mitra) => (
                                        <tr key={mitra.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{mitra.nik}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">{mitra.nama_lengkap}</td>
                                            <td className="px-6 py-4">{mitra.alamat || '-'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(mitra.deleted_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleRestore(mitra.id)}
                                                    className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                                                    title="Pulihkan Mitra"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(mitra.id)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                                                    title="Hapus Permanen"
                                                >
                                                    <Trash2 size={14} /> Hapus Permanen
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                            Recycle Bin kosong. Tidak ada data Mitra terhapus.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mitras.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-1">
                            {mitras.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                        link.active
                                            ? 'bg-simitra-orange text-white font-bold'
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
