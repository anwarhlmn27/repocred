import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, X, Shield, Mail } from 'lucide-react';
import { confirmAlert, toastSuccess } from '@/Utils/alert';

const defaultUsers = [
    {
        id: 'usr-1',
        name: 'Dr. Hendra Wijaya, M.Kom',
        email: 'hendra.wijaya@kampus.ac.id',
        role: 'admin_lpm',
        created_at: '2025-01-15T08:00:00Z',
    },
    {
        id: 'usr-2',
        name: 'Siti Aminah, M.T',
        email: 'siti.aminah@ti.kampus.ac.id',
        role: 'admin_prodi',
        created_at: '2025-02-10T09:30:00Z',
    },
    {
        id: 'usr-3',
        name: 'Rahmat Pratama, S.Kom',
        email: 'rahmat.operator@kampus.ac.id',
        role: 'operator',
        created_at: '2025-03-01T10:15:00Z',
    },
    {
        id: 'usr-4',
        name: 'Prof. Bambang Suryono',
        email: 'bambang.auditor@mutu.ac.id',
        role: 'viewer',
        created_at: '2025-03-20T11:00:00Z',
    },
];

export default function UserIndex({ users = [] }) {
    const pageProps = usePage().props;
    const authUser = pageProps.auth?.user || { id: 'usr-1', name: 'Administrator' };

    const [items, setItems] = useState(users.length > 0 ? users : defaultUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const rolesList = [
        { value: 'admin_lpm', label: 'Admin LPM / Penjaminan Mutu', badge: 'bg-indigo-100 text-indigo-800' },
        { value: 'admin_prodi', label: 'Admin Prodi / Jurusan', badge: 'bg-emerald-100 text-emerald-800' },
        { value: 'operator', label: 'Operator / Staff Input', badge: 'bg-blue-100 text-blue-800' },
        { value: 'viewer', label: 'Auditor / Viewer', badge: 'bg-purple-100 text-purple-800' },
        { value: 'user', label: 'User Reguler', badge: 'bg-slate-100 text-slate-800' },
    ];

    const [formState, setFormState] = useState({
        name: '',
        email: '',
        role: 'operator',
        password: '',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({ name: '', email: '', role: 'operator', password: '' });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            name: item.name,
            email: item.email,
            role: item.role || 'user',
            password: '',
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingItem) {
            setItems(
                items.map((it) =>
                    it.id === editingItem.id
                        ? { ...it, name: formState.name, email: formState.email, role: formState.role }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `usr-${Date.now()}`,
                name: formState.name,
                email: formState.email,
                role: formState.role,
                created_at: new Date().toISOString(),
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = async (id, name) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Pengguna?',
            text: `Apakah Anda yakin ingin menghapus "${name}"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });
        if (confirmed) {
            setItems(items.filter((it) => it.id !== id));
            toastSuccess(`Pengguna "${name}" berhasil dihapus.`);
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || item.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Pengguna" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <Users className="w-4 h-4" />
                            <span>Master Data</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Pengguna & Hak Akses</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola akun operator akreditasi, admin LPM, ketua prodi, dan tim penjamin mutu.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Pengguna</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                        </div>

                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ALL">Semua Role</option>
                            {rolesList.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> pengguna terdaftar
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-16">No</th>
                                    <th className="px-5 py-3.5">Nama & Email</th>
                                    <th className="px-5 py-3.5 text-center">Role / Peran</th>
                                    <th className="px-5 py-3.5">Terdaftar</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((user, index) => {
                                    const roleConfig = rolesList.find((r) => r.value === user.role) || {
                                        label: user.role,
                                        badge: 'bg-slate-100 text-slate-700',
                                    };
                                    const isCurrent = user.id === authUser.id;

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-400">{index + 1}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm uppercase">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            {user.name}
                                                            {isCurrent && (
                                                                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold ${roleConfig.badge}`}>
                                                    <Shield className="w-3 h-3" />
                                                    {roleConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Dialog Form */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 ">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Alamat Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    placeholder="contoh@kampus.ac.id"
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Peran / Role Pengguna <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formState.role}
                                    onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    required
                                >
                                    {rolesList.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                                >
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
