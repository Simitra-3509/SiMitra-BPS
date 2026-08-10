import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, X, Plus, FileSpreadsheet, Banknote } from 'lucide-react';

const Index = ({ honorarium, filters }) => {
    const [jenisSbml, setJenisSbml] = useState(filters?.jenis_sbml || '');
    const [kegiatanId, setKegiatanId] = useState(filters?.kegiatan_id || '');
    const [cari, setCari] = useState(filters?.cari || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('honorarium.index'),
            { jenis_sbml: jenisSbml, kegiatan_id: kegiatanId, cari: cari },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setJenisSbml('');
        setKegiatanId('');
        setCari('');
        router.get(route('honorarium.index'));
    };

    return (
        <>
            <Head title="Daftar Honorarium" />

            <div className="space-y-6">
                
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Honorarium</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Riwayat pembayaran honor mitra</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 border border-emerald-500 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition flex items-center gap-2"
                        >
                            <FileSpreadsheet size={16} /> Import Excel
                        </button>
                        <Link
                            href={route('honorarium.create')}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition flex items-center gap-1.5"
                        >
                            <Plus size={18} /> Input Honor Baru
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
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
                        <div className="md:col-span-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kegiatan</label>
                            <select
                                value={kegiatanId}
                                onChange={(e) => setKegiatanId(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-[#D9531E] focus:ring-[#D9531E] rounded-lg shadow-sm text-sm py-2 px-3"
                            >
                                <option value="">Semua Kegiatan</option>
                                {/* Di masa depan, opsi kegiatan akan dimuat dari database */}
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
                                        placeholder="Cari nama/NIK mitra..."
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
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
                                <th className="p-4 w-12 text-center">#</th>
                                <th className="p-4">TANGGAL</th>
                                <th className="p-4">MITRA</th>
                                <th className="p-4">KEGIATAN</th>
                                <th className="p-4 text-center">VOLUME</th>
                                <th className="p-4 text-right">TOTAL HONOR</th>
                                <th className="p-4 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            {honorarium?.data && honorarium.data.length > 0 ? (
                                honorarium.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="p-4 text-center">
                                            {(honorarium.current_page - 1) * honorarium.per_page + index + 1}
                                        </td>
                                        <td className="p-4">-</td>
                                        <td className="p-4">-</td>
                                        <td className="p-4">-</td>
                                        <td className="p-4 text-center">-</td>
                                        <td className="p-4 text-right">-</td>
                                        <td className="p-4 text-center">-</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/50">
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
        </>
    );
};

Index.layout = (page) => (
    <AuthenticatedLayout user={page.props.auth?.user} header="Input Honor">
        {page}
    </AuthenticatedLayout>
);

export default Index;
