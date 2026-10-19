import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Search, X, Landmark } from 'lucide-react';

const defaultFaculties = [
    { id: 'f-1', name_faculty: 'Fakultas Ilmu Komputer & Informatika' },
    { id: 'f-2', name_faculty: 'Fakultas Ekonomi dan Bisnis Digital' },
    { id: 'f-3', name_faculty: 'Fakultas Teknik & Rekayasa Sistem' },
];

const defaultProdis = [
    {
        id: 'p-1',
        faculty_id: 'f-1',
        name_prodi: 'Teknik Informatika',
        degree: 'S1',
        faculty: { name_faculty: 'Fakultas Ilmu Komputer & Informatika' },
    },
    {
        id: 'p-2',
        faculty_id: 'f-1',
        name_prodi: 'Sistem Informasi',
        degree: 'S1',
        faculty: { name_faculty: 'Fakultas Ilmu Komputer & Informatika' },
    },
    {
        id: 'p-3',
        faculty_id: 'f-1',
        name_prodi: 'Teknologi Informasi',
        degree: 'D3',
        faculty: { name_faculty: 'Fakultas Ilmu Komputer & Informatika' },
    },
    {
        id: 'p-4',
        faculty_id: 'f-2',
        name_prodi: 'Manajemen Bisnis Digital',
        degree: 'S1',
        faculty: { name_faculty: 'Fakultas Ekonomi dan Bisnis Digital' },
    },
    {
        id: 'p-5',
        faculty_id: 'f-3',
        name_prodi: 'Teknik Elektro Telekomunikasi',
        degree: 'S1',
        faculty: { name_faculty: 'Fakultas Teknik & Rekayasa Sistem' },
    },
];

export default function ProdiIndex({ prodis = [], faculties = [] }) {
    const [items, setItems] = useState(prodis.length > 0 ? prodis : defaultProdis);
    const [facultyList] = useState(faculties.length > 0 ? faculties : defaultFaculties);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDegree, setSelectedDegree] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const degreeOptions = ['D3', 'D4', 'S1', 'S2', 'S3', 'Profesi'];

    const [formState, setFormState] = useState({
        faculty_id: facultyList[0]?.id || '',
        name_prodi: '',
        degree: 'S1',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({ faculty_id: facultyList[0]?.id || '', name_prodi: '', degree: 'S1' });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            faculty_id: item.faculty_id,
            name_prodi: item.name_prodi,
            degree: item.degree,
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const selectedFac = facultyList.find((f) => f.id === formState.faculty_id);
        if (editingItem) {
            setItems(
                items.map((it) =>
                    it.id === editingItem.id
                        ? { ...it, ...formState, faculty: selectedFac }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `p-${Date.now()}`,
                ...formState,
                faculty: selectedFac,
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus prodi "${name}"? (Mode Preview UI)`)) {
            setItems(items.filter((it) => it.id !== id));
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.name_prodi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.faculty?.name_faculty && item.faculty.name_faculty.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDegree = selectedDegree === 'ALL' || item.degree === selectedDegree;
        return matchesSearch && matchesDegree;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Program Studi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>Master Data</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Program Studi</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola data program studi beserta jenjang pendidikan untuk pengelompokan borang & eviden akreditasi.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Program Studi</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari program studi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                        </div>

                        <select
                            value={selectedDegree}
                            onChange={(e) => setSelectedDegree(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ALL">Semua Jenjang</option>
                            {degreeOptions.map((deg) => (
                                <option key={deg} value={deg}>{deg}</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> data program studi
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-16">No</th>
                                    <th className="px-5 py-3.5">Program Studi</th>
                                    <th className="px-5 py-3.5 text-center">Jenjang</th>
                                    <th className="px-5 py-3.5">Fakultas / UPPS</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((prodi, index) => (
                                    <tr key={prodi.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-400">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                                                {prodi.name_prodi}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5 ml-6">
                                                ID: {prodi.id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {prodi.degree}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                                                {prodi.faculty?.name_faculty || '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(prodi)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prodi.id, prodi.name_prodi)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Dialog Form */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Fakultas / Unit Pengelola <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formState.faculty_id}
                                    onChange={(e) => setFormState({ ...formState, faculty_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    required
                                >
                                    {facultyList.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name_faculty}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Jenjang Pendidikan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formState.degree}
                                    onChange={(e) => setFormState({ ...formState, degree: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    required
                                >
                                    {degreeOptions.map((deg) => (
                                        <option key={deg} value={deg}>{deg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama Program Studi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.name_prodi}
                                    onChange={(e) => setFormState({ ...formState, name_prodi: e.target.value })}
                                    placeholder="Contoh: Teknik Informatika"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                                >
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Prodi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
