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
    Printer,
    MapPin,
    CreditCard,
    Mail
} from 'lucide-react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};

const terbilang = (angka) => {
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    angka = Math.floor(Math.abs(Number(angka) || 0));
    if (angka === 0) return 'Nol Rupiah';

    function convert(n) {
        if (n < 12) return bilangan[n];
        if (n < 20) return convert(n - 10) + ' Belas';
        if (n < 100) return convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
        if (n < 200) return 'Seratus ' + convert(n - 100);
        if (n < 1000) return convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
        if (n < 2000) return 'Seribu ' + convert(n - 1000);
        if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
        if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
        return convert(Math.floor(n / 1000000000)) + ' Milyar ' + convert(n % 1000000000);
    }
    return convert(angka).replace(/\s+/g, ' ').trim() + ' Rupiah';
};

export default function Show({ 
    id, 
    mitra = {}, 
    periode = '', 
    bulan, 
    tahun, 
    jenis_sbml = 'Semua', 
    rincian = [], 
    total_pencairan = 0, 
    jumlah_transaksi = 0 
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout header="Detail Laporan Honor Mitra">
            <Head title={`Detail Laporan - ${mitra?.nama_lengkap || 'Mitra'}`} />

            {/* Print Stylesheet */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, header, aside, .no-print, footer {
                        display: none !important;
                    }
                    body, html {
                        background: #fff !important;
                        color: #000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 11pt !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .print-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 10mm 15mm !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #333 !important;
                        padding: 6px 8px !important;
                        color: #000 !important;
                    }
                    th {
                        background-color: #f3f4f6 !important;
                    }
                    .signature-block {
                        page-break-inside: avoid;
                    }
                }
                @media screen {
                    .print-only {
                        display: none;
                    }
                }
            `}} />

            {/* SCREEN VIEW (WEB DASHBOARD) */}
            <div className="space-y-6 no-print">
                
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
                                Detail transaksi pencairan honor untuk mitra pada periode <span className="font-semibold text-gray-700 dark:text-gray-300">{periode}</span>
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition shadow-sm cursor-pointer"
                    >
                        <Printer size={16} />
                        Cetak Laporan / Kuitansi
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Nama Lengkap</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-base">{mitra?.nama_lengkap || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sobat ID</p>
                                        <p className="font-semibold font-mono text-gray-800 dark:text-gray-200">{mitra?.sobat_id || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">NPWP</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{mitra?.npwp || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">NIK</p>
                                    <p className="font-mono text-gray-800 dark:text-gray-200">{mitra?.nik || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{mitra?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Wilayah Tugas / Domisili</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                        <MapPin size={14} className="text-gray-400" />
                                        {mitra?.kecamatan ? `Kec. ${mitra.kecamatan}` : '-'} {mitra?.desa ? `, Desa ${mitra.desa}` : ''}
                                    </p>
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
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{periode || '-'}</p>
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Jml Kegiatan</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{jumlah_transaksi} Penugasan</p>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-800/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-500">Total Honor</p>
                                    <p className="text-xl font-extrabold text-orange-700 dark:text-orange-400">{formatRupiah(total_pencairan)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Tabel */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FileText size={18} className="text-[#D9531E]" />
                                    Rincian Kegiatan &amp; Penugasan
                                </h3>
                                <span className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md text-white ${String(jenis_sbml).toLowerCase() === 'pendataan' ? 'bg-[#F26522]' : 'bg-[#3dbcc9]'}`}>
                                    {jenis_sbml}
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-5 py-4 font-bold text-center w-12">NO</th>
                                            <th className="px-5 py-4 font-bold">NAMA KEGIATAN &amp; SUB-KEGIATAN</th>
                                            <th className="px-5 py-4 font-bold text-center">TGL SELESAI</th>
                                            <th className="px-5 py-4 font-bold text-center">VOLUME</th>
                                            <th className="px-5 py-4 font-bold text-right">HARGA SATUAN</th>
                                            <th className="px-5 py-4 font-bold text-right">TOTAL</th>
                                            <th className="px-5 py-4 font-bold text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {rincian.length > 0 ? (
                                            rincian.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                                                    <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-gray-800 dark:text-gray-200">{item.nama_kegiatan}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.nama_detil} &bull; <span className="uppercase text-[10px] font-bold">{item.jenis_sbml}</span></div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400 text-xs">{item.tanggal_selesai}</td>
                                                    <td className="px-5 py-4 text-center font-mono text-gray-700 dark:text-gray-300">{item.volume} {item.satuan}</td>
                                                    <td className="px-5 py-4 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(item.harga_satuan)}</td>
                                                    <td className="px-5 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">{formatRupiah(item.total)}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Aktif' || item.status === 'Dibayar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    Tidak ada rincian kegiatan untuk periode ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <td colSpan={5} className="px-5 py-4 text-right font-bold text-gray-700 dark:text-gray-300">TOTAL KESELURUHAN</td>
                                            <td className="px-5 py-4 text-right font-extrabold text-orange-600 dark:text-orange-400 text-base font-mono">{formatRupiah(total_pencairan)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* PRINT ONLY VIEW: OFFICIAL BPS KABUPATEN JEMBER RECEIPT / BUKTI PEMBAYARAN */}
            <div className="print-only print-container font-serif">
                {/* Official BPS Header */}
                <div className="border-b-2 border-black pb-3 mb-4 text-center relative">
                    <h1 className="text-base font-bold uppercase tracking-wider">BADAN PUSAT STATISTIK KABUPATEN JEMBER</h1>
                    <p className="text-xs text-gray-700">Jl. Kartini No. 19, Kepatihan, Kec. Kaliwates, Kabupaten Jember, Jawa Timur 68131</p>
                    <p className="text-xs text-gray-700">Telepon: (0331) 487222 | Email: bps3509@bps.go.id</p>
                </div>

                <div className="text-center my-4">
                    <h2 className="text-sm font-bold uppercase underline tracking-wide">
                        BUKTI TANDA TERIMA PEMBAYARAN HONORARIUM MITRA STATISTIK
                    </h2>
                    <p className="text-xs font-semibold text-gray-800">
                        Periode: {periode}
                    </p>
                </div>

                {/* Mitra Data in 2 columns */}
                <div className="mb-4 text-xs">
                    <table className="w-full border-none" style={{ border: 'none' }}>
                        <tbody>
                            <tr style={{ border: 'none' }}>
                                <td style={{ border: 'none', width: '18%', padding: '2px 0' }} className="font-semibold">Nama Lengkap</td>
                                <td style={{ border: 'none', width: '2%', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', width: '40%', padding: '2px 0' }} className="font-bold">{mitra?.nama_lengkap || '-'}</td>
                                
                                <td style={{ border: 'none', width: '15%', padding: '2px 0' }} className="font-semibold">SOBAT ID</td>
                                <td style={{ border: 'none', width: '2%', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', width: '23%', padding: '2px 0' }}>{mitra?.sobat_id || '-'}</td>
                            </tr>
                            <tr style={{ border: 'none' }}>
                                <td style={{ border: 'none', padding: '2px 0' }} className="font-semibold">NIK</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>{mitra?.nik || '-'}</td>

                                <td style={{ border: 'none', padding: '2px 0' }} className="font-semibold">NPWP</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>{mitra?.npwp || '-'}</td>
                            </tr>
                            <tr style={{ border: 'none' }}>
                                <td style={{ border: 'none', padding: '2px 0' }} className="font-semibold">Kecamatan / Desa</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>{mitra?.kecamatan || '-'} / {mitra?.desa || '-'}</td>

                                <td style={{ border: 'none', padding: '2px 0' }} className="font-semibold">Kategori SBML</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>:</td>
                                <td style={{ border: 'none', padding: '2px 0' }}>{jenis_sbml}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Print Breakdown Table */}
                <table className="w-full text-xs mb-3">
                    <thead>
                        <tr className="bg-gray-100 text-center font-bold">
                            <th style={{ width: '5%' }}>NO</th>
                            <th style={{ width: '45%' }}>NAMA KEGIATAN &amp; URAIAN PEKERJAAN</th>
                            <th style={{ width: '12%' }}>VOLUME</th>
                            <th style={{ width: '18%' }}>HARGA SATUAN</th>
                            <th style={{ width: '20%' }}>JUMLAH (RP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rincian.length > 0 ? (
                            rincian.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        <div className="font-semibold">{item.nama_kegiatan}</div>
                                        <div className="text-[10px] text-gray-600">{item.nama_detil}</div>
                                    </td>
                                    <td className="text-center">{item.volume} {item.satuan}</td>
                                    <td className="text-right">{formatRupiah(item.harga_satuan)}</td>
                                    <td className="text-right font-semibold">{formatRupiah(item.total)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">Tidak ada data kegiatan.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-50">
                            <td colSpan="4" className="text-right font-bold">JUMLAH DITERIMA :</td>
                            <td className="text-right font-bold">{formatRupiah(total_pencairan)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Terbilang Box */}
                <div className="border border-black p-2.5 mb-6 text-xs bg-gray-50">
                    <span className="font-bold">Terbilang : </span>
                    <span className="italic font-semibold">{terbilang(total_pencairan)}</span>
                </div>

                {/* 3-Column Sign-off Block */}
                <div className="signature-block text-xs mt-6">
                    <div className="flex justify-between items-start text-center">
                        <div className="w-1/3">
                            <p>Mengetahui,</p>
                            <p className="font-semibold">Pejabat Pembuat Komitmen (PPK)</p>
                            <p className="text-[10px] text-gray-500">BPS Kabupaten Jember</p>
                            <div className="h-20"></div>
                            <p className="font-bold underline">( .................................................... )</p>
                            <p className="text-[10px]">NIP. .............................................</p>
                        </div>

                        <div className="w-1/3">
                            <p>&nbsp;</p>
                            <p className="font-semibold">Bendahara Pengeluaran</p>
                            <p className="text-[10px] text-gray-500">BPS Kabupaten Jember</p>
                            <div className="h-20"></div>
                            <p className="font-bold underline">( .................................................... )</p>
                            <p className="text-[10px]">NIP. .............................................</p>
                        </div>

                        <div className="w-1/3">
                            <p>Jember, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="font-semibold">Penerima Honor (Mitra)</p>
                            <p className="text-[10px] text-gray-500">Mitra Statistik</p>
                            <div className="h-20"></div>
                            <p className="font-bold underline">{mitra?.nama_lengkap || '( .................................................... )'}</p>
                            <p className="text-[10px]">SOBAT ID: {mitra?.sobat_id || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
