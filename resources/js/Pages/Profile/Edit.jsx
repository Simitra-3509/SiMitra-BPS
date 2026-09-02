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
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-5">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Profil Saya</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lihat dan kelola informasi akun Anda.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">

                {/* ── LEFT: Main Form ── */}
                <div className="flex-1 space-y-5">

                    {/* Informasi Akun Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d9531e]/10 flex items-center justify-center">
                                <User size={18} className="text-[#d9531e]" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Akun</h2>
                        </div>

                        {/* Success alert */}
                        {status === 'profile-updated' && (
                            <div className="mx-6 mt-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                <BadgeCheck size={18} className="shrink-0" />
                                <span>Profil berhasil diperbarui.</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="p-6 space-y-6">

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
                            <div className="pt-4 mt-2">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <KeyRound size={16} className="text-[#d9531e]" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Ganti Password</h3>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
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
                            <div className="flex items-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d9531e] hover:bg-[#c44719] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    <Save size={16} />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                                >
                                    <ArrowLeft size={16} />
                                    Kembali
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Multi-Factor Authentication Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keamanan Ekstra (MFA)</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                Lindungi akun Anda dengan menambahkan lapisan keamanan tambahan. Saat ini Multi-Factor Authentication belum aktif.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
                                        <ShieldAlert size={14} />
                                        Belum Aktif
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm">
                                    <ShieldCheck size={16} />
                                    Siapkan MFA
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── RIGHT: Profile Summary Panel ── */}
                <div className="xl:w-72 space-y-4 flex-shrink-0">

                    {/* Informasi Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                        {/* Decorative Background */}
                        <div className="h-24 bg-gradient-to-r from-[#d9531e] to-orange-400"></div>

                        {/* Avatar */}
                        <div className="flex flex-col items-center px-6 pb-6 relative -mt-12">
                            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-md mb-4">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <User size={40} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                                {user.nama_lengkap || user.name || 'Administrator'}
                            </h3>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center mt-3">
                                {user.username && (
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                                        @{user.username}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                                    <BadgeCheck size={14} />
                                    {user.role || 'Admin'}
                                </span>
                            </div>
                        </div>

                        {/* Meta info */}
                        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar size={16} /> Terdaftar
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-gray-200">{formatDate(user.created_at)}</span>
                            </div>
                            {user.sobat_id && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <IdCard size={16} /> Sobat ID
                                    </span>
                                    <span className="font-mono font-bold text-gray-900 dark:text-gray-200">{user.sobat_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Administrator Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Akses Cepat</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            <Link
                                href={route('users.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#d9531e] hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#d9531e] transition-all group"
                            >
                                <Users size={18} className="text-gray-400 group-hover:text-[#d9531e]" />
                                Manajemen User
                            </Link>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#d9531e] hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#d9531e] transition-all group"
                            >
                                <ShieldCheck size={18} className="text-gray-400 group-hover:text-[#d9531e]" />
                                Security Center
                            </a>
                            <Link
                                href={route('mitra.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#d9531e] hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#d9531e] transition-all group"
                            >
                                <Contact size={18} className="text-gray-400 group-hover:text-[#d9531e]" />
                                Master Mitra
                            </Link>
                        </div>
                        <div className="px-4 pb-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all font-bold cursor-pointer"
                            >
                                <LogOut size={16} />
                                Keluar Aplikasi
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
