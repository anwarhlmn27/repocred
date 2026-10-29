import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    Award,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Layers,
    ShieldCheck,
    Globe,
    Building2,
    GraduationCap,
    Hash,
    CheckCircle2
} from 'lucide-react';

export default function CriteriaIndex({ criterias = [], agencies = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Inertia sesuai dengan tabel criterias (agency_id, code, name, sequence)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        agency_id: '',
        code: '',
        name: '',
        sequence: 1,
    });

    // Statistik Cepat Berdasarkan Data Nyata
    const stats = useMemo(() => {
        const total = criterias.length;
        const uniqueAgencies = new Set(criterias.map((c) => c.agency_id).filter(Boolean)).size;
        const lamCount = criterias.filter((c) => c.agency?.code?.toUpperCase().includes('LAM')).length;
        const banptCount = criterias.filter((c) => c.agency?.code?.toUpperCase().includes('BAN-PT')).length;
        return { total, uniqueAgencies, lamCount, banptCount };
    }, [criterias]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return criterias.filter((item) => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.agency?.code?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesAgency =
                selectedAgencyFilter === 'ALL' || item.agency_id === selectedAgencyFilter;

            return matchesSearch && matchesAgency;
        });
    }, [criterias, searchTerm, selectedAgencyFilter]);

    // Handle pemilihan agency saat form dibuka / diubah untuk auto-suggest
    const handleAgencyChange = (agencyId) => {
        const selectedAg = agencies.find((a) => a.id === agencyId);
        const existingForAgency = criterias.filter((c) => c.agency_id === agencyId);
        const nextSeq = existingForAgency.length > 0
            ? Math.max(...existingForAgency.map((c) => Number(c.sequence) || 0)) + 1
            : 1;

        let suggestedCode = data.code;
        if (!editingItem && selectedAg) {
            const prefix = selectedAg.code.replace(/[^A-Za-z0-9]/g, '');
            suggestedCode = `${prefix}-${nextSeq}`;
        }

        setData({
            ...data,
            agency_id: agencyId,
            sequence: nextSeq,
            code: suggestedCode,
        });
    };

    // Buka Modal Tambah
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();

        const defaultAgency = agencies[0];
        const defaultAgencyId = defaultAgency?.id || '';
        const existingForAgency = defaultAgencyId
            ? criterias.filter((c) => c.agency_id === defaultAgencyId)
            : [];
        const nextSeq = existingForAgency.length > 0
            ? Math.max(...existingForAgency.map((c) => Number(c.sequence) || 0)) + 1
            : 1;
        const prefix = defaultAgency ? defaultAgency.code.replace(/[^A-Za-z0-9]/g, '') : 'C';

        setData({
            agency_id: defaultAgencyId,
            code: `${prefix}-${nextSeq}`,
            name: '',
            sequence: nextSeq,
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            agency_id: item.agency_id || '',
            code: item.code || '',
            name: item.name || '',
            sequence: item.sequence || 1,
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
            put(route('master.kriteria.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('master.kriteria.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Hapus Kriteria dengan SweetAlert2
    const handleDelete = async (item) => {
        let confirmText = `Apakah Anda yakin ingin menghapus kriteria "${item.code} - ${item.name}"?`;
        if (item.activities_count > 0) {
            confirmText = `Kriteria ini memiliki ${item.activities_count} data kegiatan atau eviden borang terhubung.`;
        }

        const confirmed = await confirmAlert({
            title: 'Hapus Kriteria Akreditasi?',
            text: confirmText,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.kriteria.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Kriteria Akreditasi - Repository Akreditasi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <Award className="w-4 h-4" />
                            <span>Master Data Standar Mutu</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Kriteria Akreditasi</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola butir kriteria standar mutu akreditasi untuk lembaga BAN-PT (4 Kriteria) dan LAM (9 Kriteria) sebagai acuan pemenuhan PPEPP.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kriteria Baru</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Kriteria</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Butir</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Lembaga Terdaftar</span>
                            <span className="text-lg font-black text-slate-800">{stats.uniqueAgencies} Lembaga</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Kriteria LAM (APS)</span>
                            <span className="text-lg font-black text-slate-800">{stats.lamCount} Butir</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Kriteria BAN-PT (AIPT)</span>
                            <span className="text-lg font-black text-slate-800">{stats.banptCount} Butir</span>
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
                                placeholder="Cari kode kriteria atau judul standar mutu..."
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
                            value={selectedAgencyFilter}
                            onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Lembaga Akreditasi</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.code} - {agency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {criterias.length} Butir Kriteria
                    </div>
                </div>

                {/* Tabel Data Kriteria */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 w-20 text-center border-r border-slate-200">Urutan</th>
                                    <th className="py-3 px-4 w-32 border-r border-slate-200">Kode Kriteria</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama / Butir Standar Mutu</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Lembaga Akreditasi</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Kegiatan Terkait</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada butir kriteria yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* No */}
                                            <td className="py-3.5 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                {index + 1}
                                            </td>

                                            {/* Urutan */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 text-xs">
                                                    #{item.sequence}
                                                </span>
                                            </td>

                                            {/* Kode Kriteria */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <span className="px-2.5 py-1 text-xs font-black tracking-wider uppercase border border-indigo-200 bg-indigo-50 text-indigo-700 font-mono inline-block">
                                                    {item.code}
                                                </span>
                                            </td>

                                            {/* Nama / Butir Standar Mutu */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {item.name}
                                                </span>
                                            </td>

                                            {/* Lembaga Akreditasi */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                    <span>{item.agency?.code || '-'}</span>
                                                </div>
                                                {item.agency?.name && (
                                                    <span className="text-[11px] text-slate-400 block mt-0.5">
                                                        {item.agency.name}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Kegiatan Terkait */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-slate-200 bg-slate-100 text-slate-700 font-bold text-[11px]">
                                                    <Layers className="w-3 h-3" />
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
                                                        title="Edit Kriteria"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Kriteria"
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

            {/* Modal Dialog Form Tambah / Edit Kriteria */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Kriteria Standar' : 'Tambah Kriteria Standar Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Butir Kriteria Standar Akreditasi
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

                        {/* Form Body Sesuai Skema Tabel criterias: agency_id, code, name, sequence */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Lembaga Akreditasi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Lembaga Akreditasi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.agency_id}
                                    onChange={(e) => handleAgencyChange(e.target.value)}
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.agency_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } bg-slate-50 focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer`}
                                    required
                                >
                                    <option value="" disabled>-- Pilih Lembaga Akreditasi --</option>
                                    {agencies.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.code} - {a.name} ({a.type === 'internasional' ? 'Internasional' : 'Nasional'})
                                        </option>
                                    ))}
                                </select>
                                {errors.agency_id && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.agency_id}</p>
                                )}
                            </div>

                            {/* Urutan & Kode Kriteria */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Nomor Urutan (Sequence) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={data.sequence}
                                        onChange={(e) => setData('sequence', parseInt(e.target.value, 10) || 1)}
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.sequence ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-mono font-bold`}
                                        required
                                    />
                                    {errors.sequence && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.sequence}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Kode Kriteria <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="Contoh: LAM-1, BANPT-1, C1"
                                        className={`w-full px-3 py-2 text-xs border ${
                                            errors.code ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 font-mono font-bold uppercase`}
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.code}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nama / Butir Standar Mutu */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama / Butir Standar Mutu Kriteria <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Visi, Misi, Tujuan, dan Strategi"
                                    rows={3}
                                    className={`w-full px-3 py-2 text-xs border ${
                                        errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    } focus:outline-none focus:border-indigo-600`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>
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
                                        <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kriteria'}</span>
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
