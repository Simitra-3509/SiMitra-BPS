import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, X, FileSpreadsheet, Plus, Edit, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function Index({ auth, kegiatan, kegiatanCount, filters }) {
    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [bulan, setBulan] = useState(filters?.bulan || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [cari, setCari] = useState(filters?.cari || '');
    
    // State untuk checklist (bulk delete)
    const [selectedIds, setSelectedIds] = useState([]);

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('kegiatan.index'),
            { jenis_sbml: jenisSbml, bulan, status, tahun, cari },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setJenisSbml('');
        setBulan('');
        setStatus('');
        setTahun('');
        setCari('');
        router.get(route('kegiatan.index'));
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
            router.delete(route('kegiatan.destroy', id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} kegiatan yang dipilih?`)) {
            router.post(route('kegiatan.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(kegiatan?.data?.map(item => item.id) || []);
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const numberFormat = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return (
        <>
            <Head title="Master Kegiatan" />

            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Daftar Kegiatan</h1>
                        <p className="text-sm text-gray-500">Kelola kegiatan survei dan sensus</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-500 rounded-lg hover:bg-emerald-50 transition flex items-center gap-2"
                        >
                            <FileSpreadsheet size={16} /> Import Excel
                        </button>

                        <Link
                            href={route('kegiatan.create')}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition flex items-center gap-1.5"
                        >
                            <Plus size={18} /> Tambah Kegiatan
                        </Link>
                    </div>
                </div>

                {/* Filter & Search Bar Card */}
                <form onSubmit={handleFilter} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                        
                        {/* Filter Jenis SBML */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Jenis SBML</label>
                            <select
                                value={jenisSbml}
                                onChange={(e) => setJenisSbml(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="pendataan">Pendataan</option>
                                <option value="pengolahan">Pengolahan</option>
                            </select>
                        </div>

                        {/* Filter Bulan */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Bulan</option>
                                {namaBulan.map((item, index) => (
                                    <option key={index + 1} value={index + 1}>{item}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Non-Aktif</option>
                            </select>
                        </div>

                        {/* Filter Tahun */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tahun</label>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                            >
                                <option value="">Semua Tahun</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        {/* Input Cari & Tombol Akses */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Cari</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Nama / KRO..."
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-3 py-2 text-sm bg-[#D9531E] text-white font-medium rounded-lg hover:bg-orange-600 transition shrink-0"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-1 shrink-0"
                                >
                                    <X size={16} /> Reset
                                </button>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Status Jumlah Data */}
                <div className="text-right text-sm text-gray-600">
                    Menampilkan <span className="font-semibold">{kegiatanCount || 0}</span> kegiatan
                </div>

                {/* Tabel Data dari Database */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                        checked={kegiatan?.data?.length > 0 && selectedIds.length === kegiatan.data.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Kegiatan</th>
                                <th className="p-4 text-center">Jenis SBML</th>
                                <th className="p-4">Harga Satuan</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {kegiatan?.data && kegiatan.data.length > 0 ? (
                                kegiatan.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-[#D9531E] focus:ring-[#D9531E]"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                            />
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-500">
                                            {(kegiatan.current_page - 1) * kegiatan.per_page + index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-900">{item.nama_kegiatan}</span>
                                                <span className="text-xs text-gray-500">
                                                    {item.tgl_mulai && item.tgl_selesai ? `${item.tgl_mulai} - ${item.tgl_selesai}` : '01 - 30 September 2026'}
                                                </span>
                                                <span className="text-xs text-orange-600 font-medium mt-0.5">
                                                    KRO: {item.nomor_kro || item.kro || '2026.BMA.001'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                                                (item.jenis_sbml || item.jenis_kegiatan) === 'pendataan' 
                                                    ? 'bg-orange-100 text-orange-700' 
                                                    : 'bg-cyan-100 text-cyan-700'
                                            }`}>
                                                {item.jenis_sbml || item.jenis_kegiatan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">
                                                    Rp {numberFormat(item.harga_satuan || (item.jenis_kegiatan === 'pendataan' ? 50000 : 30000))}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    / {item.satuan || (item.jenis_kegiatan === 'pendataan' ? 'Responden' : 'Dokumen')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.status_aktif !== 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.status_aktif !== 0 ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('kegiatan.edit', item.id)}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 border border-orange-200 rounded transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400">
                                        Tidak ada data kegiatan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Floating Action Bar untuk Bulk Delete */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium">Data Terpilih</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 transition"
                            >
                                <Trash2 size={16} /> Hapus Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Manajemen Kegiatan">{page}</AuthenticatedLayout>;

export default Index;