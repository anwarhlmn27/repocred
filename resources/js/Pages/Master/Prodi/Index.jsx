import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { confirmAlert } from '@/Utils/alert';
import {
    GraduationCap,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Landmark,
    Award,
    Building2,
    CheckCircle2,
    Check,
    Layers,
    Filter,
    ShieldCheck
} from 'lucide-react';

export default function ProdiIndex({ prodis = [], faculties = [], agencies = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('ALL');
    const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Inertia sesuai dengan tabel prodis (faculty_id, agency_id, code, name, acronym, is_active)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        faculty_id: '',
        agency_id: '',
        code: '',
        name: '',
        acronym: '',
        is_active: true,
    });

    // Statistik Cepat Real Data
    const stats = useMemo(() => {
        const total = prodis.length;
        const active = prodis.filter((p) => p.is_active).length;
        const uniqueFaculties = new Set(prodis.map((p) => p.faculty_id).filter(Boolean)).size;
        const linkedAgencies = prodis.filter((p) => p.agency_id).length;
        return { total, active, uniqueFaculties, linkedAgencies };
    }, [prodis]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return prodis.filter((item) => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.faculty?.name && item.faculty.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.agency?.name && item.agency.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.agency?.code && item.agency.code.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesFaculty =
                selectedFacultyFilter === 'ALL' || item.faculty_id === selectedFacultyFilter;

            const matchesAgency =
                selectedAgencyFilter === 'ALL' ||
                (selectedAgencyFilter === 'NONE' ? !item.agency_id : item.agency_id === selectedAgencyFilter);

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && item.is_active) ||
                (statusFilter === 'INACTIVE' && !item.is_active);

            return matchesSearch && matchesFaculty && matchesAgency && matchesStatus;
        });
    }, [prodis, searchTerm, selectedFacultyFilter, selectedAgencyFilter, statusFilter]);

    // Buka Modal Tambah
    const openAddModal = () => {
        setEditingItem(null);
        clearErrors();
        reset();
        setData({
            faculty_id: faculties[0]?.id || '',
            agency_id: agencies[0]?.id || '',
            code: '',
            name: '',
            acronym: '',
            is_active: true,
        });
        setIsOpenModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            faculty_id: item.faculty_id || '',
            agency_id: item.agency_id || '',
            code: item.code || '',
            name: item.name || '',
            acronym: item.acronym || '',
            is_active: Boolean(item.is_active),
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
            put(route('master.prodi.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('master.prodi.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Hapus Prodi dengan Konfirmasi SweetAlert2
    const handleDelete = async (prodi) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Program Studi?',
            text: `Apakah Anda yakin ingin menghapus Program Studi "${prodi.name} (${prodi.acronym})"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            router.delete(route('master.prodi.destroy', prodi.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Program Studi" />

            <div className="space-y-6">
                {/* Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>Master Data Akademik</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Program Studi</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Kelola data resmi program studi, penetapan fakultas (UPPS), kode PDDikti, dan lembaga akreditasi rujukan (LAM / BAN-PT).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Program Studi</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Prodi</span>
                            <span className="text-lg font-black text-slate-800">{stats.total} Program Studi</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Status Aktif</span>
                            <span className="text-lg font-black text-slate-800">{stats.active} Aktif Digunakan</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Fakultas Terlibat</span>
                            <span className="text-lg font-black text-slate-800">{stats.uniqueFaculties} Fakultas / UPPS</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block font-medium">Terhubung Agency</span>
                            <span className="text-lg font-black text-slate-800">{stats.linkedAgencies} Prodi</span>
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
                                placeholder="Cari nama, kode, akronim, atau fakultas..."
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                            />
                        </div>

                        {/* Filter Fakultas */}
                        <select
                            value={selectedFacultyFilter}
                            onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Fakultas / UPPS</option>
                            {faculties.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name} ({f.acronym})
                                </option>
                            ))}
                        </select>

                        {/* Filter Lembaga Akreditasi */}
                        <select
                            value={selectedAgencyFilter}
                            onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Agency Akreditasi</option>
                            {agencies.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.code} - {a.name}
                                </option>
                            ))}
                            <option value="NONE">Belum Ada Agency</option>
                        </select>

                        {/* Filter Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Hanya Aktif</option>
                            <option value="INACTIVE">Nonaktif</option>
                        </select>
                    </div>

                    <div className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {prodis.length} Program Studi
                    </div>
                </div>

                {/* Tabel Data Program Studi */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center border-r border-slate-200">No</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Kode Prodi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Nama Program Studi</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Fakultas (UPPS)</th>
                                    <th className="py-3 px-4 border-r border-slate-200">Lembaga Akreditasi</th>
                                    <th className="py-3 px-4 text-center border-r border-slate-200">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada data program studi yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* No */}
                                            <td className="py-3.5 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                                                {index + 1}
                                            </td>

                                            {/* Kode & Akronim */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    {/* <span className="px-2 py-0.5 text-xs font-black tracking-wider uppercase border border-indigo-200 bg-indigo-50 text-indigo-700">
                                                        {item.acronym}
                                                    </span> */}
                                                    <span className="font-mono text-slate-500 font-semibold">
                                                        {item.code}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Nama Program Studi */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Fakultas / UPPS */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    <Landmark className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span>{item.faculty?.name || '-'}</span>
                                                </div>
                                                {item.faculty?.univ && (
                                                    <div className="text-[11px] text-slate-400 ml-5">
                                                        ({item.faculty.univ.acronym})
                                                    </div>
                                                )}
                                            </td>

                                            {/* Lembaga Akreditasi */}
                                            <td className="py-3.5 px-4 border-r border-slate-100">
                                                {item.agency ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        <span>{item.agency.code}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">- Belum Diatur -</span>
                                                )}
                                            </td>

                                            {/* Status Aktif */}
                                            <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold border ${item.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-600' : 'bg-rose-600'
                                                            }`}
                                                    />
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Program Studi"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Hapus Program Studi"
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

            {/* Modal Tambah / Edit Program Studi */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingItem ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Konfigurasi Master Data Program Studi
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

                        {/* Form Sesuai Tabel prodis: faculty_id, agency_id, code, name, acronym, is_active */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            {/* Fakultas / Unit Pengelola (UPPS) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Fakultas / Unit Pengelola (UPPS) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.faculty_id}
                                    onChange={(e) => setData('faculty_id', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs border ${errors.faculty_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 bg-white cursor-pointer`}
                                    required
                                >
                                    <option value="" disabled>-- Pilih Fakultas / UPPS --</option>
                                    {faculties.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.acronym}) {f.univ ? `- ${f.univ.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.faculty_id && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.faculty_id}</p>
                                )}
                            </div>

                            {/* Lembaga Akreditasi Rujukan (Agency) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Lembaga Akreditasi Rujukan (Agency)
                                </label>
                                <select
                                    value={data.agency_id}
                                    onChange={(e) => setData('agency_id', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs border ${errors.agency_id ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                        } focus:outline-none focus:border-indigo-600 bg-white cursor-pointer`}
                                >
                                    <option value="">-- Belum Ditentukan / Pilih Nanti --</option>
                                    {agencies.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.code} - {a.name} ({a.type === 'internasional' ? 'Internasional' : 'Nasional'})
                                        </option>
                                    ))}
                                </select>
                                {errors.agency_id ? (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.agency_id}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Pilih lembaga yang mengampu akreditasi prodi ini (contoh: LAM-INFOKOM, LAMEMBA, BAN-PT).
                                    </p>
                                )}
                            </div>

                            {/* Kode Prodi & Akronim */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Kode Prodi / PDDikti <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Contoh: 55201 atau IF"
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
                                        placeholder="Contoh: TI, SI, BD"
                                        className={`w-full px-3 py-2 text-xs border ${errors.acronym ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                            } focus:outline-none focus:border-indigo-600 font-bold uppercase`}
                                        required
                                    />
                                    {errors.acronym && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.acronym}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nama Resmi Program Studi */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Resmi Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Teknik Informatika"
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
                                        Program Studi Aktif Digunakan
                                    </span>
                                </label>
                                <p className="text-[11px] text-slate-400 ml-6.5 mt-0.5">
                                    Prodi yang aktif dapat dipilih dalam sesi akreditasi, pengisian borang, dan eviden kegiatan.
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
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {processing ? (
                                        <span>Menyimpan...</span>
                                    ) : (
                                        <span>{editingItem ? 'Perbarui Program Studi' : 'Tambah Program Studi'}</span>
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
