import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    X,
    ArrowLeft,
    FolderEdit,
    Layers,
    Calculator,
    CheckCircle2
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, kegiatan }) {
    const initialAkun = (kegiatan?.akun_kegiatan || kegiatan?.akunKegiatan || []).map((a) => ({
        id: a.id || Date.now(),
        kode_akun: a.kode_akun || '',
        nama_akun: a.nama_akun || '',
        detil: (a.detil_kegiatan || a.detilKegiatan || []).map((d) => ({
            id: d.id || Date.now() + Math.random(),
            nama_detil: d.nama_detil || '',
            jenis_sbml: d.jenis_sbml || 'pendataan',
            frekuensi_penugasan: d.frekuensi_penugasan || 'bulanan',
            satuan: d.satuan || 'DOK',
            jumlah: parseFloat(d.jumlah) || 1,
            harga_satuan: parseFloat(d.harga_satuan) || 0,
        }))
    }));

    const defaultAkun = initialAkun.length > 0 ? initialAkun : [
        {
            id: Date.now(),
            kode_akun: '521213',
            nama_akun: 'Belanja Honor Output Kegiatan',
            detil: [
                {
                    id: Date.now() + 1,
                    nama_detil: '',
                    jenis_sbml: 'pendataan',
                    frekuensi_penugasan: 'bulanan',
                    satuan: 'DOK',
                    jumlah: 1,
                    harga_satuan: 0,
                }
            ]
        }
    ];

    const { data, setData, put, processing, errors } = useForm({
        nomor_kro: kegiatan?.kro || '',
        nama_kegiatan: kegiatan?.nama_kegiatan || '',
        bulan: kegiatan?.bulan || 'Agustus',
        tahun: kegiatan?.tahun || new Date().getFullYear(),
        tgl_mulai: kegiatan?.tanggal_mulai || '',
        tgl_selesai: kegiatan?.tanggal_selesai || '',
        deskripsi: kegiatan?.deskripsi || '',
        akun: defaultAkun,
    });

    const handleAddAkun = () => {
        const newAkun = {
            id: Date.now(),
            kode_akun: '',
            nama_akun: '',
            detil: [
                {
                    id: Date.now() + 1,
                    nama_detil: '',
                    jenis_sbml: 'pendataan',
                    frekuensi_penugasan: 'bulanan',
                    satuan: 'DOK',
                    jumlah: 1,
                    harga_satuan: 0,
                }
            ]
        };
        setData('akun', [...data.akun, newAkun]);
    };

    const handleRemoveAkun = (akunIndex) => {
        if (data.akun.length <= 1) {
            alert('Minimal harus ada 1 Akun Kegiatan.');
            return;
        }
        const updatedAkun = data.akun.filter((_, idx) => idx !== akunIndex);
        setData('akun', updatedAkun);
    };

    const handleAkunChange = (akunIndex, field, value) => {
        const updatedAkun = [...data.akun];
        updatedAkun[akunIndex][field] = value;
        setData('akun', updatedAkun);
    };

    const handleAddDetil = (akunIndex) => {
        const updatedAkun = [...data.akun];
        updatedAkun[akunIndex].detil.push({
            id: Date.now(),
            nama_detil: '',
            jenis_sbml: 'pendataan',
            frekuensi_penugasan: 'bulanan',
            satuan: 'DOK',
            jumlah: 1,
            harga_satuan: 0,
        });
        setData('akun', updatedAkun);
    };

    const handleRemoveDetil = (akunIndex, detilIndex) => {
        const updatedAkun = [...data.akun];
        if (updatedAkun[akunIndex].detil.length <= 1) {
            alert('Setiap Akun minimal harus memiliki 1 Detil rincian.');
            return;
        }
        updatedAkun[akunIndex].detil = updatedAkun[akunIndex].detil.filter((_, idx) => idx !== detilIndex);
        setData('akun', updatedAkun);
    };

    const handleDetilChange = (akunIndex, detilIndex, field, value) => {
        const updatedAkun = [...data.akun];
        updatedAkun[akunIndex].detil[detilIndex][field] = value;
        setData('akun', updatedAkun);
    };

    const getAkunSubtotal = (akunObj) => {
        return (akunObj.detil || []).reduce((sum, item) => {
            const jml = parseFloat(item.jumlah) || 0;
            const hrga = parseFloat(item.harga_satuan) || 0;
            return sum + (jml * hrga);
        }, 0);
    };

    const getGrandTotal = () => {
        return (data.akun || []).reduce((sum, akunObj) => sum + getAkunSubtotal(akunObj), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.akun.length === 0) {
            alert('Minimal 1 Akun kegiatan harus diisi.');
            return;
        }
        for (let i = 0; i < data.akun.length; i++) {
            if (!data.akun[i].nama_akun.trim()) {
                alert(`Nama Akun ke-${i + 1} wajib diisi.`);
                return;
            }
            if (!data.akun[i].detil || data.akun[i].detil.length === 0) {
                alert(`Akun "${data.akun[i].nama_akun}" minimal harus memiliki 1 Detil rincian.`);
                return;
            }
        }

        put(route('kegiatan.update', kegiatan.id));
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <>
            <Head title={`Edit Kegiatan: ${kegiatan.nama_kegiatan} - SIMITRA LITE`} />

            <div className="space-y-6 pb-12">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('kegiatan.index')}
                            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Edit Kegiatan
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Perbarui rincian Akun & Detil belanja kegiatan
                            </p>
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <Calculator className="text-emerald-600 dark:text-emerald-400 shrink-0" size={20} />
                        <div>
                            <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400">Total Anggaran Kegiatan</p>
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{formatRupiah(getGrandTotal())}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: Informasi Utama */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 space-y-5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <FolderEdit size={18} className="text-[#D9531E]" />
                            Informasi Utama Kegiatan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2 space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Nama Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_kegiatan}
                                    onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                                {errors.nama_kegiatan && <p className="text-xs text-red-500">{errors.nama_kegiatan}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Kode / Nomor KRO
                                </label>
                                <input
                                    type="text"
                                    value={data.nomor_kro}
                                    onChange={(e) => setData('nomor_kro', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Bulan</label>
                                    <select
                                        value={data.bulan}
                                        onChange={(e) => setData('bulan', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                    >
                                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Tahun</label>
                                    <input
                                        type="number"
                                        value={data.tahun}
                                        onChange={(e) => setData('tahun', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Tgl Mulai</label>
                                    <input
                                        type="date"
                                        value={data.tgl_mulai}
                                        onChange={(e) => setData('tgl_mulai', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Tgl Selesai</label>
                                    <input
                                        type="date"
                                        value={data.tgl_selesai}
                                        min={data.tgl_mulai || undefined}
                                        onChange={(e) => setData('tgl_selesai', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Deskripsi / Catatan</label>
                                <textarea
                                    rows="2"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Rincian Akun & Detil */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Layers size={20} className="text-[#D9531E]" />
                                    Rincian Akun & Detil Belanja
                                </h3>
                                <p className="text-xs text-gray-500">Jenis SBML & Frekuensi kini ditentukan per baris Detil Rincian</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddAkun}
                                className="bg-[#D9531E] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Tambah Akun Baru</span>
                            </button>
                        </div>

                        {data.akun.map((akunItem, akunIdx) => {
                            const subtotalAkun = getAkunSubtotal(akunItem);

                            return (
                                <div
                                    key={akunItem.id || akunIdx}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden transition-all"
                                >
                                    <div className="bg-gray-50 dark:bg-gray-900/60 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <div className="sm:col-span-1">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                    Kode Akun
                                                </label>
                                                <input
                                                    type="text"
                                                    value={akunItem.kode_akun}
                                                    onChange={(e) => handleAkunChange(akunIdx, 'kode_akun', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                    Nama Akun <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={akunItem.nama_akun}
                                                    onChange={(e) => handleAkunChange(akunIdx, 'nama_akun', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-gray-200 dark:border-gray-700">
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Subtotal Akun</span>
                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(subtotalAkun)}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAkun(akunIdx)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800 transition cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
                                                        <th className="py-2 px-2 font-bold w-8 text-center">#</th>
                                                        <th className="py-2 px-2 font-bold min-w-[200px]">Nama Detil Rincian <span className="text-red-500">*</span></th>
                                                        <th className="py-2 px-2 font-bold w-28">Jenis SBML <span className="text-red-500">*</span></th>
                                                        <th className="py-2 px-2 font-bold w-28">Frekuensi</th>
                                                        <th className="py-2 px-2 font-bold w-24">Satuan <span className="text-red-500">*</span></th>
                                                        <th className="py-2 px-2 font-bold w-24 text-right">Jumlah <span className="text-red-500">*</span></th>
                                                        <th className="py-2 px-2 font-bold w-32 text-right">Harga Satuan (Rp)</th>
                                                        <th className="py-2 px-2 font-bold w-32 text-right">Total (Rp)</th>
                                                        <th className="py-2 px-2 font-bold w-10 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                                    {akunItem.detil.map((detilItem, detilIdx) => {
                                                        const rowTotal = (parseFloat(detilItem.jumlah) || 0) * (parseFloat(detilItem.harga_satuan) || 0);

                                                        return (
                                                            <tr key={detilItem.id || detilIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                                                <td className="py-2 px-2 text-center text-gray-400 font-mono font-bold">
                                                                    {detilIdx + 1}
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input
                                                                        type="text"
                                                                        value={detilItem.nama_detil}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'nama_detil', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <select
                                                                        value={detilItem.jenis_sbml}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'jenis_sbml', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    >
                                                                        <option value="pendataan">Pendataan</option>
                                                                        <option value="pengolahan">Pengolahan</option>
                                                                    </select>
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <select
                                                                        value={detilItem.frekuensi_penugasan}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'frekuensi_penugasan', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    >
                                                                        <option value="bulanan">Bulanan</option>
                                                                        <option value="triwulanan">Triwulanan</option>
                                                                        <option value="tahunan">Tahunan</option>
                                                                    </select>
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <select
                                                                        value={detilItem.satuan}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'satuan', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    >
                                                                        <option value="DOK">DOK</option>
                                                                        <option value="OP">OP</option>
                                                                        <option value="OB">OB</option>
                                                                        <option value="OH">OH</option>
                                                                        <option value="OK">OK</option>
                                                                        <option value="KPT">KPT</option>
                                                                        <option value="SEG">SEG</option>
                                                                        <option value="PAKET">PAKET</option>
                                                                    </select>
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        value={detilItem.jumlah}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'jumlah', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs text-right font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={detilItem.harga_satuan}
                                                                        onChange={(e) => handleDetilChange(akunIdx, detilIdx, 'harga_satuan', e.target.value)}
                                                                        className="w-full px-2 py-1 text-xs text-right font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2 text-right font-mono font-bold text-gray-800 dark:text-gray-200">
                                                                    {formatRupiah(rowTotal)}
                                                                </td>
                                                                <td className="py-2 px-2 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveDetil(akunIdx, detilIdx)}
                                                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddDetil(akunIdx)}
                                                className="text-xs font-semibold text-[#D9531E] hover:text-orange-600 flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/60 transition cursor-pointer"
                                            >
                                                <Plus size={14} />
                                                <span>Tambah Detil Rincian</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleAddAkun}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#D9531E] text-gray-600 dark:text-gray-300 hover:text-[#D9531E] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition bg-white dark:bg-gray-800 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Tambah Blok Akun Kegiatan Baru</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            * Perubahan rincian Akun & Detil akan langsung disimpan secara bersamaan.
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('kegiatan.index')}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-[#D9531E] hover:bg-orange-600 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>{processing ? 'Memperbarui...' : 'Simpan Perubahan Kegiatan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </>
    );
}

Edit.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Edit Kegiatan">{page}</AuthenticatedLayout>;
