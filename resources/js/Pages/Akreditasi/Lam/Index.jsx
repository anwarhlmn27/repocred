import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PpeppFolderExplorer from '@/Components/PpeppFolderExplorer';
import {
    Award,
    Filter,
    FolderCheck,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    FileText,
    Calendar,
    Plus,
    Folder,
    FolderOpen,
    UploadCloud,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Eye,
    X,
    Layers,
} from 'lucide-react';

const PPEPP_STAGES = [
    { key: 'penetapan', label: '1. Penetapan (P)', desc: 'Standar, SK Kurikulum OBE, VMTS Keilmuan Prodi' },
    { key: 'pelaksanaan', label: '2. Pelaksanaan (P)', desc: 'Perkuliahan, RPS OBE, Riset & PkM, Realisasi Kerjasama' },
    { key: 'evaluasi', label: '3. Evaluasi (E)', desc: 'Asesmen CPL Mahasiswa, Monev Internal, Survei Kepuasan' },
    { key: 'pengendalian', label: '4. Pengendalian (P)', desc: 'Kaji Ulang Kurikulum, Rapat Tinjauan Manajemen (RTM)' },
    { key: 'peningkatan', label: '5. Peningkatan (P)', desc: 'Akreditasi Internasional, Pemutakhiran Lab & Standar Baru' },
];

const initialLamCriterias = [
    {
        id: 'crit-l-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS) Keilmuan Program Studi',
        activities: [
            {
                id: 'act-l-1',
                title_activity: 'Penyusunan & Sosialisasi VMTS Prodi Berbasis Kecerdasan Buatan',
                description: 'Surat Keputusan Dekan mengenai rumusan visi keilmuan dan sosialisasi kepada mahasiswa baru.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-1', name: 'SK_Dekan_Rumusan_VMTS_Keilmuan_AI.pdf', size: '1.6 MB', date: '15 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-2', name: 'Laporan_Sosialisasi_Maba_Dan_Industri.pdf', size: '2.4 MB', date: '01 Feb 2025' },
                    ],
                    evaluasi: [
                        { id: 'fl-3', name: 'Hasil_Survei_Pemahaman_VMTS_Prodi_94Persen.pdf', size: '920 KB', date: '25 Feb 2025' },
                    ],
                    pengendalian: [], // Belum ada -> Merah
                    peningkatan: [],   // Belum ada -> Merah
                },
            },
        ],
    },
    {
        id: 'crit-l-6',
        code_criteria: 6,
        title_criteria: 'Pendidikan & Kurikulum Outcome-Based Education (OBE) Berstandar IEEE/ACM',
        activities: [
            {
                id: 'act-l-2',
                title_activity: 'Review Kurikulum OBE & Pemetaan Capaian Pembelajaran Lulusan (CPL)',
                description: 'RPS mata kuliah terintegrasi Capstone Project dan keterlibatan praktisi industri.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-4', name: 'Dokumen_Kurikulum_OBE_Standar_ACM.pdf', size: '5.8 MB', date: '10 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-5', name: 'Kompilasi_RPS_144_SKS.pdf', size: '12.4 MB', date: '01 Feb 2025' },
                    ],
                    evaluasi: [
                        { id: 'fl-6', name: 'Hasil_Pengukuran_Ketercapaian_CPL_Semester.pdf', size: '3.1 MB', date: '15 Mar 2025' },
                    ],
                    pengendalian: [
                        { id: 'fl-7', name: 'Berita_Acara_RTM_Remedial_CPL_Rendah.pdf', size: '820 KB', date: '20 Mar 2025' },
                    ],
                    peningkatan: [
                        { id: 'fl-8', name: 'Program_Upgrade_Modul_Microcredentials.pdf', size: '1.5 MB', date: '02 Apr 2025' },
                    ],
                },
            },
        ],
    },
    {
        id: 'crit-l-7',
        code_criteria: 7,
        title_criteria: 'Penelitian Dosen Bersama Mahasiswa bereputasi Scopus/SINTA',
        activities: [
            {
                id: 'act-l-3',
                title_activity: 'Hibah Penelitian Terapan Kemendikbudristek & Publikasi Jurnal Q2',
                description: 'Kontrak penelitian, logbook, dan naskah artikel terbit pada IEEE Access.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-9', name: 'Roadmap_Penelitian_Prodi_2024_2029.pdf', size: '2.2 MB', date: '05 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-10', name: 'Draft_Naskah_Publikasi_IEEE_Access.pdf', size: '4.6 MB', date: '22 Feb 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
];

const defaultProdis = [
    { id: 'p-1', name_prodi: 'Teknik Informatika', degree: 'S1' },
    { id: 'p-2', name_prodi: 'Sistem Informasi', degree: 'S1' },
    { id: 'p-3', name_prodi: 'Teknologi Informasi', degree: 'D3' },
];

export default function LamIndex() {
    const [criterias, setCriterias] = useState(initialLamCriterias);
    const [selectedProdi, setSelectedProdi] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [expandedCrit, setExpandedCrit] = useState(initialLamCriterias[0].id);

    const [expandedActivities, setExpandedActivities] = useState({
        'act-l-1': true,
        'act-l-2': true,
    });
    const [expandedFolders, setExpandedFolders] = useState({
        'act-l-1-penetapan': true,
        'act-l-1-pelaksanaan': true,
        'act-l-1-evaluasi': true,
        'act-l-1-pengendalian': true,
        'act-l-1-peningkatan': true,
    });

    const [uploadModal, setUploadModal] = useState({
        isOpen: false,
        critId: null,
        activityId: null,
        stageKey: null,
        stageLabel: null,
        activityTitle: '',
    });
    const [fileNameInput, setFileNameInput] = useState('');

    const [newActivityModal, setNewActivityModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
    });
    const [newActivityTitle, setNewActivityTitle] = useState('');

    const toggleCrit = (id) => {
        setExpandedCrit(expandedCrit === id ? null : id);
    };

    const toggleActivity = (actId) => {
        setExpandedActivities((prev) => ({
            ...prev,
            [actId]: !prev[actId],
        }));
    };

    const toggleFolder = (folderKey) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folderKey]: !prev[folderKey],
        }));
    };

    const handleOpenUpload = (critId, activityId, stageKey, stageLabel, activityTitle) => {
        setUploadModal({
            isOpen: true,
            critId,
            activityId,
            stageKey,
            stageLabel,
            activityTitle,
        });
        setFileNameInput('');
    };

    const handleConfirmUpload = (e) => {
        e.preventDefault();
        if (!fileNameInput.trim()) return;

        const newDoc = {
            id: `fl-${Date.now()}`,
            name: fileNameInput.endsWith('.pdf') || fileNameInput.endsWith('.docx') ? fileNameInput : `${fileNameInput}.pdf`,
            size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== uploadModal.critId) return crit;
                return {
                    ...crit,
                    activities: crit.activities.map((act) => {
                        if (act.id !== uploadModal.activityId) return act;
                        const existingStageDocs = act.ppepp_docs[uploadModal.stageKey] || [];
                        return {
                            ...act,
                            ppepp_docs: {
                                ...act.ppepp_docs,
                                [uploadModal.stageKey]: [...existingStageDocs, newDoc],
                            },
                        };
                    }),
                };
            })
        );

        setExpandedFolders((prev) => ({
            ...prev,
            [`${uploadModal.activityId}-${uploadModal.stageKey}`]: true,
        }));

        setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' });
    };

    const handleDeleteFile = (critId, activityId, stageKey, fileId, fileName) => {
        if (!confirm(`Hapus file "${fileName}" dari tahap PPEPP?`)) return;

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== critId) return crit;
                return {
                    ...crit,
                    activities: crit.activities.map((act) => {
                        if (act.id !== activityId) return act;
                        return {
                            ...act,
                            ppepp_docs: {
                                ...act.ppepp_docs,
                                [stageKey]: act.ppepp_docs[stageKey].filter((f) => f.id !== fileId),
                            },
                        };
                    }),
                };
            })
        );
    };

    const handleAddActivity = (e) => {
        e.preventDefault();
        if (!newActivityTitle.trim()) return;

        const newAct = {
            id: `act-l-${Date.now()}`,
            title_activity: newActivityTitle,
            description: 'Kegiatan pemenuhan butir standar akreditasi LAM.',
            academic_year: 2025,
            status: 'published',
            ppepp_docs: {
                penetapan: [],
                pelaksanaan: [],
                evaluasi: [],
                pengendalian: [],
                peningkatan: [],
            },
        };

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== newActivityModal.critId) return crit;
                return {
                    ...crit,
                    activities: [newAct, ...crit.activities],
                };
            })
        );

        setExpandedActivities((prev) => ({
            ...prev,
            [newAct.id]: true,
        }));

        setNewActivityModal({ isOpen: false, critId: null, critCode: null });
        setNewActivityTitle('');
    };

    const currentYear = new Date().getFullYear();
    const yearsList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    return (
        <AuthenticatedLayout>
            <Head title="Dokumen Akreditasi LAM (9 Kriteria)" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <Layers className="w-4 h-4" />
                            <span>Dokumen Akreditasi LAM</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Instrumen Akreditasi LAM (9 Kriteria)</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pohon folder evidensi 5 siklus penjaminan mutu PPEPP terintegrasi kurikulum Outcome-Based Education (OBE).
                        </p>
                    </div>

                    {/* Petunjuk Indikator Warna */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-700">Indikator Folder:</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                            <span>Lengkap</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Ada File (Merah)</span>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
                            <Filter className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Filter Borang LAM:</span>
                        </div>

                        <select
                            value={selectedProdi}
                            onChange={(e) => setSelectedProdi(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        >
                            <option value="">Semua Program Studi</option>
                            {defaultProdis.map((p) => (
                                <option key={p.id} value={p.name_prodi}>
                                    {p.name_prodi} ({p.degree})
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="">Semua Tahun Akademik</option>
                            {yearsList.map((yr) => (
                                <option key={yr} value={yr}>
                                    Tahun {yr}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="text-xs text-slate-500">
                        Total: <strong className="text-slate-800">{criterias.length}</strong> Kriteria Standar LAM
                    </span>
                </div>

                {/* Kriteria Accordion List */}
                <div className="space-y-3">
                    {criterias.map((crit) => {
                        const isExpanded = expandedCrit === crit.id;
                        const activitiesCount = crit.activities?.length || 0;

                        return (
                            <div
                                key={crit.id}
                                className={`rounded-xl bg-white border transition-all duration-200 overflow-hidden shadow-xs ${
                                    isExpanded ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                {/* Accordion Header Kriteria (Ramping & Proporsional) */}
                                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between bg-white border-b border-slate-100/80">
                                    <button
                                        type="button"
                                        onClick={() => toggleCrit(crit.id)}
                                        className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2"
                                    >
                                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
                                            C{crit.code_criteria}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    Kriteria {crit.code_criteria}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• LAM Standar Mutu OBE</span>
                                                <span className="text-[11px] text-slate-400 font-medium">• {activitiesCount} Kegiatan</span>
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate mt-0.5" title={crit.title_criteria}>
                                                {crit.title_criteria}
                                            </h3>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setNewActivityModal({ isOpen: true, critId: crit.id, critCode: crit.code_criteria })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Tambah Kegiatan</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleCrit(crit.id)}
                                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Accordion Content: Struktur Folder Windows File Explorer */}
                                {isExpanded && (
                                    <div className="p-2.5 sm:p-4 bg-slate-50/50">
                                        <PpeppFolderExplorer
                                            critId={crit.id}
                                            critCode={crit.code_criteria}
                                            critTitle={crit.title_criteria}
                                            activities={crit.activities}
                                            ppeppStages={PPEPP_STAGES}
                                            theme="emerald"
                                            onOpenUpload={handleOpenUpload}
                                            onDeleteFile={handleDeleteFile}
                                            onAddActivity={() => setNewActivityModal({ isOpen: true, critId: crit.id, critCode: crit.code_criteria })}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Upload File ke Tahap PPEPP */}
            {uploadModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Upload File Eviden PPEPP
                                </h3>
                                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    {uploadModal.stageLabel}
                                </p>
                            </div>
                            <button
                                onClick={() => setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' })}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmUpload} className="mt-4 space-y-4">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <span className="text-slate-400 block font-medium">Kegiatan Terkait:</span>
                                <span className="font-bold text-slate-800">{uploadModal.activityTitle}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama / Judul File Dokumen <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fileNameInput}
                                    onChange={(e) => setFileNameInput(e.target.value)}
                                    placeholder="Contoh: Dokumen_RPS_OBE_Standar_ACM.pdf"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Bisa berupa format PDF, Word (.docx), Excel (.xlsx), atau scan dokumen.
                                </p>
                            </div>

                            <div className="p-5 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl bg-emerald-50/30 text-center cursor-pointer transition-colors">
                                <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-emerald-800">Pilih berkas dari komputer atau drag & drop</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Ukuran maksimal file 25 MB</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                                >
                                    Upload & Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Kegiatan Baru */}
            {newActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Kegiatan / Folder Utama
                                </h3>
                                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    Kriteria {newActivityModal.critCode}
                                </p>
                            </div>
                            <button
                                onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null })}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddActivity} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama Kegiatan Baru <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newActivityTitle}
                                    onChange={(e) => setNewActivityTitle(e.target.value)}
                                    placeholder="Contoh: Lokakarya Evaluasi Kurikulum dan Capaian Pembelajaran"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Setelah dibuat, kegiatan akan otomatis memiliki 5 subfolder PPEPP siap diisi.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                                >
                                    Simpan Kegiatan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
