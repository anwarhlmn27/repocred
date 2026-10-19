import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const defaultAgencies = [
    { id: 'ag-1', name_agency: 'LAM-INFOKOM' },
    { id: 'ag-2', name_agency: 'BAN-PT' },
];

const defaultCriterias = [
    { id: 'c-1', agency_id: 'ag-1', code_criteria: 1, title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS)', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-2', agency_id: 'ag-1', code_criteria: 2, title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-3', agency_id: 'ag-1', code_criteria: 3, title_criteria: 'Mahasiswa dan Layanan Kemahasiswaan', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-4', agency_id: 'ag-1', code_criteria: 4, title_criteria: 'Sumber Daya Manusia (Dosen & Tenaga Kependidikan)', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-5', agency_id: 'ag-1', code_criteria: 5, title_criteria: 'Keuangan, Sarana dan Prasarana Pembelajaran', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-6', agency_id: 'ag-1', code_criteria: 6, title_criteria: 'Pendidikan & Pengembangan Kurikulum OBE', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-7', agency_id: 'ag-1', code_criteria: 7, title_criteria: 'Penelitian Dosen & Mahasiswa', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-8', agency_id: 'ag-1', code_criteria: 8, title_criteria: 'Pengabdian kepada Masyarakat (PkM)', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-9', agency_id: 'ag-1', code_criteria: 9, title_criteria: 'Luaran dan Capaian Tridharma Perguruan Tinggi', type: 'prodi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-10', agency_id: 'ag-2', code_criteria: 1, title_criteria: 'Visi, Misi, Tujuan, dan Strategi Institusi', type: 'institusi', agency: { name_agency: 'BAN-PT' } },
    { id: 'c-11', agency_id: 'ag-2', code_criteria: 2, title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama', type: 'institusi', agency: { name_agency: 'BAN-PT' } },
];

export default function CriteriaIndex({ criterias = [], agencies = [] }) {
    const [items, setItems] = useState(criterias.length > 0 ? criterias : defaultCriterias);
    const [agencyList] = useState(agencies.length > 0 ? agencies : defaultAgencies);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('ALL');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formState, setFormState] = useState({
        agency_id: agencyList[0]?.id || '',
        code_criteria: 1,
        title_criteria: '',
        type: 'prodi',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({ agency_id: agencyList[0]?.id || '', code_criteria: 1, title_criteria: '', type: 'prodi' });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            agency_id: item.agency_id,
            code_criteria: item.code_criteria,
            title_criteria: item.title_criteria,
            type: item.type,
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const selectedAg = agencyList.find((a) => a.id === formState.agency_id);
        if (editingItem) {
            setItems(
                items.map((it) =>
                    it.id === editingItem.id
                        ? { ...it, ...formState, agency: selectedAg }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `c-${Date.now()}`,
                ...formState,
                agency: selectedAg,
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = (id, title) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kriteria "${title}"? (Mode Preview UI)`)) {
            setItems(items.filter((it) => it.id !== id));
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.title_criteria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.code_criteria).includes(searchTerm) ||
            (item.agency?.name_agency && item.agency.name_agency.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesAgency = selectedAgency === 'ALL' || item.agency_id === selectedAgency;
        return matchesSearch && matchesAgency;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Kriteria Akreditasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <Award className="w-4 h-4" />
                            <span>Master Data</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Kriteria Akreditasi (Standar Mutu)</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Konfigurasi standar butir kriteria akreditasi untuk lembaga BAN-PT (4 Kriteria) dan LAM (9 Kriteria).
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kriteria</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor atau judul kriteria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                        </div>

                        <select
                            value={selectedAgency}
                            onChange={(e) => setSelectedAgency(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ALL">Semua Lembaga Akreditasi</option>
                            {agencyList.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name_agency}</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> butir kriteria
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-20">Kode</th>
                                    <th className="px-5 py-3.5">Judul Kriteria Standar</th>
                                    <th className="px-5 py-3.5">Lembaga Akreditasi</th>
                                    <th className="px-5 py-3.5 text-center">Tipe Cakupan</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((crit) => (
                                    <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 font-black text-indigo-700 text-sm">
                                                C{crit.code_criteria}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800">{crit.title_criteria}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                                                ID: {crit.id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                                                {crit.agency?.name_agency || '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                crit.type === 'institusi' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {crit.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(crit)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(crit.id, crit.title_criteria)}
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
                                {editingItem ? 'Edit Kriteria' : 'Tambah Kriteria Standar'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Lembaga Akreditasi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formState.agency_id}
                                    onChange={(e) => setFormState({ ...formState, agency_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    required
                                >
                                    {agencyList.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name_agency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Nomor Kriteria <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formState.code_criteria}
                                        onChange={(e) => setFormState({ ...formState, code_criteria: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Tipe Cakupan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formState.type}
                                        onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                        required
                                    >
                                        <option value="prodi">Prodi</option>
                                        <option value="institusi">Institusi</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Judul / Nama Kriteria <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={formState.title_criteria}
                                    onChange={(e) => setFormState({ ...formState, title_criteria: e.target.value })}
                                    placeholder="Contoh: Visi, Misi, Tujuan, dan Strategi"
                                    rows="2"
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
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Kriteria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
