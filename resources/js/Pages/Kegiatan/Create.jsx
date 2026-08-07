import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Info, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nomor_kro: '',
        nama_kegiatan: '',
        jenis_sbml: '',
        satuan: '',
        harga_satuan: '',
        tgl_mulai: '',
        tgl_selesai: '',
        deskripsi: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('kegiatan.store'));
    };

    return (
        <>
            <Head title="Tambah Kegiatan Baru" />

            <div className="space-y-6">
                {/* Header Title Section dengan Tombol Kembali */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('kegiatan.index')}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        title="Kembali ke Daftar Kegiatan"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tambah Kegiatan Baru</h1>
                        <p className="text-sm text-gray-500">Buat kegiatan survei/sensus baru</p>
                    </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left Side: Form Container (Span 2) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        
                        {/* Nomor KRO */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800">
                                Nomor KRO <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: PG-2026-03-41D5 atau 2898.BMA.007"
                                value={data.nomor_kro}
                                onChange={(e) => setData('nomor_kro', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            />
                            <p className="text-xs text-gray-400">Format: huruf, angka, tanda hubung (-), atau titik (.)</p>
                            {errors.nomor_kro && <p className="text-xs text-red-500 mt-1">{errors.nomor_kro}</p>}
                        </div>

                        {/* Nama Kegiatan */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800">
                                Nama Kegiatan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Petugas pendataan lapangan kerangka sampel area (ksa) jagung"
                                value={data.nama_kegiatan}
                                onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            />
                            {errors.nama_kegiatan && <p className="text-xs text-red-500 mt-1">{errors.nama_kegiatan}</p>}
                        </div>

                        {/* Jenis SBML & Satuan Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Jenis SBML <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.jenis_sbml}
                                    onChange={(e) => setData('jenis_sbml', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] bg-white transition"
                                >
                                    <option value="">-- Pilih Jenis --</option>
                                    <option value="pendataan">Pendataan</option>
                                    <option value="pengolahan">Pengolahan</option>
                                </select>
                                <p className="text-xs text-gray-400">Menentukan batas pagu SBML yang berlaku</p>
                                {errors.jenis_sbml && <p className="text-xs text-red-500 mt-1">{errors.jenis_sbml}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Satuan <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={data.satuan}
                                        onChange={(e) => setData('satuan', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] bg-white transition"
                                    >
                                        <option value="">-- Pilih Satuan --</option>
                                        <option value="bulan">Bulan</option>
                                        <option value="dokumen">Dokumen</option>
                                        <option value="hari">Hari</option>
                                        <option value="jam">Jam</option>
                                        <option value="kegiatan">Kegiatan</option>
                                        <option value="minggu">Minggu</option>
                                        <option value="orang">Orang</option>
                                        <option value="paket">Paket</option>
                                        <option value="responden">Responden</option>
                                        <option value="segmen">Segmen</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 shrink-0 transition"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {errors.satuan && <p className="text-xs text-red-500 mt-1">{errors.satuan}</p>}
                            </div>
                        </div>

                        {/* Harga Satuan */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800">
                                Harga Satuan <span className="text-red-500">*</span>
                            </label>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-[#D9531E] transition">
                                <span className="inline-flex items-center px-3.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-300 select-none font-medium">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={data.harga_satuan}
                                    onChange={(e) => setData('harga_satuan', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border-0 focus:outline-none focus:ring-0 text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            {errors.harga_satuan && <p className="text-xs text-red-500 mt-1">{errors.harga_satuan}</p>}
                        </div>

                        {/* Rentang Tanggal Kalender (Tgl Mulai & Tgl Selesai) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Tanggal Mulai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.tgl_mulai}
                                    onChange={(e) => setData('tgl_mulai', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] text-gray-700 transition"
                                />
                                {errors.tgl_mulai && <p className="text-xs text-red-500 mt-1">{errors.tgl_mulai}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Tanggal Selesai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.tgl_selesai}
                                    onChange={(e) => setData('tgl_selesai', e.target.value)}
                                    min={data.tgl_mulai || undefined}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] text-gray-700 transition"
                                />
                                {errors.tgl_selesai && <p className="text-xs text-red-500 mt-1">{errors.tgl_selesai}</p>}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800">
                                Deskripsi
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Deskripsi singkat kegiatan (opsional)"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D9531E] transition"
                            ></textarea>
                            {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <Link
                                href={route('kegiatan.index')}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-[#D9531E] rounded-lg hover:bg-orange-600 transition disabled:opacity-50 shadow-sm"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Kegiatan'}
                            </button>
                        </div>

                    </form>

                    {/* Right Side: Panduan Card (Span 1) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-semibold text-sm">
                            <Info size={18} className="text-gray-500" /> Panduan
                        </div>
                        <div className="p-5 space-y-5 text-xs text-gray-600 leading-relaxed">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2 text-sm">Jenis SBML</h4>
                                <ul className="space-y-2 pl-1">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold">•</span>
                                        <span><strong className="text-gray-800 font-semibold">Pendataan:</strong> Kegiatan lapangan (batas lebih tinggi)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold">•</span>
                                        <span><strong className="text-gray-800 font-semibold">Pengolahan:</strong> Kegiatan kantor (batas lebih rendah)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3.5 text-amber-900 leading-normal flex items-start gap-2.5">
                                <span className="text-base shrink-0">⚠️</span>
                                <span>Jenis SBML menentukan batas maksimal honor mitra per bulan.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

// Menjaga Persistent Layout agar Sidebar SIMITRA tidak hilang
Create.layout = (page) => <AuthenticatedLayout user={page.props.auth?.user} header="Tambah Kegiatan">{page}</AuthenticatedLayout>;

export default Create;