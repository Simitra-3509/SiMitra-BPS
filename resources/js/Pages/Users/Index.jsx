import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    Trash2,
    Trash,
    Edit,
    X,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import api from '@/services/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState('20');
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    // Fetch users from API
    const fetchUsers = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const response = await api.get('/users');
            if (response.data && response.data.success) {
                setUsers(response.data.data);
            } else if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers(response.data.data || []);
            }
        } catch (err) {
            console.error('Gagal mengambil data user dari API:', err);
            setErrorMsg('Gagal mengambil data dari server. Menampilkan mode cadangan.');
            // Fallback default dummy data jika API bermasalah/kosong agar UI tidak blank
            setUsers([
                {
                    id: 1,
                    username: 'admin_bps',
                    nama_lengkap: 'Budi Santoso, M.Si',
                    sobat_id: 'SBT-350901',
                    role: 'Administrator',
                    status: 'Aktif',
                    is_current_user: true,
                },
                {
                    id: 2,
                    username: 'siti_rahma',
                    nama_lengkap: 'Siti Rahmawati, S.Stat',
                    sobat_id: 'SBT-350902',
                    role: 'Ketua Tim',
                    status: 'Aktif',
                    is_current_user: false,
                },
                {
                    id: 3,
                    username: 'ahmad_fauzi',
                    nama_lengkap: 'Ahmad Fauzi',
                    sobat_id: 'SBT-350903',
                    role: 'Ketua Tim',
                    status: 'Nonaktif',
                    is_current_user: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter Logic
    const filteredUsers = users.filter((user) => {
        const matchesRole = roleFilter === '' || user.role === roleFilter;
        const matchesStatus = statusFilter === '' || user.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            searchQuery === '' ||
            (user.username && user.username.toLowerCase().includes(searchLower)) ||
            (user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(searchLower)) ||
            (user.name && user.name.toLowerCase().includes(searchLower)) ||
            (user.sobat_id && user.sobat_id.toLowerCase().includes(searchLower));

        return matchesRole && matchesStatus && matchesSearch;
    });

    // Checkbox handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUserIds(filteredUsers.map((u) => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectUser = (id) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const handleResetFilter = () => {
        setRoleFilter('');
        setStatusFilter('');
        setSearchQuery('');
    };

    const handleDeleteAllSelected = () => {
        if (selectedUserIds.length === 0) return;
        if (confirm(`Apakah Anda yakin ingin menghapus ${selectedUserIds.length} user yang dipilih?`)) {
            setUsers(users.filter((u) => !selectedUserIds.includes(u.id)));
            setSelectedUserIds([]);
        }
    };

    const handleDeleteSingle = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            setUsers(users.filter((u) => u.id !== id));
            setSelectedUserIds(selectedUserIds.filter((itemId) => itemId !== id));
        }
    };

    return (
        <AuthenticatedLayout header="Manajemen User">
            <Head title="Manajemen User - SIMITRA LITE" />

            <div className="space-y-6 p-2 md:p-4">
                {/* Error Banner jika ada kendala koneksi API */}
                {errorMsg && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* 1. Header Halaman */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Manajemen User
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola akun pengguna sistem
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => router.get('/recycle-bin/users')}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <Trash2 size={18} />
                            <span>Recycle Bin</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.get('/users/create')}
                            className="bg-simitra-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                        >
                            <Plus size={18} />
                            <span>Tambah User</span>
                        </button>
                    </div>
                </div>

                {/* 2. Bagian Filter (Flexbox Horizontal) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                        {/* Dropdown Role */}
                        <div className="w-full md:w-48 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 pr-8 py-2 focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                            >
                                <option value="">Semua Role</option>
                                <option value="Administrator">Administrator</option>
                                <option value="Admin">Admin</option>
                                <option value="Ketua Tim">Ketua Tim</option>
                            </select>
                        </div>

                        {/* Dropdown Status */}
                        <div className="w-full md:w-48 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 pr-8 py-2 focus:ring-1 focus:ring-simitra-orange focus:outline-none"
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
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari Username, Nama, atau SOBAT ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                                <Search
                                    size={18}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                        </div>

                        {/* Tombol Filter */}
                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                            <button
                                type="button"
                                className="bg-simitra-orange hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                            >
                                Cari
                            </button>

                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <X size={16} />
                                <span>Reset Filter</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Toolbar Tabel (Flexbox justify-between) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded pl-2 pr-8 py-1 text-sm font-medium focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            <span>data</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleDeleteAllSelected}
                            disabled={selectedUserIds.length === 0}
                            className={`border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                selectedUserIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Trash size={14} />
                            <span>Hapus Semua</span>
                        </button>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                        Menampilkan 1-{filteredUsers.length} dari {filteredUsers.length} user
                    </div>
                </div>

                {/* 4. Tabel Data (Responsive) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredUsers.length > 0 &&
                                                selectedUserIds.length === filteredUsers.length
                                            }
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-600 text-simitra-orange focus:ring-simitra-orange"
                                        />
                                    </th>
                                    <th className="p-4">USERNAME</th>
                                    <th className="p-4">NAMA LENGKAP</th>
                                    <th className="p-4">SOBAT ID</th>
                                    <th className="p-4 text-center">ROLE</th>
                                    <th className="p-4 text-center">STATUS</th>
                                    <th className="p-4 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin text-simitra-orange" />
                                                <span>Memuat data pengguna dari API...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    className="rounded border-gray-300 text-simitra-orange focus:ring-simitra-orange"
                                                />
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                <div className="flex items-center">
                                                    <span>{user.username}</span>
                                                    {user.is_current_user && (
                                                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500 text-white uppercase tracking-wider shadow-xs">
                                                            Anda
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">
                                                {user.nama_lengkap || user.name || '-'}
                                            </td>
                                            <td className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {user.sobat_id || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.role === 'Administrator' || user.role === 'Admin' ? (
                                                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white shadow-xs">
                                                        {user.role || 'Admin'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white shadow-xs">
                                                        {user.role || 'Ketua Tim'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                                        user.status === 'Aktif' || user.status === 'active' || !user.status
                                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800'
                                                            : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800'
                                                    }`}
                                                >
                                                    {user.status || 'Aktif'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.get(route('users.edit'), { id: user.id })}
                                                        className="text-orange-600 hover:bg-orange-50 border border-orange-200 dark:border-orange-900/50 dark:hover:bg-orange-900/30 dark:text-orange-500 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={14} />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSingle(user.id)}
                                                        className="text-red-600 hover:bg-red-50 border border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-500 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                                                        title="Hapus User"
                                                    >
                                                        <Trash size={14} />
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-400">
                                            Tidak ada data user ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 5. Footer / Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-gray-100 dark:border-gray-700 px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div>
                            Halaman 1 • 1-{filteredUsers.length} dari {filteredUsers.length} user
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-1.5 rounded transition-colors"
                                title="Halaman Pertama"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                type="button"
                                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-1.5 rounded transition-colors"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <button
                                type="button"
                                className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded border border-blue-600 text-xs"
                            >
                                1
                            </button>

                            <button
                                type="button"
                                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-1.5 rounded transition-colors"
                                title="Halaman Selanjutnya"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                type="button"
                                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-1.5 rounded transition-colors"
                                title="Halaman Terakhir"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
