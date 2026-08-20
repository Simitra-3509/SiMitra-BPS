import React, { useState, forwardRef, useRef, useEffect } from 'react';
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
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const Sidebar = forwardRef(function Sidebar({
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    mobileOpen,
    setMobileOpen
}, ref) {
    const { auth, counts } = usePage().props;
    const isAdmin = (auth?.user?.role || '').toLowerCase() === 'admin';

    const isAnyRecycleBinActive = Boolean(
        (typeof route === 'function' && route().has('users.recycle-bin') && route().current('users.recycle-bin')) ||
        (typeof route === 'function' && route().has('mitra.recycle-bin') && route().current('mitra.recycle-bin')) ||
        (typeof route === 'function' && route().has('kegiatan.recycle-bin') && route().current('kegiatan.recycle-bin')) ||
        (typeof route === 'function' && route().has('penugasan.recycle-bin') && route().current('penugasan.recycle-bin'))
    );

    const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(isAnyRecycleBinActive);
    const [collapsedRecycleFlyout, setCollapsedRecycleFlyout] = useState(false);
    const flyoutRef = useRef(null);

    const totalRecycleBinBadge =
        (counts?.recycleBinMitra || 0) +
        (counts?.recycleBinKegiatan || 0) +
        (counts?.recycleBinPenugasan || 0) +
        (counts?.recycleBinHonorarium || 0);

    // Close flyout when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
                setCollapsedRecycleFlyout(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reusable NavLink Item Component
    const NavItem = ({ href, onClick, icon: Icon, label, active, badge, isButton = false, method, as }) => {
        const Component = isButton ? 'button' : Link;
        const props = isButton
            ? { type: 'button', onClick }
            : { href, method, as, onClick };

        if (isCollapsed) {
            return (
                <div className="relative group flex justify-center my-1">
                    <Component
                        {...props}
                        className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${active
                                ? 'bg-simitra-orange text-white shadow-lg shadow-orange-500/25 scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/80 hover:scale-105'
                            }`}
                    >
                        <Icon size={20} />
                        {badge && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-simitra-dark" />
                        )}
                    </Component>

                    {/* Floating Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 border border-gray-700 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span>{label}</span>
                        {badge && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <Component
                {...props}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${active
                        ? 'bg-simitra-orange text-white font-semibold shadow-md'
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate text-sm">{label}</span>
                </div>
                {badge && (
                    <span className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded font-medium">
                        {badge}
                    </span>
                )}
            </Component>
        );
    };

    const handleSidebarContainerClick = (e) => {
        if (isCollapsed) {
            // If clicking on empty area inside the collapsed sidebar (not on a navigation link or button)
            if (!e.target.closest('a') && !e.target.closest('button')) {
                setIsCollapsed(false);
                localStorage.setItem('sidebar_collapsed', 'false');
            }
        }
    };

    return (
        <aside
            ref={ref}
            onClick={handleSidebarContainerClick}
            className={`fixed inset-y-0 left-0 bg-simitra-dark text-white flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl ${isCollapsed ? 'w-20 cursor-pointer' : 'w-64'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            title={isCollapsed ? "Klik area kosong untuk membuka sidebar" : undefined}
        >
            {/* Header / Logo */}
            <div className={`h-20 flex items-center border-b border-gray-800/80 bg-simitra-dark shrink-0 relative transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
                }`}>
                {isCollapsed ? (
                    <button
                        onClick={toggleSidebar}
                        className="group flex flex-col items-center justify-center cursor-pointer p-1 rounded-xl hover:bg-gray-800/80 transition-colors"
                        title="Buka Sidebar"
                    >
                        <img
                            src="/logo.png"
                            alt="SIMITRA"
                            className="w-12 h-12 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform"
                        />
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="SIMITRA Logo"
                                className="w-12 h-12 rounded-xl object-contain shadow-md"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-wider text-white">SIMITRA</span>
                                <span className="text-[11px] text-simitra-orange font-bold tracking-widest uppercase">VERSI 2.0</span>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Tutup Sidebar"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Nav Links Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 sidebar-scrollbar">
                <nav className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3.5'}`}>

                    {/* Dashboard */}
                    <NavItem
                        href={route('dashboard')}
                        icon={LayoutGrid}
                        label="Dashboard"
                        active={route().current('dashboard')}
                    />

                    {/* SECTION: PENGATURAN */}
                    {isCollapsed ? (
                        <div className="my-3 border-t border-gray-800/80 mx-2" />
                    ) : (
                        <div className="pt-4 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            PENGATURAN
                        </div>
                    )}

                    {/* Batas SBML */}
                    <NavItem
                        href={route('sbml.index')}
                        icon={Settings}
                        label="Batas SBML"
                        active={route().current('sbml.index')}
                        badge={!isAdmin ? 'Lihat' : null}
                    />

                    {/* SECTION: ADMINISTRATOR (Hanya Admin) */}
                    {isAdmin && (
                        <>
                            {isCollapsed ? (
                                <div className="my-3 border-t border-gray-800/80 mx-2" />
                            ) : (
                                <div className="pt-4 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    ADMINISTRATOR
                                </div>
                            )}

                            <NavItem
                                href={route('users.index')}
                                icon={Users}
                                label="Manajemen User"
                                active={route().current('users.index')}
                            />

                            <NavItem
                                href="#"
                                icon={ShieldCheck}
                                label="Security Center"
                                active={false}
                            />

                            <NavItem
                                href={route('mitra.index')}
                                icon={Contact}
                                label="Master Mitra"
                                active={route().current('mitra.index')}
                            />
                        </>
                    )}

                    {/* SECTION: MANAJEMEN KEGIATAN */}
                    {isCollapsed ? (
                        <div className="my-3 border-t border-gray-800/80 mx-2" />
                    ) : (
                        <div className="pt-4 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            MANAJEMEN KEGIATAN
                        </div>
                    )}

                    <NavItem
                        href={route('kegiatan.index')}
                        icon={CalendarCheck}
                        label="Kegiatan"
                        active={route().current('kegiatan.index')}
                    />

                    <NavItem
                        href={route('penugasan.index')}
                        icon={UserCheck}
                        label="Penugasan Mitra"
                        active={route().current('penugasan.*')}
                    />

                    {/* SECTION: TRANSAKSI */}
                    {isCollapsed ? (
                        <div className="my-3 border-t border-gray-800/80 mx-2" />
                    ) : (
                        <div className="pt-4 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            TRANSAKSI
                        </div>
                    )}

                    <NavItem
                        href={route('honorarium.index')}
                        icon={Banknote}
                        label="Input Honor"
                        active={route().current('honorarium.*')}
                    />

                    <NavItem
                        href={route('laporan-honor.index')}
                        icon={FileText}
                        label="Laporan Detail Honor Mitra"
                        active={route().current('laporan-honor.*')}
                    />

                    <NavItem
                        href={route('monitoring-kuota.index')}
                        icon={Gauge}
                        label="Monitoring Kuota"
                        active={route().current('monitoring-kuota.*')}
                    />

                    <NavItem
                        href="#"
                        icon={TrendingUp}
                        label="Monitoring SBML"
                        active={false}
                    />

                    {/* SECTION: RECYCLE BINS (Khusus Admin) */}
                    {isAdmin && (
                        <>
                            {isCollapsed ? (
                                <div className="relative group flex justify-center my-1" ref={flyoutRef}>
                                    <button
                                        type="button"
                                        onClick={() => setCollapsedRecycleFlyout(!collapsedRecycleFlyout)}
                                        className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${isAnyRecycleBinActive || collapsedRecycleFlyout
                                                ? 'bg-gray-800 text-red-400 shadow-md'
                                                : 'text-gray-400 hover:text-red-400 hover:bg-gray-800/80'
                                            }`}
                                    >
                                        <Trash2 size={20} />
                                        {totalRecycleBinBadge > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-simitra-dark" />
                                        )}
                                    </button>

                                    {/* Flyout Submenu on Collapsed Mode */}
                                    {collapsedRecycleFlyout ? (
                                        <div className="absolute left-full ml-3 w-56 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 p-2 z-50 space-y-1">
                                            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase border-b border-gray-800 flex justify-between items-center">
                                                <span>Recycle Bins</span>
                                                {totalRecycleBinBadge > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                                        {totalRecycleBinBadge}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={route('users.recycle-bin')}
                                                onClick={() => setCollapsedRecycleFlyout(false)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${route().current('users.recycle-bin') ? 'bg-simitra-orange text-white font-bold' : 'text-gray-300 hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <User size={14} /> Recycle Bin User
                                                </div>
                                            </Link>
                                            <Link
                                                href={route('mitra.recycle-bin')}
                                                onClick={() => setCollapsedRecycleFlyout(false)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${route().current('mitra.recycle-bin') ? 'bg-simitra-orange text-white font-bold' : 'text-gray-300 hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Contact size={14} /> Recycle Bin Mitra
                                                </div>
                                                {counts?.recycleBinMitra > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                        {counts.recycleBinMitra}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                href={route('kegiatan.recycle-bin')}
                                                onClick={() => setCollapsedRecycleFlyout(false)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${route().current('kegiatan.recycle-bin') ? 'bg-[#D9531E] text-white font-bold' : 'text-gray-300 hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <CalendarDays size={14} /> Recycle Bin Kegiatan
                                                </div>
                                                {counts?.recycleBinKegiatan > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                        {counts.recycleBinKegiatan}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                href={route('penugasan.recycle-bin')}
                                                onClick={() => setCollapsedRecycleFlyout(false)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${route().current('penugasan.recycle-bin') ? 'bg-[#D9531E] text-white font-bold' : 'text-gray-300 hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <UserCheck size={14} /> Recycle Bin Penugasan
                                                </div>
                                                {counts?.recycleBinPenugasan > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                        {counts.recycleBinPenugasan}
                                                    </span>
                                                )}
                                            </Link>
                                            <a
                                                href="#"
                                                onClick={() => setCollapsedRecycleFlyout(false)}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Banknote size={14} /> Recycle Bin Honorarium
                                                </div>
                                                {counts?.recycleBinHonorarium > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                        {counts.recycleBinHonorarium}
                                                    </span>
                                                )}
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 border border-gray-700 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span>Recycle Bins</span>
                                            {totalRecycleBinBadge > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                                    {totalRecycleBinBadge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="pt-4 pb-1">
                                    <div className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        RECYCLE BINS
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsRecycleBinOpen(!isRecycleBinOpen)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${isRecycleBinOpen || isAnyRecycleBinActive
                                                ? 'bg-gray-800 text-white font-medium'
                                                : 'text-gray-300 hover:bg-gray-800/80'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Trash2 size={18} className="text-red-400 shrink-0" />
                                            <span className="text-sm">Recycle Bins</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {totalRecycleBinBadge > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                                    {totalRecycleBinBadge}
                                                </span>
                                            )}
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-200 text-gray-400 ${isRecycleBinOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </button>

                                    {isRecycleBinOpen && (
                                        <div className="pl-4 pr-1 mt-1 space-y-1 border-l-2 border-gray-700 ml-5">
                                            {/* Recycle Bin User */}
                                            <Link
                                                href={route('users.recycle-bin')}
                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${route().current('users.recycle-bin')
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
                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${route().current('mitra.recycle-bin')
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
                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${route().current('kegiatan.recycle-bin')
                                                        ? 'bg-[#D9531E] text-white font-bold'
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
                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${route().current('penugasan.recycle-bin')
                                                        ? 'bg-[#D9531E] text-white font-bold'
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
                        </>
                    )}

                    {/* SECTION: AKUN */}
                    {isCollapsed ? (
                        <div className="my-3 border-t border-gray-800/80 mx-2" />
                    ) : (
                        <div className="pt-4 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            AKUN
                        </div>
                    )}

                    <NavItem
                        href={route('profile.edit')}
                        icon={User}
                        label="Profil Saya"
                        active={route().current('profile.edit')}
                    />

                    <NavItem
                        href={route('logout')}
                        icon={LogOut}
                        label="Logout"
                        active={false}
                        method="post"
                        as="button"
                    />

                </nav>
            </div>
        </aside>
    );
});

export default Sidebar;