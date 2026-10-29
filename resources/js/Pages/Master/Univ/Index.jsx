import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert, toastError, toastSuccess } from '@/Utils/alert';
import {
    Building2,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Check,
    Layers,
    Globe,
    Image,
    ShieldCheck
} from 'lucide-react';

export default function UnivIndex({ univs = [] }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Inertia sesuai kolom tabel univs
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        acronym: '',
        address: '',
        logo: '',
        is_active: true,
    });

    // Statistik Cepat
    const stats = useMemo(() => {
        const total = univs.length;
        const active = univs.filter((u) => u.is_active).length;
        const totalFaculties = univs.reduce((acc, u) => acc + (u.faculties_count || 0), 0);
        return { total, active, totalFaculties };
    }, [univs]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return univs.filter((item) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                (item.code && item.code.toLowerCase().includes(term)) ||
                (item.name && item.name.toLowerCase().includes(term)) ||
                (item.acronym && item.acronym.toLowerCase().includes(term)) ||
                (item.address && item.address.toLowerCase().includes(term));

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && item.is_active) ||
                (statusFilter === 'INACTIVE' && !item.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [univs, searchTerm, statusFilter]);

    // Buka Modal Tambah
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setData({
            code: '',
            name: '',
            acronym: '',
            address: '',
            logo: '',
            is_active: true,
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            code: item.code || '',
            name: item.name || item.name_univ || '',
            acronym: item.acronym || '',
            address: item.address || '',
            logo: item.logo || '',
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

    // Submit Simpan (Store / Update)
    const handleSave = (e) => {
        e.preventDefault();

        if (editingItem) {
            put(route('master.univ.update', editingItem.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post(route('master.univ.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    // Submit Hapus
    const handleDelete = async (item) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Perguruan Tinggi?',
            text: `Apakah Anda yakin ingin menghapus perguruan tinggi "${item.name} (${item.acronym})"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.univ.destroy', item.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Perguruan Tinggi (Universitas)" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Building2 className="w-4 h-4" />
                            <span>Master Data Institusi</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Perguruan Tinggi / Universitas</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola data resmi institusi induk perguruan tinggi, kode PDDikti, akronim, dan alamat kampus untuk akreditasi institusi (AIPT).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Universitas</span>
                    </button>
                </div>

                {/* Ringkasan Metrik */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Institusi</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Perguruan Tinggi</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Status Aktif</span>
                            <span className="text-lg font-black text-slate-800">{stats.active} Aktif Digunakan</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Fakultas Terdaftar</span>
                            <span className="text-lg font-black text-slate-800">{stats.totalFaculties} Fakultas</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                {/* <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative min-w-[260px] sm:min-w-[340px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari kode PT, nama, akronim, atau alamat..."
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Aktif Saja</option>
                            <option value="INACTIVE">Non-Aktif</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {univs.length} Perguruan Tinggi
                    </div>
                </div> */}

                {/* Tabel Perguruan Tinggi */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 text-center w-12 border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Kode & Akronim</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama Resmi Perguruan Tinggi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Alamat Kampus</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Jumlah Fakultas</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                                            Tidak ada data perguruan tinggi yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* No */}
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-400 border-r border-slate-100">
                                                {index + 1}
                                            </td>

                                            {/* Kode & Akronim */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {item.code || '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Nama Perguruan Tinggi & Logo */}
                                            <td className="py-3.5 px-4 font-semibold text-slate-800 border-r border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    {item.logo ? (
                                                        <img
                                                            src={item.logo}
                                                            alt={item.name}
                                                            className="w-8 h-8 object-contain border border-slate-200 p-0.5 shrink-0"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                                            {item.acronym ? item.acronym.substring(0, 2) : 'PT'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-sm leading-snug">
                                                            {item.name || item.name_univ}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Alamat */}
                                            <td className="py-3.5 px-4 max-w-xs text-slate-600 border-r border-slate-100">
                                                <div className="flex items-start gap-1.5 leading-relaxed">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{item.address || '-'}</span>
                                                </div>
                                            </td>

                                            {/* Jumlah Fakultas */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    {item.faculties_count || 0} Fakultas
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold border ${item.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                        }`}
                                                >
                                                    <span className={`w-2 h-2 ${item.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                                                    {item.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Data Perguruan Tinggi"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Data Perguruan Tinggi"
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

            {/* Modal Tambah / Edit Perguruan Tinggi */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Data Perguruan Tinggi' : 'Tambah Perguruan Tinggi Baru'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
                            {/* Baris 1: Kode PT & Akronim */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Kode Perguruan Tinggi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Contoh: 21127 atau 061001"
                                        className={`w-full px-3 py-2 text-xs border ${errors.code ? 'border-rose-500' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600 font-mono font-bold uppercase`}
                                        required
                                        autoFocus
                                    />
                                    {errors.code && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Singkatan / Akronim <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.acronym}
                                        onChange={(e) => setData('acronym', e.target.value.toUpperCase())}
                                        placeholder="Contoh: UTDI, ITB, UGM"
                                        className={`w-full px-3 py-2 text-xs border ${errors.acronym ? 'border-rose-500' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600 font-bold uppercase`}
                                        required
                                    />
                                    {errors.acronym && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.acronym}</p>
                                    )}
                                </div>
                            </div>

                            {/* Baris 2: Nama Resmi Perguruan Tinggi */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Nama Resmi Perguruan Tinggi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Universitas Teknologi Digital Indonesia"
                                    className={`w-full px-3 py-2 text-xs border ${errors.name ? 'border-rose-500' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-semibold`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
                                )}
                            </div>

                            {/* Baris 3: Alamat Kampus */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Alamat Lengkap Kampus
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Contoh: Jl. Ringroad Utara, Jombor, Sleman, D.I. Yogyakarta 55284"
                                    rows={3}
                                    className={`w-full px-3 py-2 text-xs border ${errors.address ? 'border-rose-500' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600`}
                                />
                                {errors.address && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.address}</p>
                                )}
                            </div>

                            {/* Baris 4: Logo URL / Path */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    URL / Path Logo Institusi (Opsional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={data.logo}
                                        onChange={(e) => setData('logo', e.target.value)}
                                        placeholder="Contoh: /images/logo.png atau https://.../logo.png"
                                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    />
                                    {data.logo && (
                                        <img
                                            src={data.logo}
                                            alt="Preview"
                                            className="w-8 h-8 border border-slate-300 object-contain p-0.5 shrink-0"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Baris 5: Status Keaktifan (Sharp Checkbox / Toggle) */}
                            <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-slate-800 block">Status Keaktifan Institusi</span>
                                    <span className="text-[11px] text-slate-500">
                                        Perguruan tinggi yang aktif akan muncul di pilihan dokumen akreditasi.
                                    </span>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 cursor-pointer"
                                    />
                                    <span className={`text-xs font-bold ${data.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {data.is_active ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : editingItem ? 'Perbarui Universitas' : 'Simpan Universitas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
