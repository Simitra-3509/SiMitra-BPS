import Sidebar from '@/Layouts/Sidebar';
import Topbar from '@/Layouts/Topbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const { auth } = usePage().props;
    const resolvedUser = user ?? auth?.user;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex">
            {/* Sidebar (Desktop) */}
            <Sidebar user={resolvedUser} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {/* Topbar */}
                <Topbar user={resolvedUser} header={header} />

                {/* Page Content */}
                <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}