import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Sun, Moon, User } from 'lucide-react';

export default function Topbar({ user, header }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    return (
        <header className="bg-simitra-orange text-white shadow h-16 flex items-center justify-between px-6 z-40 sticky top-0">
            <div className="font-semibold text-xl">
                {header || 'Dashboard'}
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                    {isDarkMode ? (
                        <>
                            <Sun size={16} /> Light Mode
                        </>
                    ) : (
                        <>
                            <Moon size={16} /> Dark Mode
                        </>
                    )}
                </button>
                <div className="text-sm border-l border-white/30 pl-4">
                    Mode saat ini: <strong>{isDarkMode ? 'Dark' : 'Light'}</strong>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <User size={18} />
                    </div>
                    <span className="font-medium text-sm hidden md:block">
                        {user?.name} ▾
                    </span>
                </div>
            </div>
        </header>
    );
}
