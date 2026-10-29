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
    ShieldCheck
} from 'lucide-react';

const rolesList = [
    { value: 'admin_lpm', label: 'Admin LPM / Penjaminan Mutu', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'admin_prodi', label: 'Admin Prodi / Unit Pengelola', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'operator', label: 'Operator / Tim Input Eviden', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'viewer', label: 'Auditor / Asesor / Viewer', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'user', label: 'User Reguler', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export default function UserIndex({ users = [] }) {
    const pageProps = usePage().props;
    const authUser = pageProps.auth?.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form Inertia sesuai tabel users: name, email, role, password
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'operator',
        password: '',
    });

    // Statistik Cepat Pengguna
    const stats = useMemo(() => {
        const total = users.length;
        const lpm = users.filter((u) => u.role === 'admin_lpm').length;
        const prodi = users.filter((u) => u.role === 'admin_prodi').length;
        const operatorAuditor = users.filter((u) => ['operator', 'viewer'].includes(u.role)).length;
        return { total, lpm, prodi, operatorAuditor };
    }, [users]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return users.filter((item) => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = selectedRole === 'ALL' || item.role === selectedRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, selectedRole]);

    // Buka Modal Tambah
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setShowPassword(false);
        setData({
            name: '',
            email: '',
            role: 'operator',
            password: '',
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setShowPassword(false);
        setData({
            name: item.name || '',
            email: item.email || '',
            role: item.role || 'user',
            password: '',
        });
        setIsOpenModal(true);
    };

    // Tutup Modal
    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
        clearErrors();
        reset();
    };

    // Submit Form
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
            confirmButtonText: 'Ya, Hapus',
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
            <Head title="Master Pengguna & Hak Akses - Repository Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Users className="w-4 h-4" />
                            <span>Master Data Pengguna</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Pengguna & Hak Akses</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola akun operator akreditasi, admin LPM penjamin mutu, perwakilan prodi, dan auditor penjaminan mutu PPEPP.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
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
                            <span className="text-xs text-slate-400 block font-medium">Total Akun</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Admin LPM</span>
                            <span className="text-lg font-black text-slate-800">{stats.lpm} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Admin Prodi</span>
                            <span className="text-lg font-black text-slate-800">{stats.prodi} Akun</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Operator & Auditor</span>
                            <span className="text-lg font-black text-slate-800">{stats.operatorAuditor} Akun</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] sm:min-w-[320px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama atau alamat email pengguna..."
                                className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
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

                        {/* Filter Role */}
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Peran / Role</option>
                            {rolesList.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {users.length} Pengguna
                    </div>
                </div>

                {/* Tabel Data Pengguna */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama & Identitas Akun</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Peran / Role</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Terdaftar Sejak</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada data pengguna yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => {
                                        const roleConfig = rolesList.find((r) => r.value === item.role) || {
                                            label: item.role,
                                            badge: 'bg-slate-100 text-slate-700 border-slate-200',
                                        };
                                        const isCurrentUser = authUser && item.id === authUser.id;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                    {index + 1}
                                                </td>

                                                {/* Nama & Email */}
                                                <td className="py-3.5 px-4 border-r border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs uppercase border border-indigo-200 shrink-0">
                                                            {item.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-sm">
                                                                    {item.name}
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                        Akun Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                <span>{item.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border ${roleConfig.badge}`}>
                                                        <Shield className="w-3 h-3" />
                                                        {roleConfig.label}
                                                    </span>
                                                </td>

                                                {/* Terdaftar */}
                                                <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] border-r border-slate-100">
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
                                                <td className="py-3.5 px-4 text-right">
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
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Hak Akses & Kredensial Pengguna
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

                        {/* Form Body Sesuai Skema Tabel users: name, email, role, password */}
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
                                    placeholder="Contoh: Dr. Budi Santoso, M.Kom"
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
                                    placeholder="contoh@kampus.ac.id"
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Peran / Role Pengguna */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Peran / Hak Akses (Role) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.role ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                    required
                                >
                                    {rolesList.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.role}</p>
                                )}
                            </div>

                            {/* Kata Sandi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Kata Sandi (Password){' '}
                                    {editingItem ? (
                                        <span className="text-slate-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>
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
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
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
