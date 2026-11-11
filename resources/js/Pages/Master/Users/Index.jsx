import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Shield,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound,
    UserCheck,
    Building2,
    ShieldCheck,
    GraduationCap,
    BookOpen,
    Wallet,
    Server,
    Library,
    Award,
    Building,
    CheckSquare,
    Filter,
    Info,
    Layers,
    FolderGit2
} from 'lucide-react';

// Konfigurasi Visual & Deskripsi Kriteria RBAC
const ROLE_CONFIGS = {
    admin_lpm: {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: ShieldCheck,
        defaultName: 'Administrator LPM / Penjamin Mutu',
        kriteriaLabel: 'Semua Kriteria (K1 - K9)',
        kriteriaShort: 'K1 - K9 (Semua)',
        kriteriaColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    kaprodi: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: GraduationCap,
        defaultName: 'Ketua Program Studi / Tim Prodi',
        kriteriaLabel: 'K1, K2, K6, K7, K8, K9 (Tridharma & Tata Kelola)',
        kriteriaShort: 'K1, K2, K6, K7, K8, K9',
        kriteriaColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    baak: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: BookOpen,
        defaultName: 'Biro Administrasi Akademik & Kemahasiswaan (BAAK)',
        kriteriaLabel: 'Kriteria 3 (Mahasiswa) & Kriteria 6 (Pendidikan/Kurikulum)',
        kriteriaShort: 'K3, K6',
        kriteriaColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    finance: {
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        icon: Wallet,
        defaultName: 'Biro Keuangan (Finance)',
        kriteriaLabel: 'Kriteria 5 (Keuangan, Pembiayaan, & Sarpras)',
        kriteriaShort: 'K5 (Keuangan)',
        kriteriaColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    hrd: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: UserCheck,
        defaultName: 'Bagian Kepegawaian / HRD',
        kriteriaLabel: 'Kriteria 4 (Sumber Daya Manusia: Dosen & Tendik)',
        kriteriaShort: 'K4 (SDM)',
        kriteriaColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    it: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Server,
        defaultName: 'Pusat Komputer & IT',
        kriteriaLabel: 'Kriteria 5 (Sarpras IT/Server) & Kriteria 6 (E-Learning)',
        kriteriaShort: 'K5, K6 (IT)',
        kriteriaColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    perpustakaan: {
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: Library,
        defaultName: 'Unit Pelaksana Teknis Perpustakaan',
        kriteriaLabel: 'Kriteria 5 (Fasilitas Buku, Jurnal, & E-Library)',
        kriteriaShort: 'K5 (Perpus)',
        kriteriaColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    kemahasiswaan: {
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Award,
        defaultName: 'Bagian Kemahasiswaan & Alumni',
        kriteriaLabel: 'Kriteria 3 (Prestasi/Organisasi) & Kriteria 9 (Tracer Study)',
        kriteriaShort: 'K3, K9',
        kriteriaColor: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    umum: {
        badge: 'bg-stone-50 text-stone-700 border-stone-200',
        icon: Building,
        defaultName: 'Bagian Umum & Sarana Prasarana',
        kriteriaLabel: 'Kriteria 2 (Tata Pamong/Aset) & Kriteria 5 (Gedung Fisik)',
        kriteriaShort: 'K2, K5',
        kriteriaColor: 'bg-stone-200 text-stone-800 border-stone-300',
    },
    auditor: {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: CheckSquare,
        defaultName: 'Auditor Mutu Internal (AMI)',
        kriteriaLabel: 'Semua Kriteria (K1 - K9: Hak Review & Validasi)',
        kriteriaShort: 'K1 - K9 (Audit)',
        kriteriaColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
};

export default function UserIndex({ users = [], roles = [], prodis = [] }) {
    const pageProps = usePage().props;
    const authUser = pageProps.auth?.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
    const [selectedScopeFilter, setSelectedScopeFilter] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form Inertia sesuai desain RBAC: name, email, role_id, prodi_id, password
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role_id: '',
        prodi_id: '',
        password: '',
    });

    // Helper untuk mengekstrak data role dari objek user
    const getUserRoleInfo = (user) => {
        let roleObj = null;
        if (user.role && typeof user.role === 'object') {
            roleObj = user.role;
        } else if (user.role_id) {
            roleObj = roles.find((r) => r.id === user.role_id);
        } else if (user.role && typeof user.role === 'string') {
            roleObj = roles.find((r) => r.code === user.role);
        }

        const code = roleObj?.code || (typeof user.role === 'string' ? user.role : 'user');
        const config = ROLE_CONFIGS[code] || {
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
            icon: Shield,
            defaultName: roleObj?.name || code?.toUpperCase() || 'Pengguna',
            kriteriaLabel: 'Eviden Terbatas',
            kriteriaShort: 'Standar',
            kriteriaColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };

        return {
            id: roleObj?.id || null,
            code: code,
            name: roleObj?.name || config.defaultName,
            scope_type: roleObj?.scope_type || (code === 'kaprodi' || code === 'admin_prodi' ? 'prodi' : 'institusi'),
            description: roleObj?.description || '',
            ...config,
        };
    };

    // Statistik Cepat Pengguna
    const stats = useMemo(() => {
        const total = users.length;
        let lpm = 0;
        let kaprodi = 0;
        let unitInstitusi = 0;

        users.forEach((u) => {
            const roleInfo = getUserRoleInfo(u);
            if (roleInfo.code === 'admin_lpm') {
                lpm++;
            } else if (roleInfo.scope_type === 'prodi') {
                kaprodi++;
            } else {
                unitInstitusi++;
            }
        });

        return { total, lpm, kaprodi, unitInstitusi };
    }, [users, roles]);

    // Filter Items Pengguna
    const filteredItems = useMemo(() => {
        return users.filter((item) => {
            const roleInfo = getUserRoleInfo(item);
            const prodiName = item.prodi?.name || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                item.name?.toLowerCase().includes(searchLower) ||
                item.email?.toLowerCase().includes(searchLower) ||
                roleInfo.name?.toLowerCase().includes(searchLower) ||
                prodiName.toLowerCase().includes(searchLower);

            const matchesRole =
                selectedRoleFilter === 'ALL' ||
                roleInfo.id === selectedRoleFilter ||
                roleInfo.code === selectedRoleFilter;

            const matchesScope =
                selectedScopeFilter === 'ALL' || roleInfo.scope_type === selectedScopeFilter;

            return matchesSearch && matchesRole && matchesScope;
        });
    }, [users, searchTerm, selectedRoleFilter, selectedScopeFilter, roles]);

    // Data Role terpilih di dalam form modal saat ini
    const activeSelectedRole = useMemo(() => {
        return roles.find((r) => r.id === data.role_id) || null;
    }, [data.role_id, roles]);

    // Buka Modal Tambah Pengguna
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setShowPassword(false);

        // Default role: kaprodi jika ada, atau peran pertama di list roles
        const defaultRole = roles.find((r) => r.code === 'kaprodi') || roles[0];
        const defaultRoleId = defaultRole ? defaultRole.id : '';
        const defaultProdiId =
            defaultRole && defaultRole.scope_type === 'prodi' && prodis.length > 0 ? prodis[0].id : '';

        setData({
            name: '',
            email: '',
            role_id: defaultRoleId,
            prodi_id: defaultProdiId,
            password: '',
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit Pengguna
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setShowPassword(false);

        const roleInfo = getUserRoleInfo(item);
        const resolvedRoleId = item.role_id || roleInfo.id || '';

        setData({
            name: item.name || '',
            email: item.email || '',
            role_id: resolvedRoleId,
            prodi_id: item.prodi_id || '',
            password: '',
        });
        setIsOpenModal(true);
    };

    // Handler ketika role diganti di formulir
    const handleRoleSelectChange = (e) => {
        const newRoleId = e.target.value;
        const newRoleObj = roles.find((r) => r.id === newRoleId);

        setData((prev) => ({
            ...prev,
            role_id: newRoleId,
            // Jika role prodi, isi dengan prodi pertama jika belum ada, jika institusi kosongkan
            prodi_id:
                newRoleObj?.scope_type === 'prodi'
                    ? prev.prodi_id || (prodis.length > 0 ? prodis[0].id : '')
                    : '',
        }));
    };

    // Tutup Modal
    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
        clearErrors();
        reset();
    };

    // Submit Form Tambah / Edit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingItem) {
            put(route('master.users.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('master.users.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Hapus Pengguna dengan SweetAlert2
    const handleDelete = async (user) => {
        if (user.id === authUser?.id) return;

        const confirmed = await confirmAlert({
            title: 'Hapus Akun Pengguna?',
            text: `Apakah Anda yakin ingin menghapus pengguna "${user.name} (${user.email})"? Pengguna ini tidak akan dapat login lagi ke sistem.`,
            confirmButtonText: 'Ya, Hapus Akun',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Pengguna & RBAC - Repository Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Users className="w-4 h-4" />
                            <span>Master Data Pengguna & Hak Akses (RBAC)</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Manajemen Pengguna & Bagian Terkait</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                            Kelola penugasan akun untuk 10 unit kerja pendukung akreditasi (LPM, Kaprodi, BAAK, Finance, HRD, IT, Perpustakaan, Kemahasiswaan, Umum, dan Auditor Mutu).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Pengguna Baru</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Total Pengguna</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Admin Penjamin Mutu</span>
                            <span className="text-lg font-black text-slate-800">{stats.lpm} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Ketua / Tim Prodi</span>
                            <span className="text-lg font-black text-slate-800">{stats.kaprodi} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Unit Kerja & Auditor</span>
                            <span className="text-lg font-black text-slate-800">{stats.unitInstitusi} Akun</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] sm:min-w-[300px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama, email, role, atau prodi..."
                                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Peran / Role */}
                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                            <select
                                value={selectedRoleFilter}
                                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                                className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                            >
                                <option value="ALL">Semua Peran / Role ({roles.length} Peran)</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.scope_type === 'prodi' ? 'Prodi' : 'Institusi'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Cakupan */}
                        <select
                            value={selectedScopeFilter}
                            onChange={(e) => setSelectedScopeFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Lingkup Akses</option>
                            <option value="institusi">Tingkat Institusi (Lintas Unit)</option>
                            <option value="prodi">Tingkat Program Studi</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500 shrink-0">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {users.length} Pengguna
                    </div>
                </div>

                {/* Tabel Data Pengguna */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200 min-w-[220px]">Nama & Identitas Akun</th>
                                    <th className="py-3 px-4 border-r border-slate-200 min-w-[200px]">Peran / Hak Akses (Role)</th>
                                    <th className="py-3 px-4 border-r border-slate-200 min-w-[180px]">Cakupan / Program Studi</th>
                                    <th className="py-3 px-4 border-r border-slate-200 min-w-[170px]">Tanggung Jawab Eviden</th>
                                    <th className="py-3 px-4 border-r border-slate-200 whitespace-nowrap">Terdaftar</th>
                                    <th className="py-3 px-4 text-right w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                                            Tidak ada data pengguna yang cocok dengan kriteria filter saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => {
                                        const roleInfo = getUserRoleInfo(item);
                                        const RoleIcon = roleInfo.icon;
                                        const isCurrentUser = authUser && item.id === authUser.id;
                                        const isProdiScoped = roleInfo.scope_type === 'prodi';

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* No */}
                                                <td className="py-3 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                    {index + 1}
                                                </td>

                                                {/* Nama & Email */}
                                                <td className="py-3 px-4 border-r border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs uppercase border border-indigo-200 shrink-0">
                                                            {item.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-xs">
                                                                    {item.name}
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                                                                        Akun Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                <span>{item.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Peran / Hak Akses */}
                                                <td className="py-3 px-4 border-r border-slate-100">
                                                    <div className="space-y-1">
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold border ${roleInfo.badge}`}>
                                                            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span>{roleInfo.name}</span>
                                                        </div>
                                                        {roleInfo.description && (
                                                            <p className="text-[10px] text-slate-400 line-clamp-1">
                                                                {roleInfo.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cakupan / Program Studi */}
                                                <td className="py-3 px-4 border-r border-slate-100">
                                                    {isProdiScoped ? (
                                                        item.prodi ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                                                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>{item.prodi.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 border border-rose-200">
                                                                Belum Diatur Prodi
                                                            </span>
                                                        )
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                                            <span>Tingkat Institusi (Semua Unit)</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Tanggung Jawab Kriteria */}
                                                <td className="py-3 px-4 border-r border-slate-100">
                                                    <div className="space-y-0.5">
                                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${roleInfo.kriteriaColor}`}>
                                                            {roleInfo.kriteriaShort}
                                                        </span>
                                                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]" title={roleInfo.kriteriaLabel}>
                                                            {roleInfo.kriteriaLabel}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Terdaftar */}
                                                <td className="py-3 px-4 text-slate-500 font-mono text-[11px] border-r border-slate-100 whitespace-nowrap">
                                                    {item.created_at ? (
                                                        new Date(item.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                            title="Edit Pengguna"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            disabled={isCurrentUser}
                                                            className={`p-1.5 border border-transparent transition-colors ${
                                                                isCurrentUser
                                                                    ? 'text-slate-300 cursor-not-allowed'
                                                                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 hover:border-slate-200 cursor-pointer'
                                                            }`}
                                                            title={isCurrentUser ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Dialog Form Tambah / Edit Pengguna */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-xl w-full p-6 shadow-2xl border border-slate-300 max-h-[92vh] overflow-y-auto">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Akun & Peran Pengguna' : 'Tambah Akun Pengguna Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Hak Akses RBAC & Lingkup Kerja Eviden Akreditasi
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Nama Lengkap */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Dr. Budi Santoso, M.Kom / Biro Keuangan"
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600`}
                                    required
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>
                                )}
                            </div>

                            {/* Alamat Email */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Alamat Email Login <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="contoh: budi@kampus.ac.id"
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Peran / Hak Akses (Role) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Peran / Bagian Terkait (RBAC Role) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.role_id}
                                    onChange={handleRoleSelectChange}
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.role_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                    required
                                >
                                    <option value="" disabled>-- Silakan Pilih Peran / Bagian --</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} — [{r.scope_type === 'prodi' ? 'Khusus Prodi' : 'Tingkat Institusi'}]
                                        </option>
                                    ))}
                                </select>
                                {errors.role_id && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.role_id}</p>
                                )}
                            </div>

                            {/* Program Studi Kondisional (jika role ber-scope prodi) */}
                            {activeSelectedRole?.scope_type === 'prodi' ? (
                                <div className="p-3 bg-emerald-50/60 border border-emerald-200">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4 text-emerald-700" />
                                        <span>Program Studi yang Diampu <span className="text-rose-500">*</span></span>
                                    </label>
                                    <select
                                        value={data.prodi_id}
                                        onChange={(e) => setData('prodi_id', e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.prodi_id ? 'border-rose-400 bg-rose-50/30' : 'border-emerald-300'
                                        } bg-white focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer`}
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Program Studi --</option>
                                        {prodis.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.code ? `[${p.code}] ` : ''}{p.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.prodi_id && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.prodi_id}</p>
                                    )}
                                    <p className="text-[11px] text-emerald-800 mt-1.5 flex items-start gap-1">
                                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                                        <span>Akun ini akan terkunci hanya dapat melihat dan mengunggah dokumen eviden akreditasi untuk program studi yang dipilih.</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                                    <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-slate-700 block text-[11px]">
                                            Cakupan Tingkat Institusi (Semua Program Studi)
                                        </span>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Pengguna dengan peran ini dapat memilih program studi yang sedang aktif akreditasi untuk mengunggah dokumen pendukung sesuai kriteria tugasnya.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Pratinjau Tanggung Jawab Kriteria (Mapping Eviden) */}
                            {activeSelectedRole && (
                                <div className="p-3 bg-indigo-50/40 border border-indigo-100 space-y-1">
                                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[11px]">
                                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Tanggung Jawab Eviden Sesuai Desain RBAC:</span>
                                    </div>
                                    <p className="text-[11px] text-slate-700">
                                        {ROLE_CONFIGS[activeSelectedRole.code]?.kriteriaLabel || activeSelectedRole.description || 'Sesuai kebijakan penjaminan mutu.'}
                                    </p>
                                </div>
                            )}

                            {/* Kata Sandi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Kata Sandi (Password){' '}
                                    {editingItem ? (
                                        <span className="text-slate-400 font-normal lowercase">(kosongkan jika tidak ingin diubah)</span>
                                    ) : (
                                        <span className="text-rose-500">*</span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={editingItem ? 'Minimal 8 karakter jika ingin merubah' : 'Minimal 8 karakter'}
                                        className={`w-full pl-3 pr-10 py-2 text-xs border ${
                                            errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-mono`}
                                        required={!editingItem}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password ? (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.password}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {editingItem
                                            ? 'Biarkan kosong jika tetap menggunakan kata sandi yang sudah ada.'
                                            : 'Gunakan minimal 8 karakter kombinasi huruf dan angka.'}
                                    </p>
                                )}
                            </div>

                            {/* Tombol Aksi Modal */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-xs"
                                >
                                    {processing ? (
                                        <span>Menyimpan...</span>
                                    ) : (
                                        <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
