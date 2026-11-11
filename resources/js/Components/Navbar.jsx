import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Folder,
    FileText,
    ClipboardCheck,
    Database,
    ChevronDown,
    Menu,
    X,
    User,
    KeyRound,
    LogOut,
} from 'lucide-react';

const iconMap = {
    LayoutDashboard,
    FolderFolder: Folder,
    FileText,
    ClipboardCheck,
    Database,
};

const menuItems = [
    { title: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    {
        title: 'Dokumen Akreditasi',
        icon: 'FolderFolder',
        children: [
            { title: 'BAN-PT', path: '/akreditasi/ban-pt' },
            { title: 'LAM', path: '/akreditasi/lam' },
            { title: 'Matriks PPEPP', path: '/akreditasi/matriks-ppepp' },
        ],
    },
    // { title: 'Kegiatan & Eviden', icon: 'FileText', path: '/kegiatan' },
    // { title: 'Audit Internal', icon: 'ClipboardCheck', path: '/audit' },
    {
        title: 'Master Data',
        icon: 'Database',
        children: [
            { title: 'Universitas', path: '/master/univ' },
            { title: 'Fakultas', path: '/master/fakultas' },
            { title: 'Agency', path: '/master/agency' },
            { title: 'Prodi', path: '/master/prodi' },
            { title: 'Tahun Akademik', path: '/master/tahun-akademik' },
            { title: 'Sesi Akreditasi', path: '/master/sesi-akreditasi' },
            { title: 'Kriteria Akreditasi', path: '/master/kriteria' },
            { title: 'Pengguna', path: '/master/users' },
        ],
    },
];

function isActivePath(currentPath, itemPath) {
    if (!itemPath) return false;
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

function hasActiveChild(children, currentPath) {
    return children?.some((child) => isActivePath(currentPath, child.path));
}

/* ── Desktop dropdown menu item ── */
function NavItem({ item, currentPath, userRole }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);


    const Icon = iconMap[item.icon];
    const hasChildren = item.children?.length > 0;
    const active = hasChildren
        ? hasActiveChild(item.children, currentPath)
        : isActivePath(currentPath, item.path);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    if (!hasChildren) {
        return (
            <Link
                href={item.path}
                className={`nav-item ${active ? 'nav-item--active' : ''}`}
            >
                {Icon && <Icon size={15} className="nav-item-icon" />}
                {item.title}
            </Link>
        );
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`nav-item nav-item-btn ${active || open ? 'nav-item--active' : ''}`}
            >
                {Icon && <Icon size={15} className="nav-item-icon" />}
                {item.title}
                <ChevronDown
                    size={13}
                    className={`nav-chevron ${open ? 'nav-chevron--open' : ''}`}
                />
            </button>

            {open && (
                <div className="nav-dropdown" onClick={() => setOpen(false)}>
                    {item.children.map((child) => (
                        <Link
                            key={child.path}
                            href={child.path}
                            className={`nav-dropdown-item ${isActivePath(currentPath, child.path)
                                ? 'nav-dropdown-item--active'
                                : ''
                                }`}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── User dropdown (Profile / Change Password / Sign Out) ── */
function UserDropdown({ user }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="navbar-user-btn"
                aria-label="User menu"
            >
                <span className="navbar-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                </span>
                <span className="navbar-username">{user?.name}</span>
                <ChevronDown
                    size={13}
                    className={`nav-chevron ${open ? 'nav-chevron--open' : ''}`}
                />
            </button>

            {open && (
                <div className="user-dropdown" onClick={() => setOpen(false)}>
                    {/* Info */}
                    <div className="user-dropdown-header">
                        <p className="user-dropdown-name">{user?.name}</p>
                        <p className="user-dropdown-email">{user?.email}</p>
                    </div>

                    <div className="user-dropdown-divider" />

                    {/* Profile */}
                    <Link href={route('profile.edit')} className="user-dropdown-item">
                        <User size={14} className="user-dropdown-icon" />
                        Profile
                    </Link>

                    {/* Change Password — arahkan ke profile (tab password) */}
                    <Link href={route('profile.edit') + '#update-password'} className="user-dropdown-item">
                        <KeyRound size={14} className="user-dropdown-icon" />
                        Ganti Password
                    </Link>

                    <div className="user-dropdown-divider" />

                    {/* Sign Out */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="user-dropdown-item user-dropdown-item--danger"
                    >
                        <LogOut size={14} className="user-dropdown-icon" />
                        Sign Out
                    </Link>
                </div>
            )}
        </div>
    );
}

/* ── Mobile menu item ── */
function MobileNavItem({ item, currentPath, userRole, onClose }) {
    const [open, setOpen] = useState(false);

    if (item.roles?.length && !item.roles.includes(userRole)) return null;

    const Icon = iconMap[item.icon];
    const hasChildren = item.children?.length > 0;
    const active = hasChildren
        ? hasActiveChild(item.children, currentPath)
        : isActivePath(currentPath, item.path);

    if (!hasChildren) {
        return (
            <Link
                href={item.path}
                onClick={onClose}
                className={`mobile-nav-item ${active ? 'mobile-nav-item--active' : ''}`}
            >
                {Icon && <Icon size={16} className="nav-item-icon" />}
                {item.title}
            </Link>
        );
    }

    return (
        <div>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`mobile-nav-item mobile-nav-item-btn w-full ${active || open ? 'mobile-nav-item--active' : ''}`}
            >
                <span className="flex items-center gap-2">
                    {Icon && <Icon size={16} className="nav-item-icon" />}
                    {item.title}
                </span>
                <ChevronDown
                    size={13}
                    className={`nav-chevron ${open ? 'nav-chevron--open' : ''}`}
                />
            </button>
            {open && (
                <div className="mobile-submenu">
                    {item.children.map((child) => (
                        <Link
                            key={child.path}
                            href={child.path}
                            onClick={onClose}
                            className={`mobile-submenu-item ${isActivePath(currentPath, child.path)
                                ? 'mobile-submenu-item--active'
                                : ''
                                }`}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Main Navbar export ── */
export default function Navbar({ user }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const userRole = typeof user?.role === 'object' && user?.role !== null ? user.role.code : (user?.role ?? null);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="app-navbar">
            <div className="navbar-inner">
                {/* Brand */}
                <Link href="/dashboard" className="navbar-brand">
                    <span className="navbar-brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                            <path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    <span className="navbar-brand-name">RepoCred</span>
                </Link>

                {/* Desktop menu */}
                <div className="navbar-menu">
                    {menuItems.map((item) => (
                        <NavItem
                            key={item.path || item.title}
                            item={item}
                            currentPath={currentPath}
                            userRole={userRole}
                        />
                    ))}
                </div>

                {/* Right side */}
                <div className="navbar-right">
                    {/* Desktop user dropdown */}
                    <div className="hidden sm:block">
                        <UserDropdown user={user} />
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="navbar-hamburger sm:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="mobile-menu">
                    {menuItems.map((item) => (
                        <MobileNavItem
                            key={item.path || item.title}
                            item={item}
                            currentPath={currentPath}
                            userRole={userRole}
                            onClose={() => setMobileOpen(false)}
                        />
                    ))}

                    {/* Mobile user section */}
                    <div className="mobile-menu-footer">
                        <div className="mobile-user-info">
                            <span className="navbar-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                            <div>
                                <p className="mobile-user-name">{user?.name}</p>
                                <p className="mobile-user-email">{user?.email}</p>
                            </div>
                        </div>
                        <div className="mobile-footer-links">
                            <Link
                                href={route('profile.edit')}
                                onClick={() => setMobileOpen(false)}
                                className="mobile-footer-link"
                            >
                                <User size={13} /> Profile
                            </Link>
                            <Link
                                href={route('profile.edit') + '#update-password'}
                                onClick={() => setMobileOpen(false)}
                                className="mobile-footer-link"
                            >
                                <KeyRound size={13} /> Ganti Password
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mobile-footer-link mobile-footer-link--danger"
                            >
                                <LogOut size={13} /> Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
