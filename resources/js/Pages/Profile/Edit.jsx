import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    User, Lock, Eye, EyeOff, Save, ArrowLeft,
    ShieldCheck, LogOut, Users, ShieldAlert,
    Contact, Calendar, IdCard, BadgeCheck,
    Settings, KeyRound, AlertCircle
} from 'lucide-react';
import { useState } from 'react';

export default function Edit({ status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        nama_lengkap: user.nama_lengkap || user.name || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => reset('password', 'password_confirmation'),
            preserveScroll: true,
        });
    };

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya" />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profil Saya</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Lihat dan perbarui informasi akun Anda</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">

                {/* ── LEFT: Main Form ── */}
                <div className="flex-1 space-y-5">

                    {/* Informasi Akun Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-[#d9531e]">
                            <User size={16} className="text-white" />
                            <span className="text-sm font-semibold text-white tracking-wide">Informasi Akun</span>
                        </div>

                        {/* Success alert */}
                        {status === 'profile-updated' && (
                            <div className="mx-5 mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                <BadgeCheck size={16} className="shrink-0" />
                                <span>Profil berhasil diperbarui.</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="p-5 space-y-5">

                            {/* Row: Username + Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username || ''}
                                        disabled
                                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="text-[11px] text-orange-500 mt-1 font-medium">Username tidak dapat di ubah</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={user.role || 'Admin'}
                                        disabled
                                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Nama Lengkap */}
                            <div>
                                <label htmlFor="nama_lengkap" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nama_lengkap"
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all
                                        ${errors.nama_lengkap ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-white'}`}
                                />
                                {errors.nama_lengkap && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.nama_lengkap}</p>
                                )}
                            </div>

                            {/* Sobat ID */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                    Sobat ID
                                </label>
                                <input
                                    type="text"
                                    value={user.sobat_id || ''}
                                    disabled
                                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">ID Pegawai BPS (12 digit)</p>
                            </div>

                            {/* Divider: Ganti Password */}
                            <div className="pt-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <KeyRound size={14} className="text-[#d9531e]" />
                                    <span className="text-sm font-semibold text-[#d9531e]">Ganti Password</span>
                                    <div className="flex-1 h-px bg-orange-100 dark:bg-gray-700" />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                        Password Baru
                                    </label>
                                    <div className={`flex items-center border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500
                                        ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            placeholder="Kosongkan jika tidak ingin mengubah password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="flex-1 px-3.5 py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="px-3 py-2.5 text-gray-400 hover:text-orange-500 transition-colors border-l border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600" tabIndex={-1}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">Minimal 6 karakter</p>
                                    {errors.password && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>
                                    )}
                                </div>

                                {data.password && (
                                    <div className="mt-4">
                                        <label htmlFor="password_confirmation" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className={`flex items-center border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500
                                            ${errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                            <input
                                                id="password_confirmation"
                                                type={showConfirm ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                placeholder="Ulangi password baru"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="flex-1 px-3.5 py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="px-3 py-2.5 text-gray-400 hover:text-orange-500 transition-colors border-l border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600" tabIndex={-1}>
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d9531e] hover:bg-[#c44719] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    <Save size={15} />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                                >
                                    <ArrowLeft size={15} />
                                    Kembali
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Multi-Factor Authentication Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-700 dark:bg-gray-900">
                            <ShieldCheck size={16} className="text-gray-300" />
                            <span className="text-sm font-semibold text-gray-200 tracking-wide">Multi-Factor Authentication</span>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Status:</span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                    <ShieldAlert size={12} />
                                    Belum Aktif
                                </span>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
                                <ShieldCheck size={15} />
                                Siapkan MFA
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── RIGHT: Profile Summary Panel ── */}
                <div className="xl:w-72 space-y-4 flex-shrink-0">

                    {/* Informasi Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                            <AlertCircle size={14} className="text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Informasi</span>
                        </div>

                        {/* Avatar */}
                        <div className="flex flex-col items-center pt-6 pb-5 px-5">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-[#d9531e] flex items-center justify-center shadow-lg mb-3">
                                <User size={36} className="text-white" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-base font-bold text-gray-800 dark:text-white text-center">
                                {user.nama_lengkap || user.name || 'Administrator'}
                            </h3>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                {user.username && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                                        @{user.username}
                                    </span>
                                )}
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md">
                                    {user.role || 'Admin'}
                                </span>
                            </div>

                            {/* Role label */}
                            <div className="flex items-center gap-1.5 mt-2">
                                <BadgeCheck size={13} className="text-[#d9531e]" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Roles: {user.role || 'Administrator'}
                                </span>
                            </div>
                        </div>

                        {/* Meta info */}
                        <div className="px-5 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar size={13} className="text-gray-400 shrink-0" />
                                <span>Terdaftar: {formatDate(user.created_at)}</span>
                            </div>
                            {user.sobat_id && (
                                <div className="flex items-center gap-2 text-xs text-blue-500">
                                    <IdCard size={13} className="shrink-0" />
                                    <span>Sobat ID: {user.sobat_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Administrator Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                            <Settings size={14} className="text-[#d9531e]" />
                            <span className="text-sm font-semibold text-[#d9531e]">Menu Administrator</span>
                        </div>
                        <div className="p-3 space-y-1.5">
                            <Link
                                href={route('users.index')}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all"
                            >
                                <Users size={14} className="text-gray-500" />
                                Manajemen User
                            </Link>
                            <a
                                href="#"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all"
                            >
                                <ShieldCheck size={14} className="text-gray-500" />
                                Security Center
                            </a>
                            <Link
                                href={route('mitra.index')}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all"
                            >
                                <Contact size={14} className="text-gray-500" />
                                Master Mitra
                            </Link>
                        </div>
                        <div className="px-3 pb-3">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600 hover:bg-red-100 hover:border-red-300 transition-all font-semibold cursor-pointer"
                            >
                                <LogOut size={14} />
                                Logout
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pb-4 text-center text-xs text-gray-400 dark:text-gray-500">
                <p>© 2026 BPS Kabupaten Jember - SIMITRA Lite V1.0</p>
                <p className="mt-0.5">
                    <a href="#" className="text-[#d9531e] hover:underline">BPS Kabupaten Jember</a>
                    {' '}| developed by Nanang Pamungkas
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
