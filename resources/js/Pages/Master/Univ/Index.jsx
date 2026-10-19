import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, X, MapPin } from 'lucide-react';

const defaultUnivs = [
    {
        id: 'u-1',
        name_univ: 'Universitas Teknologi Digital Indonesia',
        address: 'Jl. Ringroad Utara, Jombor, Sleman, D.I. Yogyakarta',
        faculties_count: 3,
    },
    {
        id: 'u-2',
        name_univ: 'Institut Sains & Teknologi Terpadu',
        address: 'Jl. Merdeka Barat No. 45, Jakarta Pusat',
        faculties_count: 2,
    },
    {
        id: 'u-3',
        name_univ: 'Universitas Nusantara Cendekia',
        address: 'Jl. Soekarno-Hatta No. 88, Bandung, Jawa Barat',
        faculties_count: 4,
    },
];

export default function UnivIndex({ univs = [] }) {
    // Gunakan defaultUnivs jika props kosong agar UI langsung muncul
    const [items, setItems] = useState(univs.length > 0 ? univs : defaultUnivs);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formState, setFormState] = useState({
        name_univ: '',
        address: '',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({ name_univ: '', address: '' });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            name_univ: item.name_univ,
            address: item.address || '',
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingItem) {
            setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formState } : it)));
        } else {
            const newItem = {
                id: `u-${Date.now()}`,
                ...formState,
                faculties_count: 0,
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${name}"? (Mode Preview UI)`)) {
            setItems(items.filter((it) => it.id !== id));
        }
    };

    const filteredItems = items.filter(
        (item) =>
            item.name_univ.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title="Master Universitas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <Building2 className="w-4 h-4" />
                            <span>Master Data</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Data Perguruan Tinggi / Universitas</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola data institusi induk perguruan tinggi untuk sistem penjaminan mutu dan akreditasi.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Universitas</span>
                    </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari universitas atau alamat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> data universitas
                    </span>
                </div>

                {/* Table Data */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-16">No</th>
                                    <th className="px-5 py-3.5">Nama Perguruan Tinggi</th>
                                    <th className="px-5 py-3.5">Alamat Kampus</th>
                                    <th className="px-5 py-3.5 text-center">Jumlah Fakultas</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((univ, index) => (
                                    <tr key={univ.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-400">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                                {univ.name_univ}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5 ml-6">
                                                ID: {univ.id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            <span className="flex items-center gap-1.5 text-xs">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                {univ.address || '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                                {univ.faculties_count ?? 0} Fakultas
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(univ)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(univ.id, univ.name_univ)}
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

            {/* Modal Dialog Form (Interactive Preview) */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Edit Universitas' : 'Tambah Universitas Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama Perguruan Tinggi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.name_univ}
                                    onChange={(e) => setFormState({ ...formState, name_univ: e.target.value })}
                                    placeholder="Contoh: Universitas Teknologi Digital Indonesia"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Alamat Kampus
                                </label>
                                <textarea
                                    value={formState.address}
                                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                                    placeholder="Alamat lengkap kampus..."
                                    rows="3"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Universitas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
