import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
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
    Info
} from 'lucide-react';

const defaultAgencies = [
    {
        id: 'ag-1',
        code: 'BAN-PT',
        name: 'Badan Akreditasi Nasional Perguruan Tinggi',
        type: 'nasional',
        level: 'univs',
        description: 'Lembaga akreditasi tingkat nasional untuk Perguruan Tinggi (AIPT) dan program studi non-LAM.',
        prodis_count: 0,
        criterias_count: 4,
        sessions_count: 2,
    },
    {
        id: 'ag-2',
        code: 'LAM-INFOKOM',
        name: 'Lembaga Akreditasi Mandiri Informatika dan Komputer',
        type: 'nasional',
        level: 'prodi',
        description: 'Lembaga akreditasi mandiri rumpun Informatika, Sistem Informasi, dan Ilmu Komputer.',
        prodis_count: 2,
        criterias_count: 9,
        sessions_count: 2,
    },
    {
        id: 'ag-3',
        code: 'LAMEMBA',
        name: 'Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi',
        type: 'nasional',
        level: 'prodi',
        description: 'Lembaga akreditasi mandiri rumpun Ilmu Ekonomi, Manajemen, Bisnis, dan Akuntansi.',
        prodis_count: 1,
        criterias_count: 9,
        sessions_count: 1,
    },
    {
        id: 'ag-4',
        code: 'LAM-TEKNIK',
        name: 'Lembaga Akreditasi Mandiri Program Studi Keteknikan',
        type: 'nasional',
        level: 'prodi',
        description: 'Lembaga akreditasi mandiri rumpun ilmu keteknikan dan rekayasa teknologi.',
        prodis_count: 1,
        criterias_count: 9,
        sessions_count: 0,
    },
    {
        id: 'ag-5',
        code: 'LAMDIK',
        name: 'Lembaga Akreditasi Mandiri Kependidikan',
        type: 'nasional',
        level: 'prodi',
        description: 'Lembaga akreditasi mandiri untuk program studi rumpun pendidikan dan keguruan.',
        prodis_count: 0,
        criterias_count: 9,
        sessions_count: 0,
    },
    {
        id: 'ag-6',
        code: 'ASIIN',
        name: 'Akkreditierungsagentur für Studiengänge der Ingenieurwissenschaften',
        type: 'internasional',
        level: 'prodi',
        description: 'Lembaga akreditasi internasional berbasis di Jerman untuk bidang Rekayasa, Informatika, dan MIPA.',
        prodis_count: 1,
        criterias_count: 7,
        sessions_count: 0,
    },
    {
        id: 'ag-7',
        code: 'ABET',
        name: 'Accreditation Board for Engineering and Technology',
        type: 'internasional',
        level: 'prodi',
        description: 'Badan akreditasi internasional ternama berbasis di Amerika Serikat untuk Sains Terapan, Komputasi, dan Rekayasa.',
        prodis_count: 0,
        criterias_count: 8,
        sessions_count: 0,
    },
];

export default function AgencyIndex({ agencies = [] }) {
    const [items, setItems] = useState(agencies.length > 0 ? agencies : defaultAgencies);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | nasional | internasional
    const [levelFilter, setLevelFilter] = useState('ALL'); // ALL | univs | prodi

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'nasional',
        level: 'prodi',
        description: '',
    });

    // Statistik Cepat
    const stats = useMemo(() => {
        const total = items.length;
        const nasional = items.filter((a) => a.type === 'nasional').length;
        const internasional = items.filter((a) => a.type === 'internasional').length;
        const univs = items.filter((a) => a.level === 'univs').length;
        const prodi = items.filter((a) => a.level === 'prodi').length;
        return { total, nasional, internasional, univs, prodi };
    }, [items]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
            const matchesLevel = levelFilter === 'ALL' || item.level === levelFilter;

            return matchesSearch && matchesType && matchesLevel;
        });
    }, [items, searchTerm, typeFilter, levelFilter]);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            code: '',
            name: '',
            type: 'nasional',
            level: 'prodi',
            description: '',
        });
        setModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            type: item.type,
            level: item.level,
            description: item.description || '',
        });
        setModalOpen(true);
    };

    // Save Form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.code.trim() || !formData.name.trim()) return;

        if (editingItem) {
            setItems((prev) =>
                prev.map((it) =>
                    it.id === editingItem.id
                        ? {
                              ...it,
                              code: formData.code.toUpperCase().trim(),
                              name: formData.name.trim(),
                              type: formData.type,
                              level: formData.level,
                              description: formData.description.trim(),
                          }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `ag-${Date.now()}`,
                code: formData.code.toUpperCase().trim(),
                name: formData.name.trim(),
                type: formData.type,
                level: formData.level,
                description: formData.description.trim(),
                prodis_count: 0,
                criterias_count: 0,
                sessions_count: 0,
            };
            setItems((prev) => [newItem, ...prev]);
        }

        setModalOpen(false);
    };

    // Delete Item
    const handleDelete = (id, name) => {
        if (!confirm(`Hapus lembaga akreditasi "${name}"?`)) return;
        setItems((prev) => prev.filter((it) => it.id !== id));
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
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
                            <span className="text-xs text-slate-400 block font-medium">Cakupan Prodi & Univ</span>
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
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600"
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

                        {/* Filter Tingkat */}
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Tingkat Sasaran</option>
                            <option value="univs">Tingkat Perguruan Tinggi / Institusi</option>
                            <option value="prodi">Tingkat Program Studi</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {items.length} Lembaga
                    </div>
                </div>

                {/* Tabel Daftar Agency */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 border-r border-slate-200">Kode & Nama Lembaga</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Tipe Akreditasi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Tingkat Sasaran</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Deskripsi Rumpun</th>
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
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Kode & Nama */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`px-2 py-0.5 text-xs font-black tracking-wide uppercase border ${
                                                        item.code === 'BAN-PT'
                                                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                                            : item.type === 'internasional'
                                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                    }`}>
                                                        {item.code}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipe: Nasional vs Internasional */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold border ${
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

                                            {/* Deskripsi */}
                                            <td className="py-3.5 px-4 max-w-xs border-r border-slate-100">
                                                <p className="text-slate-500 line-clamp-2 leading-relaxed" title={item.description}>
                                                    {item.description || '-'}
                                                </p>
                                            </td>

                                            {/* Relasi Terkait */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <div className="inline-flex items-center gap-1.5 text-[11px]">
                                                    <span className="px-2 py-0.5 border border-slate-200 bg-slate-100 text-slate-600 font-bold" title="Kriteria Standar">
                                                        {item.criterias_count || 0} Kriteria
                                                    </span>
                                                    {item.level === 'prodi' && (
                                                        <span className="px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold" title="Program Studi Terkait">
                                                            {item.prodis_count || 0} Prodi
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
                                                        title="Edit Agency"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Agency"
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
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Lembaga Akreditasi' : 'Tambah Lembaga Akreditasi Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Master Agency Mutu
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Kode Lembaga */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Kode Lembaga / Singkatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Contoh: LAM-INFOKOM, BAN-PT, ABET"
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 font-bold uppercase"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Gunakan huruf kapital singkat yang mewakili lembaga akreditasi.
                                </p>
                            </div>

                            {/* Nama Lengkap */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Nama Lengkap Lembaga <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Lembaga Akreditasi Mandiri Informatika dan Komputer"
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            {/* Tipe & Tingkat */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tipe Lembaga <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="nasional">Nasional (BAN-PT / LAM)</option>
                                        <option value="internasional">Internasional (ABET, ASIIN, dll)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tingkat Sasaran <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="prodi">Program Studi (APS)</option>
                                        <option value="univs">Perguruan Tinggi / Institusi (AIPT)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Deskripsi / Rumpun Keilmuan
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Keterangan cakupan rumpun ilmu, asal negara, atau dasar hukum akreditasi..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                                >
                                    Simpan Lembaga
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
