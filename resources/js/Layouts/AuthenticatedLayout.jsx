import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/Utils/alert';

export default function AuthenticatedLayout({ header, children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const flash = props.flash;
    const currentPath = url.split('?')[0];

    // Otomatis tampilkan toast notification saat ada flash message dari backend
    useEffect(() => {
        if (flash?.success) {
            toastSuccess(flash.success);
        }
        if (flash?.error) {
            toastError(flash.error);
        }
        if (flash?.warning) {
            toastWarning(flash.warning);
        }
        if (flash?.info) {
            toastInfo(flash.info);
        }
    }, [flash]);

    const [menuToggle, setMenuToggle] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const userMenuRef = useRef(null);

    // Auto open parent menu jika ada child aktif
    const isAkreditasiActive = currentPath.startsWith('/akreditasi');
    const isMasterActive = currentPath.startsWith('/master');

    const [openMenus, setOpenMenus] = useState({
        akreditasi: isAkreditasiActive,
        master: isMasterActive,
    });

    const toggleSubmenu = (key) => {
        setOpenMenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div id="main-wrapper" className={menuToggle ? 'show menu-toggle' : 'show'}>
            {/* Nav Header (Logo & Hamburger) */}
            <div className="nav-header">
                <Link href="/dashboard" className="brand-logo">
                    <img className="logo-abbr" src="/images/logo-white.png" alt="RepoCred" />
                    <img className="logo-compact" src="/images/logo-text-white.png" alt="RepoCred" />
                    <span
                        className="brand-title"
                        style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.5px' }}
                    >
                        RepoCred
                    </span>
                </Link>

                <div className="nav-control" onClick={() => setMenuToggle(!menuToggle)}>
                    <div className={`hamburger ${menuToggle ? 'is-active' : ''}`}>
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                    </div>
                </div>
            </div>

            {/* Header (Top Bar) */}
            <div className="header">
                <div className="header-content">
                    <nav className="navbar navbar-expand">
                        <div className="navbar-collapse justify-content-between d-flex">
                            <div className="header-left">
                                <div className="search_bar dropdown">
                                    <span className="search_icon p-3 c-pointer">
                                        <i className="la la-search text-muted"></i>
                                    </span>
                                    <div className="dropdown-menu p-0 m-0">
                                        <form>
                                            <input
                                                className="form-control"
                                                type="search"
                                                placeholder="Cari borang atau dokumen..."
                                                aria-label="Search"
                                            />
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <ul className="navbar-nav header-right">
                                <li className="nav-item dropdown header-profile" ref={userMenuRef}>
                                    <a
                                        className="nav-link cursor-pointer"
                                        href="#"
                                        role="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUserDropdown(!userDropdown);
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                    >
                                        <img
                                            src="/images/avatar/1.jpg"
                                            alt={user?.name || 'Administrator'}
                                            className="border border-slate-300"
                                            style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                if (e.currentTarget.nextElementSibling) {
                                                    e.currentTarget.nextElementSibling.classList.remove('d-none');
                                                    e.currentTarget.nextElementSibling.classList.add('d-flex');
                                                }
                                            }}
                                        />
                                        <div
                                            className="d-none align-items-center justify-content-center text-white font-weight-bold"
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                backgroundColor: '#4361ee',
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div className="header-info d-none d-sm-block text-start">
                                            <span className="fs-14 font-w600 d-block text-dark">
                                                {user?.name || 'Administrator'}
                                            </span>
                                            <small className="text-muted text-capitalize">
                                                {user?.role ? user.role.replace('_', ' ') : 'admin lpm'}
                                            </small>
                                        </div>
                                        <i
                                            className={`la la-angle-down ms-1 transition-transform ${
                                                userDropdown ? 'rotate-180' : ''
                                            }`}
                                        ></i>
                                    </a>

                                    {userDropdown && (
                                        <div
                                            className="dropdown-menu dropdown-menu-end show shadow-lg border"
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                top: '100%',
                                                minWidth: '14rem',
                                                zIndex: 1050,
                                                backgroundColor: '#fff',
                                            }}
                                        >
                                            <div className="p-3 border-bottom bg-light">
                                                <h6 className="mb-0 text-dark font-w600">{user?.name || 'Administrator'}</h6>
                                                <small className="text-muted">{user?.email || ''}</small>
                                            </div>
                                            <Link
                                                href={route('profile.edit')}
                                                className="dropdown-item ai-icon py-2"
                                                onClick={() => setUserDropdown(false)}
                                            >
                                                <i className="la la-user text-primary me-2 fs-18"></i>
                                                <span>Profile Akun</span>
                                            </Link>
                                            <Link
                                                href={route('profile.edit') + '#update-password'}
                                                className="dropdown-item ai-icon py-2"
                                                onClick={() => setUserDropdown(false)}
                                            >
                                                <i className="la la-key text-success me-2 fs-18"></i>
                                                <span>Ganti Password</span>
                                            </Link>
                                            <div className="dropdown-divider my-1"></div>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="dropdown-item ai-icon text-danger w-100 text-start py-2"
                                                onClick={() => setUserDropdown(false)}
                                            >
                                                <i className="la la-sign-out text-danger me-2 fs-18"></i>
                                                <span>Keluar / Sign Out</span>
                                            </Link>
                                        </div>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Sidebar Navigation (dlabnav) */}
            <div className="dlabnav">
                <div className="dlabnav-scroll">
                    <ul className="metismenu" id="menu">
                        <li className="nav-label first">Menu Utama</li>

                        {/* Dashboard */}
                        <li className={currentPath === '/dashboard' ? 'mm-active' : ''}>
                            <Link href="/dashboard" className="ai-icon" aria-expanded="false">
                                <i className="la la-home"></i>
                                <span className="nav-text">Dashboard</span>
                            </Link>
                        </li>

                        {/* Dokumen Akreditasi */}
                        <li className={isAkreditasiActive ? 'mm-active' : ''}>
                            <a
                                className="has-arrow ai-icon"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleSubmenu('akreditasi');
                                }}
                                aria-expanded={openMenus.akreditasi ? 'true' : 'false'}
                            >
                                <i className="la la-folder-open"></i>
                                <span className="nav-text">Dokumen Akreditasi</span>
                            </a>
                            <ul
                                aria-expanded="false"
                                className={`mm-collapse ${openMenus.akreditasi ? 'mm-show' : ''}`}
                                style={{ display: openMenus.akreditasi ? 'block' : 'none' }}
                            >
                                <li className={currentPath === '/akreditasi/ban-pt' ? 'mm-active' : ''}>
                                    <Link
                                        href="/akreditasi/ban-pt"
                                        className={currentPath === '/akreditasi/ban-pt' ? 'mm-active' : ''}
                                    >
                                        BAN-PT (4 Kriteria)
                                    </Link>
                                </li>
                                <li className={currentPath === '/akreditasi/lam' ? 'mm-active' : ''}>
                                    <Link
                                        href="/akreditasi/lam"
                                        className={currentPath === '/akreditasi/lam' ? 'mm-active' : ''}
                                    >
                                        LAM (9 Kriteria)
                                    </Link>
                                </li>
                                <li className={currentPath === '/akreditasi/matriks-ppepp' ? 'mm-active' : ''}>
                                    <Link
                                        href="/akreditasi/matriks-ppepp"
                                        className={currentPath === '/akreditasi/matriks-ppepp' ? 'mm-active' : ''}
                                    >
                                        Matriks PPEPP
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-label">Pengaturan Sistem</li>

                        {/* Master Data */}
                        <li className={isMasterActive ? 'mm-active' : ''}>
                            <a
                                className="has-arrow ai-icon"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleSubmenu('master');
                                }}
                                aria-expanded={openMenus.master ? 'true' : 'false'}
                            >
                                <i className="la la-database"></i>
                                <span className="nav-text">Master Data</span>
                            </a>
                            <ul
                                aria-expanded="false"
                                className={`mm-collapse ${openMenus.master ? 'mm-show' : ''}`}
                                style={{ display: openMenus.master ? 'block' : 'none' }}
                            >
                                <li className={currentPath === '/master/univ' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/univ"
                                        className={currentPath === '/master/univ' ? 'mm-active' : ''}
                                    >
                                        Universitas
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/fakultas' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/fakultas"
                                        className={currentPath === '/master/fakultas' ? 'mm-active' : ''}
                                    >
                                        Fakultas
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/agency' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/agency"
                                        className={currentPath === '/master/agency' ? 'mm-active' : ''}
                                    >
                                        Agency
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/prodi' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/prodi"
                                        className={currentPath === '/master/prodi' ? 'mm-active' : ''}
                                    >
                                        Prodi
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/tahun-akademik' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/tahun-akademik"
                                        className={currentPath === '/master/tahun-akademik' ? 'mm-active' : ''}
                                    >
                                        Tahun Akademik
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/sesi-akreditasi' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/sesi-akreditasi"
                                        className={currentPath === '/master/sesi-akreditasi' ? 'mm-active' : ''}
                                    >
                                        Sesi Akreditasi
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/kriteria' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/kriteria"
                                        className={currentPath === '/master/kriteria' ? 'mm-active' : ''}
                                    >
                                        Kriteria Akreditasi
                                    </Link>
                                </li>
                                <li className={currentPath === '/master/users' ? 'mm-active' : ''}>
                                    <Link
                                        href="/master/users"
                                        className={currentPath === '/master/users' ? 'mm-active' : ''}
                                    >
                                        Pengguna
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <div className="copyright p-4 text-center mt-5">
                        <p className="fs-12 text-muted">
                            <strong>RepoCred</strong> © 2026
                        </p>
                        <p className="fs-11 text-muted">Sistem Repositori Akreditasi</p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="content-body">
                <div className="container-fluid">
                    {header && (
                        <div className="row page-titles mb-3">
                            <div className="col-sm-6 p-md-0">
                                <div className="welcome-text">
                                    <h4>{header}</h4>
                                </div>
                            </div>
                        </div>
                    )}

                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <div className="copyright">
                    <p>
                        Copyright © Dikembangkan untuk <strong>RepoCred</strong> {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
