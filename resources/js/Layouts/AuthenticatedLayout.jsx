import Sidebar from '@/Layouts/Sidebar';
import Topbar from '@/Layouts/Topbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex">
            {/* Sidebar (Desktop) */}
            <Sidebar user={user} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {/* Topbar */}
                <Topbar user={user} header={header} />

                {/* Page Content */}
                <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
