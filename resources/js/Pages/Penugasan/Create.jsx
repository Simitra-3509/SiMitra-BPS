import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    UserPlus, 
    Search, 
    Trash2, 
    Copy, 
    Info, 
    CheckCircle2, 
    AlertTriangle, 
    Layers, 
    Calendar,
    X,
    UserCheck,
    Users,
    Calculator
} from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';

export default function Create({ kegiatan, kegiatanList }) {
    const listKegiatan = kegiatanList || kegiatan || [];

    const { data, setData, post, processing, errors } = useForm({
        kegiatan_id: '',
        akun_id: '',
        detil_kegiatan_id: '',
        bulan: String(new Date().getMonth() + 1),
        tahun: String(new Date().getFullYear()),
        mitras: [], // array of { id, sobat_id, nama_lengkap, kuota_target }
    });

    // Dynamic dropdown states
    const [akunList, setAkunList] = useState([]);
    const [detilList, setDetilList] = useState([]);
    const [selectedDetilInfo, setSelectedDetilInfo] = useState(null);

    const selectedKegiatan = listKegiatan.find((k) => String(k.id) === String(data.kegiatan_id));

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const currentYear = new Date().getFullYear();
    const tahunOptions = [currentYear - 1, currentYear, currentYear + 1];

    // Modal Picker Mitra states (Tanpa filter kecamatan)
    const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('1'); // default 1 (aktif)
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Salin dari Periode — state
    const [copySourceBulan, setCopySourceBulan] = useState('');
    const [copySourceTahun, setCopySourceTahun] = useState('');
    const [copyData, setCopyData] = useState([]);       // hasil fetch
    const [copyLoading, setCopyLoading] = useState(false);
    const [copyPeriodeName, setCopyPeriodeName] = useState('');
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [selectedPrevMitraIds, setSelectedPrevMitraIds] = useState([]);

    // Import Excel — placeholder state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // 1. Handling Pilih Kegiatan -> Fetch Detil langsung
    const handleKegiatanChange = (e) => {
        const selectedId = e.target.value;
        setData((prev) => ({
            ...prev,
            kegiatan_id: selectedId,
            detil_kegiatan_id: '',
        }));
        setDetilList([]);
        setSelectedDetilInfo(null);
        setCopyData([]);

        if (selectedId) {
            axios.get(route('api.penugasan.detil', selectedId))
                .then((res) => setDetilList(res.data || []))
                .catch((err) => console.error('Error fetching detil:', err));
        }
    };

    // 3. Handling Pilih Detil -> Set Detil Info & Check Prev Month
    const handleDetilChange = (e) => {
        const selectedDetilId = e.target.value;
        setData('detil_kegiatan_id', selectedDetilId);

        const foundDetil = detilList.find((d) => String(d.id) === String(selectedDetilId));
        setSelectedDetilInfo(foundDetil || null);

        if (selectedDetilId && foundDetil) {
            // No auto-fetch on detil change; user will open copy modal manually
        } else {
            setCopyData([]);
        }
    };

    // 4. Fetch copy source — bisa dari bulan manapun
    const fetchCopySource = (detilId, bulanSumber, tahunSumber) => {
        if (!detilId || !bulanSumber || !tahunSumber) return;
        setCopyLoading(true);
        axios.get(route('api.penugasan.prev-month'), {
            params: { detil_kegiatan_id: detilId, bulan: bulanSumber, tahun: tahunSumber }
        })
        .then((res) => {
            const list = res.data?.data || [];
            setCopyData(list);
            setCopyPeriodeName(
                res.data?.prev_bulan_nama
                    ? `${res.data.prev_bulan_nama} ${res.data.prev_tahun}`
                    : `${bulanSumber}/${tahunSumber}`
            );
            setSelectedPrevMitraIds(list.map((i) => i.mitra_id));
        })
        .catch((err) => console.error('Error fetching copy source:', err))
        .finally(() => setCopyLoading(false));
    };

    // Refetch when bulan/tahun changes — initialize copy source to previous month
    useEffect(() => {
        const bln = parseInt(data.bulan);
        const thn = parseInt(data.tahun);
        let prevB = bln - 1, prevT = thn;
        if (prevB < 1) { prevB = 12; prevT -= 1; }
        setCopySourceBulan(String(prevB));
        setCopySourceTahun(String(prevT));
        setCopyData([]);
    }, [data.bulan, data.tahun]);

    // 5. Search Mitra in Modal Picker (Debounce ~400ms, min 2 chars, TANPA kecamatan)
    useEffect(() => {
        if (!isPickerModalOpen) return;

        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);
            axios.get(route('api.penugasan.search-mitra'), {
                params: { 
                    q: searchQuery,
                    status_aktif: filterStatus
                }
            })
            .then((res) => {
                setSearchResults(res.data || []);
            })
            .catch((err) => console.error('Error searching mitra:', err))
            .finally(() => setIsSearching(false));
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, filterStatus, isPickerModalOpen]);

    // Fetch initial mitras when picker modal opens
    const handleOpenPickerModal = () => {
        setIsPickerModalOpen(true);
        setIsSearching(true);
        axios.get(route('api.penugasan.search-mitra'), {
            params: { 
                q: searchQuery,
                status_aktif: filterStatus
            }
        })
        .then((res) => setSearchResults(res.data || []))
        .catch((err) => console.error('Error fetching initial mitras:', err))
        .finally(() => setIsSearching(false));
    };

    // Add Mitra to selected list AND AUTO CLOSE MODAL
    const handleSelectMitraFromPicker = (mitraObj) => {
        const exists = data.mitras.some((m) => m.id === mitraObj.id);
        if (!exists) {
            const newMitras = [
                ...data.mitras,
                {
                    id: mitraObj.id,
                    sobat_id: mitraObj.sobat_id || '-',
                    nama_lengkap: mitraObj.nama_lengkap,
                    kuota_target: 1
                }
            ];
            setData('mitras', newMitras);
        }
        setIsPickerModalOpen(false);
    };

    const handleRemoveMitra = (mitraId) => {
        const updated = data.mitras.filter((m) => m.id !== mitraId);
        setData('mitras', updated);
    };

    const handleKuotaChange = (mitraId, val) => {
        const kuotaVal = Math.max(1, parseFloat(val) || 1);
        const updated = data.mitras.map((m) => {
            if (m.id === mitraId) {
                return { ...m, kuota_target: kuotaVal };
            }
            return m;
        });
        setData('mitras', updated);
    };

    // Buka modal salin — fetch source saat itu juga
    const openCopyModal = () => {
        if (!data.detil_kegiatan_id) return;
        setIsCopyModalOpen(true);
        fetchCopySource(data.detil_kegiatan_id, copySourceBulan, copySourceTahun);
    };

    const toggleSelectPrevMitra = (mitraId) => {
        if (selectedPrevMitraIds.includes(mitraId)) {
            setSelectedPrevMitraIds(selectedPrevMitraIds.filter((id) => id !== mitraId));
        } else {
            setSelectedPrevMitraIds([...selectedPrevMitraIds, mitraId]);
        }
    };

    const toggleSelectAllPrev = (e) => {
        if (e.target.checked) {
            setSelectedPrevMitraIds(copyData.map((item) => item.mitra_id));
        } else {
            setSelectedPrevMitraIds([]);
        }
    };

    const handleApplyCopyPrev = () => {
        const chosen = copyData.filter((item) => selectedPrevMitraIds.includes(item.mitra_id));
        const currentMitras = [...data.mitras];
        chosen.forEach((item) => {
            const exists = currentMitras.some((m) => m.id === item.mitra_id);
            if (!exists) {
                currentMitras.push({
                    id: item.mitra_id,
                    sobat_id: item.sobat_id || '-',
                    nama_lengkap: item.nama_lengkap,
                    kuota_target: item.kuota_target || 1
                });
            }
        });
        setData('mitras', currentMitras);
        setIsCopyModalOpen(false);
    };

    // Calculate Quota Badge Info (Frekuensi)
    const renderQuotaBadge = () => {
        if (!selectedDetilInfo) return null;

        const { frekuensi_penugasan, terpakai_bulan } = selectedDetilInfo;
        if (!frekuensi_penugasan || frekuensi_penugasan === 'bulanan') return null;

        const maxBulan = frekuensi_penugasan === 'triwulanan' ? 3 : 12;
        const terpakai = terpakai_bulan || 0;
        const sisa = maxBulan - terpakai;

        if (sisa >= 0) {
            return (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-blue-600 shrink-0" />
                        <div>
                            <span className="font-bold">Info Frekuensi Penugasan ({frekuensi_penugasan.toUpperCase()}):</span>
                            <span className="ml-1">Sudah terisi pada {terpakai} periode bulan.</span>
                        </div>
                    </div>
                    <span className="font-extrabold px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-lg shrink-0">
                        Sisa {sisa} dari {maxBulan} bulan
                    </span>
                </div>
            );
        } else {
            return (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                        <div>
                            <span className="font-bold">Peringatan Frekuensi:</span>
                            <span className="ml-1">Frekuensi {frekuensi_penugasan} (maks {maxBulan} bulan).</span>
                        </div>
                    </div>
                    <span className="font-extrabold px-2.5 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-lg shrink-0">
                        Sudah lewat kuota ({terpakai} dari {maxBulan} bulan)
                    </span>
                </div>
            );
        }
    };

    // SECTION C: Render Info Sisa Volume Detil DIPA (dengan live preview form)
    const renderSisaVolumeInfo = () => {
        if (!selectedDetilInfo) return null;

        const targetDipa        = parseFloat(selectedDetilInfo.jumlah) || 0;
        const sudahDiDB         = parseFloat(selectedDetilInfo.total_kuota_terpakai) || 0;
        const kuotaFormIni      = data.mitras.reduce((sum, m) => sum + (parseFloat(m.kuota_target) || 0), 0);
        const totalTerpakai     = sudahDiDB + kuotaFormIni;
        const sisaSetelahInput  = targetDipa - totalTerpakai;
        const satuanStr         = selectedDetilInfo.satuan || 'Volume';
        const isOver            = sisaSetelahInput < 0;

        const formatNum = (num) => new Intl.NumberFormat('id-ID').format(Math.abs(num));

        return (
            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isOver
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/60 text-red-900 dark:text-red-200'
                    : sisaSetelahInput === 0
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
            }`}>
                {/* Header */}
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                    <Calculator size={15} className={isOver ? 'text-red-500' : sisaSetelahInput === 0 ? 'text-amber-500' : 'text-emerald-600'} />
                    <span>Sisa Volume Detil DIPA</span>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-1">
                    <span className="text-gray-600 dark:text-gray-400">Target DIPA:</span>
                    <span className="font-mono font-bold">{formatNum(targetDipa)} {satuanStr}</span>

                    <span className="text-gray-600 dark:text-gray-400">Sudah ditugaskan (tersimpan):</span>
                    <span className="font-mono font-bold">{formatNum(sudahDiDB)} {satuanStr}</span>

                    {kuotaFormIni > 0 && (
                        <>
                            <span className="text-blue-600 dark:text-blue-400">+ Input form ini:</span>
                            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">+{formatNum(kuotaFormIni)} {satuanStr}</span>
                        </>
                    )}
                </div>

                {/* Sisa badge */}
                <div className="flex items-center justify-between pt-1 border-t border-current/20">
                    <span className="font-semibold">
                        {isOver ? '⚠ Melebihi Target DIPA' : 'Sisa setelah input ini:'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black ${
                        isOver
                            ? 'bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200'
                            : sisaSetelahInput === 0
                                ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                                : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200'
                    }`}>
                        {isOver ? '-' : ''}{formatNum(sisaSetelahInput)} {satuanStr}
                    </span>
                </div>
            </div>
        );
    };

    // Total harga keseluruhan baris mitra di form utama
    const hargaSatuan = selectedDetilInfo?.harga_satuan || 0;
    const totalKeseluruhan = data.mitras.reduce((sum, m) => {
        return sum + ((m.kuota_target || 1) * hargaSatuan);
    }, 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.mitras.length === 0) {
            alert('Minimal 1 mitra harus dipilih.');
            return;
        }

        post(route('penugasan.store'));
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <>
            <Head title="Tambah Penugasan Mitra" />

            <div className="space-y-6 pb-12">
                {/* Header Title */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('penugasan.index')}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Tambah Penugasan Mitra
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Pilih rincian Kegiatan, Akun, Detil, serta Pilih Mitra melalui Modal Picker
                        </p>
                    </div>
                </div>

                {/* Form Main */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* General Errors Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-sm">
                                <AlertTriangle size={18} className="shrink-0 text-red-600" />
                                Gagal Menyimpan Penugasan:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 font-medium pl-1">
                                {Object.values(errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* SECTION 1: Kegiatan, Akun, Detil (Dropdown Berantai) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 space-y-5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <Layers size={18} className="text-[#D9531E]" />
                            1. Rincian Kegiatan & Detil Belanja
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Dropdown 1: Kegiatan */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Pilih Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.kegiatan_id}
                                    onChange={handleKegiatanChange}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                >
                                    <option value="">-- Pilih Kegiatan --</option>
                                    {listKegiatan?.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.kode_kegiatan ? `${k.kode_kegiatan} - ` : ''}{k.nama_kegiatan}
                                        </option>
                                    ))}
                                </select>
                                {errors.kegiatan_id && <p className="text-xs text-red-500">{errors.kegiatan_id}</p>}
                            </div>

                            {/* Dropdown 2: Detil */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Pilih Detil Rincian <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.detil_kegiatan_id}
                                    onChange={handleDetilChange}
                                    disabled={!data.kegiatan_id || detilList.length === 0}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                >
                                    <option value="">
                                        {!data.kegiatan_id 
                                            ? '-- Pilih Kegiatan Terlebih Dahulu --' 
                                            : detilList.length === 0 
                                            ? 'Tidak ada Detil pada Kegiatan ini' 
                                            : '-- Pilih Detil Rincian --'}
                                    </option>
                                    {detilList.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_detil} [{d.jenis_sbml.toUpperCase()}] ({d.satuan})
                                        </option>
                                    ))}
                                </select>
                                {errors.detil_kegiatan_id && <p className="text-xs text-red-500">{errors.detil_kegiatan_id}</p>}
                            </div>
                        </div>

                        {/* Detail Info Card, Sisa Volume & Quota Badge */}
                        {selectedDetilInfo && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-400 font-semibold block uppercase text-[10px]">Jenis SBML</span>
                                        <span className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] text-white mt-1 ${selectedDetilInfo.jenis_sbml === 'pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                            {selectedDetilInfo.jenis_sbml === 'pendataan' ? 'Pendataan' : 'Pengolahan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 font-semibold block uppercase text-[10px]">Frekuensi Penugasan</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200 capitalize mt-1 block">
                                            {selectedDetilInfo.frekuensi_penugasan || 'Bulanan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 font-semibold block uppercase text-[10px]">Satuan Belanja</span>
                                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200 mt-1 block">
                                            {selectedDetilInfo.satuan}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 font-semibold block uppercase text-[10px]">Harga Satuan (Rp)</span>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                                            {formatRupiah(selectedDetilInfo.harga_satuan)}
                                        </span>
                                    </div>
                                </div>

                                {/* SECTION C: Info Sisa Volume Detil DIPA */}
                                {renderSisaVolumeInfo()}

                                {/* SECTION B: Badge Frekuensi Kuota */}
                                {renderQuotaBadge()}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Periode Bulan & Tahun */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={18} className="text-[#D9531E]" />
                                2. Periode Penugasan
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Bulan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.bulan}
                                    onChange={(e) => setData('bulan', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                >
                                    {namaBulan.map((nama, idx) => (
                                        <option key={idx + 1} value={String(idx + 1)}>{nama}</option>
                                    ))}
                                </select>
                                {errors.bulan && <p className="text-xs text-red-500">{errors.bulan}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Tahun <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.tahun}
                                    onChange={(e) => setData('tahun', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                >
                                    {tahunOptions.map((y) => (
                                        <option key={y} value={String(y)}>{y}</option>
                                    ))}
                                </select>
                                {errors.tahun && <p className="text-xs text-red-500">{errors.tahun}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: TABEL MITRA TERPILIH */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <UserPlus size={18} className="text-[#D9531E]" />
                                    Daftar Mitra Terpilih ({data.mitras.length})
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Tambahkan mitra lewat tombol di bawah</p>
                            </div>

                            {/* Tombol Aksi — Import | Salin | Pilih */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {/* Import Excel — hijau */}
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    disabled={!data.detil_kegiatan_id}
                                    title={!data.detil_kegiatan_id ? 'Pilih detil terlebih dahulu' : 'Import dari Excel'}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1D6F42] hover:bg-[#155733] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                                    Import Excel
                                </button>

                                {/* Salin dari Bulan — oranye */}
                                <button
                                    type="button"
                                    onClick={openCopyModal}
                                    disabled={!data.detil_kegiatan_id}
                                    title={!data.detil_kegiatan_id ? 'Pilih detil terlebih dahulu' : 'Salin dari bulan lain'}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#D9531E] hover:bg-orange-600 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Copy size={14} />
                                    Salin dari Bulan Lain
                                </button>

                                {/* Pilih & Cari Mitra — biru */}
                                <button
                                    type="button"
                                    onClick={handleOpenPickerModal}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                                >
                                    <Users size={14} />
                                    Pilih &amp; Cari Mitra
                                </button>
                            </div>
                        </div>

                        {/* TABEL MITRA TERPILIH (Judul polos + Kolom Total + Kolom nama disempitkan) */}
                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider">
                                        <th className="py-2.5 px-3 font-bold w-28">Sobat ID</th>
                                        <th className="py-2.5 px-3 font-bold w-48 max-w-[200px]">Nama Mitra</th>
                                        <th className="py-2.5 px-3 font-bold w-20 text-center">Satuan</th>
                                        <th className="py-2.5 px-3 font-bold w-28 text-right">Harga Satuan</th>
                                        <th className="py-2.5 px-3 font-bold w-36 text-right">Kuota Target Bulan Ini</th>
                                        <th className="py-2.5 px-3 font-bold w-32 text-right">Total</th>
                                        <th className="py-2.5 px-3 font-bold w-12 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {data.mitras.length > 0 ? (
                                        data.mitras.map((mitraItem) => {
                                            const rowTotal = (mitraItem.kuota_target || 1) * (selectedDetilInfo?.harga_satuan || 0);

                                            return (
                                                <tr key={mitraItem.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800 dark:text-gray-200">
                                                        {mitraItem.sobat_id || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={mitraItem.nama_lengkap}>
                                                        {mitraItem.nama_lengkap}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-mono text-gray-600 dark:text-gray-300">
                                                        {selectedDetilInfo?.satuan || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(selectedDetilInfo?.harga_satuan || 0)}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={mitraItem.kuota_target}
                                                            onChange={(e) => handleKuotaChange(mitraItem.id, e.target.value)}
                                                            className="w-full px-2.5 py-1 text-xs text-right font-mono font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-300">
                                                        {formatRupiah(rowTotal)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMitra(mitraItem.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
                                                            title="Hapus baris"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-gray-400">
                                                Belum ada mitra yang dipilih. Klik tombol <span className="font-bold text-[#D9531E]">"Pilih & Cari Mitra"</span> di atas untuk memilih mitra.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {data.mitras.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-gray-900/60 font-bold border-t border-gray-200 dark:border-gray-700">
                                            <td colSpan="5" className="py-3 px-3 text-right text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">
                                                Total Keseluruhan Penugasan:
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm font-black">
                                                {formatRupiah(totalKeseluruhan)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Actions Submit */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            * Seluruh mitra di atas akan didaftarkan ke penugasan detil kegiatan periode {namaBulan[parseInt(data.bulan) - 1]} {data.tahun}.
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('penugasan.index')}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || data.mitras.length === 0}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-[#D9531E] hover:bg-orange-600 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>{processing ? 'Menyimpan...' : 'Simpan Penugasan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* SECTION A: MODAL PICKER MITRA (1 Search Box Sobat ID / Nama, Tanpa Filter Kecamatan) */}
            <Modal show={isPickerModalOpen} onClose={() => setIsPickerModalOpen(false)} maxWidth="lg">
                <div className="p-5 space-y-4">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={18} className="text-[#D9531E]" />
                                Cari & Pilih Mitra
                            </h3>
                            <p className="text-xs text-gray-500">Cari berdasarkan Sobat ID atau Nama Lengkap</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPickerModalOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Search Input Box (1 Search Box Only, Tanpa Filter Kecamatan) */}
                    <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Sobat ID / Nama Lengkap (Min. 2 Karakter)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ketik Sobat ID (misal: 276426) atau Nama..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                            />
                            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Results Table (2 Kolom Utama: Sobat ID & Nama Lengkap) */}
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-900/60 sticky top-0 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider z-10">
                                <tr>
                                    <th className="py-2.5 px-3 font-bold w-28">Sobat ID</th>
                                    <th className="py-2.5 px-3 font-bold">Nama Lengkap</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {isSearching ? (
                                    <tr>
                                        <td colSpan="2" className="py-6 text-center text-xs text-gray-400 font-semibold animate-pulse">
                                            Mencari data mitra...
                                        </td>
                                    </tr>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((m) => {
                                        const isChosen = data.mitras.some((selected) => selected.id === m.id);
                                        return (
                                            <tr 
                                                key={m.id} 
                                                onClick={() => !isChosen && handleSelectMitraFromPicker(m)}
                                                className={`transition ${
                                                    isChosen 
                                                        ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed' 
                                                        : 'hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer'
                                                }`}
                                            >
                                                <td className="py-2.5 px-3 font-mono font-bold text-[#D9531E]">
                                                    {m.sobat_id || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white flex items-center justify-between">
                                                    <span>{m.nama_lengkap}</span>
                                                    {isChosen && (
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                                            <UserCheck size={12} /> Terpilih
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-6 text-center text-xs text-gray-400">
                                            {searchQuery.trim().length < 2
                                                ? 'Ketik minimal 2 karakter (Sobat ID / Nama) untuk mencari.'
                                                : 'Tidak ditemukan data mitra yang sesuai.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsPickerModalOpen(false)}
                            className="px-4 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ===== MODAL SALIN DARI BULAN LAIN ===== */}
            <Modal show={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} maxWidth="2xl">
                <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="flex items-center gap-2">
                            <Copy size={18} className="text-[#D9531E]" />
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Salin Daftar Mitra dari Periode Lain</h3>
                        </div>
                        <button type="button" onClick={() => setIsCopyModalOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Picker Bulan & Tahun Sumber */}
                    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                            <Calendar size={14} /> Pilih Periode Sumber yang Ingin Disalin
                        </p>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bulan Sumber</label>
                                <select
                                    value={copySourceBulan}
                                    onChange={(e) => setCopySourceBulan(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                >
                                    {namaBulan.map((nm, idx) => (
                                        <option key={idx + 1} value={String(idx + 1)}>{nm}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tahun Sumber</label>
                                <select
                                    value={copySourceTahun}
                                    onChange={(e) => setCopySourceTahun(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                >
                                    {tahunOptions.map((y) => (
                                        <option key={y} value={String(y)}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchCopySource(data.detil_kegiatan_id, copySourceBulan, copySourceTahun)}
                                disabled={copyLoading}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#D9531E] hover:bg-orange-600 rounded-xl transition cursor-pointer disabled:opacity-60"
                            >
                                {copyLoading ? (
                                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <Search size={13} />
                                )}
                                Tampilkan Data
                            </button>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 p-3 rounded-xl text-xs flex items-start gap-2">
                        <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
                        <p>Pilih mitra dari periode sumber yang dipilih. Mitra yang dicentang akan ditambahkan ke daftar mitra (kuota ikut disalin).</p>
                    </div>

                    {/* Tabel hasil */}
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-900/60 sticky top-0 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-3 w-10 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                            checked={copyData.length > 0 && selectedPrevMitraIds.length === copyData.length}
                                            onChange={toggleSelectAllPrev} />
                                    </th>
                                    <th className="py-2.5 px-3 font-bold">Sobat ID</th>
                                    <th className="py-2.5 px-3 font-bold">Nama Mitra</th>
                                    <th className="py-2.5 px-3 font-bold text-right">Kuota ({namaBulan[parseInt(copySourceBulan)-1]})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {copyLoading ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-xs text-gray-400 animate-pulse">Memuat data...</td></tr>
                                ) : copyData.length > 0 ? (
                                    copyData.map((item) => {
                                        const isChecked = selectedPrevMitraIds.includes(item.mitra_id);
                                        const alreadyAdded = data.mitras.some((m) => m.id === item.mitra_id);
                                        return (
                                            <tr key={item.mitra_id}
                                                onClick={() => !alreadyAdded && toggleSelectPrevMitra(item.mitra_id)}
                                                className={`transition cursor-pointer ${
                                                    alreadyAdded ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                                                    : isChecked ? 'bg-orange-50 dark:bg-orange-950/20'
                                                    : 'hover:bg-gray-50/60 dark:hover:bg-gray-900/20'
                                                }`}>
                                                <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                                        checked={isChecked} disabled={alreadyAdded}
                                                        onChange={() => toggleSelectPrevMitra(item.mitra_id)} />
                                                </td>
                                                <td className="py-2.5 px-3 font-mono font-bold text-[#D9531E]">{item.sobat_id || '-'}</td>
                                                <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                                                    {item.nama_lengkap}
                                                    {alreadyAdded && <span className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">Sudah ada</span>}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono font-bold text-right text-gray-800 dark:text-gray-200">{item.kuota_target}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="4" className="py-8 text-center text-xs text-gray-400">
                                        {copySourceBulan ? 'Tidak ada penugasan pada periode ini untuk detil yang dipilih.' : 'Pilih periode sumber lalu klik Tampilkan Data.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {selectedPrevMitraIds.length} dipilih dari {copyData.length} mitra
                        </span>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setIsCopyModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                                Batal
                            </button>
                            <button type="button" disabled={selectedPrevMitraIds.length === 0}
                                onClick={handleApplyCopyPrev}
                                className="px-5 py-2 text-xs font-bold text-white bg-[#D9531E] hover:bg-orange-600 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer">
                                Salin {selectedPrevMitraIds.length} Mitra
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Create.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Tambah Penugasan Mitra">
        {page}
    </AuthenticatedLayout>
);
