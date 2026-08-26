import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAppToast } from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, X, Trash, Eye, User, Phone, MapPin, CreditCard, GraduationCap, Briefcase, Calendar, ShieldCheck, Mail, FileSpreadsheet, Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Index({ mitras, filters, banksList, deletedCount }) {
    const { flash, counts } = usePage().props;
    const { toast } = useAppToast();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'semua');
    const [bank, setBank] = useState(filters.bank || 'semua');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [selectedIds, setSelectedIds] = useState([]);

    // State ConfirmDialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingMitra, setEditingMitra] = useState(null);

    // State untuk Modal Detail Mitra
    const [detailMitra, setDetailMitra] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const openDetailModal = (mitra) => {
        setDetailMitra(mitra);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailMitra(null);
    };

    // State untuk Modal Import Excel Mitra
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const { data: importData, setData: setImportData, post: postImport, processing: processingImport, errors: importErrors, reset: resetImport } = useForm({
        file: null,
        rows: []
    });

    const openImportModal = () => {
        setIsImportModalOpen(true);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setTimeout(() => resetImport(), 300);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "NIK", "Nama Lengkap", "Sobat ID", "No Telepon", "No WhatsApp",
            "Jenis Kelamin", "Tanggal Lahir", "Alamat", "Desa", "Kecamatan",
            "Ijazah Terakhir", "Keahlian", "No Rekening", "Nama Bank"
        ];
        const sampleRow = [
            "3509000000000028", "Hasan Basri", "458217", "081234567890", "081234567890",
            "L", "1990-05-14", "Jl. Mawar No. 5", "Sumbersari", "Sumbersari",
            "S1", "Statistik, Komputer", "1234567890", "BNI"
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
        worksheet['!cols'] = [
            { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 14 }, { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 18 },
            { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 15 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import Mitra");
        XLSX.writeFile(workbook, "Template_Import_Mitra.xlsx");
    };

    const processFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheet = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheet];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                setImportData({ file, rows: jsonData });
            } catch (err) {
                console.error("Gagal membaca file excel:", err);
                setImportData({ file, rows: [] });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;
        postImport(route('mitra.import'), {
            onSuccess: () => closeImportModal()
        });
    };

    // Form for Create & Edit
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nik: '',
        nama_lengkap: '',
        sobat_id: '',
        no_rekening: '',
        nama_bank: '',
        no_telepon: '',
        alamat: '',
        status_aktif: true,
    });

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('mitra.index'), { search, status, bank, per_page: perPage }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('semua');
        setBank('semua');
        setPerPage(20);
        router.get(route('mitra.index'), {}, { preserveState: true });
    };

    const handlePerPageChange = (e) => {
        const val = e.target.value;
        setPerPage(val);
        router.get(route('mitra.index'), { search, status, bank, per_page: val }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingMitra(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (mitra) => {
        clearErrors();
        setEditingMitra(mitra);
        setData({
            nik: mitra.nik,
            nama_lengkap: mitra.nama_lengkap,
            sobat_id: mitra.sobat_id || '',
            no_rekening: mitra.no_rekening || '',
            nama_bank: mitra.nama_bank || '',
            no_telepon: mitra.no_telepon || '',
            alamat: mitra.alamat || '',
            status_aktif: Boolean(mitra.status_aktif),
        });
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingMitra(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMitra) {
            put(route('mitra.update', editingMitra.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('mitra.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (mitraId) => {
        setConfirmConfig({
            title: 'Hapus Data Mitra',
            message: 'Apakah Anda yakin ingin memindahkan data Mitra ini ke Recycle Bin?',
            onConfirm: () => {
                router.delete(route('mitra.destroy', mitraId));
                setConfirmOpen(false);
            },
        });
        setConfirmOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === mitras.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(mitras.data.map((m) => m.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Mitra BPS" />

            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Master Mitra BPS</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Database & direktori mitra statistik Kabupaten Jember</p>
                    </div>

                    <div className="grid grid-cols-1 sm:flex items-center gap-3 w-full md:w-auto">
                        <Link
                            href={route('mitra.recycle-bin')}
                            className="relative bg-[#FF7F00] hover:bg-[#E67300] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md w-full sm:w-auto"
                        >
                            <Trash size={18} /> Recycle Bin
                            {(counts?.recycleBinMitra || deletedCount) > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-gray-800">
                                    {counts?.recycleBinMitra || deletedCount}
                                </span>
                            )}
                        </Link>

                        <button
                            type="button"
                            onClick={openImportModal}
                            className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 border border-emerald-500 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <FileSpreadsheet size={16} /> Import Excel
                        </button>

                        <button
                            onClick={openCreateModal}
                            className="bg-simitra-orange hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={16} /> Tambah Mitra
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row items-end gap-3">
                        {/* Status Filter */}
                        <div className="w-full md:w-44">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status Mitra</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-simitra-orange"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Non-Aktif</option>
                            </select>
                        </div>

                        {/* Bank Filter */}
                        <div className="w-full md:w-44">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Bank</label>
                            <select
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-simitra-orange"
                            >
                                <option value="semua">Semua Bank</option>
                                {banksList.map((b, idx) => (
                                    <option key={idx} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input & Action Buttons */}
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cari</label>
                            <div className="flex items-center gap-2 w-full">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Nama, NIK, atau Sobat ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-simitra-orange"
                                    />
                                    <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-simitra-orange hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shrink-0"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm px-3 py-2 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                                >
                                    <X size={16} /> Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Component */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm min-w-[850px] whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={mitras.data.length > 0 && selectedIds.length === mitras.data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-600 text-simitra-orange focus:ring-simitra-orange"
                                        />
                                    </th>
                                    <th className="p-4">NAMA</th>
                                    <th className="p-4">NIK</th>
                                    <th className="p-4">SOBAT ID</th>
                                    <th className="p-4">NO. TELEPON</th>
                                    <th className="p-4 text-center">STATUS</th>
                                    <th className="p-4 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                                {mitras.data.length > 0 ? (
                                    mitras.data.map((mitra) => (
                                        <tr key={mitra.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(mitra.id)}
                                                    onChange={() => toggleSelect(mitra.id)}
                                                    className="rounded border-gray-300 text-simitra-orange focus:ring-simitra-orange"
                                                />
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                {mitra.nama_lengkap}
                                            </td>
                                            <td className="p-4 font-mono font-medium text-rose-500">
                                                {mitra.nik}
                                            </td>
                                            <td className="p-4 font-mono text-rose-500">
                                                {mitra.sobat_id || '-'}
                                            </td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 font-mono">
                                                {mitra.no_telepon || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full border ${mitra.status_aktif
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800'
                                                        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800'
                                                    }`}>
                                                    {mitra.status_aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => openDetailModal(mitra)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 dark:border-blue-900/50 dark:hover:bg-blue-900/30 dark:text-blue-500 rounded transition"
                                                        title="Detail Mitra"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(mitra)}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 border border-orange-200 dark:border-orange-900/50 dark:hover:bg-orange-900/30 dark:text-orange-500 rounded transition"
                                                        title="Edit Mitra"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mitra.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-500 rounded transition"
                                                        title="Pindahkan ke Recycle Bin"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-400">
                                            Tidak ada data Mitra ditemukan.
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
                                    className={`px-3 py-1 text-xs rounded-md ${link.active
                                            ? 'bg-simitra-orange text-white font-bold'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form Create/Edit */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
                            {editingMitra ? 'Edit Data Mitra' : 'Tambah Mitra Baru'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">NIK (16 Digit)</label>
                                    <input
                                        type="text"
                                        maxLength={16}
                                        value={data.nik}
                                        onChange={(e) => setData('nik', e.target.value)}
                                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    {errors.nik && <span className="text-xs text-red-500 mt-1 block">{errors.nik}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">SOBAT ID</label>
                                    <input
                                        type="text"
                                        value={data.sobat_id}
                                        onChange={(e) => setData('sobat_id', e.target.value)}
                                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                                {errors.nama_lengkap && <span className="text-xs text-red-500 mt-1 block">{errors.nama_lengkap}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Bank</label>
                                    <input
                                        type="text"
                                        placeholder="Mandiri, BNI, BRI, dll"
                                        value={data.nama_bank}
                                        onChange={(e) => setData('nama_bank', e.target.value)}
                                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">No. Rekening</label>
                                    <input
                                        type="text"
                                        value={data.no_rekening}
                                        onChange={(e) => setData('no_rekening', e.target.value)}
                                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">No. Telepon / WhatsApp</label>
                                <input
                                    type="text"
                                    value={data.no_telepon}
                                    onChange={(e) => setData('no_telepon', e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows="2"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="status_aktif"
                                    checked={data.status_aktif}
                                    onChange={(e) => setData('status_aktif', e.target.checked)}
                                    className="rounded border-gray-300 text-simitra-orange focus:ring-simitra-orange"
                                />
                                <label htmlFor="status_aktif" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status Aktif
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 text-sm rounded-md transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-simitra-orange hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-colors"
                                >
                                    {editingMitra ? 'Simpan Perubahan' : 'Tambah Mitra'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Mitra (Read-Only) */}
            {isDetailModalOpen && detailMitra && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-[#D9531E] to-orange-600 p-6 text-white relative">
                            <button
                                type="button"
                                onClick={closeDetailModal}
                                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold uppercase shrink-0 shadow-inner">
                                    {detailMitra.nama_lengkap ? detailMitra.nama_lengkap.substring(0, 2) : 'M'}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl font-black text-white tracking-tight">{detailMitra.nama_lengkap}</h2>
                                        <span className={`px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full tracking-wider ${detailMitra.status_aktif
                                                ? 'bg-emerald-400 text-emerald-950'
                                                : 'bg-red-400 text-red-950'
                                            }`}>
                                            {detailMitra.status_aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-orange-100 font-mono flex-wrap">
                                        <span>NIK: {detailMitra.nik}</span>
                                        <span>•</span>
                                        <span>Sobat ID: {detailMitra.sobat_id || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Grid Section 1: Informasi Kontak & Identitas */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] mb-3 flex items-center gap-2">
                                    <User size={15} /> Identitas & Kontak
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Jenis Kelamin</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                            {detailMitra.jenis_kelamin || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Tanggal Lahir</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {detailMitra.tanggal_lahir || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">No. Telepon</span>
                                        <span className="text-sm font-semibold font-mono text-gray-800 dark:text-gray-200">
                                            {detailMitra.no_telepon || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">No. WhatsApp</span>
                                        <span className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                                            {detailMitra.no_whatsapp || detailMitra.no_telepon || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Section 2: Alamat & Domisili */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] mb-3 flex items-center gap-2">
                                    <MapPin size={15} /> Domisili & Alamat
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                    <div className="sm:col-span-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Alamat Lengkap</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {detailMitra.alamat || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Desa / Kelurahan</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                            {detailMitra.desa || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Kecamatan</span>
                                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400 capitalize">
                                            {detailMitra.kecamatan || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Section 3: Pendidikan & Keahlian */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] mb-3 flex items-center gap-2">
                                    <GraduationCap size={15} /> Pendidikan & Keahlian
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Ijazah Terakhir</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">
                                            {detailMitra.ijazah_terakhir || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Keahlian</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {detailMitra.keahlian || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Section 4: Pembayaran / Bank */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] mb-3 flex items-center gap-2">
                                    <CreditCard size={15} /> Rekening Pembayaran
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Nama Bank</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                                            {detailMitra.nama_bank || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Nomor Rekening</span>
                                        <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {detailMitra.no_rekening || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-xs text-gray-400 italic">Data Mitra BPS Kabupaten Jember</span>
                            <button
                                type="button"
                                onClick={closeDetailModal}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-xl transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Import Excel Mitra */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Data Mitra Excel (.xlsx)</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Unggah kolektif data Mitra Statistik (Upsert NIK)</p>
                                </div>
                            </div>
                            <button onClick={closeImportModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            {/* Structured Error Display */}
                            {importErrors.import && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                                    <AlertTriangle size={16} className="shrink-0 text-red-500" />
                                    <span>{importErrors.import}</span>
                                </div>
                            )}

                            {importErrors.import_list && Array.isArray(importErrors.import_list) && importErrors.import_list.length > 0 && (
                                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs space-y-1.5 max-h-44 overflow-y-auto">
                                    <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                                        <AlertTriangle size={15} />
                                        <span>Gagal Import (Daftar Kesalahan Baris):</span>
                                    </div>
                                    <ul className="list-disc pl-4 space-y-1 text-rose-700 dark:text-rose-300">
                                        {importErrors.import_list.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Info Box Format */}
                            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-xs space-y-2.5 text-blue-900 dark:text-blue-200">
                                <p className="font-bold flex items-center gap-1.5">
                                    <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                                    Ketentuan Format Import Excel:
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-blue-800 dark:text-blue-300 leading-relaxed">
                                    <li>
                                        Header kolom: <span className="font-mono font-bold">NIK, Nama Lengkap, Sobat ID, No Telepon, No WhatsApp, Jenis Kelamin, Tanggal Lahir, Alamat, Desa, Kecamatan, Ijazah Terakhir, Keahlian, No Rekening, Nama Bank</span>
                                    </li>
                                    <li><strong className="text-blue-950 dark:text-white">NIK & Nama Lengkap wajib diisi</strong> (NIK tepat 16 digit angka).</li>
                                    <li>Format Tanggal Lahir: <span className="font-mono text-blue-700 font-bold">YYYY-MM-DD</span>.</li>
                                    <li>System menggunakan mode <strong className="text-emerald-700 dark:text-emerald-400">UPSERT</strong>: NIK yang sudah ada akan otomatis di-update data terbarunya.</li>
                                </ul>

                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3.5 py-2 rounded-lg border border-blue-300 dark:border-blue-700 shadow-xs cursor-pointer transition"
                                >
                                    <Download size={14} /> Download Format Template Excel (.xlsx)
                                </button>
                            </div>

                            {/* Dropzone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${dragActive
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                                        : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-emerald-500 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                    <Upload className="text-emerald-600 dark:text-emerald-400" size={32} />
                                    {importData.file ? (
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">{importData.file.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{(importData.file.size / 1024).toFixed(1)} KB ({importData.rows?.length || 0} baris data)</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Pilih File Excel (.xlsx)</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Drag & drop atau klik untuk memilih file</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeImportModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!importData.file || processingImport}
                                    className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Upload size={16} />
                                    <span>{processingImport ? 'Memproses Import...' : 'Proses Import'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
