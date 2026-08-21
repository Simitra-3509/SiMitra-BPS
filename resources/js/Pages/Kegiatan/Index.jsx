import React, { useState, useRef } from 'react';
import { Head, router, Link, useForm, usePage } from '@inertiajs/react';
import { Search, X, FileSpreadsheet, Plus, Edit, Trash2, Eye, Copy, Info, CheckCircle2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

function Index({ auth, kegiatan, kegiatanCount, filters }) {
    const { flash } = usePage().props;
    const flashMessage = flash?.message || flash?.success;
    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [bulan, setBulan] = useState(filters?.bulan || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [cari, setCari] = useState(filters?.cari || '');

    // State untuk checklist (bulk delete)
    const [selectedIds, setSelectedIds] = useState([]);

    // State untuk modal duplikasi
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    const { data: duplicateData, setData: setDuplicateData, post: postDuplicate, processing: processingDuplicate, errors: errorsDuplicate, reset: resetDuplicate } = useForm({
        tgl_mulai: '',
        tgl_selesai: '',
        status_aktif: 1
    });

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        router.post(route('kegiatan.import'), { file }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                e.target.value = '';
            },
            onError: (errors) => {
                e.target.value = '';
                if (errors.file) {
                    alert(errors.file);
                }
            }
        });
    };

    const openDuplicateModal = (kegiatanItem) => {
        setSelectedKegiatan(kegiatanItem);
        // We will default to empty dates for them to pick
        setDuplicateData({
            tgl_mulai: '',
            tgl_selesai: '',
            status_aktif: 1
        });
        setIsDuplicateModalOpen(true);
    };

    const closeDuplicateModal = () => {
        setIsDuplicateModalOpen(false);
        setTimeout(() => resetDuplicate(), 300);
    };

    const handleDuplicateSubmit = (e) => {
        e.preventDefault();
        postDuplicate(route('kegiatan.duplicate', selectedKegiatan.id), {
            onSuccess: () => closeDuplicateModal()
        });
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('kegiatan.index'),
            { jenis_sbml: jenisSbml, bulan, status, tahun, cari },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setJenisSbml('');
        setBulan('');
        setStatus('');
        setTahun('');
        setCari('');
        router.get(route('kegiatan.index'));
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
            router.delete(route('kegiatan.destroy', id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} kegiatan yang dipilih?`)) {
            router.post(route('kegiatan.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(kegiatan?.data?.map(item => item.id) || []);
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

    const numberFormat = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return (
        <>
            <Head title="Master Kegiatan" />

            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Kegiatan</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola kegiatan survei dan sensus</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept=".xlsx,.xls,.csv" 
                        />
                        <button
                            type="button"
                            onClick={handleImportClick}
                            className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 border border-emerald-500 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition flex items-center gap-2"
                        >
                            <FileSpreadsheet size={16} /> Import Excel
                        </button>

                        <Link
                            href={route('kegiatan.create')}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition flex items-center gap-1.5"
                        >
                            <Plus size={18} /> Tambah Kegiatan
                        </Link>
                    </div>
                </div>

                {/* Flash Success Notification */}
                {flashMessage && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 size={18} />
                        </div>
                        <span className="text-sm font-semibold">{flashMessage}</span>
                    </div>
                )}

                {/* Filter & Search Bar Card */}
                <form onSubmit={handleFilter} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">

                        {/* Filter Jenis SBML */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis SBML</label>
                            <select
                                value={jenisSbml}
                                onChange={(e) => setJenisSbml(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="pendataan">Pendataan</option>
                                <option value="pengolahan">Pengolahan</option>
                            </select>
                        </div>

                        {/* Filter Bulan */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Bulan</option>
                                {namaBulan.map((item, index) => (
                                    <option key={index + 1} value={index + 1}>{item}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Non-Aktif</option>
                            </select>
                        </div>

                        {/* Filter Tahun */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tahun</label>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Tahun</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        {/* Input Cari & Tombol Akses */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cari</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Nama / KRO..."
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-3 py-2 text-sm bg-[#D9531E] text-white font-medium rounded-lg hover:bg-orange-600 transition shrink-0"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1 shrink-0"
                                >
                                    <X size={16} /> Reset
                                </button>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Status Jumlah Data */}
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan <span className="font-semibold text-gray-900 dark:text-gray-200">{kegiatanCount || 0}</span> kegiatan
                </div>

                {/* Tabel Data dari Database */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                        checked={kegiatan?.data?.length > 0 && selectedIds.length === kegiatan.data.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Kegiatan</th>
                                <th className="p-4 text-center">Jenis SBML</th>
                                <th className="p-4">Harga Satuan</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            {kegiatan?.data && kegiatan.data.length > 0 ? (
                                kegiatan.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                            />
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-500 dark:text-gray-400">
                                            {(kegiatan.current_page - 1) * kegiatan.per_page + index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-900 dark:text-white">{item.nama_kegiatan}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.tgl_mulai && item.tgl_selesai ? `${item.tgl_mulai} - ${item.tgl_selesai}` : '01 - 30 September 2026'}
                                                </span>
                                                <span className="text-xs text-orange-600 font-medium mt-0.5">
                                                    KRO: {item.nomor_kro || item.kro || '2026.BMA.001'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-wrap items-center justify-center gap-1">
                                                {(() => {
                                                    const types = new Set();
                                                    (item.detil_kegiatan || item.detilKegiatan || []).forEach(d => {
                                                        if (d.jenis_sbml) types.add(d.jenis_sbml.toLowerCase());
                                                    });
                                                    const typeArr = Array.from(types);
                                                    if (typeArr.length === 0) typeArr.push(item.jenis_kegiatan || 'pendataan');

                                                    return typeArr.map(t => (
                                                        <span
                                                            key={t}
                                                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white ${t === 'pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'
                                                                }`}
                                                        >
                                                            {t === 'pendataan' ? 'Pendataan' : 'Pengolahan'}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    Rp {numberFormat(item.total_anggaran || 0)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Total Anggaran
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.status_aktif !== 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {item.status_aktif !== 0 ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('kegiatan.show', item.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 dark:border-blue-900/50 dark:hover:bg-blue-900/30 dark:text-blue-500 rounded transition"
                                                    title="Lihat Detail Rincian (Show)"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <Link
                                                    href={route('kegiatan.edit', item.id)}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 border border-orange-200 dark:border-orange-900/50 dark:hover:bg-orange-900/30 dark:text-orange-500 rounded transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => openDuplicateModal(item)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 dark:border-blue-900/50 dark:hover:bg-blue-900/30 dark:text-blue-500 rounded transition"
                                                    title="Duplikat"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-500 rounded transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-500">
                                        Tidak ada data kegiatan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {kegiatan?.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan {kegiatan.from || 0} ke {kegiatan.to || 0} dari {kegiatan.total} data
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto">
                            {kegiatan.links.map((link, i) => (
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

                {/* Floating Action Bar untuk Bulk Delete */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium">Data Terpilih</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-500 hover:text-white transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 transition"
                            >
                                <Trash2 size={16} /> Hapus Data
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Duplikat Kegiatan */}
            <Modal show={isDuplicateModalOpen} onClose={closeDuplicateModal} maxWidth="md">
                <form onSubmit={handleDuplicateSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Duplikat Kegiatan {selectedKegiatan?.nama_kegiatan && `- ${selectedKegiatan.nama_kegiatan}`}
                    </h2>

                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p>Fitur ini akan menyalin data kegiatan terpilih. Silahkan sesuaikan waktu pelaksanaan yang baru.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={duplicateData.tgl_mulai}
                                    onChange={(e) => setDuplicateData('tgl_mulai', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    value={duplicateData.tgl_selesai}
                                    onChange={(e) => setDuplicateData('tgl_selesai', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={duplicateData.status_aktif}
                                onChange={(e) => setDuplicateData('status_aktif', parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                                required
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Non-Aktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDuplicateModal}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processingDuplicate}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {processingDuplicate ? 'Menyimpan...' : 'Duplikasi Kegiatan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Manajemen Kegiatan">{page}</AuthenticatedLayout>;

export default Index;