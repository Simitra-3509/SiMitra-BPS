import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, X, FileSpreadsheet, Plus, Edit, Trash2, Eye, Banknote, AlertTriangle, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAppToast } from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';

const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function Index({ penugasan, kegiatanTanpaMitra, semuaKegiatan, filters }) {
    const { flash } = usePage().props;
    const { toast } = useAppToast();
    const flashMessage = flash?.message || flash?.success;

    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [kegiatanId, setKegiatanId] = useState(filters?.kegiatan_id || '');
    const [statusHonor, setStatusHonor] = useState(filters?.status_honor || '');
    const [search, setSearch] = useState(filters?.search || '');
    const [showBanner, setShowBanner] = useState(true);
    const [showAllKegiatan, setShowAllKegiatan] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // State ConfirmDialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });

    // State for the Assign Mitra modal
    const [assignModal, setAssignModal] = useState({ isOpen: false, kegiatan: null });
    const [mitraSearch, setMitraSearch] = useState('');

    const handleFilter = () => {
        router.get(route('penugasan.index'), {
            jenis_sbml: jenisSbml,
            kegiatan_id: kegiatanId,
            status_honor: statusHonor,
            search,
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setJenisSbml('');
        setKegiatanId('');
        setStatusHonor('');
        setSearch('');
        router.get(route('penugasan.index'));
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            title: 'Hapus Penugasan',
            message: 'Apakah Anda yakin ingin menghapus penugasan ini? Data akan dipindahkan ke Recycle Bin.',
            onConfirm: () => {
                router.delete(route('penugasan.destroy', id));
                setConfirmOpen(false);
            },
        });
        setConfirmOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: `Hapus ${selectedIds.length} Penugasan`,
            message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} penugasan yang dipilih?`,
            onConfirm: () => {
                router.post(route('penugasan.bulk-destroy'), { ids: selectedIds }, {
                    onSuccess: () => { setSelectedIds([]); setConfirmOpen(false); },
                });
            },
        });
        setConfirmOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === penugasan.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(penugasan.data.map(item => item.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleFilter();
    };

    return (
        <>
            <Head title="Penugasan Mitra" />

            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Penugasan Mitra</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola penugasan mitra ke kegiatan</p>
                    </div>
                    <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#00AA55] hover:bg-[#008844] rounded-lg transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer w-full sm:w-auto"
                        >
                            <FileSpreadsheet size={18} /> Import Excel
                        </button>
                        <Link
                            href={route('penugasan.create')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#0080FF] hover:bg-[#0066CC] rounded-lg transition flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
                        >
                            <Plus size={18} /> Tambah Penugasan
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

                {/* Warning Banner: Kegiatan tanpa mitra */}
                {showBanner && kegiatanTanpaMitra?.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 relative overflow-hidden shadow-sm">
                        {/* Decorative Icon */}
                        <div className="absolute -right-6 -top-6 text-amber-500/10 pointer-events-none">
                            <AlertTriangle size={120} />
                        </div>

                        <button
                            onClick={() => setShowBanner(false)}
                            className="absolute top-4 right-4 p-1.5 text-amber-500 hover:bg-amber-100 rounded-lg transition z-10"
                            title="Tutup"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative z-10 flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-100 rounded-lg text-amber-600 shadow-sm border border-amber-200/50">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-amber-900 tracking-tight">
                                        Perhatian: {kegiatanTanpaMitra.length} Kegiatan Belum Memiliki Mitra
                                    </h3>
                                    <p className="text-sm text-amber-700 mt-0.5">
                                        Kegiatan di bawah ini sudah berstatus aktif namun belum ada mitra yang ditugaskan.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                {(showAllKegiatan ? kegiatanTanpaMitra : kegiatanTanpaMitra.slice(0, 3)).map((kg) => (
                                    <div key={kg.id} className="flex items-center bg-white dark:bg-gray-800 border border-amber-200/70 dark:border-amber-700/50 rounded-xl p-2.5 pr-3 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500 transition-all group">
                                        <div className="flex flex-col ml-1 mr-6">
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                                                {kg.nama_kegiatan}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`w-fit px-2 py-0.5 text-[10px] font-bold rounded flex items-center uppercase tracking-wide text-white ${(kg.jenis_sbml || kg.jenis_kegiatan) === 'pendataan'
                                                        ? 'bg-[#F26522]'
                                                        : 'bg-[#3dbcc9]'
                                                    }`}>
                                                    {(kg.jenis_sbml || kg.jenis_kegiatan) === 'pendataan' ? 'Pendataan' : 'Pengolahan'}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                    <Calendar size={10} className="text-gray-400 dark:text-gray-500" />
                                                    {kg.tgl_mulai && kg.tgl_selesai 
                                                        ? `${kg.tgl_mulai} s/d ${kg.tgl_selesai}`
                                                        : '01 Jan - 31 Jan 2026'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-auto pl-4 border-l border-gray-100 dark:border-gray-700 flex items-center">
                                            <button
                                                onClick={() => setAssignModal({ isOpen: true, kegiatan: kg })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg hover:bg-[#D9531E] hover:text-white dark:hover:bg-[#D9531E] dark:hover:text-white hover:border-[#D9531E] transition-colors"
                                            >
                                                <Plus size={14} /> Tugaskan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!showAllKegiatan && kegiatanTanpaMitra.length > 3 && (
                                    <button
                                        onClick={() => setShowAllKegiatan(true)}
                                        className="flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700/50 border-dashed rounded-xl px-6 py-2 transition-all group min-h-[60px]"
                                    >
                                        <span className="text-lg font-bold text-amber-600 group-hover:scale-110 transition-transform">+{kegiatanTanpaMitra.length - 3}</span>
                                        <span className="text-xs font-semibold text-amber-700">Lainnya</span>
                                    </button>
                                )}
                                {showAllKegiatan && kegiatanTanpaMitra.length > 3 && (
                                    <button
                                        onClick={() => setShowAllKegiatan(false)}
                                        className="flex items-center justify-center bg-white/50 dark:bg-gray-800/50 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700/50 border-dashed rounded-xl px-5 py-2 text-sm font-semibold text-amber-700 dark:text-amber-500 transition-all min-h-[60px]"
                                    >
                                        Sembunyikan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Jenis SBML */}
                        <div className="flex flex-col gap-1 min-w-[150px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Jenis SBML</label>
                            <select
                                value={jenisSbml}
                                onChange={(e) => setJenisSbml(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="pendataan">Pendataan</option>
                                <option value="pengolahan">Pengolahan</option>
                            </select>
                        </div>

                        {/* Kegiatan */}
                        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Kegiatan</label>
                            <select
                                value={kegiatanId}
                                onChange={(e) => setKegiatanId(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">Semua Kegiatan</option>
                                {semuaKegiatan?.map((kg) => (
                                    <option key={kg.id} value={kg.id}>{kg.nama_kegiatan}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Honor */}
                        <div className="flex flex-col gap-1 min-w-[160px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Status Honor</label>
                            <select
                                value={statusHonor}
                                onChange={(e) => setStatusHonor(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">Semua Status</option>
                                <option value="sudah">Sudah Input</option>
                                <option value="belum">Belum Input</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Cari</label>
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Nama/NIK mitra, nama kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pb-0.5">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition flex items-center gap-1.5"
                            >
                                <Search size={14} /> Cari
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5"
                            >
                                <X size={14} /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Total count */}
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                    Total: <span className="font-semibold text-gray-900 dark:text-gray-200">{penugasan?.total ?? 0}</span> penugasan
                </div>

                {/* Tabel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-10 text-center"><input type="checkbox" checked={selectedIds.length === penugasan.data?.length && penugasan.data.length > 0} onChange={toggleSelectAll} className="rounded text-orange-600 focus:ring-orange-500" /></th>
                                <th className="p-4 w-10 text-center">No</th>
                                <th className="p-4">Kegiatan</th>
                                <th className="p-4">Mitra</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Honorarium</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            {penugasan?.data && penugasan.data.length > 0 ? (
                                penugasan.data.map((item, index) => {
                                    const totalHonor = item.honoraria?.reduce((sum, h) => sum + (h.jumlah_honor ?? 0), 0) ?? 0;
                                    const sudahInput = item.honoraria?.length > 0;
                                    const nomorUrut = (penugasan.current_page - 1) * penugasan.per_page + index + 1;

                                    return (
                                        <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded text-orange-600" /></td>
                                            <td className="p-4 text-center font-medium text-gray-400 dark:text-gray-500">{nomorUrut}</td>
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-900 dark:text-white leading-snug">
                                                    {item.kegiatan?.nama_kegiatan ?? '-'}
                                                    {item.bulan && item.tahun && (
                                                        <span className="text-gray-500 dark:text-gray-400 font-medium text-xs ml-1">
                                                            ({namaBulan[item.bulan - 1]} {item.tahun})
                                                        </span>
                                                    )}
                                                </p>
                                                {(item.kegiatan?.jenis_sbml || item.kegiatan?.jenis_kegiatan) && (
                                                        <span className={`mt-1.5 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white ${(item.kegiatan.jenis_sbml || item.kegiatan.jenis_kegiatan) === 'pendataan'
                                                            ? 'bg-[#F26522]'
                                                            : 'bg-[#3dbcc9]'
                                                        }`}>
                                                        {(item.kegiatan.jenis_sbml || item.kegiatan.jenis_kegiatan) === 'pendataan' ? 'Pendataan' : 'Pengolahan'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.mitra?.nama ?? '-'}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.mitra?.nik ?? ''}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.kegiatan?.status_aktif
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {item.kegiatan?.status_aktif ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {sudahInput ? (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                                            ✓ Sudah Input
                                                        </span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Rp {totalHonor.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        ⏳ Belum Input
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('honorarium.create', { penugasan_id: item.id })}
                                                        title="Input Honor"
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:text-emerald-500 rounded-lg transition flex items-center justify-center"
                                                    >
                                                        <Banknote size={15} />
                                                    </Link>
                                                    <Link
                                                        href={route('penugasan.edit', item.id)}
                                                        title="Edit"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-blue-500 rounded-lg transition inline-flex items-center justify-center"
                                                    >
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Hapus"
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400 dark:text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📋</span>
                                            <span className="text-sm">Tidak ada data penugasan yang ditemukan.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>

                    {/* Pagination */}
                    {penugasan?.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {penugasan.from || 0} ke {penugasan.to || 0} dari {penugasan.total} data
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {penugasan.links.map((link, i) => (
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
                </div>

                {/* Assign Mitra Modal */}
                {assignModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Tugaskan Mitra
                                </h3>
                                <button
                                    onClick={() => {
                                        setAssignModal({ isOpen: false, kegiatan: null });
                                        setMitraSearch('');
                                    }}
                                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 space-y-4">
                                <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                                    <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">
                                        Kegiatan Terpilih
                                    </p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                                        {assignModal.kegiatan?.nama_kegiatan}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Cari Mitra <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">(Live Search)</span>
                                    </label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            value={mitraSearch}
                                            onChange={(e) => setMitraSearch(e.target.value)}
                                            placeholder="Ketik nama atau NIK mitra..."
                                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition"
                                        />
                                    </div>
                                </div>

                                {/* Placeholder for List */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-48 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 p-4 text-center space-y-2">
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-sm">
                                        <Search size={24} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-sm font-medium">Belum ada data mitra.</p>
                                    <p className="text-xs">Daftar mitra akan muncul di sini setelah pencarian dilakukan.</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setAssignModal({ isOpen: false, kegiatan: null });
                                        setMitraSearch('');
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Tutup
                                </button>
                                <button
                                    disabled
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#D9531E] rounded-lg opacity-50 cursor-not-allowed flex items-center gap-1.5"
                                >
                                    <Plus size={16} /> Tugaskan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Action Bar untuk Bulk Delete */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1B2335] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
                            <span className="w-6 h-6 bg-[#F26522] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium">Data Terpilih</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-2 py-2 text-sm font-medium text-gray-300 dark:text-gray-500 hover:text-white transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 text-sm font-medium bg-[#ef4444] hover:bg-red-600 rounded-lg flex items-center gap-2 transition shadow-sm"
                            >
                                <Trash2 size={16} /> Hapus Data
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
        </>
    );
}

Index.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Penugasan Mitra">
        {page}
    </AuthenticatedLayout>
);

export default Index;
