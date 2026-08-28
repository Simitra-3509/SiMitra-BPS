import React, { useState, Fragment } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { Search, X, FileSpreadsheet, Plus, Edit, Trash2, Eye, Banknote, AlertTriangle, ChevronLeft, ChevronRight, Calendar, CheckCircle2, Upload, Download, FileText, Lock, Unlock } from 'lucide-react';
import AuthenticatedLayout, { useAppToast } from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import * as XLSX from 'xlsx';

const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function Index({ auth, penugasan, kegiatanTanpaMitra, semuaKegiatan, tahunList = [], statusPeriode, filters }) {
    const { flash } = usePage().props;
    const { toast } = useAppToast();
    const flashMessage = flash?.message || flash?.success;

    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [kegiatanId, setKegiatanId] = useState(filters?.kegiatan_id || '');
    const [bulan, setBulan] = useState(filters?.bulan || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [search, setSearch] = useState(filters?.search || '');
    const [showBanner, setShowBanner] = useState(true);
    const [showAllKegiatan, setShowAllKegiatan] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [mitraSearch, setMitraSearch] = useState('');

    const userRole = (auth?.user?.role || usePage().props?.auth?.user?.role || '').toLowerCase();
    const canManagePenugasan = ['operator', 'admin', 'administrator'].includes(userRole);
    const isPPK = userRole === 'ppk';

    const activeBulan = statusPeriode?.bulan || (bulan ? parseInt(bulan) : new Date().getMonth() + 1);
    const activeTahun = statusPeriode?.tahun || (tahun ? parseInt(tahun) : new Date().getFullYear());
    const isPeriodLocked = statusPeriode?.is_locked || false;

    const handleToggleKunci = (targetBulan, targetTahun, isCurrentlyLocked) => {
        const routeName = isCurrentlyLocked ? 'periode.buka' : 'periode.kunci';
        const actionText = isCurrentlyLocked ? 'membuka kunci' : 'mengunci';
        
        setConfirmConfig({
            title: isCurrentlyLocked ? 'Buka Kunci Periode' : 'Kunci Periode Pengisian',
            message: `Apakah Anda yakin ingin ${actionText} pengisian penugasan bulan ${namaBulan[targetBulan - 1]} ${targetTahun}?`,
            confirmText: isCurrentlyLocked ? 'Ya, Buka Kunci' : 'Ya, Kunci Periode',
            variant: isCurrentlyLocked ? 'unlock' : 'lock',
            onConfirm: () => {
                router.post(route(routeName), {
                    bulan: targetBulan,
                    tahun: targetTahun
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Periode ${namaBulan[targetBulan - 1]} ${targetTahun} berhasil di-${isCurrentlyLocked ? 'buka' : 'kunci'}.`);
                        setConfirmOpen(false);
                    }
                });
            }
        });
        setConfirmOpen(true);
    };

    // State ConfirmDialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });

    // State for the Assign Mitra modal
    const [assignModal, setAssignModal] = useState({ isOpen: false, kegiatan: null });

    // State for Import Excel Penugasan Mitra modal
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
        const headers = ["Kode KRO", "Nama Detil", "Sobat ID", "Bulan", "Tahun", "Kuota Target"];
        const sampleRow = ["2026.BMA.001", "Honor SKLNP", "276426", "Agustus", "2026", 40];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
        worksheet['!cols'] = [
            { wch: 22 },
            { wch: 25 },
            { wch: 16 },
            { wch: 16 },
            { wch: 12 },
            { wch: 15 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import Penugasan");
        XLSX.writeFile(workbook, "Template_Import_Penugasan_Mitra.xlsx");
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (file) => {
        if (!file) return;
        setImportData('file', file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
                setImportData('rows', data);
            } catch (err) {
                toast.error('Gagal membaca file Excel. Pastikan format file valid.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleInputFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileChange(file);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.rows || importData.rows.length === 0) {
            toast.error('Pilih file Excel terlebih dahulu yang berisi data penugasan.');
            return;
        }

        postImport(route('penugasan.import'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Data Penugasan Mitra berhasil di-import!');
                closeImportModal();
            },
            onError: (errs) => {
                toast.error('Terjadi kesalahan saat meng-import data penugasan.');
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === (penugasan?.data?.length || 0)) {
            setSelectedIds([]);
        } else {
            setSelectedIds(penugasan?.data?.map(item => item.id) || []);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: 'Hapus Penugasan Terpilih',
            message: `Apakah Anda yakin ingin memindahkan ${selectedIds.length} data penugasan ke Recycle Bin?`,
            confirmText: 'Ya, Hapus Terpilih',
            variant: 'danger',
            onConfirm: () => {
                router.post(route('penugasan.bulk-destroy'), { ids: selectedIds }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`${selectedIds.length} penugasan mitra berhasil dipindahkan ke Recycle Bin.`);
                        setSelectedIds([]);
                        setConfirmOpen(false);
                    }
                });
            }
        });
        setConfirmOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            title: 'Hapus Penugasan',
            message: 'Apakah Anda yakin ingin memindahkan data penugasan ini ke Recycle Bin?',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
            onConfirm: () => {
                router.delete(route('penugasan.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Penugasan mitra berhasil dipindahkan ke Recycle Bin.');
                        setConfirmOpen(false);
                    }
                });
            }
        });
        setConfirmOpen(true);
    };

    const handleFilter = () => {
        router.get(route('penugasan.index'), {
            jenis_sbml: jenisSbml,
            kegiatan_id: kegiatanId,
            bulan: bulan,
            tahun: tahun,
            search: search,
        }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setJenisSbml('');
        setKegiatanId('');
        setBulan('');
        setTahun('');
        setSearch('');
        router.get(route('penugasan.index'));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleFilter();
    };

    return (
        <>
            <Head title="Penugasan Mitra" />

            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Penugasan Mitra</h1>
                            {/* Widget Status Periode */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${isPeriodLocked
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                }`}>
                                {isPeriodLocked ? <Lock size={13} /> : <Unlock size={13} />}
                                Periode {namaBulan[activeBulan - 1]} {activeTahun}: {isPeriodLocked ? 'TERKUNCI' : 'TERBUKA'}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola alokasi kuota penugasan mitra per kegiatan & bulan anggaran</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Tombol Kunci Periode Khusus PPK Saja */}
                        {isPPK && (
                            <button
                                type="button"
                                onClick={() => handleToggleKunci(activeBulan, activeTahun, isPeriodLocked)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${isPeriodLocked
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                                    }`}
                                title={isPeriodLocked ? 'Klik untuk membuka kunci periode ini' : 'Klik untuk mengunci periode ini'}
                            >
                                {isPeriodLocked ? <Unlock size={16} /> : <Lock size={16} />}
                                {isPeriodLocked ? 'Buka Kunci Periode' : 'Kunci Periode Bulan Ini'}
                            </button>
                        )}

                        {/* Tombol Tambah Penugasan & Import Khusus Operator & Admin saat TERBUKA */}
                        {canManagePenugasan && !isPeriodLocked && (
                            <>
                                <button
                                    type="button"
                                    onClick={openImportModal}
                                    className="px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    <FileSpreadsheet size={16} /> Import Excel
                                </button>
                                <Link
                                    href={route('penugasan.create')}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#0080FF] hover:bg-[#0066CC] rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                                >
                                    <Plus size={16} /> Tambah Penugasan
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Warning Banner saat TERKUNCI */}
                {isPeriodLocked && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-xl shadow-xs flex items-center gap-3">
                        <Lock className="shrink-0 text-amber-600 dark:text-amber-400" size={20} />
                        <div>
                            <p className="font-bold text-sm">Periode Pengisian Terkunci</p>
                            <p className="text-xs opacity-90">Pengisian dan pengeditan data penugasan bulan {namaBulan[activeBulan - 1]} {activeTahun} sedang dikunci oleh PPK. Hubungi PPK jika diperlukan pembukaan kunci untuk penyesuaian data.</p>
                        </div>
                    </div>
                )}

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
                                    <option key={kg.id} value={kg.id}>
                                        {kg.kode_kegiatan ? `${kg.kode_kegiatan} - ` : ''}{kg.nama_kegiatan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bulan */}
                        <div className="flex flex-col gap-1 min-w-[130px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">Semua Bulan</option>
                                {namaBulan.map((name, idx) => (
                                    <option key={idx + 1} value={idx + 1}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tahun */}
                        <div className="flex flex-col gap-1 min-w-[110px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Tahun</label>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">Semua Tahun</option>
                                {(tahunList.length > 0 ? tahunList : [2025, 2026, 2027]).map((yr) => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                        </div>


                        {/* Search */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Cari</label>
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Nama/Sobat ID mitra, nama kegiatan..."
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
                                onClick={handleResetFilter}
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
                                    <th className="p-4">Kegiatan & Detil</th>
                                    <th className="p-4">Periode</th>
                                    <th className="p-4">Mitra</th>
                                    <th className="p-4 text-center">Kuota Target</th>
                                    <th className="p-4 text-right">Total Honor</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                 {penugasan?.data && penugasan.data.length > 0 ? (
                                    penugasan.data.map((item, index) => {
                                        const nomorUrut = (penugasan.current_page - 1) * penugasan.per_page + index + 1;
                                        const detilObj = item.detil_kegiatan || item.detilKegiatan;

                                        return (
                                            <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded text-orange-600" /></td>
                                                <td className="p-4 text-center font-medium text-gray-400 dark:text-gray-500">{nomorUrut}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="font-bold text-gray-900 dark:text-white leading-snug">
                                                            {item.kegiatan?.nama_kegiatan ?? '-'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {detilObj?.nama_detil ?? 'Semua Detil'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                                    {item.bulan && item.tahun
                                                        ? `${namaBulan[item.bulan - 1] || item.bulan} ${item.tahun}`
                                                        : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {item.mitra?.nama_lengkap ?? '-'}
                                                        </p>
                                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                            Sobat ID: {item.mitra?.sobat_id ?? '-'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-mono font-bold text-gray-800 dark:text-gray-200">
                                                    {item.kuota_target ?? 0} {(detilObj?.satuan ?? '').toUpperCase()}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    Rp {new Intl.NumberFormat('id-ID').format(item.total_honor ?? 0)}
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
                                                    {canManagePenugasan && !isPeriodLocked ? (
                                                        <div className="flex items-center justify-center gap-1.5">
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
                                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-500 rounded-lg transition inline-flex items-center justify-center"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 font-medium italic flex items-center justify-center gap-1">
                                                            {isPeriodLocked ? <Lock size={12} /> : null} {isPeriodLocked ? 'Terkunci' : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-gray-400 dark:text-gray-500">
                                            Tidak ada data penugasan yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {penugasan?.data && penugasan.data.length > 0 && (
                                <tfoot className="bg-gray-50 dark:bg-gray-700/80 border-t-2 border-gray-200 dark:border-gray-600 font-bold text-gray-900 dark:text-white text-sm">
                                    <tr>
                                        <td colSpan="6" className="p-4 text-right">
                                            Total Keseluruhan (Halaman Ini):
                                        </td>
                                        <td className="p-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                            Rp {new Intl.NumberFormat('id-ID').format(
                                                penugasan.data.reduce((sum, item) => sum + (parseFloat(item.total_honor) || 0), 0)
                                            )}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            )}
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
                                            placeholder="Ketik nama atau Sobat ID mitra..."
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

                {/* Modal Import Excel Penugasan Mitra */}
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Penugasan Mitra (.xlsx)</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Unggah kolektif penugasan mitra (Mode Upsert)</p>
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
                                        Ketentuan Format Import Excel Penugasan:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-blue-800 dark:text-blue-300 leading-relaxed">
                                        <li>
                                            Header kolom wajib: <span className="font-mono font-bold">Kode KRO, Nama Detil, Sobat ID, Bulan, Tahun, Kuota Target</span>
                                        </li>
                                        <li>Kolom <strong className="text-blue-950 dark:text-white">Bulan</strong> diisi teks nama bulan Indonesia (contoh: <span className="font-mono text-blue-700 font-bold">Agustus</span>).</li>
                                        <li><strong className="text-blue-950 dark:text-white">Kode KRO, Nama Detil, dan Sobat ID</strong> harus sudah terdaftar di sistem.</li>
                                        <li>System menggunakan mode <strong className="text-emerald-700 dark:text-emerald-400">UPSERT</strong>: Kombinasi (Detil + Mitra + Bulan + Tahun) yang sudah ada akan otomatis di-update kuota targetnya.</li>
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
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                cancelText={confirmConfig.cancelText || 'Batal'}
                variant={confirmConfig.variant || 'danger'}
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
