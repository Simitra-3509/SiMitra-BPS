import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, X, Trash } from 'lucide-react';

export default function Index({ mitras, filters, banksList, deletedCount }) {
    const { flash, counts } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'semua');
    const [bank, setBank] = useState(filters.bank || 'semua');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [selectedIds, setSelectedIds] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingMitra, setEditingMitra] = useState(null);

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
        if (confirm('Apakah Anda yakin ingin memindahkan data Mitra ini ke Recycle Bin?')) {
            router.delete(route('mitra.destroy', mitraId));
        }
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
        <AuthenticatedLayout header="Master Mitra">
            <Head title="Master Mitra - SIMITRA LITE" />

            <div className="space-y-6">
                {/* Flash Message */}
                {flash?.message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {flash.message}
                    </div>
                )}

                {/* Page Title & Action Buttons Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Mitra</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola data mitra BPS Kabupaten Jember</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link
                            href={route('mitra.recycle-bin')}
                            className="relative border border-yellow-500/80 text-yellow-500 hover:bg-yellow-500/10 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <Trash size={16} /> Recycle Bin
                            {(counts?.recycleBinMitra || deletedCount) > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {counts?.recycleBinMitra || deletedCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={openCreateModal}
                            className="bg-simitra-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                        >
                            <Plus size={18} /> Tambah Mitra
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end w-full">
                        {/* Filter Status */}
                        <div className="w-full md:w-48 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-simitra-orange"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        {/* Filter Bank */}
                        <div className="w-full md:w-48 shrink-0">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bank</label>
                            <select
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-simitra-orange"
                            >
                                <option value="semua">Semua Bank</option>
                                {banksList?.map((b, idx) => (
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

                {/* Info & Per-Page Row */}
                <div className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-300 px-1 gap-2">
                    <div className="flex items-center gap-2">
                        <span>Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-2 pr-8 py-1 text-sm font-medium focus:ring-simitra-orange"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="semua">Semua</option>
                        </select>
                        <span>data</span>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">
                        Menampilkan <strong className="text-gray-900 dark:text-white">{mitras.from || 0}-{mitras.to || 0}</strong> dari <strong className="text-gray-900 dark:text-white">{mitras.total}</strong> mitra
                    </div>
                </div>

                {/* Table Component */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-simitra-dark text-white uppercase text-xs font-bold tracking-wider border-b border-gray-700">
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
                                    <th className="p-4">REKENING</th>
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
                                            <td className="p-4">
                                                <div className="font-mono text-gray-900 dark:text-gray-100 font-medium">
                                                    {mitra.no_rekening || '-'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {mitra.nama_bank || ''}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200">
                                                {mitra.no_telepon || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                                    mitra.status_aktif
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800'
                                                        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800'
                                                }`}>
                                                    {mitra.status_aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(mitra)}
                                                        className="border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white p-1.5 rounded transition-colors"
                                                        title="Edit Mitra"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mitra.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors"
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
                                        <td colSpan="8" className="p-8 text-center text-gray-400">
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
        </AuthenticatedLayout>
    );
}
