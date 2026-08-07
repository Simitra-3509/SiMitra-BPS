import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Sun, Moon, User, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';

export default function Topbar({ user, header }) {
    const [isDarkMode, setIsDarkMode]     = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef                     = useRef(null);

    useEffect(() => {
        const dark =
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', dark);
        setIsDarkMode(dark);
    }, []);

    const toggleDarkMode = () => {
        const next = !isDarkMode;
        document.documentElement.classList.toggle('dark', next);
        localStorage.theme = next ? 'dark' : 'light';
        setIsDarkMode(next);
    };

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const displayName = user?.nama_lengkap || user?.name || 'Administrator';
    const role        = user?.role || 'Administrator';

    return (
        <header className="bg-simitra-orange text-white shadow h-16 flex items-center justify-between px-6 z-40 sticky top-0">
            <div className="font-semibold text-xl">
                {header || 'Dashboard'}
            </div>

            <div className="flex items-center gap-4">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                    {isDarkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                </button>
                <div className="text-sm border-l border-white/30 pl-4">
                    Mode saat ini: <strong>{isDarkMode ? 'Dark' : 'Light'}</strong>
                </div>

                {/* User dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none"
                    >
                        <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center shrink-0">
                            <User size={16} />
                        </div>
                        <span className="font-medium text-sm hidden md:block">
                            {displayName}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                            {/* Role info */}
                            <div className="px-4 py-3.5">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#d9531e]" />
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{role}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700" />

                            {/* Logout */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setDropdownOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                <LogOut size={15} className="text-gray-400" />
                                Logout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
