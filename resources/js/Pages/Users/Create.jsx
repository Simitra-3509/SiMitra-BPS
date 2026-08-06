import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        nama_lengkap: '',
        sobat_id: '',
        role: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Memanggil route('user.store') atau fallback ke route('users.store') / '/users'
        const storeRoute = typeof route === 'function' && route().has('user.store') 
            ? route('user.store') 
            : (typeof route === 'function' && route().has('users.store') ? route('users.store') : '/users');

        post(storeRoute);
    };

    const backRoute = typeof route === 'function' && route().has('users.index') 
        ? route('users.index') 
        : (typeof route === 'function' && route().has('user.index') ? route('user.index') : '/users');

    return (
        <AuthenticatedLayout header="Tambah User Baru">
            <Head title="Tambah User Baru - SIMITRA LITE" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* 1. Header Halaman */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Tambah User Baru
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Buat akun pengguna baru
                    </p>
                </div>

                {/* 2. Container Form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        
                        {/* Username * */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Masukkan username"
                                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                                    errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-500'
                                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors`}
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                            )}
                        </div>

                        {/* Password * */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-500'
                                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Nama Lengkap * */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                placeholder="Masukkan nama lengkap beserta gelar"
                                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                                    errors.nama_lengkap ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-500'
                                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors`}
                            />
                            {errors.nama_lengkap && (
                                <p className="mt-1 text-xs text-red-500">{errors.nama_lengkap}</p>
                            )}
                        </div>

                        {/* Sobat ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Sobat ID
                            </label>
                            <input
                                type="text"
                                value={data.sobat_id}
                                onChange={(e) => setData('sobat_id', e.target.value)}
                                placeholder="Contoh: 350922010017"
                                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                                    errors.sobat_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-500'
                                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors`}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                ID Pegawai BPS (12 digit)
                            </p>
                            {errors.sobat_id && (
                                <p className="mt-1 text-xs text-red-500">{errors.sobat_id}</p>
                            )}
                        </div>

                        {/* Role * */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                                    errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-500'
                                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors`}
                            >
                                <option value="" disabled>
                                    -- Pilih Role --
                                </option>
                                <option value="Administrator">Administrator</option>
                                <option value="Admin">Admin</option>
                                <option value="Ketua Tim">Ketua Tim</option>
                                <option value="Operator">Operator</option>
                                <option value="Pegawai">Pegawai</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-xs text-red-500">{errors.role}</p>
                            )}
                        </div>

                        {/* 4. Tombol Aksi */}
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
                            >
                                <CheckCircle size={16} />
                                <span>{processing ? 'Menyimpan...' : 'Simpan'}</span>
                            </button>

                            <Link
                                href={backRoute}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={16} />
                                <span>Kembali</span>
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
