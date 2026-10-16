import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Settings } from 'lucide-react';

export default function Edit({ config }) {
    const { data, setData, put, processing, errors } = useForm({
        kode_program: config.kode_program,
        kode_akun: config.kode_akun,
        komponen_default: config.komponen_default,
        subkomponen_default: config.subkomponen_default,
        regex_pattern: config.regex_pattern ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('konfigurasi-anggaran.update', config.id));
    };

    return (
        <AuthenticatedLayout header={`Edit Konfigurasi Anggaran ${config.tahun_anggaran}`}>
            <Head title={`Edit Konfigurasi ${config.tahun_anggaran}`} />

            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('konfigurasi-anggaran.index')}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings className="text-[#D9531E]" /> Edit Konfigurasi — Tahun {config.tahun_anggaran}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                                <strong>Tahun Anggaran:</strong> {config.tahun_anggaran} (tidak dapat diubah)
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kode Program <span className="text-red-500">*</span> <span className="text-gray-400">(contoh: 054.01.GG)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_program}
                                    onChange={(e) => setData('kode_program', e.target.value.toUpperCase())}
                                    placeholder="054.01.GG"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E] font-mono"
                                />
                                {errors.kode_program && <p className="text-sm text-red-500 mt-1">{errors.kode_program}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kode Akun <span className="text-red-500">*</span> <span className="text-gray-400">(contoh: 521213)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_akun}
                                    onChange={(e) => setData('kode_akun', e.target.value)}
                                    placeholder="521213"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E] font-mono"
                                />
                                {errors.kode_akun && <p className="text-sm text-red-500 mt-1">{errors.kode_akun}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Komponen Default <span className="text-red-500">*</span> <span className="text-gray-400">(3 digit)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    value={data.komponen_default}
                                    onChange={(e) => setData('komponen_default', e.target.value)}
                                    placeholder="005"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E] font-mono"
                                />
                                {errors.komponen_default && <p className="text-sm text-red-500 mt-1">{errors.komponen_default}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Subkomponen Default <span className="text-red-500">*</span> <span className="text-gray-400">(1 huruf kapital)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={1}
                                    value={data.subkomponen_default}
                                    onChange={(e) => setData('subkomponen_default', e.target.value.toUpperCase())}
                                    placeholder="A"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E] font-mono"
                                />
                                {errors.subkomponen_default && <p className="text-sm text-red-500 mt-1">{errors.subkomponen_default}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Regex Pattern (Validasi)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.regex_pattern}
                                    onChange={(e) => setData('regex_pattern', e.target.value)}
                                    placeholder="^\\d{3}\\.[A-Z]{2}\\.[A-Z]{2}\\.[A-Z]{3}\\.[A-Z]{3}\\.[A-Z]{3}\\.[A-Z]\\.[A-Z]{6}$"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-[#D9531E] focus:border-[#D9531E] font-mono text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Pola validasi untuk kode beban anggaran. Kosongkan jika tidak ingin divalidasi dengan regex.
                                </p>
                                {errors.regex_pattern && <p className="text-sm text-red-500 mt-1">{errors.regex_pattern}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('konfigurasi-anggaran.index')}
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
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
