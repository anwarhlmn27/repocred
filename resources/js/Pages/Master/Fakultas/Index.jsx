import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    Landmark,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Building2,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Check,
    Layers,
    Filter
} from 'lucide-react';

export default function FakultasIndex({ faculties = [], univs = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUnivFilter, setSelectedUnivFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Inertia sesuai dengan tabel faculties (univ_id, code, name, acronym, is_active)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        univ_id: '',
        code: '',
        name: '',
        acronym: '',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setData({
            univ_id: univs[0]?.id || '',
            code: '',
            name: '',
            acronym: '',
            is_active: true,
        });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            univ_id: item.univ_id || '',
            code: item.code || '',
            name: item.name || '',
            acronym: item.acronym || '',
            is_active: Boolean(item.is_active),
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
        clearErrors();
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('master.fakultas.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('master.fakultas.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (item) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Fakultas?',
            text: `Apakah Anda yakin ingin menghapus fakultas "${item.name} (${item.acronym})"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.fakultas.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    // Filter Items
    const filteredItems = useMemo(() => {
        return faculties.filter((item) => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.univ?.name && item.univ.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.univ?.acronym && item.univ.acronym.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesUniv = selectedUnivFilter === 'ALL' || item.univ_id === selectedUnivFilter;

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && item.is_active) ||
                (statusFilter === 'INACTIVE' && !item.is_active);

            return matchesSearch && matchesUniv && matchesStatus;
        });
    }, [faculties, searchTerm, selectedUnivFilter, statusFilter]);

    // Summary Statistics
    const stats = useMemo(() => {
        const total = faculties.length;
        const active = faculties.filter((f) => f.is_active).length;
        const totalProdis = faculties.reduce((acc, curr) => acc + (curr.prodis_count || 0), 0);
        return { total, active, totalProdis };
    }, [faculties]);

    return (
        <AuthenticatedLayout>
            <Head title="Master Fakultas / UPPS" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Landmark className="w-4 h-4" />
                            <span>Master Data Institusi</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Fakultas / UPPS</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola unit pengelola program studi (UPPS) di lingkungan perguruan tinggi, kode fakultas, akronim, dan status operasional.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Fakultas</span>
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fakultas</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{stats.total} Fakultas</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Landmark className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white p-5 border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Aktif</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{stats.active} Aktif</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white p-5 border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Prodi Terhubung</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalProdis} Program Studi</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Toolbar Filter & Pencarian */}
                <div className="bg-white p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, kode, akronim, univ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
                            />
                        </div>

                        {/* Filter Perguruan Tinggi */}
                        <div className="w-full sm:w-60">
                            <select
                                value={selectedUnivFilter}
                                onChange={(e) => setSelectedUnivFilter(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
                            >
                                <option value="ALL">Semua Perguruan Tinggi</option>
                                {univs.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.acronym})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Status */}
                        <div className="w-full sm:w-44">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="ACTIVE">Hanya Aktif</option>
                                <option value="INACTIVE">Hanya Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <span className="text-xs font-medium text-slate-500 shrink-0">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {faculties.length} fakultas
                    </span>
                </div>

                {/* Tabel Data Fakultas */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="px-4 py-3 w-40 border-r border-slate-200">Kode</th>
                                    <th className="px-5 py-3 border-r border-slate-200">Nama Fakultas / UPPS</th>
                                    <th className="px-5 py-3 border-r border-slate-200">Perguruan Tinggi</th>
                                    <th className="px-4 py-3 text-center border-r border-slate-200 w-36">Jumlah Prodi</th>
                                    <th className="px-4 py-3 text-center border-r border-slate-200 w-28">Status</th>
                                    <th className="px-4 py-3 text-right w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Landmark className="w-8 h-8 text-slate-300" />
                                                <p className="text-sm font-semibold text-slate-600">Belum ada data fakultas</p>
                                                <p className="text-xs text-slate-400">
                                                    {searchTerm || selectedUnivFilter !== 'ALL' || statusFilter !== 'ALL'
                                                        ? 'Tidak ditemukan fakultas yang sesuai dengan kriteria filter.'
                                                        : 'Klik tombol "Tambah Fakultas" di atas untuk menambahkan data baru.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((fac, index) => (
                                        <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3.5 text-center text-slate-400 border-r border-slate-100">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3.5 border-r border-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-[11px]">
                                                        {fac.acronym}
                                                    </span>
                                                    {/* <span className="font-bold text-slate-800 text-xs">
                                                        {fac.code}
                                                    </span> */}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 border-r border-slate-100">
                                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                    <Landmark className="w-4 h-4 text-indigo-600 shrink-0" />
                                                    <span>{fac.name}</span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 border-r border-slate-100">
                                                {fac.univ ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 border border-slate-200">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                        <span>{fac.univ.name} ({fac.univ.acronym})</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Tidak terhubung</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center border-r border-slate-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    <span>{fac.prodis_count ?? 0} Prodi</span>
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-center border-r border-slate-100">
                                                {fac.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                                        <span className="w-1.5 h-1.5 bg-emerald-600"></span>
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                                                        <span className="w-1.5 h-1.5 bg-slate-400"></span>
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                <div className="inline-flex items-center gap-1 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(fac)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Fakultas"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(fac)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Fakultas"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Dialog Form Fakultas */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {editingItem ? 'Edit Data Fakultas' : 'Tambah Fakultas Baru'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {editingItem ? 'Perbarui informasi fakultas sesuai tabel faculties' : 'Lengkapi data fakultas induk dan unit pengelola prodi'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {/* Pilih Perguruan Tinggi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Perguruan Tinggi Induk <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.univ_id}
                                    onChange={(e) => setData('univ_id', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs border ${errors.univ_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 bg-white`}
                                    required
                                >
                                    <option value="" disabled>-- Pilih Perguruan Tinggi --</option>
                                    {univs.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.acronym})
                                        </option>
                                    ))}
                                </select>
                                {errors.univ_id && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.univ_id}</p>
                                )}
                            </div>

                            {/* Baris Kode & Akronim */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Kode Fakultas <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Contoh: 01 atau FIK"
                                        className={`w-full px-3 py-2 text-xs border ${errors.code ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600`}
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Singkatan / Akronim <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.acronym}
                                        onChange={(e) => setData('acronym', e.target.value.toUpperCase())}
                                        placeholder="Contoh: FIK atau FASILKOM"
                                        className={`w-full px-3 py-2 text-xs border ${errors.acronym ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600 uppercase`}
                                        required
                                    />
                                    {errors.acronym && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.acronym}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nama Resmi Fakultas */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Resmi Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Fakultas Ilmu Komputer"
                                    className={`w-full px-3 py-2 text-xs border ${errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>
                                )}
                            </div>

                            {/* Status Aktif */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-0 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-800">
                                        Fakultas / UPPS Aktif Digunakan
                                    </span>
                                </label>
                                <p className="text-[11px] text-slate-400 ml-6.5 mt-0.5">
                                    Fakultas yang aktif dapat dipilih saat mengelola program studi dan dokumen akreditasi.
                                </p>
                            </div>

                            {/* Tombol Aksi */}
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
                                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                                >
                                    {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Fakultas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
