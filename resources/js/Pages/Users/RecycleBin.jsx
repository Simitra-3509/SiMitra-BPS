import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Trash2, 
    ArrowLeft, 
    Info, 
    Search, 
    X, 
    AlertTriangle, 
    Trash, 
    RotateCcw 
} from 'lucide-react';

export default function RecycleBin({ trashedUsers = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || '20');
    const [selectedIds, setSelectedIds] = useState([]);

    // Extract items from pagination object or array
    const userList = Array.isArray(trashedUsers) 
        ? trashedUsers 
        : (trashedUsers?.data || []);

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(userList.map(item => item.id));
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
        if (confirm(`Apakah Anda yakin ingin memulihkan ${selectedIds.length} user yang dipilih?`)) {
            const bulkRestoreRoute = typeof route === 'function' && route().has('users.bulk-restore')
                ? route('users.bulk-restore')
                : `/recycle-bin/users/bulk-restore`;
            router.post(bulkRestoreRoute, { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const handleBulkForceDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`PERINGATAN: ${selectedIds.length} data user ini akan dihapus secara PERMANEN! Apakah Anda yakin?`)) {
            const bulkForceDeleteRoute = typeof route === 'function' && route().has('users.bulk-force-delete')
                ? route('users.bulk-force-delete')
                : `/recycle-bin/users/bulk-force-delete`;
            router.delete(bulkForceDeleteRoute, {
                data: { ids: selectedIds },
                onSuccess: () => setSelectedIds([])
            });
        }
    }; 
        ? trashedUsers 
        : (trashedUsers?.data || []);

    const totalItems = Array.isArray(trashedUsers) 
        ? trashedUsers.length 
        : (trashedUsers?.total ?? userList.length);

    // Inertia GET for search & filtering
    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        
        const targetRoute = typeof route === 'function' && route().has('users.recycle-bin')
            ? route('users.recycle-bin')
            : '/recycle-bin/users';

        router.get(
            targetRoute,
            { search, role, status, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setStatus('');
        setPerPage('20');

        const targetRoute = typeof route === 'function' && route().has('users.recycle-bin')
            ? route('users.recycle-bin')
            : '/recycle-bin/users';

        router.get(
            targetRoute,
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleRestore = (id) => {
        if (confirm('Apakah Anda yakin ingin memulihkan akun user ini?')) {
            const restoreRoute = typeof route === 'function' && route().has('users.restore')
                ? route('users.restore', id)
                : `/recycle-bin/users/${id}/restore`;

            router.post(restoreRoute, {}, { preserveScroll: true });
        }
    };

    const handleForceDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini secara permanen? Data tidak dapat dikembalikan lagi!')) {
            const forceDeleteRoute = typeof route === 'function' && route().has('users.force-delete')
                ? route('users.force-delete', id)
                : `/recycle-bin/users/${id}/force-delete`;

            router.delete(forceDeleteRoute, { preserveScroll: true });
        }
    };

    const backToUserManagementRoute = typeof route === 'function' && route().has('users.index')
        ? route('users.index')
        : '/users';

    return (
        <AuthenticatedLayout header="Recycle Bin User">
            <Head title="Recycle Bin User - SIMITRA LITE" />

            <div className="space-y-6 p-2 md:p-4">
                
                {/* 1. Header Halaman */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Trash2 size={28} className="text-red-500 shrink-0" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                Recycle Bin — User Terhapus
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Akun user yang telah dihapus sementara. Admin dapat memulihkan atau menghapus permanen.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={backToUserManagementRoute}
                        className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Manajemen User</span>
                    </Link>
                </div>

                {/* 2. Alert Kuning (Informasi Retensi Data) */}
                <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700/50 p-4 rounded-lg flex items-center gap-2.5 text-sm shadow-xs">
                    <Info size={16} className="shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <span>
                        Data user yang dihapus akan disimpan hingga 30 hari sebelum dibersihkan otomatis.
                    </span>
                </div>

                {/* 3. Bagian Filter (Flexbox Horizontal) */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end w-full">
                        
                        {/* Dropdown Role */}
                        <div className="w-full md:w-44 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 pr-8 py-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                                <option value="">Semua Role</option>
                                <option value="Administrator">Administrator</option>
                                <option value="Admin">Admin</option>
                                <option value="Ketua Tim">Ketua Tim</option>
                                <option value="Operator">Operator</option>
                                <option value="Pegawai">Pegawai</option>
                            </select>
                        </div>

                        {/* Dropdown Status */}
                        <div className="w-full md:w-44 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 pr-8 py-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        {/* Input Cari */}
                        <div className="flex-1 w-full relative">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Cari
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari Username, Nama, atau Email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                    <Search
                                        size={18}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                                >
                                    Cari
                                </button>
                            </div>
                        </div>

                        {/* Dropdown Tampilkan */}
                        <div className="w-full md:w-32 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Tampilkan
                            </label>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(e.target.value);
                                    handleFilterSubmit();
                                }}
                                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 pr-8 py-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        {/* Tombol Reset */}
                        <div className="w-full md:w-auto shrink-0">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                                <span>Reset</span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* 4. Teks Info Jumlah Data */}
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 font-medium mb-4">
                    {totalItems} item di Recycle Bin
                </div>

                {/* Bulk Actions Floating Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700/50 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
                            <div className="bg-[#D9531E] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-medium text-gray-200">User Terpilih</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkRestore}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                            >
                                <RotateCcw size={16} /> Restore Terpilih
                            </button>
                            <button
                                onClick={handleBulkForceDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Hapus Permanen Terpilih
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md ml-2"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. Alert Merah (Peringatan Tabel) & 6. Tabel Data / Empty State */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
                    
                    {/* Banner Peringatan Tabel (Tepat di Atas Header Tabel) */}
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800/40 p-3 flex items-center gap-2 text-xs font-medium">
                        <AlertTriangle size={16} className="shrink-0 text-red-500" />
                        <span>
                            Data di bawah tidak muncul di halaman User utama. Pulihkan untuk mengaktifkan kembali, atau hapus permanen untuk menghapus selamanya.
                        </span>
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-simitra-dark text-white uppercase text-xs font-bold tracking-wider border-b border-gray-700">
                                <tr>
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-600 text-[#D9531E] focus:ring-[#D9531E] bg-gray-800 cursor-pointer"
                                            onChange={toggleSelectAll}
                                            checked={userList.length > 0 && selectedIds.length === userList.length}
                                        />
                                    </th>
                                    <th className="p-4 text-center">#</th>
                                    <th className="p-4">USERNAME</th>
                                    <th className="p-4">NAMA LENGKAP</th>
                                    <th className="p-4">EMAIL</th>
                                    <th className="p-4 text-center">ROLE</th>
                                    <th className="p-4 text-center">STATUS</th>
                                    <th className="p-4">DIHAPUS OLEH</th>
                                    <th className="p-4">TANGGAL HAPUS</th>
                                    <th className="p-4 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                                {userList.length > 0 ? (
                                    userList.map((user, index) => (
                                        <tr 
                                            key={user.id || index}
                                            className={`transition-colors ${selectedIds.includes(user.id) ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E] dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
                                                    checked={selectedIds.includes(user.id)}
                                                    onChange={() => toggleSelect(user.id)}
                                                />
                                            </td>
                                            <td className="p-4 text-center font-medium text-gray-500 dark:text-gray-400">
                                                {index + 1}
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                {user.username}
                                            </td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200">
                                                {user.nama_lengkap || user.name || '-'}
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">
                                                {user.email || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white shadow-xs">
                                                    {user.role || 'Admin'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full border bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800">
                                                    {user.status || 'Terhapus'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                                                {user.deleted_by || 'System Admin'}
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                                                {user.deleted_at || 'Baru Saja'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(user.id)}
                                                        className="border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                                        title="Pulihkan User"
                                                    >
                                                        <RotateCcw size={14} />
                                                        <span>Pulihkan</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleForceDelete(user.id)}
                                                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                                        title="Hapus Permanen"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Hapus Permanen</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* Empty State */
                                    <tr>
                                        <td colSpan="10" className="p-0">
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Trash size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Recycle Bin kosong.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
