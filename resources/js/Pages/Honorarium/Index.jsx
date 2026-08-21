import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    X, 
    Plus, 
    FileSpreadsheet, 
    Banknote, 
    CheckCircle, 
    XCircle, 
    Send, 
    Lock, 
    Info, 
    MessageSquare 
} from 'lucide-react';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';

const Index = ({ honorarium, semuaKegiatan, filters }) => {
    const { auth, flash } = usePage().props;
    const userRole = (auth?.user?.role || '').toLowerCase();
    const isPpk = userRole === 'ppk';

    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [kegiatanId, setKegiatanId] = useState(filters?.kegiatan_id || '');
    const [statusPersetujuan, setStatusPersetujuan] = useState(filters?.status_persetujuan || '');
    const [cari, setCari] = useState(filters?.cari || '');

    // Modal Tolak PPK State
    const [isTolakModalOpen, setIsTolakModalOpen] = useState(false);
    const [selectedHonorId, setSelectedHonorId] = useState(null);
    const [catatanPpk, setCatatanPpk] = useState('');

    // Modal Detail Catatan Tolak State
    const [isDetailCatatanOpen, setIsDetailCatatanOpen] = useState(false);
    const [viewCatatan, setViewCatatan] = useState('');

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        confirmText: 'Ya',
        cancelText: 'Batal',
        variant: 'info',
        onConfirm: null,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('honorarium.index'),
            { jenis_sbml: jenisSbml, kegiatan_id: kegiatanId, status_persetujuan: statusPersetujuan, cari: cari },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setJenisSbml('');
        setKegiatanId('');
        setStatusPersetujuan('');
        setCari('');
        router.get(route('honorarium.index'));
    };

    const handleAjukan = (id) => {
        setConfirmConfig({
            title: 'Ajukan Honorarium',
            message: 'Apakah Anda yakin ingin mengajukan honorarium ini ke PPK untuk persetujuan?',
            confirmText: 'Ya, Ajukan',
            cancelText: 'Batal',
            variant: 'info',
            onConfirm: () => {
                setConfirmOpen(false);
                router.post(route('honorarium.ajukan', id));
            },
        });
        setConfirmOpen(true);
    };

    const handleSetujui = (id) => {
        setConfirmConfig({
            title: 'Setujui Honorarium',
            message: 'Apakah Anda yakin ingin menyetujui pembayaran honorarium ini sebagai PPK?',
            confirmText: 'Ya, Setujui',
            cancelText: 'Batal',
            variant: 'info',
            onConfirm: () => {
                setConfirmOpen(false);
                router.post(route('honorarium.setujui', id));
            },
        });
        setConfirmOpen(true);
    };

    const openTolakModal = (id) => {
        setSelectedHonorId(id);
        setCatatanPpk('');
        setIsTolakModalOpen(true);
    };

    const handleConfirmTolak = (e) => {
        e.preventDefault();
        if (!catatanPpk.trim()) {
            alert('Catatan/Alasan penolakan wajib diisi.');
            return;
        }
        router.post(route('honorarium.tolak', selectedHonorId), {
            catatan_ppk: catatanPpk
        }, {
            onSuccess: () => setIsTolakModalOpen(false)
        });
    };

    const openViewCatatan = (catatan) => {
        setViewCatatan(catatan || 'Tidak ada catatan khusus.');
        setIsDetailCatatanOpen(true);
    };

    const renderStatusBadge = (item) => {
        const st = item.status_persetujuan || 'draft';
        if (st === 'disetujui') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle size={13} /> Disetujui PPK
                </span>
            );
        }
        if (st === 'menunggu_persetujuan') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <Send size={13} /> Menunggu PPK
                </span>
            );
        }
        if (st === 'ditolak') {
            return (
                <button
                    type="button"
                    onClick={() => openViewCatatan(item.catatan_ppk)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 hover:underline cursor-pointer"
                    title="Klik untuk lihat alasan penolakan"
                >
                    <XCircle size={13} /> Ditolak PPK <MessageSquare size={11} className="ml-0.5" />
                </button>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Draft
            </span>
        );
    };

    return (
        <>
            <Head title="Daftar Honorarium" />

            <div className="space-y-6">
                
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Honorarium</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Riwayat pembayaran honor mitra & Approval PPK</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#00AA55] hover:bg-[#008844] rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer"
                        >
                            <FileSpreadsheet size={18} /> Import Excel
                        </button>
                        <Link
                            href={route('honorarium.create')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#0080FF] hover:bg-[#0066CC] rounded-lg transition flex items-center gap-1.5 shadow-md"
                        >
                            <Plus size={18} /> Input Honor Baru
                        </Link>
                    </div>
                </div>

                {/* Alert Messages */}
                {flash?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
                        <Lock size={16} className="shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}
                {flash?.message && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                        <CheckCircle size={16} className="shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis SBML</label>
                            <select
                                value={jenisSbml}
                                onChange={(e) => setJenisSbml(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#D9531E] focus:ring-[#D9531E] rounded-lg shadow-sm text-sm py-2 px-3"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="pendataan">Pendataan</option>
                                <option value="pengolahan">Pengolahan</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kegiatan</label>
                            <select
                                value={kegiatanId}
                                onChange={(e) => setKegiatanId(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#D9531E] focus:ring-[#D9531E] rounded-lg shadow-sm text-sm py-2 px-3"
                            >
                                <option value="">Semua Kegiatan</option>
                                {semuaKegiatan?.map((kg) => (
                                    <option key={kg.id} value={kg.id}>{kg.nama_kegiatan}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status Approval</label>
                            <select
                                value={statusPersetujuan}
                                onChange={(e) => setStatusPersetujuan(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#D9531E] focus:ring-[#D9531E] rounded-lg shadow-sm text-sm py-2 px-3"
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="menunggu_persetujuan">Menunggu PPK</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                        <div className="md:col-span-5 flex gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cari</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={14} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari nama/Sobat ID/NIK..."
                                        value={cari}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#D9531E] focus:ring-[#D9531E] rounded-lg shadow-sm text-sm py-2"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#D9531E] text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors"
                                >
                                    <X size={14} /> Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Total Info */}
                <div className="flex justify-end text-sm text-gray-600 dark:text-gray-400">
                    Total: <span className="font-semibold ml-1">{honorarium?.total || 0}</span> honorarium
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Mitra</th>
                                <th className="p-4">Kegiatan</th>
                                <th className="p-4 text-center">Volume</th>
                                <th className="p-4 text-right">Total Honor</th>
                                <th className="p-4 text-center">Status Approval</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            {honorarium?.data && honorarium.data.length > 0 ? (
                                honorarium.data.map((item, index) => {
                                    const st = item.status_persetujuan || 'draft';
                                    const isDisetujui = st === 'disetujui';

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="p-4 text-center">
                                                {(honorarium.current_page - 1) * honorarium.per_page + index + 1}
                                            </td>
                                            <td className="p-4 font-mono text-xs">{item.tanggal_input ? new Date(item.tanggal_input).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : '-'}</td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                {item.penugasan?.mitra?.nama_lengkap || item.penugasan?.mitra?.nama || '-'}
                                                {item.penugasan?.mitra?.sobat_id && (
                                                    <span className="block text-xs font-mono font-normal text-orange-600 dark:text-orange-400">
                                                        ID: {item.penugasan.mitra.sobat_id}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">
                                                {item.penugasan?.kegiatan?.nama_kegiatan || '-'}
                                            </td>
                                            <td className="p-4 text-center font-mono font-bold">{item.jumlah_item || 1}</td>
                                            <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                Rp {new Intl.NumberFormat('id-ID').format(item.jumlah_honor || 0)}
                                            </td>
                                            <td className="p-4 text-center">
                                                {renderStatusBadge(item)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Tombol Ajukan (jika Draft / Ditolak) */}
                                                    {(st === 'draft' || st === 'ditolak') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAjukan(item.id)}
                                                            className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                                                            title="Ajukan persetujuan ke PPK"
                                                        >
                                                            <Send size={12} /> Ajukan
                                                        </button>
                                                    )}

                                                    {/* Tombol Khusus PPK (Setujui / Tolak) */}
                                                    {isPpk && st !== 'disetujui' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetujui(item.id)}
                                                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                                                title="Setujui Honorarium"
                                                            >
                                                                <CheckCircle size={12} /> Setujui
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openTolakModal(item.id)}
                                                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                                                title="Tolak Honorarium"
                                                            >
                                                                <XCircle size={12} /> Tolak
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Indikator Terkunci untuk Non-PPK saat disetujui */}
                                                    {isDisetujui && !isPpk && (
                                                        <span 
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                                                            title="Honor ini sudah disetujui PPK. Hubungi PPK secara langsung untuk perubahan."
                                                        >
                                                            <Lock size={12} /> Terkunci
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-2">
                                            <Banknote size={32} className="text-gray-300 dark:text-gray-600" />
                                            <p className="text-sm">Belum ada data honorarium yang sesuai filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Modal Tolak PPK */}
            <Modal show={isTolakModalOpen} onClose={() => setIsTolakModalOpen(false)} maxWidth="md">
                <form onSubmit={handleConfirmTolak} className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-600 font-bold border-b border-gray-100 dark:border-gray-700 pb-3">
                        <XCircle size={20} />
                        <h3>Penolakan Honorarium oleh PPK</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Alasan / Catatan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="4"
                            placeholder="Tuliskan alasan penolakan secara jelas untuk operator..."
                            value={catatanPpk}
                            onChange={(e) => setCatatanPpk(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                            required
                        ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsTolakModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs"
                        >
                            Simpan Penolakan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail Catatan Penolakan */}
            <Modal show={isDetailCatatanOpen} onClose={() => setIsDetailCatatanOpen(false)} maxWidth="md">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-600 font-bold border-b border-gray-100 dark:border-gray-700 pb-3">
                        <MessageSquare size={18} />
                        <h3>Catatan Penolakan dari PPK</h3>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200">
                        {viewCatatan}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsDetailCatatanOpen(false)}
                            className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                cancelText={confirmConfig.cancelText}
                variant={confirmConfig.variant}
            />
        </>
    );
};

Index.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Daftar Honorarium">
        {page}
    </AuthenticatedLayout>
);

export default Index;
