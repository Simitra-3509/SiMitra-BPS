import { Link } from '@inertiajs/react';
import { User } from 'lucide-react';

export default function Topbar({ user, header }) {
    return (
        <header className="bg-simitra-orange text-white shadow h-14 flex items-center justify-between px-6 z-40 sticky top-0">
            <div className="font-semibold text-lg">
                {header || 'Dashboard'}
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <User size={18} />
                    <span className="font-medium">
                        {user?.name || 'User'} ▾
                    </span>
                </div>
            </div>
        </header>
    );
}
