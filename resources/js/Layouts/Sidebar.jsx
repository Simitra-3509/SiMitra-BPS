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
    LogOut 
} from 'lucide-react';

const StackedTrashIcon = ({ SubIcon }) => (
    <div className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
        <Trash2 size={18} className="text-gray-300" />
        <div className="absolute -bottom-1 -right-1 bg-simitra-dark rounded-full p-[1px] text-simitra-orange border border-gray-700 shadow-sm flex items-center justify-center">
            <SubIcon size={10} />
        </div>
    </div>
);

export default function Sidebar() {
    const { url } = usePage();
    const { counts } = usePage().props;

    // --- Logika Pengecekan Active State yang Akurat ---

    // 1. Dashboard Active State
    const isDashboardActive = (typeof route === 'function' && route().current('dashboard')) || url === '/dashboard';

    // 2. Manajemen User Active State (Hanya true untuk Halaman User biasa, FALSE untuk Recycle Bin)
    const isUserActive = (typeof route === 'function' && route().has('users.index') && route().current('users.*') && !route().current('users.recycle-bin'))
        || (typeof route === 'function' && route().has('user.index') && route().current('user.*') && !route().current('user.recycle-bin'))
        || ((url.startsWith('/users') || url.startsWith('/user')) && !url.includes('recycle-bin'));

    // 3. Recycle Bin User Active State (Murni hanya true untuk halaman Recycle Bin User)
    const isUserRecycleBinActive = (typeof route === 'function' && route().has('users.recycle-bin') && route().current('users.recycle-bin'))
        || (typeof route === 'function' && route().has('user.recycle-bin') && route().current('user.recycle-bin'))
        || url.includes('/recycle-bin/users')
        || url.includes('/recycle-bin/user');

    // 4. Master Mitra Active State (Hanya true untuk Master Mitra, FALSE untuk Recycle Bin Mitra)
    const isMitraActive = (typeof route === 'function' && route().has('mitra.index') && route().current('mitra.*') && !route().current('mitra.recycle-bin'))
        || (url.startsWith('/mitra') && !url.includes('recycle-bin'));

    // 5. Recycle Bin Mitra Active State (Murni hanya true untuk halaman Recycle Bin Mitra)
    const isMitraRecycleBinActive = (typeof route === 'function' && route().has('mitra.recycle-bin') && route().current('mitra.recycle-bin'))
        || url.includes('/recycle-bin/mitra');

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-simitra-dark text-white flex flex-col hidden md:flex z-50">
            {/* Logo */}
            <div className="h-20 flex flex-col items-center justify-center border-b border-gray-800 bg-simitra-dark">
                <span className="text-2xl font-bold tracking-wider">SIMITRA</span>
                <span className="text-xs text-simitra-orange font-semibold tracking-widest uppercase">LITE V1.0</span>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                    {/* Dashboard */}
                    <Link 
                        href={typeof route === 'function' && route().has('dashboard') ? route('dashboard') : '/dashboard'} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isDashboardActive ? 'bg-simitra-orange text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <LayoutGrid size={18} />
                        Dashboard
                    </Link>

                    {/* PENGATURAN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        PENGATURAN
                    </div>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Settings size={18} />
                            Batas SBML
                        </div>
                    </a>

                    {/* ADMINISTRATOR */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        ADMINISTRATOR
                    </div>
                    <Link 
                        href={typeof route === 'function' && route().has('users.index') ? route('users.index') : '/users'} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isUserActive ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} />
                            Manajemen User
                        </div>
                    </Link>
                    <Link 
                        href={typeof route === 'function' && route().has('users.recycle-bin') ? route('users.recycle-bin') : '/recycle-bin/users'} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isUserRecycleBinActive ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <StackedTrashIcon SubIcon={User} />
                            Recycle Bin User
                        </div>
                    </Link>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} />
                            Security Center
                        </div>
                    </a>
                    <Link 
                        href={typeof route === 'function' && route().has('mitra.index') ? route('mitra.index') : '/mitra'} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isMitraActive ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Contact size={18} />
                            Master Mitra
                        </div>
                    </Link>
                    <Link 
                        href={typeof route === 'function' && route().has('mitra.recycle-bin') ? route('mitra.recycle-bin') : '/recycle-bin/mitra'} 
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isMitraRecycleBinActive ? 'bg-simitra-orange text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <StackedTrashIcon SubIcon={Contact} />
                            Recycle Bin Mitra
                        </div>
                        {counts?.recycleBinMitra > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                                {counts.recycleBinMitra}
                            </span>
                        )}
                    </Link>

                    {/* MANAJEMEN KEGIATAN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        MANAJEMEN KEGIATAN
                    </div>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <CalendarCheck size={18} />
                            Kegiatan
                        </div>
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <StackedTrashIcon SubIcon={CalendarDays} />
                            Recycle Bin Kegiatan
                        </div>
                        {counts?.recycleBinKegiatan > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                                {counts.recycleBinKegiatan}
                            </span>
                        )}
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <UserCheck size={18} />
                            Penugasan Mitra
                        </div>
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <StackedTrashIcon SubIcon={UserCheck} />
                            Recycle Bin Penugasan
                        </div>
                        {counts?.recycleBinPenugasan > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                                {counts.recycleBinPenugasan}
                            </span>
                        )}
                    </a>

                    {/* TRANSAKSI */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        TRANSAKSI
                    </div>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Banknote size={18} />
                            Input Honor
                        </div>
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <StackedTrashIcon SubIcon={Banknote} />
                            Recycle Bin Honorarium
                        </div>
                        {counts?.recycleBinHonorarium > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                                {counts.recycleBinHonorarium}
                            </span>
                        )}
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={18} />
                            Laporan Detail Honor Mitra
                        </div>
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Gauge size={18} />
                            Monitoring Kuota
                        </div>
                    </a>
                    <a href="#" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={18} />
                            Monitoring SBML
                        </div>
                    </a>

                    {/* AKUN */}
                    <div className="pt-5 pb-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        AKUN
                    </div>
                    <Link 
                        href={typeof route === 'function' && route().has('profile.edit') ? route('profile.edit') : '/profile'} 
                        className="flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <User size={18} />
                            Profil Saya
                        </div>
                    </Link>
                    <Link 
                        href={typeof route === 'function' && route().has('logout') ? route('logout') : '/logout'} 
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
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
