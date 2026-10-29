import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    Award,
    Globe,
    Building2,
    GraduationCap,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    ShieldCheck,
    Layers,
    Check,
    AlertCircle,
    Info,
    CalendarCheck2
} from 'lucide-react';

export default function AgencyIndex({ agencies = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | nasional | internasional
    const [levelFilter, setLevelFilter] = useState('ALL'); // ALL | univs | prodi

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Inertia sesuai dengan tabel agencies (code, name, type, level)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        type: 'nasional',
        level: 'prodi',
    });

    // Statistik Cepat berdasarkan data real
    const stats = useMemo(() => {
        const total = agencies.length;
        const nasional = agencies.filter((a) => a.type === 'nasional').length;
        const internasional = agencies.filter((a) => a.type === 'internasional').length;
        const univs = agencies.filter((a) => a.level === 'univs').length;
        const prodi = agencies.filter((a) => a.level === 'prodi').length;
        return { total, nasional, internasional, univs, prodi };
    }, [agencies]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return agencies.filter((item) => {
            const matchesSearch =
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
            const matchesLevel = levelFilter === 'ALL' || item.level === levelFilter;

            return matchesSearch && matchesType && matchesLevel;
        });
    }, [agencies, searchTerm, typeFilter, levelFilter]);

    // Buka Modal Tambah
    const handleOpenAdd = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setData({
            code: '',
            name: '',
            type: 'nasional',
            level: 'prodi',
        });
        setModalOpen(true);
    };

    // Buka Modal Edit
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            code: item.code || '',
            name: item.name || '',
            type: item.type || 'nasional',
            level: item.level || 'prodi',
        });
        setModalOpen(true);
    };

    // Tutup Modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        clearErrors();
        reset();
    };

    // Submit Form
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingItem) {
            put(route('master.agency.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('master.agency.store'), {
                preserveScroll: true,
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    // Hapus Item dengan konfirmasi SweetAlert2
    const handleDelete = async (item) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Lembaga Akreditasi?',
            text: `Apakah Anda yakin ingin menghapus lembaga akreditasi "${item.name} (${item.code})"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.agency.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Agency (Lembaga Akreditasi)" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Award className="w-4 h-4" />
                            <span>Master Data Penjamin Mutu</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Master Agency (Lembaga Akreditasi)</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola data lembaga akreditasi nasional (BAN-PT, LAM-INFOKOM, LAMEMBA, dll.) dan internasional (ABET, ASIIN) sebagai payung instrumen mutu.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Agency Baru</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Agency</span>
                            <span className="text-lg font-black text-slate-800">{stats.total}</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Nasional (BAN & LAM)</span>
                            <span className="text-lg font-black text-slate-800">{stats.nasional}</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Internasional</span>
                            <span className="text-lg font-black text-slate-800">{stats.internasional}</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Cakupan Sasaran</span>
                            <span className="text-lg font-black text-slate-800">{stats.prodi} Prodi / {stats.univs} PT</span>
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
                                placeholder="Cari kode (BAN-PT, LAM) atau nama..."
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                            />
                        </div>

                        {/* Filter Tipe */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Tipe (Nasional & Internasional)</option>
                            <option value="nasional">Lembaga Nasional</option>
                            <option value="internasional">Lembaga Internasional</option>
                        </select>

                        {/* Filter Tingkat Sasaran */}
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Tingkat Sasaran</option>
                            <option value="univs">Tingkat Perguruan Tinggi (AIPT)</option>
                            <option value="prodi">Tingkat Program Studi (APS)</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {agencies.length} Lembaga
                    </div>
                </div>

                {/* Tabel Daftar Agency */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Kode</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama Lembaga</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Tipe Akreditasi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Tingkat Sasaran</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Data Terkait</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada lembaga akreditasi yang cocok dengan pencarian Anda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* No */}
                                            <td className="py-3.5 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                {index + 1}
                                            </td>

                                            {/* Kode & Nama */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`px-2.5 py-1 text-xs font-black tracking-wide uppercase border ${
                                                        item.code === 'BAN-PT'
                                                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                                            : item.type === 'internasional'
                                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                    }`}>
                                                        {item.code}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipe: Nasional vs Internasional */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border ${
                                                    item.type === 'internasional'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {item.type === 'internasional' ? (
                                                        <Globe className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    )}
                                                    <span className="capitalize">{item.type}</span>
                                                </span>
                                            </td>

                                            {/* Tingkat: Univs vs Prodi */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    {item.level === 'univs' ? (
                                                        <>
                                                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                                            <span>Perguruan Tinggi (AIPT)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Program Studi (APS)</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Relasi Terkait */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <div className="inline-flex items-center gap-1.5 text-[11px]">
                                                    <span className="px-2 py-0.5 border border-slate-200 bg-slate-100 text-slate-600 font-bold" title="Kriteria Standar Mutu">
                                                        {item.criterias_count || 0} Kriteria
                                                    </span>
                                                    {item.level === 'prodi' && (
                                                        <span className="px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold" title="Program Studi Terkait">
                                                            {item.prodis_count || 0} Prodi
                                                        </span>
                                                    )}
                                                    {item.sessions_count > 0 && (
                                                        <span className="px-2 py-0.5 border border-purple-200 bg-purple-50 text-purple-700 font-bold" title="Sesi Akreditasi">
                                                            {item.sessions_count} Sesi
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Lembaga"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Lembaga"
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

            {/* Modal Tambah / Edit Agency */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Lembaga Akreditasi' : 'Tambah Lembaga Akreditasi Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Master Data Lembaga Penjamin Mutu Akreditasi
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={processing}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Sesuai Tabel agencies: code, name, type, level */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Kode Lembaga / Singkatan */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Kode Lembaga / Singkatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: LAM-INFOKOM, BAN-PT, ABET"
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.code ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600 font-bold uppercase`}
                                    required
                                    autoFocus
                                />
                                {errors.code ? (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.code}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Gunakan huruf kapital singkat unik yang mewakili lembaga akreditasi.
                                    </p>
                                )}
                            </div>

                            {/* Nama Lengkap Lembaga */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Lengkap Lembaga <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Lembaga Akreditasi Mandiri Informatika dan Komputer"
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>
                                )}
                            </div>

                            {/* Tipe & Tingkat Sasaran */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tipe Lembaga <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.type ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer`}
                                        required
                                    >
                                        <option value="nasional">Nasional (BAN-PT / LAM)</option>
                                        <option value="internasional">Internasional (ABET, ASIIN, dll)</option>
                                    </select>
                                    {errors.type && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tingkat Sasaran <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.level}
                                        onChange={(e) => setData('level', e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.level ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer`}
                                        required
                                    >
                                        <option value="prodi">Program Studi (APS)</option>
                                        <option value="univs">Perguruan Tinggi / Institusi (AIPT)</option>
                                    </select>
                                    {errors.level && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.level}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
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
                                        <span>{editingItem ? 'Perbarui Lembaga' : 'Simpan Lembaga'}</span>
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
