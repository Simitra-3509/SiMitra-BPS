import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function Edit({ penugasan, kegiatan, mitra, auth }) {
    const { data, setData, put, processing, errors } = useForm({
        kegiatan_id: penugasan.kegiatan_id || '',
        mitra_id: penugasan.mitra_id || '',
        tanggal_mulai: penugasan.tanggal_mulai || '',
        tanggal_selesai: penugasan.tanggal_selesai || '',
        status: penugasan.status || 'Aktif'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('penugasan.update', penugasan.id));
    };

    return (
        <>
            <Head title="Edit Penugasan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Edit Penugasan</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tugaskan mitra ke kegiatan</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl space-y-6">
                    {/* Kegiatan */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Kegiatan</label>
                        <select
                            value={data.kegiatan_id}
                            onChange={(e) => setData('kegiatan_id', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                        >
                            <option value="">-- Pilih Kegiatan --</option>
                            {kegiatan.map((kg) => (
                                <option key={kg.id} value={kg.id}>{kg.nama_kegiatan}</option>
                            ))}
                        </select>
                        {errors.kegiatan_id && <p className="text-xs text-red-500 mt-1">{errors.kegiatan_id}</p>}
                    </div>

                    {/* Mitra */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Mitra</label>
                        <select
                            value={data.mitra_id}
                            onChange={(e) => setData('mitra_id', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                        >
                            <option value="">-- Pilih Mitra --</option>
                            {mitra.map((mt) => (
                                <option key={mt.id} value={mt.id}>{mt.nama_lengkap} ({mt.nik})</option>
                            ))}
                        </select>
                        {errors.mitra_id && <p className="text-xs text-red-500 mt-1">{errors.mitra_id}</p>}
                    </div>

                    {/* Tanggal Mulai */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={data.tanggal_mulai}
                            onChange={(e) => setData('tanggal_mulai', e.target.value)}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition cursor-pointer"
                        />
                        {errors.tanggal_mulai && <p className="text-xs text-red-500 mt-1">{errors.tanggal_mulai}</p>}
                    </div>

                    {/* Tanggal Selesai */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Tanggal Selesai</label>
                        <input
                            type="date"
                            value={data.tanggal_selesai}
                            onChange={(e) => setData('tanggal_selesai', e.target.value)}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition cursor-pointer"
                        />
                        {errors.tanggal_selesai && <p className="text-xs text-red-500 mt-1">{errors.tanggal_selesai}</p>}
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                        >
                            <option value="Aktif">Aktif</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                        {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <Link
                            href={route('penugasan.index')}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-500 dark:bg-gray-600 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                        >
                            <CheckCircle size={16} /> Simpan
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Edit Penugasan">{page}</AuthenticatedLayout>;

export default Edit;
