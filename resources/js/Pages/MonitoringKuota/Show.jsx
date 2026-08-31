import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Calendar, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

const getBulanList = () => {
    return [
        { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maret' },
        { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
        { id: 7, name: 'Juli' }, { id: 8, name: 'Agustus' }, { id: 9, name: 'September' },
        { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'Desember' },
    ];
};

export default function Show({ mitra, penugasans, bulan, tahun, ringkasan }) {
    const getBulanName = (m) => {
        const bln = getBulanList().find(b => b.id == m);
        return bln ? bln.name : '';
    };

    const periodLabel = `${getBulanName(bulan)} ${tahun}`;

    const renderRingkasanCard = (title, data, type) => {
        const usage = data.batas > 0 ? (data.terpakai / data.batas) * 100 : 0;
        const isKritis = usage >= 100;
        const isWarning = usage >= 80 && usage < 100;
        
        return (
            <div className={`p-5 rounded-xl border ${type === 'pendataan' ? 'border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20' : 'border-cyan-200 bg-cyan-50 dark:border-cyan-900/50 dark:bg-cyan-900/20'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-bold text-lg ${type === 'pendataan' ? 'text-orange-700 dark:text-orange-400' : 'text-cyan-700 dark:text-cyan-400'}`}>
                        {title}
                    </h3>
                    {isKritis ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <AlertCircle size={14} /> Kritis
                        </span>
                    ) : isWarning ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <AlertCircle size={14} /> Warning
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 size={14} /> Aman
                        </span>
                    )}
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Batas Pagu:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">{formatRupiah(data.batas)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Terpakai:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{formatRupiah(data.terpakai)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-end">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sisa Kuota:</span>
                        <span className={`font-bold text-lg ${isKritis ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {formatRupiah(data.sisa)}
                        </span>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
                            <span>Penggunaan</span>
                            <span>{usage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${isKritis ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(usage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout header="Detail Monitoring Kuota">
            <Head title={`Detail Kuota - ${mitra.nama_lengkap}`} />

            <div className="space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('monitoring-kuota.index')}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                        title="Kembali"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Penggunaan Kuota</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rincian transaksi penugasan mitra per bulan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Mitra Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{mitra.nama_lengkap}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Sobat ID: {mitra.sobat_id || '-'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Status Aktif</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${mitra.status_aktif ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {mitra.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">No. Rekening</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{mitra.no_rekening || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Bank</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{mitra.nama_bank || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-gray-500" />
                                Periode: {periodLabel}
                            </h2>
                            <div className="space-y-4">
                                {renderRingkasanCard('Kuota Pendataan', ringkasan.pendataan, 'pendataan')}
                                {renderRingkasanCard('Kuota Pengolahan', ringkasan.pengolahan, 'pengolahan')}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Penugasan & Transaksi</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar kegiatan dan honor yang diterima pada {periodLabel}</p>
                            </div>
                            
                            <div className="p-0 overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">NO</th>
                                            <th className="p-4">KEGIATAN</th>
                                            <th className="p-4">JENIS SBML</th>
                                            <th className="p-4 text-center">STATUS</th>
                                            <th className="p-4 text-right">TOTAL HONOR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                        {penugasans.length > 0 ? (
                                            penugasans.map((p, index) => (
                                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                    <td className="p-4 text-gray-500 dark:text-gray-400 font-medium">{index + 1}</td>
                                                    <td className="p-4 text-gray-900 dark:text-gray-200 font-medium">
                                                        {p.kegiatan?.nama_kegiatan || '-'}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded text-white uppercase tracking-wide ${p.kegiatan?.jenis_sbml === 'pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                                            {p.kegiatan?.jenis_sbml === 'pendataan' ? 'PENDATAAN' : 'PENGOLAHAN'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            p.status === 'selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            p.status === 'dibatalkan' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Proses'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                                                        {formatRupiah(p.total_honor)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-transparent">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FileSpreadsheet size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                                                        <p>Belum ada riwayat penugasan untuk bulan ini.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {penugasans.length > 0 && (
                                        <tfoot className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                                            <tr>
                                                <td colSpan="4" className="p-4 text-right font-bold text-gray-700 dark:text-gray-300">
                                                    TOTAL HONOR DITERIMA
                                                </td>
                                                <td className="p-4 text-right font-bold text-lg text-[#D9531E] dark:text-orange-400">
                                                    {formatRupiah(penugasans.reduce((sum, p) => sum + p.total_honor, 0))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
