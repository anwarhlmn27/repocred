import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
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
    Layers,
} from 'lucide-react';

export default function TahunAkademikIndex({ academicYears = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const currentCalendarYear = new Date().getFullYear();

    // Form Inertia sesuai dengan tabel academicyears (year)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        year: currentCalendarYear,
    });

    // Cari tahun akademik tertinggi / terbaru
    const latestYearItem = useMemo(() => {
        if (!academicYears || academicYears.length === 0) return null;
        return [...academicYears].sort((a, b) => Number(b.year) - Number(a.year))[0];
    }, [academicYears]);

    // Total kegiatan dari seluruh tahun
    const totalActivities = useMemo(() => {
        return academicYears.reduce((acc, curr) => acc + (curr.activities_count || 0), 0);
    }, [academicYears]);

    // Filter Items berdasarkan pencarian
    const filteredItems = useMemo(() => {
        return academicYears.filter((item) => {
            const yearStr = `${item.year}`;
            const academicLabel = `${item.year}/${Number(item.year) + 1}`;
            return (
                yearStr.includes(searchTerm) ||
                academicLabel.includes(searchTerm)
            );
        });
    }, [academicYears, searchTerm]);

    // Buka Modal Tambah
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        const highestYear = latestYearItem ? Number(latestYearItem.year) : currentCalendarYear;
        setData({
            year: highestYear + 1,
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            year: item.year,
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

    // Submit Form Tambah / Edit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingItem) {
            put(route('master.tahun-akademik.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('master.tahun-akademik.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Hapus Tahun Akademik dengan SweetAlert2
    const handleDelete = async (item) => {
        const label = `${item.year}/${Number(item.year) + 1}`;
        let confirmMsg = `Apakah Anda yakin ingin menghapus Tahun Akademik ${label}?`;
        if (item.activities_count > 0) {
            confirmMsg = `Tahun akademik ${label} memiliki ${item.activities_count} data kegiatan tridharma/eviden terhubung.`;
        }

        const confirmed = await confirmAlert({
            title: 'Hapus Tahun Akademik?',
            text: confirmMsg,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.tahun-akademik.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Tahun Akademik - Repository Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>Master Data Periode</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Tahun Akademik</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola periode tahun akademik institusi sebagai acuan siklus pelaporan mutu PPEPP dan evidensi akreditasi (TS, TS-1, TS-2).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Tahun Akademik</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Card 1: Total Periode */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                Total Tahun Akademik
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-800">
                                    {academicYears.length}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Periode Tercatat</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Tersedia untuk siklus pelaporan akreditasi
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Card 2: Periode Terbaru */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                Periode Terkini
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-700">
                                    {latestYearItem ? `${latestYearItem.year}/${Number(latestYearItem.year) + 1}` : '-'}
                                </span>
                                {latestYearItem && (
                                    <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                                        Terbaru
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Tahun acuan pelaporan tridharma terkini
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Card 3: Kegiatan Terkait */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                Kegiatan Tridharma Terkait
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-800">
                                    {totalActivities}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Kegiatan Terhubung</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Dari seluruh siklus tahun akademik
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari tahun akademik (misal: 2024 atau 2024/2025)..."
                            className="w-full border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
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

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {academicYears.length} Tahun Akademik
                    </div>
                </div>

                {/* Tabel Data Tahun Akademik */}
                <div className="border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">
                                        No
                                    </th>
                                    <th className="py-3 px-4 border-r border-slate-200">
                                        Tahun Akademik
                                    </th>
                                    <th className="py-3 px-4 border-r border-slate-200">
                                        Tahun Awal
                                    </th>
                                    <th className="py-3 px-4 border-r border-slate-200">
                                        Periode Semester
                                    </th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">
                                        Kegiatan Terkait
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                                            <Calendar className="mx-auto h-7 w-7 text-slate-300 mb-1.5" />
                                            <p className="font-semibold text-slate-600 text-xs">Tidak ada data tahun akademik</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan kata kunci pencarian Anda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => {
                                        const isLatest = latestYearItem && item.id === latestYearItem.id;
                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-slate-50/70 transition-colors ${
                                                    isLatest ? 'bg-indigo-50/20' : ''
                                                }`}
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center font-mono text-slate-400 border-r border-slate-100">
                                                    {index + 1}
                                                </td>

                                                {/* Label Tahun Akademik */}
                                                <td className="py-3.5 px-4 border-r border-slate-100">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center font-bold text-xs border ${
                                                                isLatest
                                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}
                                                        >
                                                            <CalendarDays className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-sm">
                                                                    {item.year}/{Number(item.year) + 1}
                                                                </span>
                                                                {isLatest && (
                                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold">
                                                                        Terkini
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tahun Awal */}
                                                <td className="py-3.5 px-4 border-r border-slate-100">
                                                    <span className="bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800 border border-slate-200">
                                                        {item.year}
                                                    </span>
                                                </td>

                                                {/* Periode Semester */}
                                                <td className="py-3.5 px-4 text-slate-600 border-r border-slate-100">
                                                    <span>Semester Ganjil & Genap</span>
                                                </td>

                                                {/* Kegiatan Terkait */}
                                                <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                                                        <Layers className="h-3 w-3" />
                                                        {item.activities_count || 0} Kegiatan
                                                    </span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                            title="Edit Tahun Akademik"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                            title="Hapus Tahun Akademik"
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

                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <span>Menampilkan {filteredItems.length} dari {academicYears.length} tahun akademik</span>
                        <span>* Format tahun akademik menggunakan standar tahun awal (e.g. 2024 = 2024/2025)</span>
                    </div>
                </div>

                {/* Modal Dialog Tambah / Edit Tahun Akademik */}
                {isOpenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                        <div className="bg-white max-w-sm w-full p-6 shadow-2xl border border-slate-300">
                            {/* Header Modal */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        {editingItem ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}
                                    </h3>
                                    <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                        {editingItem ? 'Perbarui data tahun akademik' : 'Daftarkan periode tahun akademik baru'}
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

                            {/* Form Body Sesuai Skema Tabel academicyears (year) */}
                            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Tahun Awal <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        required
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        placeholder="Contoh: 2025"
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.year ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-bold`}
                                        autoFocus
                                    />
                                    {errors.year ? (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.year}</p>
                                    ) : (
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Masukkan 4 digit angka tahun pembuka (antara 2000 - 2100).
                                        </p>
                                    )}
                                </div>

                                {/* Preview Card */}
                                <div className="border border-indigo-100 bg-indigo-50/60 p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                                        Pratinjau Format Periode:
                                    </span>
                                    <p className="text-sm font-black text-indigo-900">
                                        {data.year ? `${data.year}/${Number(data.year) + 1}` : '-'}
                                    </p>
                                    <span className="text-[11px] text-indigo-600 block mt-0.5">
                                        Mencakup Semester Ganjil & Genap
                                    </span>
                                </div>

                                {/* Modal Actions */}
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
                                            <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Tahun Akademik'}</span>
                                        )}
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
