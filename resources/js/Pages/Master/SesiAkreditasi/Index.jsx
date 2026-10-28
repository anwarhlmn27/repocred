import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Award,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    AlertCircle,
    Check,
    Layers,
    Building2,
    GraduationCap,
    SlidersHorizontal,
    CheckCircle2,
    Clock
} from 'lucide-react';

const defaultSessions = [
    {
        id: 'sesi-pt-2025',
        name: 'Akreditasi Perguruan Tinggi (AIPT) 2025–2030',
        type: 'institusi',
        level_label: 'Institusi (AIPT)',
        target_name: 'Universitas Teknologi Digital',
        agency_code: 'BAN-PT',
        year_start: 2025,
        year_end: 2030,
        ts_year: 2025,
        ts_count: 5,
        status: 'active',
        status_label: 'Aktif Berjalan',
        sk_number: 'Dalam Proses Penyusunan LKPT/LED',
        target_rating: 'Unggul',
    },
    {
        id: 'sesi-pt-2020',
        name: 'Akreditasi Perguruan Tinggi (AIPT) 2020–2025',
        type: 'institusi',
        level_label: 'Institusi (AIPT)',
        target_name: 'Universitas Teknologi Digital',
        agency_code: 'BAN-PT',
        year_start: 2020,
        year_end: 2025,
        ts_year: 2020,
        ts_count: 5,
        status: 'completed',
        status_label: 'Selesai / Terakreditasi',
        sk_number: 'SK BAN-PT No. 1024/SK/BAN-PT/Akred/PT/XII/2020',
        target_rating: 'Unggul (Tercapai)',
    },
    {
        id: 'sesi-lam-ti-2024',
        name: 'Akreditasi S1 Teknik Informatika 2024–2029',
        type: 'prodi',
        level_label: 'Program Studi (APS)',
        target_name: 'Teknik Informatika (S1)',
        agency_code: 'LAM-INFOKOM',
        year_start: 2024,
        year_end: 2029,
        ts_year: 2024,
        ts_count: 3,
        status: 'active',
        status_label: 'Aktif Berjalan',
        sk_number: 'Pengumpulan Eviden PPEPP',
        target_rating: 'Unggul',
    },
    {
        id: 'sesi-lam-si-2024',
        name: 'Akreditasi S1 Sistem Informasi 2024–2029',
        type: 'prodi',
        level_label: 'Program Studi (APS)',
        target_name: 'Sistem Informasi (S1)',
        agency_code: 'LAM-INFOKOM',
        year_start: 2024,
        year_end: 2029,
        ts_year: 2024,
        ts_count: 3,
        status: 'active',
        status_label: 'Aktif Berjalan',
        sk_number: 'Persiapan Borang LAM-INFOKOM',
        target_rating: 'Unggul',
    },
    {
        id: 'sesi-lam-mnj-2023',
        name: 'Akreditasi S1 Manajemen 2023–2028',
        type: 'prodi',
        level_label: 'Program Studi (APS)',
        target_name: 'Manajemen (S1)',
        agency_code: 'LAMEMBA',
        year_start: 2023,
        year_end: 2028,
        ts_year: 2023,
        ts_count: 3,
        status: 'completed',
        status_label: 'Selesai / Terakreditasi',
        sk_number: 'SK LAMEMBA No. 450/DE/A.1/AR.8/XI/2023',
        target_rating: 'Baik Sekali (Tercapai)',
    },
    {
        id: 'sesi-pt-2030',
        name: 'Reakreditasi Perguruan Tinggi (AIPT) 2030–2035',
        type: 'institusi',
        level_label: 'Institusi (AIPT)',
        target_name: 'Universitas Teknologi Digital',
        agency_code: 'BAN-PT',
        year_start: 2030,
        year_end: 2035,
        ts_year: 2030,
        ts_count: 5,
        status: 'draft',
        status_label: 'Draft / Persiapan',
        sk_number: '-',
        target_rating: 'Unggul / Internasional',
    },
];

export default function SesiAkreditasiIndex({ sessions = defaultSessions }) {
    const [items, setItems] = useState(sessions?.length > 0 ? sessions : defaultSessions);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | institusi | prodi
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | active | completed | draft

    // Modal Form State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'institusi',
        target_name: 'Universitas Teknologi Digital',
        agency_code: 'BAN-PT',
        year_start: 2025,
        year_end: 2030,
        ts_year: 2025,
        ts_count: 5,
        status: 'active',
        sk_number: '',
        target_rating: 'Unggul',
    });

    // Filter Items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.agency_code.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
            const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [items, searchTerm, typeFilter, statusFilter]);

    // Open Modal Add
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            type: 'institusi',
            target_name: 'Universitas Teknologi Digital',
            agency_code: 'BAN-PT',
            year_start: 2025,
            year_end: 2030,
            ts_year: 2025,
            ts_count: 5,
            status: 'active',
            sk_number: '',
            target_rating: 'Unggul',
        });
        setModalOpen(true);
    };

    // Open Modal Edit
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            target_name: item.target_name,
            agency_code: item.agency_code,
            year_start: item.year_start,
            year_end: item.year_end,
            ts_year: item.ts_year,
            ts_count: item.ts_count,
            status: item.status,
            sk_number: item.sk_number || '',
            target_rating: item.target_rating || 'Unggul',
        });
        setModalOpen(true);
    };

    // Submit Form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const statusLabels = {
            active: 'Aktif Berjalan',
            completed: 'Selesai / Terakreditasi',
            draft: 'Draft / Persiapan',
        };

        if (editingItem) {
            setItems((prev) =>
                prev.map((it) =>
                    it.id === editingItem.id
                        ? {
                              ...it,
                              ...formData,
                              level_label: formData.type === 'institusi' ? 'Institusi (AIPT)' : 'Program Studi (APS)',
                              status_label: statusLabels[formData.status] || 'Aktif',
                          }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `sesi-${Date.now()}`,
                ...formData,
                level_label: formData.type === 'institusi' ? 'Institusi (AIPT)' : 'Program Studi (APS)',
                status_label: statusLabels[formData.status] || 'Aktif',
            };
            setItems((prev) => [newItem, ...prev]);
        }

        setModalOpen(false);
    };

    // Delete Item
    const handleDelete = (id, name) => {
        if (!confirm(`Hapus sesi akreditasi "${name}"?`)) return;
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Sesi Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>Master Data Konfigurasi</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Master Sesi Akreditasi</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola periode dan siklus sesi akreditasi Institusi (BAN-PT) maupun Program Studi (LAM), rentang tahun TS, dan target peringkat mutu.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Sesi Baru</span>
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] sm:min-w-[300px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama sesi, lembaga, prodi..."
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600"
                            />
                        </div>

                        {/* Filter Tingkat */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Tingkat (Institusi & Prodi)</option>
                            <option value="institusi">Institusi / BAN-PT</option>
                            <option value="prodi">Program Studi / LAM</option>
                        </select>

                        {/* Filter Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Status Sesi</option>
                            <option value="active">Sesi Aktif</option>
                            <option value="completed">Selesai / Terakreditasi</option>
                            <option value="draft">Draft / Persiapan</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {items.length} Sesi Akreditasi
                    </div>
                </div>

                {/* Tabel Sesi Akreditasi */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 border-r border-slate-200">Nama Sesi & Lembaga</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Tingkat / Sasaran</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Periode Sesi</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Tahun Acuan TS</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Target / Status SK</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada data sesi akreditasi yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-slate-800 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                                        item.agency_code === 'BAN-PT'
                                                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                    }`}>
                                                        {item.agency_code}
                                                    </span>
                                                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                    {item.type === 'institusi' ? (
                                                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                    ) : (
                                                        <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    )}
                                                    <span>{item.target_name}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                                                    {item.level_label}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700 border-r border-slate-100">
                                                {item.year_start} – {item.year_end}
                                            </td>

                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-slate-200 bg-slate-100 text-slate-700 font-bold text-[11px]">
                                                    TS {item.ts_year} ({item.ts_count} Thn)
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-600 border-r border-slate-100">
                                                <div className="font-bold text-slate-700">{item.target_rating}</div>
                                                <span className="text-[11px] text-slate-400 truncate block max-w-xs" title={item.sk_number}>
                                                    {item.sk_number || '-'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold border ${
                                                        item.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                            : item.status === 'completed'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {item.status_label}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Sesi"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Sesi"
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

            {/* Modal Form Tambah / Edit Sesi Akreditasi */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Sesi Akreditasi' : 'Tambah Sesi Akreditasi Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Periode & Evaluasi TS
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
                            {/* Tingkat Sesi & Lembaga */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tingkat Sesi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setFormData({
                                                ...formData,
                                                type: newType,
                                                agency_code: newType === 'institusi' ? 'BAN-PT' : 'LAM-INFOKOM',
                                                target_name:
                                                    newType === 'institusi'
                                                        ? 'Universitas Teknologi Digital'
                                                        : 'Teknik Informatika (S1)',
                                                ts_count: newType === 'institusi' ? 5 : 3,
                                            });
                                        }}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold"
                                    >
                                        <option value="institusi">Institusi (AIPT)</option>
                                        <option value="prodi">Program Studi (APS)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Lembaga Akreditasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.agency_code}
                                        onChange={(e) => setFormData({ ...formData, agency_code: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold"
                                    >
                                        <option value="BAN-PT">BAN-PT (Nasional PT)</option>
                                        <option value="LAM-INFOKOM">LAM-INFOKOM (Informatika)</option>
                                        <option value="LAMEMBA">LAMEMBA (Ekonomi/Bisnis)</option>
                                        <option value="LAM-TEKNIK">LAM-TEKNIK (Teknik)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Nama Sesi */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Nama Sesi Akreditasi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Akreditasi Perguruan Tinggi (AIPT) 2025–2030"
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Sasaran Institusi / Prodi */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    Sasaran (Nama Institusi / Program Studi) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.target_name}
                                    onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            {/* Periode Tahun Mulai - Tahun Selesai */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tahun Mulai <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year_start}
                                        onChange={(e) => setFormData({ ...formData, year_start: parseInt(e.target.value, 10) || 2025 })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tahun Selesai <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year_end}
                                        onChange={(e) => setFormData({ ...formData, year_end: parseInt(e.target.value, 10) || 2030 })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Konfigurasi TS */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Tahun Acuan TS <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.ts_year}
                                        onChange={(e) => setFormData({ ...formData, ts_year: parseInt(e.target.value, 10) || 2025 })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Rentang TS <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.ts_count}
                                        onChange={(e) => setFormData({ ...formData, ts_count: parseInt(e.target.value, 10) || 3 })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value={3}>3 Tahun (TS s/d TS-2 - Standar LAM)</option>
                                        <option value={5}>5 Tahun (TS s/d TS-4 - Standar BAN-PT)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Target Rating & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Target Predikat
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.target_rating}
                                        onChange={(e) => setFormData({ ...formData, target_rating: e.target.value })}
                                        placeholder="Unggul / Baik Sekali"
                                        className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-slate-600 mb-1">
                                        Status Sesi
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="active">Sesi Aktif Berjalan</option>
                                        <option value="completed">Selesai / Terakreditasi</option>
                                        <option value="draft">Draft / Persiapan</option>
                                    </select>
                                </div>
                            </div>

                            {/* No. SK / Catatan */}
                            <div>
                                <label className="block font-semibold uppercase text-slate-600 mb-1">
                                    No. SK Akreditasi / Catatan Progres
                                </label>
                                <input
                                    type="text"
                                    value={formData.sk_number}
                                    onChange={(e) => setFormData({ ...formData, sk_number: e.target.value })}
                                    placeholder="Contoh: SK BAN-PT No. 1024/SK/BAN-PT/2020 atau Dalam Proses"
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
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
                                    Simpan Sesi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
