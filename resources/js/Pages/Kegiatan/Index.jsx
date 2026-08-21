import React, { useState, useRef } from 'react';
import { Head, router, Link, useForm, usePage } from '@inertiajs/react';
import { Search, X, FileSpreadsheet, Plus, Edit, Trash2, Eye, Copy, Info, CheckCircle2, Download, Upload, FileText, Settings, Crown, Wrench, ChevronDown, ChevronRight, List } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import * as XLSX from 'xlsx';

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

    // State untuk expand row
    const [expandedRowId, setExpandedRowId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedRowId(prev => prev === id ? null : id);
    };

    // State untuk modal duplikasi
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    // State untuk Modal Import Excel/CSV
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
        const data = [
            ["Kode KRO", "Nama Kegiatan", "Tanggal Mulai", "Tanggal Selesai", "Nama Detil", "Jenis SBML", "Satuan", "Jumlah", "Harga Satuan"],
            ["2026.BMA.001", "Sensus Ekonomi 2026", "2026-09-01", "2026-09-30", "Honor SKLNP", "pendataan", "DOK", 40, 91000],
            ["2026.BMA.001", "Sensus Ekonomi 2026", "2026-09-01", "2026-09-30", "Honor sksppi", "pendataan", "DOK", 60, 75000]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        worksheet['!cols'] = [
            { wch: 18 },
            { wch: 35 },
            { wch: 16 },
            { wch: 16 },
            { wch: 22 },
            { wch: 15 },
            { wch: 12 },
            { wch: 10 },
            { wch: 16 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import Kegiatan");

        XLSX.writeFile(workbook, "Template_Import_Kegiatan.xlsx");
    };

    // Konversi nilai tanggal (JS Date, serial number, atau string) ke format YYYY-MM-DD
    const toDateString = (val) => {
        if (!val && val !== 0) return null;
        // Sudah string format YYYY-MM-DD
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
        // JS Date object (dari cellDates:true)
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        // Excel serial number (angka bulat, misal 46387)
        if (typeof val === 'number' && Number.isInteger(val) && val > 1000) {
            // Konversi Excel serial ke Date (epoch Excel = 1899-12-30)
            const epoch = new Date(1899, 11, 30);
            epoch.setDate(epoch.getDate() + val);
            const y = epoch.getFullYear();
            const m = String(epoch.getMonth() + 1).padStart(2, '0');
            const d = String(epoch.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        // String format lain coba parse
        if (typeof val === 'string' && val.trim()) {
            const parsed = new Date(val);
            if (!isNaN(parsed)) {
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const d = String(parsed.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
        }
        return null;
    };

    // Normalisasi semua kolom tanggal dalam setiap baris hasil parsing Excel
    const normalizeDateFields = (rows) => {
        const dateKeys = ['Tanggal Mulai', 'Tanggal Selesai', 'tanggal mulai', 'tanggal selesai',
                          'tanggal_mulai', 'tanggal_selesai', 'tgl_mulai', 'tgl_selesai'];
        return rows.map(row => {
            const normalized = { ...row };
            dateKeys.forEach(key => {
                if (key in normalized) {
                    normalized[key] = toDateString(normalized[key]);
                }
            });
            return normalized;
        });
    };

    const processFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                // cellDates:true agar serial number Excel otomatis jadi JS Date
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                const normalizedRows = normalizeDateFields(jsonData);
                setImportData({ file, rows: normalizedRows });
            } catch (err) {
                console.error("Gagal membaca file excel:", err);
                setImportData({ file, rows: [] });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
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
        if (file) {
            processFile(file);
        }
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;
        postImport(route('kegiatan.import'), {
            onSuccess: () => closeImportModal()
        });
    };

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
                            onClick={openImportModal}
                            className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 border border-emerald-500 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition flex items-center gap-2 cursor-pointer"
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
                                <th className="p-4 w-8"></th>
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
                                <th className="p-4 text-center">Detil</th>
                                <th className="p-4">Total Anggaran</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            {kegiatan?.data && kegiatan.data.length > 0 ? (
                                kegiatan.data.map((item, index) => {
                                    const isExpanded = expandedRowId === item.id;
                                    const detils = item.detil_kegiatan || item.detilKegiatan || [];
                                    const detilCount = detils.length;

                                    return (
                                        <React.Fragment key={item.id}>
                                            {/* — Main Row — */}
                                            <tr
                                                className={`cursor-pointer transition-colors ${
                                                    isExpanded
                                                        ? 'bg-orange-50 dark:bg-orange-900/10'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                                onClick={() => toggleExpand(item.id)}
                                            >
                                                {/* Chevron */}
                                                <td className="pl-4 pr-1 py-4 text-gray-400 dark:text-gray-500">
                                                    {isExpanded
                                                        ? <ChevronDown size={16} className="text-orange-500" />
                                                        : <ChevronRight size={16} />}
                                                </td>

                                                {/* Checkbox */}
                                                <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                    />
                                                </td>

                                                {/* No */}
                                                <td className="p-4 text-center font-medium text-gray-500 dark:text-gray-400">
                                                    {(kegiatan.current_page - 1) * kegiatan.per_page + index + 1}
                                                </td>

                                                {/* Kegiatan */}
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-gray-900 dark:text-white">{item.nama_kegiatan}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.tanggal_mulai && item.tanggal_selesai
                                                                ? `${item.tanggal_mulai} - ${item.tanggal_selesai}`
                                                                : (item.tgl_mulai && item.tgl_selesai
                                                                    ? `${item.tgl_mulai} - ${item.tgl_selesai}`
                                                                    : '-')}
                                                        </span>
                                                        <span className="text-xs text-orange-600 font-medium mt-0.5">
                                                            KRO: {item.kode_kegiatan || item.nomor_kro || item.kro || '-'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Detil Badge */}
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        detilCount > 0
                                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>
                                                        <List size={11} />
                                                        {detilCount} Detil
                                                    </span>
                                                </td>

                                                {/* Total Anggaran */}
                                                <td className="p-4">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        Rp {numberFormat(item.total_anggaran || 0)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        item.status_aktif !== 0
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {item.status_aktif !== 0 ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </td>

                                                {/* Aksi — Edit, Duplicate, Delete (NO Eye) */}
                                                <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('kegiatan.edit', item.id)}
                                                            className="p-1.5 text-orange-600 hover:bg-orange-50 border border-orange-200 dark:border-orange-900/50 dark:hover:bg-orange-900/30 dark:text-orange-500 rounded transition"
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDuplicateModal(item); }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 dark:border-blue-900/50 dark:hover:bg-blue-900/30 dark:text-blue-500 rounded transition"
                                                            title="Duplikat"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-500 rounded transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* — Expand Drawer Row — */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                                                    <td colSpan="8" className="px-0 py-0">
                                                        <div className="border-t border-orange-200 dark:border-orange-800/50">
                                                            {detilCount === 0 ? (
                                                                <div className="px-10 py-5 text-sm text-gray-400 dark:text-gray-500 italic flex items-center gap-2">
                                                                    <List size={14} />
                                                                    Belum ada detil belanja untuk kegiatan ini.
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="overflow-y-auto"
                                                                    style={{ maxHeight: detilCount > 8 ? '320px' : 'none' }}
                                                                >
                                                                    <table className="w-full text-xs">
                                                                        <thead className="sticky top-0 bg-orange-50 dark:bg-orange-950/40 border-b border-orange-200 dark:border-orange-800/40">
                                                                            <tr>
                                                                                <th className="px-4 py-2.5 text-left font-bold text-gray-600 dark:text-gray-300 w-8">No</th>
                                                                                <th className="px-4 py-2.5 text-left font-bold text-gray-600 dark:text-gray-300">Nama Detil</th>
                                                                                <th className="px-4 py-2.5 text-center font-bold text-gray-600 dark:text-gray-300">Jenis SBML</th>
                                                                                <th className="px-4 py-2.5 text-center font-bold text-gray-600 dark:text-gray-300">Satuan</th>
                                                                                <th className="px-4 py-2.5 text-right font-bold text-gray-600 dark:text-gray-300">Jumlah</th>
                                                                                <th className="px-4 py-2.5 text-right font-bold text-gray-600 dark:text-gray-300">Harga Satuan</th>
                                                                                <th className="px-4 py-2.5 text-right font-bold text-gray-600 dark:text-gray-300">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                                            {detils.map((d, di) => (
                                                                                <tr key={d.id || di} className="hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition">
                                                                                    <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 text-center">{di + 1}</td>
                                                                                    <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{d.nama_detil}</td>
                                                                                    <td className="px-4 py-2.5 text-center">
                                                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white ${
                                                                                            (d.jenis_sbml || '').toLowerCase() === 'pendataan'
                                                                                                ? 'bg-[#F26522]'
                                                                                                : 'bg-[#3dbcc9]'
                                                                                        }`}>
                                                                                            {d.jenis_sbml || '-'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-400">{d.satuan || '-'}</td>
                                                                                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{numberFormat(d.jumlah || 0)}</td>
                                                                                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">Rp {numberFormat(d.harga_satuan || 0)}</td>
                                                                                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">Rp {numberFormat((d.jumlah || 0) * (d.harga_satuan || 0))}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot className="border-t-2 border-orange-200 dark:border-orange-800/50 bg-orange-50/60 dark:bg-orange-950/30">
                                                                            <tr>
                                                                                <td colSpan="6" className="px-4 py-2.5 text-right font-bold text-gray-700 dark:text-gray-300 text-xs">Total Anggaran Kegiatan:</td>
                                                                                <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">Rp {numberFormat(item.total_anggaran || 0)}</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400 dark:text-gray-500">
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

            {/* Modal Import Excel / CSV */}
            <Modal show={isImportModalOpen} onClose={closeImportModal} maxWidth="lg">
                <form onSubmit={handleImportSubmit} className="bg-[#182232] text-white p-6 rounded-2xl shadow-2xl border border-gray-700/60 relative space-y-5">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-xl">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Import Kegiatan Excel</h2>
                                <p className="text-xs text-gray-400">Unggah data kolektif kegiatan survei dan sensus BPS</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={closeImportModal}
                            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Blue Info Box */}
                    <div className="bg-[#132238] border border-blue-800/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                            <FileText size={16} />
                            <span>Ketentuan Format File Excel (.xlsx):</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside leading-relaxed pl-1">
                            <li>
                                Format kolom header: <span className="font-mono text-blue-300 font-bold">Kode KRO, Nama Kegiatan, Tanggal Mulai, Tanggal Selesai, Nama Detil, Jenis SBML, Satuan, Jumlah, Harga Satuan</span>
                            </li>
                            <li>
                                Nilai Jenis SBML: <span className="font-bold text-white">pendataan atau pengolahan</span>
                            </li>
                            <li>
                                <span className="font-bold text-white">Format Tanggal:</span> YYYY-MM-DD (contoh: <span className="font-mono text-blue-300">2026-09-01</span>).
                            </li>
                        </ul>

                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-600/60 text-blue-300 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                        >
                            <Download size={14} /> Download Format Template Excel (.xlsx)
                        </button>
                    </div>

                    {/* File Dropzone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                            dragActive ? 'border-emerald-400 bg-emerald-950/20' : 'border-gray-700/80 bg-gray-900/40 hover:border-emerald-500/70 hover:bg-gray-900/70'
                        }`}
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                            <Upload className="text-emerald-500" size={32} />
                            {importData.file ? (
                                <div className="space-y-0.5">
                                    <span className="text-sm font-bold text-emerald-400 block">{importData.file.name}</span>
                                    <span className="text-xs text-gray-400">{(importData.file.size / 1024).toFixed(1)} KB ({importData.rows?.length || 0} baris data)</span>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-bold text-emerald-400">Pilih File Excel (.xlsx / .xls)</span>
                                    <span className="text-xs text-gray-400">Format didukung: .xlsx, .xls, .csv</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeImportModal}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!importData.file || processingImport}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Upload size={16} />
                            <span>{processingImport ? 'Memproses...' : 'Proses Import'}</span>
                        </button>
                    </div>

                </form>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Manajemen Kegiatan">{page}</AuthenticatedLayout>;

export default Index;