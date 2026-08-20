import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Calendar,
    Layers,
    Calculator,
    Tag,
    BadgeCheck
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, kegiatan, grandTotal }) {
    const detilList = kegiatan?.detil_kegiatan || (kegiatan?.akun_kegiatan || []).flatMap((a) => a.detil_kegiatan || []);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const totalBudget = grandTotal || detilList.reduce((sum, detil) => {
        return sum + (parseFloat(detil.total) || ((parseFloat(detil.jumlah) || 0) * (parseFloat(detil.harga_satuan) || 0)));
    }, 0);

    return (
        <>
            <Head title={`Detail Kegiatan: ${kegiatan.nama_kegiatan} - SIMITRA LITE`} />

            <div className="space-y-6 pb-12">
                {/* Header Actions */}
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
                                Detail Rincian Kegiatan
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Rincian Belanja Kegiatan & Detil SBML
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('kegiatan.edit', kegiatan.id)}
                            className="bg-[#D9531E] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
                        >
                            <Edit size={16} />
                            <span>Edit Kegiatan</span>
                        </Link>
                    </div>
                </div>

                {/* Banner Summary Total Anggaran Kegiatan */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                            <Calculator size={18} />
                            <span>Total Keseluruhan Anggaran Kegiatan</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{formatRupiah(totalBudget)}</h2>
                        <p className="text-xs text-emerald-100/90 font-medium">
                            {kegiatan.nama_kegiatan}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-white/20 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                            <Tag size={14} />
                            KRO: {kegiatan.kro || '-'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                            <Calendar size={14} />
                            {kegiatan.bulan} {kegiatan.tahun}
                        </span>
                        <span className="bg-emerald-400 text-slate-900 text-xs px-3 py-1.5 rounded-lg font-black flex items-center gap-1">
                            <BadgeCheck size={14} />
                            {kegiatan.status_aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                {/* Metadata Ringkas Kegiatan */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-gray-400 font-semibold block mb-1">Periode Pelaksanaan</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                            {kegiatan.tanggal_mulai ? `${kegiatan.tanggal_mulai} s.d ${kegiatan.tanggal_selesai || 'Selesai'}` : `${kegiatan.bulan} ${kegiatan.tahun}`}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400 font-semibold block mb-1">Deskripsi</span>
                        <span className="text-gray-700 dark:text-gray-300 italic">
                            {kegiatan.deskripsi || 'Tidak ada deskripsi'}
                        </span>
                    </div>
                </div>

                {/* Section Tabel Detil Belanja */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers size={18} className="text-[#D9531E]" />
                            Rincian Detil Belanja ({detilList.length} Rincian)
                        </h3>
                    </div>

                    {detilList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">
                            Belum ada rincian Detil belanja pada kegiatan ini.
                        </div>
                    ) : (
                        <div className="p-4 overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
                                        <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                                        <th className="py-2.5 px-3 font-bold">Rincian Detil Belanja</th>
                                        <th className="py-2.5 px-3 font-bold w-28 text-center">Jenis SBML</th>
                                        <th className="py-2.5 px-3 font-bold w-24 text-center">Frekuensi</th>
                                        <th className="py-2.5 px-3 font-bold w-20 text-center">Satuan</th>
                                        <th className="py-2.5 px-3 font-bold w-24 text-right">Volume</th>
                                        <th className="py-2.5 px-3 font-bold w-32 text-right">Harga Satuan</th>
                                        <th className="py-2.5 px-3 font-bold w-36 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {detilList.map((detil, dIdx) => {
                                        const rowTotal = parseFloat(detil.total) || ((parseFloat(detil.jumlah) || 0) * (parseFloat(detil.harga_satuan) || 0));
                                        const isPendataan = (detil.jenis_sbml || 'pendataan').toLowerCase() === 'pendataan';

                                        return (
                                            <tr key={detil.id || dIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                                <td className="py-2.5 px-3 text-center text-gray-400 font-mono font-bold">
                                                    {dIdx + 1}
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200">
                                                    {detil.nama_detil}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded text-white ${isPendataan ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                                        {isPendataan ? 'Pendataan' : 'Pengolahan'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center capitalize text-gray-600 dark:text-gray-400 font-medium">
                                                    {detil.frekuensi_penugasan || 'bulanan'}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-[11px] px-2 py-0.5 rounded font-bold">
                                                        {detil.satuan}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-800 dark:text-gray-200">
                                                    {parseFloat(detil.jumlah).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                                    {formatRupiah(detil.harga_satuan)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(rowTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Detail Kegiatan">{page}</AuthenticatedLayout>;
