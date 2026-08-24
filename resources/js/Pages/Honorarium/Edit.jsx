import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, ArrowLeft, ShieldAlert, AlertTriangle, Calculator, Layers } from 'lucide-react';

const namaBulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const Edit = ({ honorarium, penugasanList = [] }) => {
    const { data, setData, put, processing, errors } = useForm({
        penugasan_id: honorarium.penugasan_id || '',
        jumlah_item: honorarium.jumlah_item || 1,
        tanggal_input: honorarium.tanggal_input ? honorarium.tanggal_input.substring(0, 10) : '',
        keterangan: honorarium.keterangan || '',
    });

    const [selectedPenugasan, setSelectedPenugasan] = useState(honorarium.penugasan || null);

    useEffect(() => {
        if (data.penugasan_id) {
            const found = penugasanList.find((p) => String(p.id) === String(data.penugasan_id));
            setSelectedPenugasan(found || honorarium.penugasan || null);
        }
    }, [data.penugasan_id]);

    const hargaSatuan = selectedPenugasan?.detil_kegiatan?.harga_satuan || selectedPenugasan?.detilKegiatan?.harga_satuan || honorarium.harga_satuan_snapshot || 0;
    const kuotaTarget = selectedPenugasan?.kuota_target || 0;
    const satuanStr = selectedPenugasan?.detil_kegiatan?.satuan || selectedPenugasan?.detilKegiatan?.satuan || 'Item';
    const volumeVal = parseFloat(data.jumlah_item) || 0;
    const totalHonorLive = volumeVal * hargaSatuan;

    const isExceedingQuota = selectedPenugasan && kuotaTarget > 0 && volumeVal > kuotaTarget;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isExceedingQuota) return;
        put(route('honorarium.update', honorarium.id));
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <>
            <Head title="Edit Honorarium" />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href={route('honorarium.index')}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Honorarium</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Perbarui data pembayaran honorarium mitra</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Panel: Form */}
                    <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* General Errors Banner */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1">
                                    <div className="font-bold flex items-center gap-1.5 text-sm">
                                        <AlertTriangle size={18} className="shrink-0 text-red-600" />
                                        Gagal Memperbarui Honorarium:
                                    </div>
                                    <ul className="list-disc list-inside space-y-0.5 font-medium pl-1">
                                        {Object.values(errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Penugasan Readonly/Select */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Penugasan Mitra (Kegiatan - Detil - Mitra)
                                </label>
                                <select 
                                    disabled
                                    value={data.penugasan_id}
                                    className="w-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
                                >
                                    {penugasanList?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.kegiatan?.nama_kegiatan} - {p.detil_kegiatan?.nama_detil || p.detilKegiatan?.nama_detil} | {p.mitra?.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected Penugasan Context Card */}
                            {selectedPenugasan && (
                                <div className="bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 p-4 rounded-xl text-xs space-y-1.5 text-orange-900 dark:text-orange-200">
                                    <div className="font-bold text-sm text-[#D9531E] dark:text-orange-400 flex items-center gap-1.5">
                                        <Layers size={16} /> Detail Penugasan:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                        <div><strong>Kegiatan:</strong> {selectedPenugasan.kegiatan?.nama_kegiatan}</div>
                                        <div><strong>Detil Belanja:</strong> {selectedPenugasan.detil_kegiatan?.nama_detil || selectedPenugasan.detilKegiatan?.nama_detil}</div>
                                        <div><strong>Mitra:</strong> {selectedPenugasan.mitra?.nama_lengkap} ({selectedPenugasan.mitra?.sobat_id})</div>
                                        <div><strong>Periode:</strong> {namaBulanList[(selectedPenugasan.bulan || 1) - 1]} {selectedPenugasan.tahun}</div>
                                        <div><strong>Kuota Target Penugasan:</strong> <span className="font-bold text-emerald-700 dark:text-emerald-400">{kuotaTarget} {satuanStr}</span></div>
                                        <div><strong>Harga Satuan:</strong> <span className="font-bold">{formatRupiah(hargaSatuan)}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Volume & Harga Satuan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Volume (Jumlah Item) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <input 
                                            type="number" 
                                            min="1"
                                            max={kuotaTarget || undefined}
                                            value={data.jumlah_item}
                                            onChange={(e) => setData('jumlah_item', e.target.value)}
                                            className={`w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border rounded-l-lg focus:outline-none focus:ring-2 transition ${
                                                isExceedingQuota 
                                                    ? 'border-red-500 focus:ring-red-500/20' 
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#D9531E]/20 focus:border-[#D9531E]'
                                            }`} 
                                        />
                                        <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">
                                            {satuanStr}
                                        </span>
                                    </div>
                                    {isExceedingQuota && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1">
                                            <AlertTriangle size={14} className="shrink-0" />
                                            Volume ({volumeVal}) melebihi kuota target ({kuotaTarget} {satuanStr}) pada penugasan ini.
                                        </p>
                                    )}
                                    {errors.jumlah_item && <p className="text-xs text-red-500 mt-1">{errors.jumlah_item}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Harga Satuan (Snapshot Read-Only)
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                            Rp
                                        </span>
                                        <input 
                                            type="text" 
                                            value={hargaSatuan.toLocaleString('id-ID')} 
                                            readOnly 
                                            className="w-full px-3.5 py-2.5 text-sm font-bold border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-0 cursor-not-allowed" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Total Honor Live Calculation */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Total Honorarium (Kalkulasi Otomatis Server-Side)
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-bold">
                                        Rp
                                    </span>
                                    <input 
                                        type="text" 
                                        value={totalHonorLive.toLocaleString('id-ID')} 
                                        readOnly 
                                        className="w-full px-3.5 py-2.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-emerald-50/30 dark:bg-emerald-950/20 focus:outline-none cursor-not-allowed" 
                                    />
                                </div>
                            </div>

                            {/* Tanggal Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Tanggal Input <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date" 
                                    value={data.tanggal_input}
                                    onChange={(e) => setData('tanggal_input', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition" 
                                />
                                {errors.tanggal_input && <p className="text-xs text-red-500 mt-1">{errors.tanggal_input}</p>}
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Keterangan</label>
                                <textarea 
                                    rows="3" 
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Catatan tambahan (opsional)"
                                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]/20 focus:border-[#D9531E] transition"
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                                <Link
                                    href={route('honorarium.index')}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || isExceedingQuota}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#D9531E] hover:bg-[#c24617] rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CheckCircle size={18} /> Simpan Perubahan
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Panel: Validasi Info */}
                    <div className="lg:col-span-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-[#D9531E] p-4 flex items-center gap-2 text-white font-semibold text-sm">
                            <ShieldAlert size={20} /> Informasi Edit Honorarium
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 space-y-4 text-xs">
                            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 p-4 rounded-xl space-y-2">
                                <div className="font-bold flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400">
                                    <Calculator size={16} /> Hitung Otomatis:
                                </div>
                                <p className="leading-relaxed">
                                    Total honorarium akan diperbarui otomatis di server berdasarkan perubahan volume item.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

Edit.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Edit Honorarium">
        {page}
    </AuthenticatedLayout>
);

export default Edit;
