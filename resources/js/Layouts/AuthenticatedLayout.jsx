import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/Layouts/Sidebar';
import Topbar from '@/Layouts/Topbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const { auth } = usePage().props;
    const resolvedUser = user ?? auth?.user;

    // Persist sidebar state in localStorage, default to false (open) or remembered value
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef(null);
    const topbarRef = useRef(null);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', String(next));
            return next;
        });
    };

    // Close / collapse sidebar when clicking on empty area outside the sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideSidebar = sidebarRef.current && sidebarRef.current.contains(event.target);
            const clickedInsideTopbarToggle = topbarRef.current && topbarRef.current.contains(event.target);

            // If expanded and user clicks anywhere outside the sidebar and not on the topbar toggle button
            if (!isCollapsed && !clickedInsideSidebar && !clickedInsideTopbarToggle) {
                setIsCollapsed(true);
                localStorage.setItem('sidebar_collapsed', 'true');
            }

            // Also close mobile drawer if clicking outside
            if (mobileOpen && !clickedInsideSidebar) {
                setMobileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCollapsed, mobileOpen]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex">
            {/* Sidebar (Desktop & Mobile) */}
            <Sidebar 
                ref={sidebarRef}
                user={resolvedUser} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                toggleSidebar={toggleSidebar}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Mobile Backdrop Overlay */}
            {mobileOpen && (
                <div 
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                />
            )}

            {/* Main Content Area */}
            <div 
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${
                    isCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {/* Topbar */}
                <Topbar 
                    ref={topbarRef}
                    user={resolvedUser} 
                    header={header} 
                    isCollapsed={isCollapsed}
                    toggleSidebar={toggleSidebar}
                    setMobileOpen={setMobileOpen}
                />

                {/* Page Content */}
                <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}