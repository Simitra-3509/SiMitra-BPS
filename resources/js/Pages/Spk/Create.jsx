import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    FileText, 
    Calendar, 
    User, 
    DollarSign,
    Layers
} from 'lucide-react';
import { formatRupiah } from '@/utils/formatters';

export default function Create({ mitras = [], kegiatans = [], autoFill = null }) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const { data, setData, post, processing, errors } = useForm({
        mitra_id: autoFill?.mitra_id || '',
        bulan: autoFill?.bulan || currentMonth.toString(),
        tahun: autoFill?.tahun || currentYear.toString(),
        tanggal_mulai: autoFill?.tanggal_mulai || '',
        tanggal_selesai: autoFill?.tanggal_selesai || '',
        status: 'draft',
        catatan: '',
        details: autoFill?.details || [
            {
                kegiatan_id: '',
                uraian_tugas: '',
                tanggal_mulai_detail: '',
                tanggal_selesai_detail: '',
                volume: 1,
                satuan: 'Dokumen',
                harga_satuan: 0,
                nilai: 0,
                kode_anggaran: '',
                akun_anggaran: ''
            }
        ]
    });

    const addDetail = () => {
        setData('details', [
            ...data.details,
            {
                kegiatan_id: '',
                uraian_tugas: '',
                tanggal_mulai_detail: data.tanggal_mulai || '',
                tanggal_selesai_detail: data.tanggal_selesai || '',
                volume: 1,
                satuan: 'Dokumen',
                harga_satuan: 0,
                nilai: 0,
                kode_anggaran: '',
                akun_anggaran: ''
            }
        ]);
    };

    const removeDetail = (index) => {
        if (data.details.length === 1) return;
        const newDetails = data.details.filter((_, i) => i !== index);
        setData('details', newDetails);
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;

        if (field === 'volume' || field === 'harga_satuan') {
            const vol = parseFloat(newDetails[index].volume) || 0;
            const price = parseFloat(newDetails[index].harga_satuan) || 0;
            newDetails[index].nilai = vol * price;
        }

        setData('details', newDetails);
    };

    const calculateTotal = () => {
        return data.details.reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('spk.store'));
    };

    const months = [
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    return (
        <AuthenticatedLayout header="Buat Surat Perintah Kerja (SPK)">
            <Head title="Buat SPK Baru" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* Back link & Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('spk.index')}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-[#D9531E]" /> Buat SPK Baru
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Isi informasi SPK dan rincian tugas untuk mitra terkait.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <User size={18} className="text-[#D9531E]" /> Informasi SPK
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mitra */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pilih Mitra <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.mitra_id}
                                    onChange={(e) => setData('mitra_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                >
                                    <option value="">-- Pilih Mitra --</option>
                                    {mitras.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama_lengkap} ({m.sobat_id || '-'}) - {m.kecamatan || '-'}
                                        </option>
                                    ))}
                                </select>
                                {errors.mitra_id && <p className="text-sm text-red-500 mt-1">{errors.mitra_id}</p>}
                            </div>

                            {/* Status SPK */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status Awal <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                >
                                    <option value="draft">Draft (Belum Bernomor)</option>
                                    <option value="terbit">Terbitkan Langsung (Generate Nomor SPK)</option>
                                </select>
                                {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                            </div>

                            {/* Bulan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Bulan Periode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.bulan}
                                    onChange={(e) => setData('bulan', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.bulan && <p className="text-sm text-red-500 mt-1">{errors.bulan}</p>}
                            </div>

                            {/* Tahun */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tahun Periode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.tahun}
                                    onChange={(e) => setData('tahun', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                />
                                {errors.tahun && <p className="text-sm text-red-500 mt-1">{errors.tahun}</p>}
                            </div>

                            {/* Tanggal Mulai SPK */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tanggal Mulai SPK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                />
                                {errors.tanggal_mulai && <p className="text-sm text-red-500 mt-1">{errors.tanggal_mulai}</p>}
                            </div>

                            {/* Tanggal Selesai SPK */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tanggal Selesai SPK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                />
                                {errors.tanggal_selesai && <p className="text-sm text-red-500 mt-1">{errors.tanggal_selesai}</p>}
                            </div>
                        </div>

                        {/* Catatan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Catatan / Keterangan
                            </label>
                            <textarea
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                rows={2}
                                placeholder="Tambahkan catatan khusus jika ada..."
                                className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                            />
                            {errors.catatan && <p className="text-sm text-red-500 mt-1">{errors.catatan}</p>}
                        </div>
                    </div>

                    {/* Details / Items Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Layers size={18} className="text-[#D9531E]" /> Rincian Tugas & Anggaran
                            </h2>
                            <button
                                type="button"
                                onClick={addDetail}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950 text-[#D9531E] hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg text-sm font-medium transition"
                            >
                                <Plus size={16} /> Tambah Kegiatan
                            </button>
                        </div>

                        {errors.details && typeof errors.details === 'string' && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                {errors.details}
                            </div>
                        )}

                        <div className="space-y-4">
                            {data.details.map((detail, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 relative space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Kegiatan #{index + 1}
                                        </span>
                                        {data.details.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDetail(index)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded transition"
                                                title="Hapus Rincian"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Kegiatan Induk */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Kegiatan BPS <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={detail.kegiatan_id}
                                                onChange={(e) => handleDetailChange(index, 'kegiatan_id', e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            >
                                                <option value="">-- Pilih Kegiatan --</option>
                                                {kegiatans.map((k) => (
                                                    <option key={k.id} value={k.id}>
                                                        {k.nama_kegiatan}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Uraian Tugas */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Uraian Tugas / Pekerjaan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={detail.uraian_tugas}
                                                onChange={(e) => handleDetailChange(index, 'uraian_tugas', e.target.value)}
                                                placeholder="Contoh: Pendataan Lapangan Survei Angkatan Kerja Nasional"
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Tanggal Mulai Detail */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tanggal Mulai Tugas <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={detail.tanggal_mulai_detail}
                                                onChange={(e) => handleDetailChange(index, 'tanggal_mulai_detail', e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Tanggal Selesai Detail */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tanggal Selesai Tugas <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={detail.tanggal_selesai_detail}
                                                onChange={(e) => handleDetailChange(index, 'tanggal_selesai_detail', e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Volume */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Volume <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={detail.volume}
                                                onChange={(e) => handleDetailChange(index, 'volume', e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Satuan */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Satuan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={detail.satuan}
                                                onChange={(e) => handleDetailChange(index, 'satuan', e.target.value)}
                                                placeholder="Dokumen / Rumah Tangga / Blok Sensus"
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Harga Satuan */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Harga Satuan (Rp) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={detail.harga_satuan}
                                                onChange={(e) => handleDetailChange(index, 'harga_satuan', e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E]"
                                            />
                                        </div>

                                        {/* Total Nilai Detail */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Subtotal Nilai
                                            </label>
                                            <div className="w-full text-sm font-semibold py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                                                {formatRupiah(detail.nilai)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Summary */}
                        <div className="p-4 bg-orange-50/70 dark:bg-orange-950/40 rounded-xl border border-orange-200/70 dark:border-orange-800/40 flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                Total Nilai SPK:
                            </span>
                            <span className="text-xl font-bold text-[#D9531E]">
                                {formatRupiah(calculateTotal())}
                            </span>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('spk.index')}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D9531E] hover:bg-[#C44C1C] text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                        >
                            <Save size={18} />
                            {processing ? 'Menyimpan...' : 'Simpan SPK'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
