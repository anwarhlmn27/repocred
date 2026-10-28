import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Folder,
    FileText,
    ClipboardCheck,
    Database,
    ChevronDown,
    ChevronRight,
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
            { title: 'BAN-PT (4 Kriteria)', path: '/akreditasi/ban-pt' },
            { title: 'LAM (9 Kriteria)', path: '/akreditasi/lam' },
            { title: 'Matriks PPEPP', path: '/akreditasi/matriks-ppepp' },
        ],
    },
    { title: 'Kegiatan & Eviden', icon: 'FileText', path: '/kegiatan' },
    { title: 'Audit Internal', icon: 'ClipboardCheck', path: '/audit' },
    {
        title: 'Master Data',
        icon: 'Database',
        roles: ['admin_lpm'],
        children: [
            { title: 'Univ', path: '/master/univ' },
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

function SidebarItem({ item, currentPath, userRole, depth = 0 }) {
    const hasChildren = item.children && item.children.length > 0;
    const active = hasActiveChild(item.children, currentPath) || isActivePath(currentPath, item.path);
    const [open, setOpen] = useState(active);

    // Role-based visibility
    if (item.roles && item.roles.length > 0) {
        if (!item.roles.includes(userRole)) return null;
    }

    const Icon = iconMap[item.icon];

    if (hasChildren) {
        return (
            <li>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className={`sidebar-group-btn ${open ? 'sidebar-group-btn--open' : ''}`}
                >
                    <span className="sidebar-item-left">
                        {Icon && <Icon className="sidebar-icon" size={18} />}
                        <span className="sidebar-item-label">{item.title}</span>
                    </span>
                    {open ? (
                        <ChevronDown className="sidebar-chevron" size={14} />
                    ) : (
                        <ChevronRight className="sidebar-chevron" size={14} />
                    )}
                </button>

                <ul
                    className={`sidebar-submenu ${open ? 'sidebar-submenu--open' : ''}`}
                >
                    {item.children.map((child) => (
                        <SidebarItem
                            key={child.path}
                            item={child}
                            currentPath={currentPath}
                            userRole={userRole}
                            depth={depth + 1}
                        />
                    ))}
                </ul>
            </li>
        );
    }

    const isActive = isActivePath(currentPath, item.path);

    return (
        <li>
            <Link
                href={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''} ${depth > 0 ? 'sidebar-item--child' : ''}`}
            >
                {Icon && <Icon className="sidebar-icon" size={18} />}
                <span className="sidebar-item-label">{item.title}</span>
                {isActive && <span className="sidebar-active-dot" />}
            </Link>
        </li>
    );
}

export default function Sidebar({ userRole }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <svg viewBox="0 0 24 24" fill="none" className="sidebar-brand-svg">
                        <path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="sidebar-brand-text">
                    <span className="sidebar-brand-title">RepoCred</span>
                    <span className="sidebar-brand-subtitle">Sistem Akreditasi</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path || item.title}
                            item={item}
                            currentPath={currentPath}
                            userRole={userRole}
                        />
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <span className="sidebar-footer-text">v1.0.0 · RepoCred</span>
            </div>
        </aside>
    );
}
