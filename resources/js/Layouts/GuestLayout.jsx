import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/Utils/alert';

export default function GuestLayout({ children }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toastSuccess(flash.success);
        if (flash?.error) toastError(flash.error);
        if (flash?.warning) toastWarning(flash.warning);
        if (flash?.info) toastInfo(flash.info);
    }, [flash]);
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="inline-block">
                    <ApplicationLogo className="h-24 w-auto max-w-[240px] object-contain mx-auto" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
