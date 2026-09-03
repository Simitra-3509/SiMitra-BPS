import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAppToast } from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Search, RotateCcw, Trash2, ArrowLeft, Folder, CheckCircle2 } from 'lucide-react';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function RecycleBin({ mitras, filters }) {
    const { flash } = usePage().props;
    const { toast } = useAppToast();
    const flashMessage = flash?.message || flash?.success;
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedIds, setSelectedIds] = useState([]);

    // State ConfirmDialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null, variant: 'warning' });

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(mitras.data.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkRestore = () => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: `Pulihkan ${selectedIds.length} Data Mitra`,
            message: `Apakah Anda yakin ingin memulihkan ${selectedIds.length} data Mitra yang dipilih?`,
            variant: 'warning',
            onConfirm: () => {
                setConfirmOpen(false);
                router.post(route('mitra.bulk-restore'), { ids: selectedIds }, {
                    onSuccess: () => setSelectedIds([])
                });
            },
        });
        setConfirmOpen(true);
    };

    const handleBulkForceDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: `Hapus Permanen ${selectedIds.length} Data Mitra`,
            message: `PERINGATAN: ${selectedIds.length} data Mitra ini akan dihapus secara PERMANEN dan tidak dapat dikembalikan lagi!`,
            variant: 'danger',
            onConfirm: () => {
                setConfirmOpen(false);
                router.delete(route('mitra.bulk-force-delete'), {
                    data: { ids: selectedIds },
                    onSuccess: () => setSelectedIds([])
                });
            },
        });
        setConfirmOpen(true);
    };

    const handleRestoreAll = () => {
        setConfirmConfig({
            title: 'Pulihkan Semua Data Mitra',
            message: `Apakah Anda yakin ingin memulihkan SELURUH (${mitras.total}) data Mitra yang ada di Recycle Bin?`,
            variant: 'warning',
            onConfirm: () => {
                setConfirmOpen(false);
                router.post(route('mitra.restore-all'), {}, {
                    onSuccess: () => setSelectedIds([])
                });
            },
        });
        setConfirmOpen(true);
    };

    const handleEmptyRecycleBin = () => {
        setConfirmConfig({
            title: 'Kosongkan Recycle Bin Mitra',
            message: `PERINGATAN KRUSIAL: Apakah Anda yakin ingin MENGHAPUS PERMANEN SELURUH (${mitras.total}) data Mitra di Recycle Bin? Data yang dihapus TIDAK BISA DIKEMBALIKAN!`,
            variant: 'danger',
            onConfirm: () => {
                setConfirmOpen(false);
                router.delete(route('mitra.empty-recycle-bin'), {
                    onSuccess: () => setSelectedIds([])
                });
            },
        });
        setConfirmOpen(true);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mitra.recycle-bin'), { search }, { preserveState: true });
    };

    const handleRestore = (id) => {
        setConfirmConfig({
            title: 'Pulihkan Data Mitra',
            message: 'Apakah Anda yakin ingin memulihkan data Mitra ini? Data akan aktif kembali.',
            variant: 'warning',
            onConfirm: () => {
                setConfirmOpen(false);
                router.post(route('mitra.restore', id));
            },
        });
        setConfirmOpen(true);
    };

    const handleForceDelete = (id) => {
        setConfirmConfig({
            title: 'Hapus Permanen Mitra',
            message: 'PERINGATAN: Data ini akan dihapus secara PERMANEN dan tidak dapat dikembalikan lagi!',
            variant: 'danger',
            onConfirm: () => {
                setConfirmOpen(false);
                router.delete(route('mitra.force-delete', id));
            },
        });
        setConfirmOpen(true);
    };

    return (
        <AuthenticatedLayout header="Recycle Bin — Mitra Terhapus">
            <Head title="Recycle Bin Mitra" />

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

                {/* Bulk Actions Floating Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#1B2335] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
                            <span className="w-6 h-6 bg-[#F26522] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium">Data Terpilih</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkRestore}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <RotateCcw size={16} /> Restore Terpilih
                            </button>
                            <button
                                onClick={handleBulkForceDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2 size={16} /> Hapus Permanen Terpilih
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition cursor-pointer ml-2"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Link
                            href={route('mitra.index')}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
                        >
                            <ArrowLeft size={16} /> Kembali ke Master Mitra
                        </Link>

                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:w-64">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari Sobat ID / Nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F26522]"
                                />
                                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="bg-[#1B2335] hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total Data Terhapus: <strong className="text-red-500 font-bold text-sm">{mitras?.total || 0}</strong>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[800px] whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase text-xs font-bold border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#F26522] focus:ring-[#F26522] dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
                                            onChange={toggleSelectAll}
                                            checked={mitras?.data && mitras.data.length > 0 && selectedIds.length === mitras.data.length}
                                        />
                                    </th>
                                    <th className="px-6 py-4">Sobat ID</th>
                                    <th className="px-6 py-4">Nama Lengkap</th>
                                    <th className="px-6 py-4">Alamat</th>
                                    <th className="px-6 py-4">Tanggal Dihapus</th>
                                    <th className="px-6 py-4 text-right">Aksi Pulihkan / Hapus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {mitras?.data && mitras.data.length > 0 ? (
                                    mitras.data.map((mitra) => (
                                        <tr key={mitra.id} className={`transition ${selectedIds.includes(mitra.id) ? 'bg-orange-50/50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#F26522] focus:ring-[#F26522] dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
                                                    checked={selectedIds.includes(mitra.id)}
                                                    onChange={() => toggleSelect(mitra.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{mitra.sobat_id || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{mitra.nama_lengkap}</td>
                                            <td className="px-6 py-4">{mitra.alamat || '-'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(mitra.deleted_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleRestore(mitra.id)}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                    title="Pulihkan Mitra"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(mitra.id)}
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
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Folder size={32} className="text-gray-300 dark:text-gray-600" />
                                                <p className="text-sm">Recycle Bin kosong. Tidak ada data Mitra terhapus.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mitras?.links && mitras.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-1">
                            {mitras.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                        link.active
                                            ? 'bg-[#F26522] text-white font-bold'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.variant === 'danger' ? 'Ya, Hapus Permanen' : 'Ya, Pulihkan'}
                cancelText="Batal"
                variant={confirmConfig.variant}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
