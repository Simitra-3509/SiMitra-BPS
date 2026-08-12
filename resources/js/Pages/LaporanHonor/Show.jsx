import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    User, 
    Calendar, 
    FileText, 
    CheckCircle2, 
    DollarSign, 
    Printer 
} from 'lucide-react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

export default function Show({ id }) {
    // Dummy Data Based on ID
    const data = id == 3 ? {
        mitra: { nama_lengkap: 'Dewi Sartika', nik: '3201123456789003', npwp: '34.567.890.1-003.000', email: 'dewi.sartika@email.com' },
        periode: 'Mei 2026',
        jenis_sbml: 'Pendataan',
        rincian: [
            { id: 104, nama_kegiatan: 'Survei Sosial Ekonomi Nasional (Susenas)', tanggal_selesai: '12 Mei 2026', volume: 20, harga_satuan: 100000, total: 2000000, status: 'Dibayar' },
            { id: 105, nama_kegiatan: 'Survei Angkatan Kerja Nasional (Sakernas)', tanggal_selesai: '20 Mei 2026', volume: 10, harga_satuan: 100000, total: 1000000, status: 'Diproses' },
            { id: 106, nama_kegiatan: 'Survei Biaya Hidup (SBH)', tanggal_selesai: '28 Mei 2026', volume: 5, harga_satuan: 100000, total: 500000, status: 'Diproses' },
        ],
        total_pencairan: 3500000,
        jumlah_transaksi: 3,
    } : id == 2 ? {
        mitra: { nama_lengkap: 'Xander Halim', nik: '3201123456789002', npwp: '98.765.432.1-002.000', email: 'xander.halim@email.com' },
        periode: 'Mei 2026',
        jenis_sbml: 'Pengolahan',
        rincian: [
            { id: 103, nama_kegiatan: 'Entri Data Survei Industri Besar', tanggal_selesai: '18 Mei 2026', volume: 80, harga_satuan: 30000, total: 2400000, status: 'Dibayar' },
        ],
        total_pencairan: 2400000,
        jumlah_transaksi: 1,
    } : {
        mitra: { nama_lengkap: 'Budi Santoso', nik: '3201123456789001', npwp: '12.345.678.9-001.000', email: 'budi.santoso@email.com' },
        periode: 'Mei 2026',
        jenis_sbml: 'Pengolahan',
        rincian: [
            { id: 101, nama_kegiatan: 'Pengolahan Data Susenas 2026', tanggal_selesai: '10 Mei 2026', volume: 50, harga_satuan: 30000, total: 1500000, status: 'Dibayar' },
            { id: 102, nama_kegiatan: 'Pengolahan Data Sensus Ekonomi', tanggal_selesai: '25 Mei 2026', volume: 40, harga_satuan: 30000, total: 1200000, status: 'Diproses' },
        ],
        total_pencairan: 2700000,
        jumlah_transaksi: 2,
    };

    return (
        <AuthenticatedLayout header="Detail Laporan Honor Mitra">
            <Head title={`Detail Laporan - ${data.mitra.nama_lengkap}`} />

            <div className="space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('laporan-honor.index')}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                            title="Kembali"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Laporan Rincian Honorarium
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Detail transaksi pencairan honor untuk mitra pada periode ini.
                            </p>
                        </div>
                    </div>
                    
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition shadow-sm">
                        <Printer size={16} />
                        Cetak Laporan
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profil Mitra Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <User size={18} className="text-[#D9531E]" />
                                    Informasi Mitra
                                </h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{data.mitra.nama_lengkap}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NIK</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-200">{data.mitra.nik}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NPWP</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-200">{data.mitra.npwp}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-200">{data.mitra.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Transaksi */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Periode</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.periode}</p>
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Jml Transaksi</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.jumlah_transaksi} Kegiatan</p>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-800/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-500">Total Pencairan</p>
                                    <p className="text-xl font-extrabold text-orange-700 dark:text-orange-400">{formatRupiah(data.total_pencairan)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Tabel */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FileText size={18} className="text-[#D9531E]" />
                                    Rincian Kegiatan
                                </h3>
                                <span className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md text-white ${data.jenis_sbml === 'Pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                    {data.jenis_sbml}
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-5 py-4 font-bold text-center">NO</th>
                                            <th className="px-5 py-4 font-bold">NAMA KEGIATAN</th>
                                            <th className="px-5 py-4 font-bold text-center">TGL SELESAI</th>
                                            <th className="px-5 py-4 font-bold text-center">VOLUME</th>
                                            <th className="px-5 py-4 font-bold text-right">HARGA SATUAN</th>
                                            <th className="px-5 py-4 font-bold text-right">TOTAL</th>
                                            <th className="px-5 py-4 font-bold text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {data.rincian.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                                                <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">{item.nama_kegiatan}</td>
                                                <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{item.tanggal_selesai}</td>
                                                <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{item.volume}</td>
                                                <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-400">{formatRupiah(item.harga_satuan)}</td>
                                                <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">{formatRupiah(item.total)}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Dibayar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <td colSpan={5} className="px-5 py-4 text-right font-bold text-gray-700 dark:text-gray-300">TOTAL KESELURUHAN</td>
                                            <td className="px-5 py-4 text-right font-extrabold text-orange-600 dark:text-orange-400 text-base">{formatRupiah(data.total_pencairan)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
