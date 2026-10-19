import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileSpreadsheet,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Calendar,
    GraduationCap,
    Award,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Paperclip,
} from 'lucide-react';

const defaultActivities = [
    {
        id: 'act-1',
        title_activity: 'Penyusunan Kurikulum Outcome-Based Education (OBE) Berbasis Standar ACM/IEEE',
        description: 'Workshop pemutakhiran kurikulum dan penyesuaian profil lulusan bersama Asosiasi Pendidikan Tinggi Informatika.',
        academic_year: 2025,
        status: 'published',
        prodi: { name_prodi: 'Teknik Informatika', degree: 'S1' },
        criteria: { code_criteria: 6, title_criteria: 'Pendidikan', agency: { name_agency: 'LAM-INFOKOM' } },
        creator: { name: 'Dr. Hendra Wijaya' },
        documents: [
            { id: 'doc-1', filename: 'SK_Tim_Pengembang_Kurikulum_2025.pdf', file_size: 1540000, ppepp: { code_ppepp: 1, title_ppepp: 'Penetapan (P)' } },
            { id: 'doc-2', filename: 'Dokumen_RPS_OBE_Semua_Mata_Kuliah.pdf', file_size: 4820000, ppepp: { code_ppepp: 2, title_ppepp: 'Pelaksanaan (P)' } },
        ],
    },
    {
        id: 'act-2',
        title_activity: 'Survei Evaluasi Kepuasan Pengguna Lulusan & Stakeholder Industri Mitra',
        description: 'Evaluasi tracer study terhadap kompetensi teknis dan soft skills lulusan di dunia kerja.',
        academic_year: 2024,
        status: 'published',
        prodi: { name_prodi: 'Sistem Informasi', degree: 'S1' },
        criteria: { code_criteria: 9, title_criteria: 'Luaran dan Capaian Tridharma', agency: { name_agency: 'LAM-INFOKOM' } },
        creator: { name: 'Siti Aminah, M.T' },
        documents: [
            { id: 'doc-3', filename: 'Hasil_Tracer_Study_Batch_2024.pdf', file_size: 2100000, ppepp: { code_ppepp: 3, title_ppepp: 'Evaluasi (E)' } },
        ],
    },
    {
        id: 'act-3',
        title_activity: 'Pelatihan Sertifikasi Internasional Cloud Computing AWS untuk Dosen & Mahasiswa',
        description: 'Peningkatan kompetensi SDM program studi dalam arsitektur cloud dan DevOps modern.',
        academic_year: 2025,
        status: 'draft',
        prodi: { name_prodi: 'Teknik Informatika', degree: 'S1' },
        criteria: { code_criteria: 4, title_criteria: 'Sumber Daya Manusia', agency: { name_agency: 'LAM-INFOKOM' } },
        creator: { name: 'Rahmat Pratama' },
        documents: [],
    },
    {
        id: 'act-4',
        title_activity: 'Audit Keselamatan & Kelayakan Sarana Prasarana Laboratorium Jaringan',
        description: 'Pemeriksaan berkala fasilitas perangkat keras router, switch, dan sistem backup server kampus.',
        academic_year: 2024,
        status: 'rejected',
        prodi: { name_prodi: 'Teknologi Informasi', degree: 'D3' },
        criteria: { code_criteria: 5, title_criteria: 'Keuangan, Sarana dan Prasarana', agency: { name_agency: 'LAM-INFOKOM' } },
        creator: { name: 'Rahmat Pratama' },
        documents: [],
    },
];

const defaultProdis = [
    { id: 'p-1', name_prodi: 'Teknik Informatika', degree: 'S1' },
    { id: 'p-2', name_prodi: 'Sistem Informasi', degree: 'S1' },
    { id: 'p-3', name_prodi: 'Teknologi Informasi', degree: 'D3' },
];

const defaultCriterias = [
    { id: 'c-1', code_criteria: 1, title_criteria: 'Visi, Misi, Tujuan, dan Strategi', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-4', code_criteria: 4, title_criteria: 'Sumber Daya Manusia', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-5', code_criteria: 5, title_criteria: 'Keuangan, Sarana dan Prasarana', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-6', code_criteria: 6, title_criteria: 'Pendidikan', agency: { name_agency: 'LAM-INFOKOM' } },
    { id: 'c-9', code_criteria: 9, title_criteria: 'Luaran dan Capaian Tridharma', agency: { name_agency: 'LAM-INFOKOM' } },
];

export default function KegiatanIndex({ activities = { data: [] } }) {
    const initialItems = activities.data && activities.data.length > 0 ? activities.data : defaultActivities;
    const [items, setItems] = useState(initialItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProdi, setSelectedProdi] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedDocModal, setSelectedDocModal] = useState(null);

    const currentYear = new Date().getFullYear();

    const [formState, setFormState] = useState({
        title_activity: '',
        prodi_id: defaultProdis[0].id,
        criteria_id: defaultCriterias[0].id,
        academic_year: currentYear,
        status: 'published',
        description: '',
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormState({
            title_activity: '',
            prodi_id: defaultProdis[0].id,
            criteria_id: defaultCriterias[0].id,
            academic_year: currentYear,
            status: 'published',
            description: '',
        });
        setIsOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormState({
            title_activity: item.title_activity,
            prodi_id: item.prodi_id || defaultProdis[0].id,
            criteria_id: item.criteria_id || defaultCriterias[0].id,
            academic_year: item.academic_year,
            status: item.status,
            description: item.description || '',
        });
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
        setEditingItem(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const selectedP = defaultProdis.find((p) => p.id === formState.prodi_id) || defaultProdis[0];
        const selectedC = defaultCriterias.find((c) => c.id === formState.criteria_id) || defaultCriterias[0];

        if (editingItem) {
            setItems(
                items.map((it) =>
                    it.id === editingItem.id
                        ? { ...it, ...formState, prodi: selectedP, criteria: selectedC }
                        : it
                )
            );
        } else {
            const newItem = {
                id: `act-${Date.now()}`,
                ...formState,
                prodi: selectedP,
                criteria: selectedC,
                creator: { name: 'Administrator' },
                documents: [],
            };
            setItems([newItem, ...items]);
        }
        closeModal();
    };

    const handleDelete = (id, title) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kegiatan "${title}"? (Mode Preview UI)`)) {
            setItems(items.filter((it) => it.id !== id));
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.title_activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesProdi = !selectedProdi || item.prodi?.name_prodi === selectedProdi;
        const matchesStatus = !selectedStatus || item.status === selectedStatus;
        return matchesSearch && matchesProdi && matchesStatus;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Kegiatan & Eviden Akreditasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Pusat Data Tridharma & Eviden</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Kegiatan & Dokumen Eviden</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kompilasi agenda kegiatan akademik, penelitian, pengabdian, dan bukti dukung mutu program studi.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kegiatan Baru</span>
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama kegiatan atau uraian..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                        </div>

                        <select
                            value={selectedProdi}
                            onChange={(e) => setSelectedProdi(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Semua Program Studi</option>
                            {defaultProdis.map((p) => (
                                <option key={p.id} value={p.name_prodi}>{p.name_prodi}</option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-16">No</th>
                                    <th className="px-5 py-3.5">Judul Kegiatan & Uraian</th>
                                    <th className="px-5 py-3.5">Program Studi</th>
                                    <th className="px-5 py-3.5">Kriteria Standar</th>
                                    <th className="px-5 py-3.5 text-center">Tahun</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-center">Dokumen</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((act, index) => (
                                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-400">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800">{act.title_activity}</div>
                                            {act.description && (
                                                <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-2">
                                                    {act.description}
                                                </p>
                                            )}
                                            <div className="text-[11px] text-slate-400 mt-1">
                                                Oleh: {act.creator?.name || 'Administrator'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                                                {act.prodi?.name_prodi || '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 inline-flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5" />
                                                <span>K-{act.criteria?.code_criteria}</span>
                                                <span className="text-[10px] text-indigo-500 font-normal">
                                                    ({act.criteria?.agency?.name_agency})
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">
                                                {act.criteria?.title_criteria}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center font-mono text-xs font-semibold text-slate-700">
                                            {act.academic_year}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                act.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                                                act.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {act.status === 'published' && <CheckCircle2 className="w-3 h-3" />}
                                                {act.status === 'draft' && <Clock className="w-3 h-3" />}
                                                {act.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                                                {act.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedDocModal(act)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                title="Lihat Dokumen PPEPP"
                                            >
                                                <Paperclip className="w-3 h-3" />
                                                <span>{act.documents?.length || 0} File</span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(act)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(act.id, act.title_activity)}
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

            {/* Modal Dialog Form Tambah/Edit */}
            {isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Edit Kegiatan & Eviden' : 'Tambah Kegiatan Eviden Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Judul Kegiatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.title_activity}
                                    onChange={(e) => setFormState({ ...formState, title_activity: e.target.value })}
                                    placeholder="Contoh: Workshop Peninjauan Kurikulum OBE Berbasis Industri"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Program Studi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formState.prodi_id}
                                        onChange={(e) => setFormState({ ...formState, prodi_id: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                        required
                                    >
                                        {defaultProdis.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name_prodi} ({p.degree})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Kriteria Standar <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formState.criteria_id}
                                        onChange={(e) => setFormState({ ...formState, criteria_id: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                        required
                                    >
                                        {defaultCriterias.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                C{c.code_criteria}: {c.title_criteria}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Tahun Akademik <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.academic_year}
                                        onChange={(e) => setFormState({ ...formState, academic_year: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Status Eviden <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                                        required
                                    >
                                        <option value="published">Published (Siap Audit)</option>
                                        <option value="draft">Draft (Dalam Proses)</option>
                                        <option value="rejected">Rejected (Perlu Revisi)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Deskripsi & Catatan Kegiatan
                                </label>
                                <textarea
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    placeholder="Rincian pelaksanaan kegiatan, bukti fisik, link folder cloud drive..."
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
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Dokumen Bukti PPEPP */}
            {selectedDocModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Dokumen Eviden Mutu PPEPP
                                </h3>
                                <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
                                    {selectedDocModal.title_activity}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDocModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {(!selectedDocModal.documents || selectedDocModal.documents.length === 0) ? (
                                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Belum ada file dokumen pendukung yang diunggah.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedDocModal.documents.map((doc) => (
                                        <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs uppercase">
                                                    P{doc.ppepp?.code_ppepp || 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{doc.filename}</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        Tahap: {doc.ppepp?.title_ppepp || 'Standar'} • {(doc.file_size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="p-1.5 text-indigo-600 font-semibold text-xs cursor-pointer hover:underline">
                                                Lihat File
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedDocModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
