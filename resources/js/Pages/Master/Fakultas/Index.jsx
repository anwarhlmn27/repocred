import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Landmark, Plus, Edit2, Trash2, Search, X, Building2, GraduationCap } from 'lucide-react';
import { confirmAlert, toastSuccess } from '@/Utils/alert';

const defaultUnivs = [
    { id: 'u-1', name_univ: 'Universitas Teknologi Digital Indonesia' },
    { id: 'u-2', name_univ: 'Institut Sains & Teknologi Terpadu' },
];

const defaultFaculties = [
    {
        id: 'f-1',
        univ_id: 'u-1',
        name_faculty: 'Fakultas Ilmu Komputer & Informatika',
        univ: { name_univ: 'Universitas Teknologi Digital Indonesia' },
        prodis_count: 3,
    },
    {
        id: 'f-2',
        univ_id: 'u-1',
        name_faculty: 'Fakultas Ekonomi dan Bisnis Digital',
        univ: { name_univ: 'Universitas Teknologi Digital Indonesia' },
        prodis_count: 2,
    },
    {
        id: 'f-3',
        univ_id: 'u-1',
        name_faculty: 'Fakultas Teknik & Rekayasa Sistem',
        univ: { name_univ: 'Universitas Teknologi Digital Indonesia' },
        prodis_count: 4,
    },
    {
        id: 'f-4',
        univ_id: 'u-2',
        name_faculty: 'Fakultas Sains Terapan & Analitika Data',
        univ: { name_univ: 'Institut Sains & Teknologi Terpadu' },
        prodis_count: 2,
    },
];

export default function FakultasIndex({ faculties = [], univs = [] }) {
    const [items, setItems] = useState(faculties.length > 0 ? faculties : defaultFaculties);
    const [univList] = useState(univs.length > 0 ? univs : defaultUnivs);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formState, setFormState] = useState({
        univ_id: univList[0]?.id || '',
        name_faculty: '',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({ univ_id: univList[0]?.id || '', name_faculty: '' });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            univ_id: item.univ_id,
            name_faculty: item.name_faculty,
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const selectedUniv = univList.find((u) => u.id === formState.univ_id);
        if (editingItem) {
            setItems(
                items.map((it) =>
                    it.id === editingItem.id
                        ? { ...it, ...formState, univ: selectedUniv }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `f-${Date.now()}`,
                ...formState,
                univ: selectedUniv,
                prodis_count: 0,
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = async (id, name) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Fakultas?',
            text: `Apakah Anda yakin ingin menghapus "${name}"?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });
        if (confirmed) {
            setItems(items.filter((it) => it.id !== id));
            toastSuccess(`Fakultas "${name}" berhasil dihapus.`);
        }
    };

    const filteredItems = items.filter(
        (item) =>
            item.name_faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.univ?.name_univ && item.univ.name_univ.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title="Master Fakultas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
                            <Landmark className="w-4 h-4" />
                            <span>Master Data</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Fakultas / UPPS</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola unit pengelola program studi (UPPS) di lingkungan perguruan tinggi.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Fakultas</span>
                    </button>
                </div>

                {/* Toolbar Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari fakultas atau universitas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> data fakultas
                    </span>
                </div>

                {/* Table Data */}
                <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs uppercase text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 w-16 border-r border-slate-200">No</th>
                                    <th className="px-5 py-3 border-r border-slate-200">Nama Fakultas</th>
                                    <th className="px-5 py-3 border-r border-slate-200">Perguruan Tinggi Induk</th>
                                    <th className="px-5 py-3 text-center border-r border-slate-200">Jumlah Prodi</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((fac, index) => (
                                    <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-400 border-r border-slate-100">{index + 1}</td>
                                        <td className="px-5 py-4 border-r border-slate-100">
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                <Landmark className="w-4 h-4 text-indigo-600 shrink-0" />
                                                {fac.name_faculty}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5 ml-6">
                                                ID: {fac.id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 border-r border-slate-100">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 border border-slate-200">
                                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                                {fac.univ?.name_univ || 'Tidak terhubung'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center border-r border-slate-100">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                {fac.prodis_count ?? 0} Prodi
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(fac)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fac.id, fac.name_faculty)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Edit Fakultas' : 'Tambah Fakultas Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Pilih Perguruan Tinggi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formState.univ_id}
                                    onChange={(e) => setFormState({ ...formState, univ_id: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
                                    required
                                >
                                    {univList.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name_univ}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama Fakultas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.name_faculty}
                                    onChange={(e) => setFormState({ ...formState, name_faculty: e.target.value })}
                                    placeholder="Contoh: Fakultas Ilmu Komputer"
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                                >
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Fakultas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
