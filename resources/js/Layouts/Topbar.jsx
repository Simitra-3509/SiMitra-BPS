import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Link } from '@inertiajs/react';
import { User, Sun, Moon, ChevronDown, ShieldCheck, LogOut, Menu } from 'lucide-react';

const Topbar = forwardRef(function Topbar({ user, header, isCollapsed, toggleSidebar, setMobileOpen }, ref) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initial load dark mode
    useEffect(() => {
        if (document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = user?.name || user?.username || 'User';
    const role = user?.role || 'Guest';

    return (
        <header className="bg-simitra-orange text-white shadow h-14 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 transition-colors">
            <div className="flex items-center gap-3">
                {/* Desktop Toggle Button */}
                <button
                    ref={ref}
                    type="button"
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center justify-center p-2 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
                    title={isCollapsed ? "Buka Sidebar Lengkap" : "Tutup Sidebar (Hanya Ikon)"}
                >
                    <Menu size={18} />
                </button>

                {/* Mobile Toggle Button */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden flex items-center justify-center p-2 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
                    title="Buka Menu"
                >
                    <Menu size={18} />
                </button>

                <div className="font-bold text-base sm:text-lg tracking-wide">
                    {header || 'Dashboard'}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 cursor-pointer"
                >
                    {isDarkMode ? <><Sun size={16} /> <span className="hidden sm:inline">Light Mode</span></> : <><Moon size={16} /> <span className="hidden sm:inline">Dark Mode</span></>}
                </button>
                <div className="text-sm border-l border-white/30 pl-4 hidden lg:block">
                    Mode saat ini: <strong>{isDarkMode ? 'Dark' : 'Light'}</strong>
                </div>

                {/* User dropdown */}
                <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer focus:outline-none"
                    >
                        <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center shrink-0">
                            <User size={16} />
                        </div>
                        <span className="font-semibold text-sm hidden md:block">
                            {displayName}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                            {/* Role info */}
                            <div className="px-4 py-3.5 bg-gray-50/60 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Role Aktif</p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#d9531e]" />
                                    <span className="text-sm font-bold text-gray-800 dark:text-white capitalize">{role}</span>
                                </div>
                            </div>

                            {/* Profil Saya */}
                            <Link
                                href={route('profile.edit')}
                                onClick={() => setDropdownOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white border-b border-gray-100 dark:border-gray-700/50 transition-colors cursor-pointer"
                            >
                                <User size={15} className="text-gray-500 dark:text-gray-400" />
                                Profil Saya
                            </Link>

                            {/* Logout */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setDropdownOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            >
                                <LogOut size={15} className="text-red-500" />
                                Logout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
});

export default Topbar;
