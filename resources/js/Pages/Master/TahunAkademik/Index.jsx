import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert, toastSuccess, toastWarning } from '@/Utils/alert';
import {
    Calendar,
    CalendarDays,
    CheckCircle2,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    AlertCircle,
    Check,
    Layers,
} from 'lucide-react';

const defaultAcademicYears = [
    {
        id: 'ay-2025',
        year: 2025,
        is_active: true,
        activities_count: 12,
        created_at: '2025-01-05',
    },
    {
        id: 'ay-2024',
        year: 2024,
        is_active: false,
        activities_count: 24,
        created_at: '2024-01-10',
    },
    {
        id: 'ay-2023',
        year: 2023,
        is_active: false,
        activities_count: 19,
        created_at: '2023-01-15',
    },
    {
        id: 'ay-2022',
        year: 2022,
        is_active: false,
        activities_count: 15,
        created_at: '2022-01-12',
    },
];

export default function TahunAkademikIndex({ academicYears = [] }) {
    const [items, setItems] = useState(
        academicYears.length > 0 ? academicYears : defaultAcademicYears
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Form State
    const currentCalendarYear = new Date().getFullYear();
    const [formState, setFormState] = useState({
        year: currentCalendarYear,
        is_active: false,
    });
    const [formError, setFormError] = useState('');

    const showToast = (message) => {
        toastSuccess(message);
    };

    // Filter Items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const yearStr = `${item.year}`;
            const academicLabel = `${item.year}/${item.year + 1}`;
            const matchesSearch =
                yearStr.includes(searchTerm) ||
                academicLabel.includes(searchTerm);

            if (!matchesSearch) return false;

            if (statusFilter === 'ACTIVE') return item.is_active;
            if (statusFilter === 'INACTIVE') return !item.is_active;

            return true;
        });
    }, [items, searchTerm, statusFilter]);

    // Statistics
    const activeYearItem = items.find((i) => i.is_active);
    const totalActivities = items.reduce((acc, curr) => acc + (curr.activities_count || 0), 0);

    const openAddModal = () => {
        setEditingItem(null);
        const highestYear = items.length > 0 ? Math.max(...items.map((i) => Number(i.year))) : currentCalendarYear;
        setFormState({
            year: highestYear + 1,
            is_active: items.length === 0,
        });
        setFormError('');
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            year: item.year,
            is_active: item.is_active,
        });
        setFormError('');
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
        setFormError('');
    };

    const handleSave = (e) => {
        e.preventDefault();
        const yearNum = parseInt(formState.year, 10);

        if (!yearNum || isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            setFormError('Tahun harus berupa 4 digit angka yang valid (antara 2000 - 2100).');
            return;
        }

        const isDuplicate = items.some(
            (it) => it.year === yearNum && (!editingItem || it.id !== editingItem.id)
        );
        if (isDuplicate) {
            setFormError(`Tahun Akademik ${yearNum}/${yearNum + 1} sudah terdaftar.`);
            return;
        }

        if (editingItem) {
            const updated = items.map((it) => {
                if (it.id === editingItem.id) {
                    return {
                        ...it,
                        year: yearNum,
                        is_active: formState.is_active,
                    };
                }
                if (formState.is_active) {
                    return { ...it, is_active: false };
                }
                return it;
            });
            setItems(updated);
            showToast(`Tahun Akademik ${yearNum}/${yearNum + 1} berhasil diperbarui.`);
        } else {
            let updatedList = formState.is_active
                ? items.map((it) => ({ ...it, is_active: false }))
                : [...items];

            const newItem = {
                id: `ay-${yearNum}-${Date.now()}`,
                year: yearNum,
                is_active: formState.is_active,
                activities_count: 0,
                created_at: new Date().toISOString().split('T')[0],
            };

            setItems([newItem, ...updatedList].sort((a, b) => b.year - a.year));
            showToast(`Tahun Akademik ${yearNum}/${yearNum + 1} berhasil ditambahkan.`);
        }

        closeModal();
    };

    const handleToggleActive = (item) => {
        if (item.is_active) return;

        const updated = items.map((it) => ({
            ...it,
            is_active: it.id === item.id,
        }));
        setItems(updated);
        showToast(`Tahun Akademik ${item.year}/${item.year + 1} ditetapkan sebagai tahun aktif.`);
    };

    const handleDelete = async (item) => {
        if (item.is_active) {
            toastWarning('Tahun akademik yang sedang aktif tidak dapat dihapus. Silakan aktifkan tahun lain terlebih dahulu.');
            return;
        }

        let confirmMsg = `Hapus tahun akademik ${item.year}/${item.year + 1}?`;
        if (item.activities_count > 0) {
            confirmMsg = `Tahun akademik ${item.year}/${item.year + 1} memiliki ${item.activities_count} data kegiatan terhubung. Yakin ingin menghapus?`;
        }

        const confirmed = await confirmAlert({
            title: 'Hapus Tahun Akademik?',
            text: confirmMsg,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (!confirmed) return;

        setItems(items.filter((it) => it.id !== item.id));
        toastSuccess(`Tahun Akademik ${item.year}/${item.year + 1} berhasil dihapus.`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Tahun Akademik - Repository Akreditasi" />

            <div className="space-y-4 pb-10">
                {/* Toast Notification (, smaller font) */}
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 px-3.5 py-2 text-[11px] font-medium text-white shadow-lg transition-all">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────
                    1. Header & Tombol Tambah (Font turun 4px, border radius 2px)
                ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-600/20">
                                <CalendarDays className="h-3 w-3" />
                                Master Data Periode
                            </span>
                        </div>
                        <h1 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                            Tahun Akademik
                        </h1>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                            Kelola periode tahun akademik institusi sebagai acuan siklus pelaporan mutu PPEPP dan evidensi akreditasi.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-1.5 bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-blue-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Tahun Akademik
                    </button>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    2. Summary KPI Cards (, fonts reduced 4px)
                ────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Card 1: Total Periode */}
                    <div className="border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Total Tahun Akademik
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-blue-50 text-blue-600">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[22px] font-extrabold text-slate-900 leading-none">
                                {items.length}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Periode Tercatat</span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-500">
                            Tersedia untuk filter instrumen akreditasi
                        </p>
                    </div>

                    {/* Card 2: Periode Aktif */}
                    <div className="border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Tahun Akademik Aktif
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[18px] font-extrabold text-emerald-700 leading-none">
                                {activeYearItem ? `${activeYearItem.year}/${activeYearItem.year + 1}` : 'Belum Dipilih'}
                            </span>
                            <span className="inline-flex items-center bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                                Aktif
                            </span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-500">
                            Digunakan sebagai filter default sistem
                        </p>
                    </div>

                    {/* Card 3: Total Kegiatan Terhubung */}
                    <div className="border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Kegiatan Tridharma Terkait
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-indigo-50 text-indigo-600">
                                <Layers className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[22px] font-extrabold text-slate-900 leading-none">
                                {totalActivities}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Kegiatan Terhubung</span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-500">
                            Dari seluruh siklus tahun akademik
                        </p>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    3. Filter & Search Bar ()
                ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2.5 border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari tahun akademik (misal: 2025 atau 2025/2026)..."
                            className="w-full border border-slate-300 bg-slate-50/50 pl-8 pr-7 py-1.5 text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500">Status:</span>
                        <div className="inline-flex border border-slate-200 bg-slate-50 p-0.5">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                    statusFilter === 'ALL'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setStatusFilter('ACTIVE')}
                                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                    statusFilter === 'ACTIVE'
                                        ? 'bg-white text-emerald-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Aktif
                            </button>
                            <button
                                onClick={() => setStatusFilter('INACTIVE')}
                                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                    statusFilter === 'INACTIVE'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Arsip / Tidak Aktif
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    4. Tabel Data Tahun Akademik ()
                ────────────────────────────────────────────────────────── */}
                <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] w-12 text-center">
                                        No
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">
                                        Tahun Akademik
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">
                                        Tahun Awal
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">
                                        Periode Semester
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">
                                        Status
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">
                                        Kegiatan Terkait
                                    </th>
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500">
                                            <Calendar className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
                                            <p className="font-semibold text-slate-700 text-xs">Tidak ada data tahun akademik</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Coba sesuaikan kata kunci pencarian Anda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-slate-50/70 transition-colors ${
                                                item.is_active ? 'bg-emerald-50/20' : ''
                                            }`}
                                        >
                                            <td className="py-2.5 px-3 text-center font-medium text-slate-500 text-[10px]">
                                                {index + 1}
                                            </td>

                                            {/* Label Tahun Akademik */}
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center font-bold text-[10px] ${
                                                            item.is_active
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {item.year}/{item.year + 1}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500">
                                                            ID: {item.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tahun Awal */}
                                            <td className="py-2.5 px-3 font-medium text-slate-700">
                                                <span className="bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800 border border-slate-200">
                                                    {item.year}
                                                </span>
                                            </td>

                                            {/* Periode Semester */}
                                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                                <span>Semester Ganjil & Genap</span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-2.5 px-3 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                                                        <span className="h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                                                        Aktif Saat Ini
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                                        Tidak Aktif
                                                    </span>
                                                )}
                                            </td>

                                            {/* Kegiatan Terkait */}
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                                                    <Layers className="h-3 w-3" />
                                                    {item.activities_count || 0} Kegiatan
                                                </span>
                                            </td>

                                            {/* Aksi (, smaller buttons) */}
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!item.is_active && (
                                                        <button
                                                            onClick={() => handleToggleActive(item)}
                                                            className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                            title="Jadikan Tahun Akademik Aktif"
                                                        >
                                                            <Check className="h-2.5 w-2.5" />
                                                            Jadikan Aktif
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                                        title="Edit Tahun Akademik"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Hapus Tahun Akademik"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <span>Menampilkan {filteredItems.length} dari {items.length} tahun akademik</span>
                        <span>* Hanya satu tahun akademik yang dapat berstatus aktif dalam satu waktu</span>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    5. Modal Dialog Tambah / Edit Tahun Akademik ()
                ────────────────────────────────────────────────────────── */}
                {isOpenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-2xs transition-opacity animate-fade-in">
                        <div className="relative w-full max-w-sm transform overflow-hidden bg-white shadow-2xl transition-all border border-slate-200">
                            {/* Header Modal */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center bg-blue-100 text-blue-700">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900">
                                            {editingItem ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}
                                        </h3>
                                        <p className="text-[10px] text-slate-500">
                                            {editingItem ? 'Perbarui data tahun akademik' : 'Daftarkan periode akademik baru'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSave} className="p-4 space-y-3">
                                {formError && (
                                    <div className="flex items-start gap-1.5 bg-rose-50 border border-rose-200 p-2.5 text-[10px] text-rose-700">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                                        Tahun Awal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        required
                                        value={formState.year}
                                        onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                                        placeholder="Contoh: 2025"
                                        className="w-full border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                    />
                                    <p className="mt-1 text-[10px] text-slate-500">
                                        Masukkan tahun pembuka (4 digit angka).
                                    </p>
                                </div>

                                {/* Preview Card */}
                                <div className="border border-blue-100 bg-blue-50/60 p-2.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                                        Pratinjau Format Periode:
                                    </span>
                                    <p className="text-xs font-extrabold text-blue-900">
                                        {formState.year ? `${formState.year}/${Number(formState.year) + 1}` : '-'}
                                    </p>
                                    <span className="text-[10px] text-blue-700 block mt-0.5">
                                        Mencakup Semester Ganjil & Genap
                                    </span>
                                </div>

                                {/* Checkbox is_active */}
                                <div className="flex items-start gap-2.5 border border-slate-200 bg-slate-50/50 p-2.5">
                                    <input
                                        type="checkbox"
                                        id="is_active_checkbox"
                                        checked={formState.is_active}
                                        onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                                        className="mt-0.5 h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active_checkbox" className="text-[10px] select-none">
                                        <span className="font-bold text-slate-800 block">
                                            Tetapkan sebagai Tahun Akademik Aktif
                                        </span>
                                        <span className="text-slate-500 mt-0.5 block leading-relaxed">
                                            Jika dicentang, tahun akademik lain otomatis diubah statusnya menjadi tidak aktif.
                                        </span>
                                    </label>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                                    >
                                        {editingItem ? 'Simpan Perubahan' : 'Tambah Tahun Akademik'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
