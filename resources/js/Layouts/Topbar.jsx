import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { User, Sun, Moon, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';

export default function Topbar({ user, header }) {
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
        <header className="bg-simitra-orange text-white shadow h-14 flex items-center justify-between px-6 z-40 sticky top-0">
            <div className="font-semibold text-lg">
                {header || 'Dashboard'}
            </div>

            <div className="flex items-center gap-4">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer"
                >
                    {isDarkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                </button>
                <div className="text-sm border-l border-white/30 pl-4 hidden md:block">
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
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white capitalize">{role}</span>
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
