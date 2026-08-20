import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Gauge, 
    LayoutGrid, 
    Settings, 
    Users, 
    Trash2, 
    ShieldCheck, 
    Contact, 
    CalendarCheck, 
    CalendarDays, 
    UserCheck, 
    Banknote, 
    FileText, 
    TrendingUp, 
    User, 
    LogOut,
    ChevronDown
} from 'lucide-react';

export default function Sidebar() {
    const { auth, counts } = usePage().props;
    const isAdmin = (auth?.user?.role || '').toLowerCase() === 'admin';

    const isAnyRecycleBinActive = Boolean(
        (typeof route === 'function' && route().has('users.recycle-bin') && route().current('users.recycle-bin')) ||
        (typeof route === 'function' && route().has('mitra.recycle-bin') && route().current('mitra.recycle-bin'))
    );

    const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(isAnyRecycleBinActive);

    const totalRecycleBinBadge = 
        (counts?.recycleBinMitra || 0) + 
        (counts?.recycleBinKegiatan || 0) + 
        (counts?.recycleBinPenugasan || 0) + 
        (counts?.recycleBinHonorarium || 0);

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-simitra-dark text-white flex flex-col hidden md:flex z-50">
            {/* Logo */}
            <div className="h-20 flex flex-col items-center justify-center border-b border-gray-800 bg-simitra-dark shrink-0">
                <span className="text-2xl font-bold tracking-wider">SIMITRA</span>
                <span className="text-xs text-simitra-orange font-semibold tracking-widest uppercase">LITE V1.0</span>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                    {/* Dashboard */}
                    <Link 
                        href={route('dashboard')} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${route().current('dashboard') ? 'bg-simitra-orange text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <LayoutGrid size={18} />
                        Dashboard
                    </Link>

                    {/* PENGATURAN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        PENGATURAN
                    </div>
                    
                    {/* Batas SBML */}
                    <Link 
                        href={route('sbml.index')} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('sbml.index') ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={18} />
                            Batas SBML
                        </div>
                        {!isAdmin && (
                            <span className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded font-medium">
                                Lihat
                            </span>
                        )}
                    </Link>

                    {/* ADMINISTRATOR (Hanya untuk Role Admin) */}
                    {isAdmin && (
                        <>
                            <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                ADMINISTRATOR
                            </div>
                            <Link 
                                href={route('users.index')} 
                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('users.index') ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users size={18} />
                                    Manajemen User
                                </div>
                            </Link>
                            <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} />
                                    Security Center
                                </div>
                            </a>
                            <Link 
                                href={route('mitra.index')} 
                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('mitra.index') ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Contact size={18} />
                                    Master Mitra
                                </div>
                            </Link>
                        </>
                    )}

                    {/* MANAJEMEN KEGIATAN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        MANAJEMEN KEGIATAN
                    </div>
                    
                    <Link 
                        href={route('kegiatan.index')} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('kegiatan.index') ? 'bg-[#D9531E] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <CalendarCheck size={18} />
                            Kegiatan
                        </div>
                    </Link>

                    <Link
                        href={route('penugasan.index')}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('penugasan.*') ? 'bg-[#D9531E] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <UserCheck size={18} />
                            Penugasan Mitra
                        </div>
                    </Link>

                    {/* TRANSAKSI */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        TRANSAKSI
                    </div>
                    <Link 
                        href={route('honorarium.index')} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('honorarium.*') ? 'bg-[#D9531E] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Banknote size={18} />
                            Input Honor
                        </div>
                    </Link>
                    <Link 
                        href={route('laporan-honor.index')} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('laporan-honor.*') ? 'bg-[#D9531E] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={18} />
                            Laporan Detail Honor Mitra
                        </div>
                    </Link>
                    <Link 
                        href={route('monitoring-kuota.index')} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${route().current('monitoring-kuota.*') ? 'bg-[#D9531E] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Gauge size={18} />
                            Monitoring Kuota
                        </div>
                    </Link>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={18} />
                            Monitoring SBML
                        </div>
                    </a>

                    {/* RECYCLE BINS (GRUP DROPDOWN UNTUK SEMUA RECYCLE BIN) */}
                    {isAdmin && (
                        <div className="pt-4 pb-1">
                            <div className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                RECYCLE BINS
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRecycleBinOpen(!isRecycleBinOpen)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                                    isRecycleBinOpen || isAnyRecycleBinActive
                                        ? 'bg-gray-800 text-white font-medium'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 size={18} className="text-red-400" />
                                    <span>Recycle Bins</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {totalRecycleBinBadge > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                            {totalRecycleBinBadge}
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 text-gray-400 ${
                                            isRecycleBinOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </div>
                            </button>

                            {isRecycleBinOpen && (
                                <div className="pl-4 pr-1 mt-1 space-y-1 border-l-2 border-gray-700 ml-5">
                                    {/* Recycle Bin User */}
                                    <Link
                                        href={route('users.recycle-bin')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                            route().current('users.recycle-bin')
                                                ? 'bg-simitra-orange text-white font-bold'
                                                : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <User size={14} className="text-gray-400" />
                                            <span>Recycle Bin User</span>
                                        </div>
                                    </Link>

                                    {/* Recycle Bin Mitra */}
                                    <Link
                                        href={route('mitra.recycle-bin')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                            route().current('mitra.recycle-bin')
                                                ? 'bg-simitra-orange text-white font-bold'
                                                : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Contact size={14} className="text-gray-400" />
                                            <span>Recycle Bin Mitra</span>
                                        </div>
                                        {counts?.recycleBinMitra > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                {counts.recycleBinMitra}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Recycle Bin Kegiatan */}
                                    <Link
                                        href={route('kegiatan.recycle-bin')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                            url.startsWith('/recycle-bin/kegiatan')
                                                ? 'bg-[#D9531E] text-white'
                                                : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <CalendarDays size={14} className="text-gray-400" />
                                            <span>Recycle Bin Kegiatan</span>
                                        </div>
                                        {counts?.recycleBinKegiatan > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                {counts.recycleBinKegiatan}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Recycle Bin Penugasan */}
                                    <Link
                                        href={route('penugasan.recycle-bin')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                            url.startsWith('/recycle-bin/penugasan')
                                                ? 'bg-[#D9531E] text-white'
                                                : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <UserCheck size={14} className="text-gray-400" />
                                            <span>Recycle Bin Penugasan</span>
                                        </div>
                                        {counts?.recycleBinPenugasan > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                {counts.recycleBinPenugasan}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Recycle Bin Honorarium */}
                                    <a
                                        href="#"
                                        className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Banknote size={14} className="text-gray-400" />
                                            <span>Recycle Bin Honorarium</span>
                                        </div>
                                        {counts?.recycleBinHonorarium > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                {counts.recycleBinHonorarium}
                                            </span>
                                        )}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AKUN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        AKUN
                    </div>
                    <Link 
                        href={route('profile.edit')} 
                        className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <User size={18} />
                            Profil Saya
                        </div>
                    </Link>
                    <Link 
                        href={route('logout')} 
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            Logout
                        </div>
                    </Link>
                </nav>
            </div>
        </aside>
    );
}