import Dropdown from '@/Components/Dropdown';
import Navbar from '@/Components/Navbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar with all menus */}
            <Navbar user={user} />

            {/* Page header (opsional) */}
            {header && (
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </div>
            )}

            {/* Page content */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
