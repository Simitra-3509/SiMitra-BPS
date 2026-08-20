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
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, kegiatan }) {
    const initialDetil = (kegiatan?.detil_kegiatan || []).map((d) => ({
        id: d.id || Date.now() + Math.random(),
        nama_detil: d.nama_detil || '',
        jenis_sbml: d.jenis_sbml || 'pendataan',
        frekuensi_penugasan: d.frekuensi_penugasan || 'bulanan',
        satuan: d.satuan || 'DOK',
        jumlah: parseFloat(d.jumlah) || 1,
        harga_satuan: parseFloat(d.harga_satuan) || 0,
    }));

    const defaultDetil = initialDetil.length > 0 ? initialDetil : [
        {
            id: Date.now(),
            nama_detil: '',
            jenis_sbml: 'pendataan',
            frekuensi_penugasan: 'bulanan',
            satuan: 'DOK',
            jumlah: 1,
            harga_satuan: 0,
        }
    ];

    const { data, setData, put, processing, errors } = useForm({
        kode_kegiatan: kegiatan?.kode_kegiatan || '',
        nama_kegiatan: kegiatan?.nama_kegiatan || '',
        tanggal_mulai: kegiatan?.tanggal_mulai || '',
        tanggal_selesai: kegiatan?.tanggal_selesai || '',
        deskripsi: kegiatan?.deskripsi || '',
        detil: defaultDetil,
    });

    const handleAddDetil = () => {
        const newDetil = {
            id: Date.now(),
            nama_detil: '',
            jenis_sbml: 'pendataan',
            frekuensi_penugasan: 'bulanan',
            satuan: 'DOK',
            jumlah: 1,
            harga_satuan: 0,
        };
        setData('detil', [...data.detil, newDetil]);
    };

    const handleRemoveDetil = (detilIndex) => {
        if (data.detil.length <= 1) {
            alert('Minimal harus ada 1 Detil Rincian belanja.');
            return;
        }
        const updatedDetil = data.detil.filter((_, idx) => idx !== detilIndex);
        setData('detil', updatedDetil);
    };

    const handleDetilChange = (detilIndex, field, value) => {
        const updatedDetil = [...data.detil];
        updatedDetil[detilIndex][field] = value;
        setData('detil', updatedDetil);
    };

    const getGrandTotal = () => {
        return (data.detil || []).reduce((sum, item) => {
            const jml = parseFloat(item.jumlah) || 0;
            const hrga = parseFloat(item.harga_satuan) || 0;
            return sum + (jml * hrga);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.detil.length === 0) {
            alert('Minimal 1 Detil rincian belanja harus diisi.');
            return;
        }
        for (let i = 0; i < data.detil.length; i++) {
            if (!data.detil[i].nama_detil.trim()) {
                alert(`Nama Detil ke-${i + 1} wajib diisi.`);
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
                                Perbarui rincian Detil belanja kegiatan
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

                {/* Form Main - UNIFIED CARD */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 space-y-6">
                    
                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 rounded-xl space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-sm">
                                <AlertTriangle size={18} className="shrink-0 text-red-600" />
                                Gagal Menyimpan Perubahan:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 font-medium pl-1">
                                {Object.values(errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* SECTION 1: Informasi Utama Kegiatan */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <FolderEdit size={18} className="text-[#D9531E]" />
                            Informasi Utama Kegiatan
                        </h3>

                        {/* Baris 1: Kode KRO & Nama Kegiatan (Side-by-side) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4 space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Kode KRO / Kode Kegiatan
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_kegiatan}
                                    onChange={(e) => setData('kode_kegiatan', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                                {errors.kode_kegiatan && <p className="text-xs text-red-500">{errors.kode_kegiatan}</p>}
                            </div>

                            <div className="md:col-span-8 space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Nama Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_kegiatan}
                                    onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                                {errors.nama_kegiatan && <p className="text-xs text-red-500">{errors.nama_kegiatan}</p>}
                            </div>
                        </div>

                        {/* Baris 2: Tanggal Mulai & Tanggal Selesai */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Tanggal Selesai
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_selesai}
                                    min={data.tanggal_mulai || undefined}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1 pt-1">
                            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">Deskripsi / Catatan Kegiatan</label>
                            <textarea
                                rows="2"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* SECTION 2: Rincian Detil Belanja (SEAMLESSLY INTEGRATED) */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="flex items-center justify-between pb-2">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Layers size={18} className="text-[#D9531E]" />
                                    Rincian Detil Belanja
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Tentukan rincian Detil, Jenis SBML, Satuan, & Harga Satuan per baris</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDetil}
                                className="bg-[#D9531E] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Tambah Detil Rincian</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider bg-gray-50 dark:bg-gray-900/60">
                                        <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                                        <th className="py-2.5 px-3 font-bold min-w-[200px]">Nama Detil Rincian <span className="text-red-500">*</span></th>
                                        <th className="py-2.5 px-3 font-bold w-28">Jenis SBML <span className="text-red-500">*</span></th>
                                        <th className="py-2.5 px-3 font-bold w-28">Frekuensi</th>
                                        <th className="py-2.5 px-3 font-bold w-24">Satuan <span className="text-red-500">*</span></th>
                                        <th className="py-2.5 px-3 font-bold w-24 text-right">Jumlah <span className="text-red-500">*</span></th>
                                        <th className="py-2.5 px-3 font-bold w-32 text-right">Harga Satuan (Rp)</th>
                                        <th className="py-2.5 px-3 font-bold w-36 text-right">Total (Rp)</th>
                                        <th className="py-2.5 px-3 font-bold w-12 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {data.detil.map((detilItem, detilIdx) => {
                                        const rowTotal = (parseFloat(detilItem.jumlah) || 0) * (parseFloat(detilItem.harga_satuan) || 0);

                                        return (
                                            <tr key={detilItem.id || detilIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                                <td className="py-2.5 px-3 text-center text-gray-400 font-mono font-bold">
                                                    {detilIdx + 1}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <input
                                                        type="text"
                                                        value={detilItem.nama_detil}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'nama_detil', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                    />
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <select
                                                        value={detilItem.jenis_sbml}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'jenis_sbml', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                    >
                                                        <option value="pendataan">Pendataan</option>
                                                        <option value="pengolahan">Pengolahan</option>
                                                    </select>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <select
                                                        value={detilItem.frekuensi_penugasan}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'frekuensi_penugasan', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                    >
                                                        <option value="bulanan">Bulanan</option>
                                                        <option value="triwulanan">Triwulanan</option>
                                                        <option value="tahunan">Tahunan</option>
                                                    </select>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <select
                                                        value={detilItem.satuan}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'satuan', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
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
                                                <td className="py-2.5 px-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={detilItem.jumlah}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'jumlah', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs text-right font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                    />
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={detilItem.harga_satuan}
                                                        onChange={(e) => handleDetilChange(detilIdx, 'harga_satuan', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs text-right font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#D9531E] focus:outline-none"
                                                    />
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-800 dark:text-gray-200">
                                                    {formatRupiah(rowTotal)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDetil(detilIdx)}
                                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            * Perubahan rincian Detil belanja akan langsung disimpan.
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
            </div>
        </>
    );
}

Edit.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Edit Kegiatan">{page}</AuthenticatedLayout>;
