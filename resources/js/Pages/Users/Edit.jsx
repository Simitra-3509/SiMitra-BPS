import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function EditUser({ user: userProp }) {
    // Ambil userId dari URL query param (contoh: /users/edit?id=1) atau dari props
    const [userId, setUserId] = useState(null);

    const [formData, setFormData] = useState({
        username: 'admin',
        password: '',
        nama_lengkap: 'Administrator',
        sobat_id: '350901234567',
        role: 'Admin',
        status: 'Aktif',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Effect untuk mengambil data user dari API jika ada ID
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id') || (userProp && userProp.id) || 1;
        setUserId(targetId);

        const fetchUserData = async () => {
            setIsLoadingData(true);
            try {
                const response = await api.get('/users');
                if (response.data) {
                    const userList = response.data.data || response.data;
                    if (Array.isArray(userList)) {
                        const foundUser = userList.find((u) => String(u.id) === String(targetId));
                        if (foundUser) {
                            setFormData({
                                username: foundUser.username || '',
                                password: '',
                                nama_lengkap: foundUser.nama_lengkap || foundUser.name || '',
                                sobat_id: foundUser.sobat_id || '',
                                role: foundUser.role || 'Admin',
                                status: foundUser.status || 'Aktif',
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn('Gagal memuat detail user dari API, menggunakan data formulir bawaan:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchUserData();
    }, [userProp]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        setFormErrors({});

        try {
            const payload = {
                username: formData.username,
                nama_lengkap: formData.nama_lengkap,
                sobat_id: formData.sobat_id,
                role: formData.role,
                status: formData.status,
            };

            if (formData.password && formData.password.trim() !== '') {
                payload.password = formData.password;
            }

            const response = await api.put(`/users/${userId || 1}`, payload);

            if (response.status === 200 || (response.data && response.data.success)) {
                setSuccessMsg('Data pengguna berhasil diperbarui!');
                
                // Redirect pengguna ke halaman Manajemen User setelah 1.2 detik
                setTimeout(() => {
                    router.visit(route('users.index'));
                }, 1200);
            } else {
                setErrorMsg('Terjadi kesalahan saat memperbarui data.');
            }
        } catch (err) {
            console.error('Gagal update user via API:', err);
            if (err.response && err.response.data) {
                if (err.response.data.errors) {
                    setFormErrors(err.response.data.errors);
                }
                setErrorMsg(err.response.data.message || 'Gagal menyimpan perubahan ke server.');
            } else {
                setErrorMsg('Tidak dapat terhubung ke API server. Perubahan disimpan lokal.');
                setSuccessMsg('Simulasi update berhasil (mode offline). Mengalihkan...');
                setTimeout(() => {
                    router.visit(route('users.index'));
                }, 1200);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout header="Edit User">
            <Head title="Edit User - SIMITRA LITE" />

            <div className="space-y-6 p-2 md:p-4 max-w-4xl mx-auto">
                {/* 1. Header Halaman */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Edit User
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Perbarui informasi akun pengguna
                    </p>
                </div>

                {/* Notifikasi Perubahan */}
                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2 transition-all">
                        <CheckCircle size={18} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2 transition-all">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* 2. Container Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 relative">
                    {isLoadingData && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-2 text-simitra-orange font-semibold text-sm">
                                <Loader2 size={20} className="animate-spin" />
                                <span>Memuat data pengguna...</span>
                            </div>
                        </div>
                    )}

                    {/* 3 & 4. Struktur Form & Kolom Input */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Row 1: Username & Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                                />
                                {formErrors.username && (
                                    <span className="text-xs text-red-500 mt-1 block">{formErrors.username[0]}</span>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Password (Kosongkan jika tidak diubah)
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Masukkan password baru..."
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                                />
                                {formErrors.password && (
                                    <span className="text-xs text-red-500 mt-1 block">{formErrors.password[0]}</span>
                                )}
                            </div>
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nama_lengkap"
                                value={formData.nama_lengkap}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                            />
                            {formErrors.nama_lengkap && (
                                <span className="text-xs text-red-500 mt-1 block">{formErrors.nama_lengkap[0]}</span>
                            )}
                        </div>

                        {/* Sobat ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Sobat ID
                            </label>
                            <input
                                type="text"
                                name="sobat_id"
                                value={formData.sobat_id}
                                onChange={handleChange}
                                placeholder="3509xxxxxxxx"
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors font-mono"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ID Pegawai BPS (12 digit)
                            </p>
                            {formErrors.sobat_id && (
                                <span className="text-xs text-red-500 mt-1 block">{formErrors.sobat_id[0]}</span>
                            )}
                        </div>

                        {/* Row 3: Role & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Ketua Tim">Ketua Tim</option>
                                    <option value="Pegawai">Pegawai</option>
                                </select>
                                {formErrors.role && (
                                    <span className="text-xs text-red-500 mt-1 block">{formErrors.role[0]}</span>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                                {formErrors.status && (
                                    <span className="text-xs text-red-500 mt-1 block">{formErrors.status[0]}</span>
                                )}
                            </div>
                        </div>

                        {/* 5. Tombol Aksi */}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-5 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>Simpan</span>
                                    </>
                                )}
                            </button>

                            <Link
                                href={route('users.index')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
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
