import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Lock, Unlock, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ periodes, tahun, tahunList }) {
    const { auth } = usePage().props;
    const userRole = (auth?.user?.role || '').toLowerCase();
    const isPpk = userRole === 'ppk';

    const [selectedTahun, setSelectedTahun] = useState(tahun);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'kunci'|'buka', item }

    const handleTahunChange = (e) => {
        const t = e.target.value;
        setSelectedTahun(t);
        router.get(route('periode.index'), { tahun: t }, { preserveState: true });
    };

    const handleConfirm = () => {
        if (!confirmAction) return;

        const { type, item } = confirmAction;
        const url = type === 'kunci' ? route('periode.kunci') : route('periode.buka');

        router.post(url, {
            bulan: item.bulan,
            tahun: item.tahun,
        }, {
            preserveScroll: true,
            onSuccess: () => setConfirmAction(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Lock className="text-[#D9531E]" size={24} />
                            Periode Pengisian Penugasan
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Kelola status pengisian penugasan mitra per bulan (Buka / Kunci Periode oleh PPK)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Calendar size={16} /> Tahun:
                        </label>
                        <select
                            value={selectedTahun}
                            onChange={handleTahunChange}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-[#D9531E]"
                        >
                            {tahunList.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Periode Pengisian Penugasan" />

            <div className="max-w-7xl mx-auto space-y-6">
                {!isPpk && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                        <div className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Informasi Otorisasi:</strong> Penguncian dan pembukaan periode pengisian penugasan hanya dapat dilakukan oleh <strong>PPK (Pejabat Pembuat Komitmen)</strong>. Ketika periode terkunci, selain PPK tidak dapat menambah atau mengedit penugasan mitra pada bulan tersebut.
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            Status 12 Bulan Periode {selectedTahun}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Format Kunci Otomatis Sistem: Setiap tanggal 16 jam 00:01
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
                        {periodes.map((item) => {
                            const isLocked = item.status === 'terkunci';

                            return (
                                <div
                                    key={item.bulan}
                                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                                        isLocked
                                            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                                            : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-base text-gray-900 dark:text-white">
                                                {item.nama_bulan} {item.tahun}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                                    isLocked
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                }`}
                                            >
                                                {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                                                {isLocked ? 'TERKUNCI' : 'TERBUKA'}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            {isLocked ? (
                                                <div>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Dikunci oleh:</span>{' '}
                                                    {item.dikunci_oleh ? item.dikunci_oleh : 'Sistem Otomatis (Tgl 16)'}
                                                    {item.dikunci_at && (
                                                        <span className="block text-[11px] text-gray-400">
                                                            {item.dikunci_at}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Terakhir dibuka:</span>{' '}
                                                    {item.dibuka_oleh ? item.dibuka_oleh : 'Terbuka secara standar'}
                                                    {item.dibuka_at && (
                                                        <span className="block text-[11px] text-gray-400">
                                                            {item.dibuka_at}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isPpk && (
                                        <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex justify-end">
                                            {isLocked ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmAction({ type: 'buka', item })}
                                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                >
                                                    <Unlock size={14} /> Buka Kunci Periode
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmAction({ type: 'kunci', item })}
                                                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                >
                                                    <Lock size={14} /> Kunci Periode
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
                title={confirmAction?.type === 'kunci' ? 'Kunci Periode Pengisian?' : 'Buka Kunci Periode Pengisian?'}
                message={
                    confirmAction?.type === 'kunci'
                        ? `Apakah Anda yakin ingin MENGUNCI periode ${confirmAction?.item?.nama_bulan} ${confirmAction?.item?.tahun}? Operator tidak dapat menambah/mengedit penugasan pada bulan ini.`
                        : `Apakah Anda yakin ingin MEMBUKA kunci periode ${confirmAction?.item?.nama_bulan} ${confirmAction?.item?.tahun}? Operator dapat kembali mengisi penugasan.`
                }
                variant={confirmAction?.type === 'kunci' ? 'lock' : 'unlock'}
                confirmText={confirmAction?.type === 'kunci' ? 'Ya, Kunci Periode' : 'Ya, Buka Kunci'}
            />
        </AuthenticatedLayout>
    );
}
