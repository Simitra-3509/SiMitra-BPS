import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAppToast } from '@/Layouts/AuthenticatedLayout';
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
    FileSpreadsheet,
    Download,
    Upload,
    CheckCircle2,
} from 'lucide-react';
import api from '@/services/api';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function UserManagement() {
    const { toast } = useAppToast();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // State ConfirmDialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });

    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState('20');
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Form Data States
    const [createForm, setCreateForm] = useState({
        username: '',
        password: '',
        nama_lengkap: '',
        sobat_id: '',
        role: 'Operator',
    });
    const [editForm, setEditForm] = useState({
        id: null,
        username: '',
        password: '',
        nama_lengkap: '',
        sobat_id: '',
        role: 'Operator',
        status: 'Aktif',
    });

    const [importFile, setImportFile] = useState(null);
    const [importRoleOption, setImportRoleOption] = useState('auto');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);

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
                setUsers(response.data?.data || []);
            }
        } catch (err) {
            console.error('Gagal mengambil data user dari API:', err);
            setErrorMsg('Gagal mengambil data dari server. Menampilkan mode cadangan.');
            setUsers([
                {
                    id: 1,
                    username: 'admin_bps',
                    nama_lengkap: 'Budi Santoso, M.Si',
                    sobat_id: '350901234567',
                    role: 'Admin',
                    status: 'Aktif',
                },
                {
                    id: 2,
                    username: 'siti_rahma',
                    nama_lengkap: 'Siti Rahmawati, S.Stat',
                    sobat_id: '350902345678',
                    role: 'Operator',
                    status: 'Aktif',
                },
                {
                    id: 3,
                    username: 'kepila_bps',
                    nama_lengkap: 'Drs. Ahmad Fauzi, M.E.',
                    sobat_id: '350903456789',
                    role: 'Viewer',
                    status: 'Aktif',
                },
                {
                    id: 4,
                    username: 'mitra_jember',
                    nama_lengkap: 'Dewi Lestari',
                    sobat_id: '350904567890',
                    role: 'Mitra',
                    status: 'Aktif',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Color Badges per Role (Warna khas BPS)
    const getRoleBadgeStyle = (roleName) => {
        const role = (roleName || '').toLowerCase();
        if (role === 'admin' || role === 'administrator') {
            return { backgroundColor: '#eb891b', color: '#ffffff' }; // BPS Orange
        }
        if (role === 'operator') {
            return { backgroundColor: '#68b92e', color: '#ffffff' }; // BPS Green
        }
        if (role === 'ppk') {
            return { backgroundColor: '#8b5cf6', color: '#ffffff' }; // PPK Purple/Indigo
        }
        if (role === 'viewer') {
            return { backgroundColor: '#0093dd', color: '#ffffff' }; // BPS Blue
        }
        if (role === 'mitra') {
            return { backgroundColor: '#60ba72', color: '#ffffff' }; // BPS Mitra Green
        }
        return { backgroundColor: '#68b92e', color: '#ffffff' };
    };

    // Filter Logic
    const filteredUsers = users.filter((user) => {
        const matchesRole = roleFilter === '' || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
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

    const handleDeleteAllSelected = async () => {
        if (selectedUserIds.length === 0) return;
        setConfirmConfig({
            title: `Hapus ${selectedUserIds.length} User`,
            message: `Apakah Anda yakin ingin menghapus ${selectedUserIds.length} user yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
            onConfirm: async () => {
                setConfirmOpen(false);
                try {
                    await Promise.all(selectedUserIds.map((id) => api.delete(`/users/${id}`)));
                    setUsers(users.filter((u) => !selectedUserIds.includes(u.id)));
                    setSelectedUserIds([]);
                    toast.success('User terpilih berhasil dihapus.');
                } catch (err) {
                    console.error('Gagal menghapus user:', err);
                    toast.error('Gagal menghapus beberapa user dari server.');
                }
            },
        });
        setConfirmOpen(true);
    };

    const handleDeleteSingle = async (id) => {
        setConfirmConfig({
            title: 'Hapus User',
            message: 'Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: async () => {
                setConfirmOpen(false);
                try {
                    await api.delete(`/users/${id}`);
                    setUsers(users.filter((u) => u.id !== id));
                    setSelectedUserIds(selectedUserIds.filter((itemId) => itemId !== id));
                    toast.success('User berhasil dihapus.');
                } catch (err) {
                    console.error('Gagal menghapus user:', err);
                    toast.error('Gagal menghapus user dari server.');
                }
            },
        });
        setConfirmOpen(true);
    };

    // Open Modal Handlers
    const openCreateModal = () => {
        setCreateForm({
            username: '',
            password: '',
            nama_lengkap: '',
            sobat_id: '',
            role: 'Operator',
        });
        setModalError(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditForm({
            id: user.id,
            username: user.username || '',
            password: '',
            nama_lengkap: user.nama_lengkap || user.name || '',
            sobat_id: user.sobat_id || '',
            role: user.role || 'Operator',
            status: user.status || 'Aktif',
        });
        setModalError(null);
        setIsEditModalOpen(true);
    };

    const extractErrorMessage = (err, fallback) => {
        if (err.response?.data?.errors) {
            const errList = Object.values(err.response.data.errors).flat();
            if (errList.length > 0) {
                return `Validasi gagal: ${errList.join(' | ')}`;
            }
        }
        return err.response?.data?.message || fallback;
    };

    // Handle Create Submit
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setModalError(null);
        try {
            const payload = { ...createForm };
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }
            const response = await api.post('/users', payload);
            if (response.status === 201 || (response.data && response.data.success)) {
                setSuccessMsg('User baru berhasil ditambahkan!');
                setIsCreateModalOpen(false);
                fetchUsers();
            }
        } catch (err) {
            console.error('Gagal menambah user:', err);
            setModalError(extractErrorMessage(err, 'Gagal menyimpan user baru. Periksa kembali form.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setModalError(null);
        try {
            const payload = { ...editForm };
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }
            const response = await api.put(`/users/${editForm.id}`, payload);
            if (response.status === 200 || (response.data && response.data.success)) {
                setSuccessMsg('Data pengguna berhasil diperbarui!');
                setIsEditModalOpen(false);
                fetchUsers();
            }
        } catch (err) {
            console.error('Gagal mengedit user:', err);
            setModalError(extractErrorMessage(err, 'Gagal memperbarui data user.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Download Template CSV
    const handleDownloadTemplate = () => {
        const templateContent = 'username,nama_lengkap,sobat_id,role\nsurya_bps,Ahmad Surya,350901234567,Operator\nviewer_bps,Drs. Budi Utama,350902345678,Viewer\nmitra_jember,Siti Rahmawati,350903456789,Mitra';
        const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'format_import_user_bps.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle Import Submit
    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setModalError('Pilih file Excel / CSV terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);
        setModalError(null);
        try {
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('override_role', importRoleOption);

            const response = await api.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.success) {
                setSuccessMsg(response.data.message || 'Import data user berhasil!');
                setIsImportModalOpen(false);
                setImportFile(null);
                fetchUsers();
            }
        } catch (err) {
            console.error('Gagal mengimport data user:', err);
            setModalError(err.response?.data?.message || 'Gagal melakukan import file.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout header="Manajemen User">
            <Head title="Manajemen User - SIMITRA LITE" />

            <div className="space-y-6 p-2 md:p-4">
                {/* Notification Toast */}
                {successMsg && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            <span>{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-bold hover:text-emerald-800">
                            ✕
                        </button>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* 1. Header Halaman & Action Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Manajemen User
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola akun pengguna sistem & hak akses aplikasi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 w-full md:w-auto">
                        {/* Tombol Recycle Bin (Oranye - Sensus Ekonomi BPS) */}
                        <button
                            type="button"
                            onClick={() => router.get('/recycle-bin/users')}
                            className="bg-[#FF7F00] hover:bg-[#E67300] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer w-full sm:w-auto"
                        >
                            <Trash2 size={18} />
                            <span>Recycle Bin</span>
                        </button>

                        {/* Tombol Import Excel (Hijau - Sensus Pertanian BPS) */}
                        <button
                            type="button"
                            onClick={() => { setModalError(null); setImportFile(null); setIsImportModalOpen(true); }}
                            className="bg-[#00AA55] hover:bg-[#008844] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer w-full sm:w-auto"
                        >
                            <FileSpreadsheet size={18} />
                            <span>Import Excel</span>
                        </button>

                        {/* Tombol Tambah User (Biru - Sensus Penduduk BPS) */}
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-[#0080FF] hover:bg-[#0066CC] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer w-full sm:w-auto"
                        >
                            <Plus size={18} />
                            <span>Tambah User</span>
                        </button>
                    </div>
                </div>

                {/* 2. Card Filter & Pencarian */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                        {/* Dropdown Role (Admin, Operator, Viewer, Mitra) */}
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
                                <option value="Admin">Admin</option>
                                <option value="Operator">Operator</option>
                                <option value="PPK">PPK</option>
                                <option value="Viewer">Viewer</option>
                                <option value="Mitra">Mitra</option>
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
                                onClick={handleResetFilter}
                                className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <X size={16} />
                                <span>Reset Filter</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Toolbar Tabel */}
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
                    </div>

                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                        Menampilkan 1-{filteredUsers.length} dari {filteredUsers.length} user
                    </div>
                </div>

                {/* 4. Tabel Data User */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm min-w-[750px] whitespace-nowrap">
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
                                    filteredUsers.map((user) => {
                                        const badgeStyle = getRoleBadgeStyle(user.role);
                                        return (
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
                                                    <span>{user.username}</span>
                                                </td>
                                                <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">
                                                    {user.nama_lengkap || user.name || '-'}
                                                </td>
                                                <td className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                    {user.sobat_id || '-'}
                                                </td>
                                                {/* Badge Role dengan Warna Logo BPS */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        style={badgeStyle}
                                                        className="inline-block px-3 py-1 text-xs font-bold rounded-full shadow-xs uppercase tracking-wider"
                                                    >
                                                        {user.role || 'Operator'}
                                                    </span>
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
                                                            onClick={() => openEditModal(user)}
                                                            className="text-orange-600 hover:bg-orange-50 border border-orange-200 dark:border-orange-900/50 dark:hover:bg-orange-900/30 dark:text-orange-500 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                                                            title="Edit User"
                                                        >
                                                            <Edit size={14} />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSingle(user.id)}
                                                            className="text-red-600 hover:bg-red-50 border border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-500 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                                                            title="Hapus User"
                                                        >
                                                            <Trash size={14} />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                </div>

                {/* Floating Action Bar untuk Bulk Delete */}
                {selectedUserIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#1a2435] text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700/60 flex items-center gap-5 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        <div className="flex items-center gap-3 border-r border-gray-700/80 pr-5">
                            <span className="w-7 h-7 bg-[#D9531E] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                                {selectedUserIds.length}
                            </span>
                            <span className="text-sm font-semibold text-gray-200">Data Terpilih</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedUserIds([])}
                                className="px-3.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAllSelected}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2 size={16} />
                                <span>Hapus Data</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* ==================== POP-UP MODAL: TAMBAH USER ==================== */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah User Baru</h3>
                                <p className="text-xs text-gray-500">Buat akun pengguna sistem baru</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{modalError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.username}
                                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                    placeholder="Masukkan username"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.nama_lengkap}
                                    onChange={(e) => setCreateForm({ ...createForm, nama_lengkap: e.target.value })}
                                    placeholder="Nama lengkap beserta gelar"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => {
                                        const newRole = e.target.value;
                                        setCreateForm({
                                            ...createForm,
                                            role: newRole,
                                            sobat_id: newRole === 'Mitra' ? createForm.sobat_id : ''
                                        });
                                    }}
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Operator">Operator</option>
                                    <option value="PPK">PPK</option>
                                    <option value="Viewer">Viewer (Atasan / Monitoring)</option>
                                    <option value="Mitra">Mitra</option>
                                </select>
                            </div>

                            {createForm.role === 'Mitra' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        SOBAT ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.sobat_id}
                                        onChange={(e) => setCreateForm({ ...createForm, sobat_id: e.target.value })}
                                        placeholder="3509xxxxxxxxxxxx"
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Password <span className="text-gray-400 font-normal">
                                        {createForm.role === 'Mitra'
                                            ? '(Opsional — jika kosong otomatis memakai SOBAT ID / Username)'
                                            : '(Opsional — jika kosong otomatis memakai Username)'}
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    placeholder={createForm.role === 'Mitra' ? "Biarkan kosong untuk password otomatis SOBAT ID" : "Biarkan kosong untuk password otomatis Username"}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-simitra-orange hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    <span>Simpan User</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== POP-UP MODAL: EDIT USER ==================== */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Data User</h3>
                                <p className="text-xs text-gray-500">Perbarui profil dan wewenang pengguna</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{modalError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.nama_lengkap}
                                    onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            setEditForm({
                                                ...editForm,
                                                role: newRole,
                                                sobat_id: newRole === 'Mitra' ? editForm.sobat_id : ''
                                            });
                                        }}
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Operator">Operator</option>
                                        <option value="PPK">PPK</option>
                                        <option value="Viewer">Viewer</option>
                                        <option value="Mitra">Mitra</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            {editForm.role === 'Mitra' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        SOBAT ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.sobat_id}
                                        onChange={(e) => setEditForm({ ...editForm, sobat_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Ganti Password (Kosongkan jika tidak diubah)
                                </label>
                                <input
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    placeholder="Masukkan password baru"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-simitra-orange focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-simitra-orange hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== POP-UP MODAL: IMPORT EXCEL ==================== */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800">
                            <div className="flex items-center gap-2.5">
                                <FileSpreadsheet className="text-emerald-600" size={24} />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import User Excel / CSV</h3>
                                    <p className="text-xs text-gray-500">Unggah data kolektif pegawai BPS</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{modalError}</span>
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-xs space-y-2 text-blue-900 dark:text-blue-200">
                                <p className="font-bold flex items-center gap-1.5">
                                    <FileSpreadsheet size={16} className="text-blue-600" />
                                    Ketentuan Format File Import:
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Format kolom header: <code>username</code>, <code>nama_lengkap</code>, <code>sobat_id</code>, <code>role</code></li>
                                    <li>Nilai <code>role</code>: Admin, Operator, PPK, Viewer, atau Mitra</li>
                                    <li><strong>Password Otomatis:</strong> Password bawaan diambil dari nilai <code>sobat_id</code> masing-masing user dan <strong>otomatis di-hash secara aman</strong> oleh sistem.</li>
                                </ul>

                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-blue-300 shadow-2xs cursor-pointer"
                                >
                                    <Download size={14} /> Download Format Template Excel/CSV
                                </button>
                            </div>

                            {/* Pilihan Target Role (5 Tombol Warna BPS) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">
                                    Pilih Target Role Pengguna yang Diimport:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {/* 1. Otomatis */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('auto')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'auto'
                                                ? 'bg-slate-700 text-white border-slate-900 shadow-md ring-2 ring-slate-400'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span>⚙️ Otomatis (File)</span>
                                        {importRoleOption === 'auto' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>

                                    {/* 2. Admin */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('Admin')}
                                        style={{ backgroundColor: importRoleOption === 'Admin' ? '#eb891b' : undefined }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'Admin'
                                                ? 'text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 hover:bg-amber-100'
                                        }`}
                                    >
                                        <span>👑 Admin</span>
                                        {importRoleOption === 'Admin' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>

                                    {/* 3. Operator */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('Operator')}
                                        style={{ backgroundColor: importRoleOption === 'Operator' ? '#68b92e' : undefined }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'Operator'
                                                ? 'text-white border-green-600 shadow-md ring-2 ring-green-300'
                                                : 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 hover:bg-green-100'
                                        }`}
                                    >
                                        <span>🛠️ Operator</span>
                                        {importRoleOption === 'Operator' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>

                                    {/* 4. PPK */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('PPK')}
                                        style={{ backgroundColor: importRoleOption === 'PPK' ? '#8b5cf6' : undefined }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'PPK'
                                                ? 'text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                                                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 hover:bg-purple-100'
                                        }`}
                                    >
                                        <span>📋 PPK</span>
                                        {importRoleOption === 'PPK' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>

                                    {/* 4. Viewer */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('Viewer')}
                                        style={{ backgroundColor: importRoleOption === 'Viewer' ? '#0093dd' : undefined }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'Viewer'
                                                ? 'text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 hover:bg-blue-100'
                                        }`}
                                    >
                                        <span>👁️ Viewer</span>
                                        {importRoleOption === 'Viewer' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>

                                    {/* 5. Mitra */}
                                    <button
                                        type="button"
                                        onClick={() => setImportRoleOption('Mitra')}
                                        style={{ backgroundColor: importRoleOption === 'Mitra' ? '#60ba72' : undefined }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                            importRoleOption === 'Mitra'
                                                ? 'text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                    >
                                        <span>🤝 Mitra</span>
                                        {importRoleOption === 'Mitra' && <CheckCircle2 size={14} className="shrink-0 text-white" />}
                                    </button>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors">
                                <Upload size={32} className="mx-auto text-emerald-600 mb-2" />
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <span className="text-emerald-600 hover:underline">Pilih File CSV / Excel</span>
                                    <input
                                        type="file"
                                        accept=".csv, .xlsx, .xls, .txt"
                                        onChange={(e) => setImportFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                {importFile ? (
                                    <p className="mt-2 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                                        📄 {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 mt-1">Format didukung: .csv, .xlsx, .xls</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !importFile}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    <span>Proses Import</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
