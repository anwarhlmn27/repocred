import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    Calendar,
    CalendarDays,
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
    CheckCircle2,
    Clock,
    ShieldCheck,
    FileText,
    Activity as ActivityIcon
} from 'lucide-react';

const statusConfig = {
    draft: {
        label: 'Draft / Persiapan',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    submitted: {
        label: 'Submit Borang / LED',
        badge: 'bg-amber-50 text-amber-700 border-amber-300',
    },
    field_assessment: {
        label: 'Asesmen Lapangan (AL)',
        badge: 'bg-purple-50 text-purple-700 border-purple-300',
    },
    completed: {
        label: 'Selesai / Terakreditasi',
        badge: 'bg-blue-50 text-blue-700 border-blue-300',
    },
    archived: {
        label: 'Diarsipkan',
        badge: 'bg-slate-100 text-slate-500 border-slate-200',
    },
};

export default function SesiAkreditasiIndex({ sessions = [], prodis = [], agencies = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [agencyFilter, setAgencyFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const currentYear = new Date().getFullYear();

    // Form Inertia sesuai dengan tabel accreditation_sessions
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        prodi_id: '',
        agency_id: '',
        name: '',
        year_start: currentYear,
        year_end: currentYear + 5,
        status: 'draft',
        ts_count: 3,
        ts_year: currentYear,
        sk_number: '',
        achieved_rating: 'Unggul',
        is_active: true,
    });

    // Statistik Cepat Berdasarkan Data Nyata
    const stats = useMemo(() => {
        const total = sessions.length;
        const active = sessions.filter((s) => s.is_active).length;
        const inProgress = sessions.filter((s) => ['submitted', 'field_assessment'].includes(s.status)).length;
        const completed = sessions.filter((s) => s.status === 'completed').length;
        return { total, active, inProgress, completed };
    }, [sessions]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return sessions.filter((item) => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.prodi?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.prodi?.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.agency?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sk_number?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesAgency = agencyFilter === 'ALL' || item.agency_id === agencyFilter;
            const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
            const matchesActive =
                activeFilter === 'ALL' ||
                (activeFilter === 'ACTIVE' && item.is_active) ||
                (activeFilter === 'INACTIVE' && !item.is_active);

            return matchesSearch && matchesAgency && matchesStatus && matchesActive;
        });
    }, [sessions, searchTerm, agencyFilter, statusFilter, activeFilter]);

    // Handle pemilihan prodi di modal untuk auto-suggest
    const handleProdiChange = (selectedProdiId) => {
        const selected = prodis.find((p) => p.id === selectedProdiId);
        let updatedAgencyId = data.agency_id;
        let updatedName = data.name;

        if (selected) {
            // Jika prodi memiliki default agency_id, gunakan
            if (selected.agency_id) {
                updatedAgencyId = selected.agency_id;
            }
            // Auto generate nama jika belum diubah manual
            if (!editingItem) {
                updatedName = `Akreditasi ${selected.name} ${data.year_start}–${data.year_end}`;
            }
        }

        setData({
            ...data,
            prodi_id: selectedProdiId,
            agency_id: updatedAgencyId,
            name: updatedName,
        });
    };

    // Buka Modal Tambah
    const handleOpenAdd = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        const defaultProdi = prodis[0];
        const defaultAgencyId = defaultProdi?.agency_id || agencies[0]?.id || '';
        const defaultStart = currentYear;
        const defaultEnd = currentYear + 5;
        const defaultName = defaultProdi ? `Akreditasi ${defaultProdi.name} ${defaultStart}–${defaultEnd}` : '';

        setData({
            prodi_id: defaultProdi?.id || '',
            agency_id: defaultAgencyId,
            name: defaultName,
            year_start: defaultStart,
            year_end: defaultEnd,
            status: 'draft',
            ts_count: 3,
            ts_year: defaultStart,
            sk_number: '',
            achieved_rating: 'Unggul',
            is_active: true,
        });
        setModalOpen(true);
    };

    // Buka Modal Edit
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            prodi_id: item.prodi_id || '',
            agency_id: item.agency_id || '',
            name: item.name || '',
            year_start: item.year_start || currentYear,
            year_end: item.year_end || currentYear + 5,
            status: item.status || 'draft',
            ts_count: item.ts_count || 3,
            ts_year: item.ts_year || currentYear,
            sk_number: item.sk_number || '',
            achieved_rating: item.achieved_rating || 'Unggul',
            is_active: Boolean(item.is_active),
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
            put(route('master.sesi-akreditasi.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('master.sesi-akreditasi.store'), {
                preserveScroll: true,
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    // Hapus Sesi Akreditasi dengan SweetAlert2
    const handleDelete = async (item) => {
        let confirmText = `Apakah Anda yakin ingin menghapus sesi "${item.name}"?`;
        if (item.activities_count > 0) {
            confirmText = `Sesi "${item.name}" memiliki ${item.activities_count} riwayat kegiatan atau eviden borang terhubung.`;
        }

        const confirmed = await confirmAlert({
            title: 'Hapus Sesi Akreditasi?',
            text: confirmText,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.sesi-akreditasi.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Sesi Akreditasi - Repository Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>Master Data Konfigurasi</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Master Sesi Akreditasi</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola periode dan siklus sesi akreditasi Program Studi (LAM/BAN-PT), rentang tahun TS (Tahun Sekarang), dan target capaian mutu.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Sesi Baru</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Sesi</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Sesi</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Sesi Aktif</span>
                            <span className="text-lg font-black text-slate-800">{stats.active} Aktif</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Tahap Borang & AL</span>
                            <span className="text-lg font-black text-slate-800">{stats.inProgress} Sesi</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Selesai / Terbit SK</span>
                            <span className="text-lg font-black text-slate-800">{stats.completed} Sesi</span>
                        </div>
                    </div>
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

                        {/* Filter Lembaga Akreditasi */}
                        <select
                            value={agencyFilter}
                            onChange={(e) => setAgencyFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Lembaga Akreditasi</option>
                            {agencies.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.code} ({a.type})
                                </option>
                            ))}
                        </select>

                        {/* Filter Status Siklus */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Tahap Siklus</option>
                            <option value="draft">Draft / Persiapan</option>
                            <option value="submitted">Submit Borang / LED</option>
                            <option value="field_assessment">Asesmen Lapangan (AL)</option>
                            <option value="completed">Selesai / Terakreditasi</option>
                            <option value="archived">Diarsipkan</option>
                        </select>

                        {/* Filter Status Aktif */}
                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Status Sesi</option>
                            <option value="ACTIVE">Hanya Sesi Aktif</option>
                            <option value="INACTIVE">Sesi Nonaktif</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {sessions.length} Sesi Akreditasi
                    </div>
                </div>

                {/* Tabel Sesi Akreditasi */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Lembaga</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama Sesi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Program Studi / UPPS</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Periode Sesi</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Tahun Acuan TS</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Predikat / Nomor SK</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada data sesi akreditasi yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => {
                                        const cfg = statusConfig[item.status] || statusConfig.draft;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                    {index + 1}
                                                </td>

                                                {/* Nama Sesi & Lembaga */}
                                                <td className="py-3.5 px-4 font-semibold text-slate-800 border-r border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${item.agency?.code === 'BAN-PT'
                                                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                }`}
                                                        >
                                                            {item.agency?.code || 'AGENCY'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-800 border-r border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 text-sm">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Program Studi / UPPS */}
                                                <td className="py-3.5 px-4 border-r border-slate-100">
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span>{item.prodi?.name || '-'}</span>
                                                        {item.prodi?.faculty.acronym && (
                                                            <span className="text-[10px] bg-slate-100 px-1 py-0.2 font-mono font-bold text-slate-600 border border-slate-200">
                                                                {item.prodi.faculty.acronym}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Periode Sesi */}
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700 border-r border-slate-100">
                                                    <span className="bg-slate-50 px-2 py-0.5 border border-slate-200">
                                                        {item.year_start} – {item.year_end}
                                                    </span>
                                                </td>

                                                {/* Tahun Acuan TS */}
                                                <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-slate-200 bg-slate-100 text-slate-700 font-bold text-[11px]">
                                                        TS {item.ts_year} ({item.ts_count} Thn)
                                                    </span>
                                                </td>

                                                {/* Target Predikat / No. SK */}
                                                <td className="py-3.5 px-4 text-slate-600 border-r border-slate-100">
                                                    <div className="font-bold text-slate-800">
                                                        {item.achieved_rating || '-'}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 truncate block max-w-xs" title={item.sk_number}>
                                                        {item.sk_number || 'Belum ada SK'}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${cfg.badge}`}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                        {item.is_active ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Aktif Berjalan
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">
                                                                Nonaktif
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
                                                            title="Edit Sesi"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                            title="Hapus Sesi"
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

            {/* Modal Form Tambah / Edit Sesi Akreditasi */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
                    <div className="bg-white max-w-xl w-full p-6 shadow-2xl border border-slate-300 my-8">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Sesi Akreditasi' : 'Tambah Sesi Akreditasi Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Periode & Evaluasi TS Akreditasi
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

                        {/* Form Body Sesuai Skema Tabel accreditation_sessions */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Program Studi & Lembaga Akreditasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Program Studi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.prodi_id}
                                        onChange={(e) => handleProdiChange(e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.prodi_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Program Studi --</option>
                                        {prodis.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.acronym})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.prodi_id && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.prodi_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Lembaga Akreditasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.agency_id}
                                        onChange={(e) => setData('agency_id', e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.agency_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Lembaga Akreditasi --</option>
                                        {agencies.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.code} - {a.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.agency_id && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.agency_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nama Sesi Akreditasi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Sesi Akreditasi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Akreditasi S1 Teknik Informatika 2024–2029"
                                    className={`w-full px-3.5 py-2 text-xs border ${errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-semibold`}
                                    required
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>
                                )}
                            </div>

                            {/* Periode Sesi (Tahun Mulai & Tahun Selesai) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tahun Mulai Periode <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={data.year_start}
                                        onChange={(e) => {
                                            const yStart = parseInt(e.target.value, 10) || currentYear;
                                            setData({
                                                ...data,
                                                year_start: yStart,
                                                year_end: yStart + 5,
                                                ts_year: yStart,
                                            });
                                        }}
                                        className={`w-full px-3 py-2 text-xs border ${errors.year_start ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600`}
                                        required
                                    />
                                    {errors.year_start && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.year_start}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tahun Selesai Periode <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={data.year_end}
                                        onChange={(e) => setData('year_end', parseInt(e.target.value, 10) || currentYear + 5)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.year_end ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600`}
                                        required
                                    />
                                    {errors.year_end && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.year_end}</p>
                                    )}
                                </div>
                            </div>

                            {/* Konfigurasi TS (Tahun Sekarang) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tahun Acuan TS (Tahun Sekarang) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={data.ts_year}
                                        onChange={(e) => setData('ts_year', parseInt(e.target.value, 10) || currentYear)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.ts_year ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600`}
                                        required
                                    />
                                    {errors.ts_year && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.ts_year}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Rentang TS Mutu <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.ts_count}
                                        onChange={(e) => setData('ts_count', parseInt(e.target.value, 10) || 3)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.ts_count ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                        required
                                    >
                                        <option value={3}>3 Tahun (TS s/d TS-2 - Standar LAM)</option>
                                        <option value={5}>5 Tahun (TS s/d TS-4 - Standar BAN-PT)</option>
                                    </select>
                                    {errors.ts_count && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.ts_count}</p>
                                    )}
                                </div>
                            </div>

                            {/* Target Predikat & Tahap Siklus */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Peringkat / Predikat Akreditasi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.achieved_rating}
                                        onChange={(e) => setData('achieved_rating', e.target.value)}
                                        placeholder="Contoh: Unggul, Baik Sekali, Baik"
                                        className={`w-full px-3 py-2 text-xs border ${errors.achieved_rating ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600`}
                                    />
                                    {errors.achieved_rating && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.achieved_rating}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tahap Siklus Akreditasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`w-full px-3 py-2 text-xs border ${errors.status ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } bg-slate-50 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer`}
                                        required
                                    >
                                        <option value="draft">Draft / Persiapan</option>
                                        <option value="submitted">Submit Borang / LED</option>
                                        <option value="field_assessment">Asesmen Lapangan (AL)</option>
                                        <option value="completed">Selesai / Terakreditasi</option>
                                        <option value="archived">Diarsipkan</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nomor SK Akreditasi / Keterangan */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nomor SK Akreditasi / Keterangan Progres
                                </label>
                                <input
                                    type="text"
                                    value={data.sk_number}
                                    onChange={(e) => setData('sk_number', e.target.value)}
                                    placeholder="Contoh: SK LAM-INFOKOM No. 045/SK/2024 atau Pengumpulan Eviden PPEPP"
                                    className={`w-full px-3.5 py-2 text-xs border ${errors.sk_number ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600`}
                                />
                                {errors.sk_number && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.sk_number}</p>
                                )}
                            </div>

                            {/* Status Sesi Aktif */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-0 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-800">
                                        Sesi Akreditasi Aktif Berjalan
                                    </span>
                                </label>
                                <p className="text-[11px] text-slate-400 ml-6.5 mt-0.5">
                                    Sesi yang berstatus aktif akan dijadikan referensi utama pengisian borang, eviden tridharma, dan asesmen.
                                </p>
                            </div>

                            {/* Tombol Aksi Modal */}
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
                                        <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Sesi Akreditasi'}</span>
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
