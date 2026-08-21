import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Settings, 
    Info, 
    FileText, 
    CheckCircle2, 
    Save, 
    TrendingUp, 
    Calendar, 
    ShieldAlert, 
    RotateCcw,
    Layers,
    Monitor,
    Lock
} from 'lucide-react';
import { useState } from 'react';

export default function SbmlIndex({ limits, history, flash }) {
    const { auth } = usePage().props;
    const isAdmin = (auth?.user?.role || '').toLowerCase() === 'admin';

    const { data, setData, post, processing, errors, reset } = useForm({
        pendataan: limits?.pendataan || 3085000,
        pengolahan: limits?.pengolahan || 2854000,
        tahun: limits?.tahun || new Date().getFullYear(),
    });

    const [showToast, setShowToast] = useState(true);

    const formatRp = (number) => {
        if (!number && number !== 0) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0 
        }).format(number);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sbml.update'), {
            onSuccess: () => {
                setShowToast(true);
            }
        });
    };

    const handleSetDefault = () => {
        setData({
            pendataan: 3085000,
            pengolahan: 2854000,
            tahun: limits?.tahun || new Date().getFullYear(),
        });
    };

    return (
        <AuthenticatedLayout header="Pengaturan Batas SBML">
            <Head title="Pengaturan Batas SBML" />

            <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* Alert Notification */}
                {flash?.success && showToast && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between transition-all">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-medium text-sm">{flash.success}</span>
                        </div>
                        <button 
                            onClick={() => setShowToast(false)} 
                            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200 text-sm font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Page Title Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <div className="flex items-center gap-2 text-simitra-orange font-semibold text-sm mb-1 uppercase tracking-wider">
                            <Settings size={16} /> Modul Pengaturan System
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Batas SBML (Standard Biaya Masukan Lainnya)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Konfigurasi batas maksimal akumulasi honorarium mitra statistik per bulan per jenis kegiatan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 shrink-0">
                        <Calendar className="text-simitra-orange" size={20} />
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-semibold">Tahun Anggaran</div>
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{data.tahun}</div>
                        </div>
                    </div>
                </div>

                {/* Section 1: Edukasi & Informasi SBML */}
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-xl shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-6 -translate-y-6">
                        <FileText size={200} />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm uppercase tracking-wider">
                            <Info size={18} /> Informasi Kebijakan SBML
                        </div>

                        <h3 className="text-xl font-bold">Apa itu SBML?</h3>
                        <p className="text-blue-100 text-sm leading-relaxed max-w-4xl">
                            <strong className="text-white">SBML (Standard Biaya Masukan Lainnya)</strong> merupakan acuan resmi yang ditetapkan oleh Badan Pusat Statistik (BPS) dan Kementerian Keuangan mengenai <strong>batas batas maksimal pembayaran honorarium</strong> yang dapat diterima oleh seorang Mitra Statistik dalam 1 (satu) bulan kalender. Aturan ini bertujuan untuk menjamin pemerataan alokasi kegiatan serta mencegah terjadinya <i>overpaying</i> (kelebihan batas penerimaan honor).
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Card Pendataan */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg flex items-start gap-4">
                                <div className="p-3 bg-simitra-orange text-white rounded-lg shrink-0">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">Pendataan (Lapangan)</h4>
                                    <p className="text-xs text-blue-100 mt-0.5">
                                        Kegiatan pencacahan, wawancara, dan pengumpulan data langsung di lapangan.
                                    </p>
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded font-semibold text-xs text-white">
                                        Batas Aktif: {formatRp(limits?.pendataan)} / bulan
                                    </div>
                                </div>
                            </div>

                            {/* Card Pengolahan */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg flex items-start gap-4">
                                <div className="p-3 bg-cyan-500 text-white rounded-lg shrink-0">
                                    <Monitor size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">Pengolahan (Kantor)</h4>
                                    <p className="text-xs text-blue-100 mt-0.5">
                                        Kegiatan pengolahan data, penyuntingan (editing/coding), serta entri data di kantor.
                                    </p>
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded font-semibold text-xs text-white">
                                        Batas Aktif: {formatRp(limits?.pengolahan)} / bulan
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Form Konfigurasi SBML Dynamic */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="text-simitra-orange" size={20} />
                                    Form Konfigurasi Limit SBML
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Hanya dapat diubah secara bebas dan dinamis oleh Administrator.
                                </p>
                            </div>
                            {isAdmin ? (
                                <button
                                    type="button"
                                    onClick={handleSetDefault}
                                    className="text-xs font-semibold text-simitra-orange hover:text-orange-600 flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/50 transition-colors"
                                >
                                    <RotateCcw size={14} /> Reset Default 2026
                                </button>
                            ) : (
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                    <Lock size={14} /> Read-Only Mode
                                </span>
                            )}
                        </div>

                        {!isAdmin && (
                            <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-xs flex items-center gap-2">
                                <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                                <span>Mode Baca (Read-Only). Hanya role <strong>Admin</strong> yang diizinkan untuk mengubah nilai batas SBML.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Tahun */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Tahun Anggaran Kebijakan
                                </label>
                                <input 
                                    type="number"
                                    min="2020"
                                    max="2099"
                                    value={data.tahun}
                                    disabled={!isAdmin}
                                    onChange={(e) => setData('tahun', parseInt(e.target.value) || new Date().getFullYear())}
                                    className="w-full md:w-1/3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-simitra-orange focus:border-transparent text-sm disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                    required
                                />
                                {errors.tahun && <p className="text-red-500 text-xs mt-1">{errors.tahun}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Input Pendataan */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-simitra-orange"></span>
                                            Batas Pendataan
                                        </label>
                                        <span className="text-xs font-medium text-gray-500">Per Bulan</span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-2.5 text-gray-500 font-semibold text-sm">Rp</span>
                                        <input 
                                            type="number" 
                                            value={data.pendataan}
                                            disabled={!isAdmin}
                                            onChange={(e) => setData('pendataan', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-base focus:ring-2 focus:ring-simitra-orange focus:border-transparent disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                            placeholder="3085000"
                                            required
                                        />
                                    </div>
                                    <div className="text-xs text-simitra-orange font-semibold">
                                        Preview: {formatRp(data.pendataan)}
                                    </div>
                                    {errors.pendataan && <p className="text-red-500 text-xs">{errors.pendataan}</p>}
                                </div>

                                {/* Input Pengolahan */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                                            Batas Pengolahan
                                        </label>
                                        <span className="text-xs font-medium text-gray-500">Per Bulan</span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-2.5 text-gray-500 font-semibold text-sm">Rp</span>
                                        <input 
                                            type="number" 
                                            value={data.pengolahan}
                                            disabled={!isAdmin}
                                            onChange={(e) => setData('pengolahan', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-base focus:ring-2 focus:ring-simitra-orange focus:border-transparent disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                            placeholder="2854000"
                                            required
                                        />
                                    </div>
                                    <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                                        Preview: {formatRp(data.pengolahan)}
                                    </div>
                                    {errors.pengolahan && <p className="text-red-500 text-xs">{errors.pengolahan}</p>}
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="pt-2 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 bg-simitra-orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan SBML'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Quick Summary Card */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                                <ShieldAlert className="text-amber-500" size={20} />
                                Ringkasan Batas SBML {data.tahun}
                            </h4>
                            
                            <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                <div className="pt-2 flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Jenis Pendataan</span>
                                    <span className="font-bold text-simitra-orange">{formatRp(data.pendataan)}</span>
                                </div>
                                <div className="pt-2 flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Jenis Pengolahan</span>
                                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatRp(data.pengolahan)}</span>
                                </div>
                                <div className="pt-2 flex items-center justify-between font-semibold text-gray-800 dark:text-gray-200">
                                    <span>Status Sistem</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                        Aktif Digunakan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* History Table Card */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                Riwayat Konfigurasi Database
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 min-w-[500px] whitespace-nowrap">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-3 py-2">Kegiatan</th>
                                            <th className="px-3 py-2">Batas Max</th>
                                            <th className="px-3 py-2">Tahun</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {history && history.length > 0 ? (
                                            history.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-3 py-2 font-medium capitalize text-gray-800 dark:text-gray-200">
                                                        {item.jenis_kegiatan}
                                                    </td>
                                                    <td className="px-3 py-2 font-semibold text-simitra-orange">
                                                        {formatRp(item.batas_maksimal)}
                                                    </td>
                                                    <td className="px-3 py-2">{item.tahun}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-3 py-2 text-center text-gray-400">Belum ada riwayat</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
