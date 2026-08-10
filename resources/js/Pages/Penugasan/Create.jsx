import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function Create({ kegiatan, mitra }) {
    const { data, setData, post, processing, errors } = useForm({
        kegiatan_id: new URLSearchParams(window.location.search).get('kegiatan_id') || '',
        mitra_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('penugasan.store'));
    };

    const kegiatanTerpilih = kegiatan?.find((k) => String(k.id) === String(data.kegiatan_id));

    return (
        <>
            <Head title="Tambah Penugasan Mitra" />

            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('penugasan.index')}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                        title="Kembali ke Penugasan"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Tambah Penugasan</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tugaskan mitra ke kegiatan yang aktif</p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6"
                    >

                        {/* Pilih Kegiatan */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Kegiatan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.kegiatan_id}
                                onChange={(e) => setData('kegiatan_id', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">-- Pilih Kegiatan --</option>
                                {kegiatan?.map((kg) => (
                                    <option key={kg.id} value={kg.id}>
                                        {kg.nama_kegiatan} ({kg.jenis_sbml})
                                    </option>
                                ))}
                            </select>
                            {kegiatanTerpilih && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Jenis SBML:&nbsp;
                                    <span className={`font-semibold ${kegiatanTerpilih.jenis_sbml === 'pendataan' ? 'text-orange-600' : 'text-purple-600'}`}>
                                        {kegiatanTerpilih.jenis_sbml === 'pendataan' ? 'Pendataan' : 'Pengolahan'}
                                    </span>
                                </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500">Pilih kegiatan yang membutuhkan penugasan mitra</p>
                            {errors.kegiatan_id && <p className="text-xs text-red-500 mt-1">{errors.kegiatan_id}</p>}
                        </div>

                        {/* Pilih Mitra */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Mitra <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.mitra_id}
                                onChange={(e) => setData('mitra_id', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            >
                                <option value="">-- Pilih Mitra --</option>
                                {mitra?.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nama} — {m.nik}
                                    </option>
                                ))}
                            </select>
                            {errors.mitra_id && (
                                <p className="text-xs text-red-500">{errors.mitra_id}</p>
                            )}
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3.5 text-xs text-blue-800 dark:text-blue-200 leading-relaxed flex items-start gap-2.5">
                            <span className="text-base shrink-0">ℹ️</span>
                            <span>Satu mitra dapat ditugaskan ke beberapa kegiatan berbeda. Namun, satu mitra tidak bisa ditugaskan ke kegiatan yang sama lebih dari sekali.</span>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                            <Link
                                href={route('penugasan.index')}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition disabled:opacity-50 shadow-sm flex items-center gap-2"
                            >
                                <UserPlus size={15} />
                                {processing ? 'Menyimpan...' : 'Tugaskan Mitra'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </>
    );
}

Create.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Tambah Penugasan">
        {page}
    </AuthenticatedLayout>
);

export default Create;
