import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Award,
    Filter,
    FolderCheck,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    FileText,
    FileSpreadsheet,
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
    GraduationCap,
    RotateCcw,
    Sparkles,
    Check,
    ArrowRight,
    Calendar,
    Clock,
    SlidersHorizontal,
    FolderPlus,
    EyeOff
} from 'lucide-react';

const PPEPP_STAGES = [
    { key: 'penetapan', label: '1. Penetapan (P)', desc: 'Standar Mutu, SK Kurikulum OBE, VMTS Keilmuan Prodi' },
    { key: 'pelaksanaan', label: '2. Pelaksanaan (P)', desc: 'Perkuliahan, RPS OBE, Riset Dosen, Realisasi Kerjasama' },
    { key: 'evaluasi', label: '3. Evaluasi (E)', desc: 'Asesmen CPL Mahasiswa, Monev Internal, Survei Kepuasan' },
    { key: 'pengendalian', label: '4. Pengendalian (P)', desc: 'Kaji Ulang Kurikulum, Rapat Tinjauan Manajemen (RTM)' },
    { key: 'peningkatan', label: '5. Peningkatan (P)', desc: 'Akreditasi Internasional, Pemutakhiran Lab & Standar Baru' },
];

const defaultProdis = [
    {
        id: 'p-ti',
        code: '55201',
        name_prodi: 'Teknik Informatika',
        degree: 'S1',
        faculty: 'Fakultas Ilmu Komputer',
        acronym: 'TI',
        agency_code: 'LAM-INFOKOM',
        default_ts_count: 3,
        description: 'Fokus keilmuan Rekayasa Perangkat Lunak, Kecerdasan Buatan, dan Komputasi Cerdas.',
    },
    {
        id: 'p-si',
        code: '57201',
        name_prodi: 'Sistem Informasi',
        degree: 'S1',
        faculty: 'Fakultas Ilmu Komputer',
        acronym: 'SI',
        agency_code: 'LAM-INFOKOM',
        default_ts_count: 3,
        description: 'Fokus keilmuan Tata Kelola TI, Enterprise Architecture, dan Analisis Bisnis Digital.',
    },
    {
        id: 'p-mnj',
        code: '61201',
        name_prodi: 'Manajemen',
        degree: 'S1',
        faculty: 'Fakultas Ekonomi dan Bisnis',
        acronym: 'MNJ',
        agency_code: 'LAMEMBA',
        default_ts_count: 3, // LAMEMBA umumnya 3 tahun (TS s/d TS-2)
        description: 'Fokus keilmuan Manajemen Bisnis, Kewirausahaan, dan Pemasaran Digital.',
    },
];

// Helper kalkulasi daftar tahun TS berdasarkan tahun acuan TS dan jumlah TS
const generateTsOptions = (tsYear, count = 3) => {
    const list = [
        { key: 'all', label: 'Semua TS (Kebijakan/Siklus 5 Tahun)', short: 'Semua TS', year: null, desc: 'Untuk dokumen Renstra, VMTS, Kebijakan Lintas Tahun' },
    ];
    for (let i = 0; i < count; i++) {
        const year = tsYear - i;
        const tag = i === 0 ? 'TS' : `TS-${i}`;
        list.push({
            key: `ts-${i}`,
            label: `${tag} (Tahun Akademik ${year})`,
            short: `${tag} (${year})`,
            tag,
            year,
            desc: i === 0 ? 'Tahun berjalan pengajuan borang' : `${i} tahun sebelum TS`,
        });
    }
    return list;
};

// Data Dasar 9 Kriteria LAM
const baseLamCriterias = [
    {
        id: 'crit-l-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS) Keilmuan Program Studi',
        default_ts_enabled: ['all'], // Kriteria 1 biasanya hanya butuh folder Semua TS
        activities: [
            {
                id: 'act-ti-1',
                title_activity: 'Penyusunan & Sosialisasi VMTS Prodi Berbasis AI & Software Engineering',
                ts_key: 'all',
                ts_label: 'Semua TS',
                year: null,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-1', name: 'SK_Dekan_Rumusan_VMTS_Keilmuan_TI.pdf', size: '1.6 MB', date: '15 Jan 2025' },
                        { id: 'fl-1b', name: 'Buku_Renstra_Program_Studi_TI_2024_2029.pdf', size: '3.4 MB', date: '18 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-2', name: 'Laporan_Sosialisasi_Maba_Dan_Mitra_Industri.pdf', size: '2.4 MB', date: '01 Feb 2025' },
                    ],
                    evaluasi: [
                        { id: 'fl-3', name: 'Hasil_Survei_Pemahaman_VMTS_Prodi_94Persen.pdf', size: '920 KB', date: '25 Feb 2025' },
                    ],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-l-2',
        code_criteria: 2,
        title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Program Studi',
        default_ts_enabled: ['all', 'ts-0'],
        activities: [
            {
                id: 'act-ti-2',
                title_activity: 'MoU Kerjasama Industri Teknologi & Program Magang Kampus Merdeka',
                ts_key: 'ts-0',
                ts_label: 'TS (2024)',
                year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-20', name: 'Pedoman_Kerjasama_Kemitraan_Prodi_TI.pdf', size: '2.1 MB', date: '10 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-21', name: 'Dokumen_MoU_12_Perusahaan_Teknologi.pdf', size: '6.8 MB', date: '20 Feb 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-l-3',
        code_criteria: 3,
        title_criteria: 'Mahasiswa dan Layanan Pembinaan Kemahasiswaan',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [
            {
                id: 'act-ti-3',
                title_activity: 'Pembinaan Prestasi Kompetensi Gemastik & Lomba Inovasi Nasional',
                ts_key: 'ts-0',
                ts_label: 'TS (2024)',
                year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-30', name: 'SK_Tim_Pembina_Prestasi_Mahasiswa_TI.pdf', size: '980 KB', date: '05 Feb 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-31', name: 'Piagam_Juara_2_Gemastik_Data_Mining.pdf', size: '3.1 MB', date: '12 Mar 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-l-4',
        code_criteria: 4,
        title_criteria: 'Sumber Daya Manusia (Dosen Tetap Program Studi & Tenaga Kependidikan)',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [],
    },
    {
        id: 'crit-l-5',
        code_criteria: 5,
        title_criteria: 'Keuangan, Sarana dan Prasarana Penunjang Akademik Program Studi',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [],
    },
    {
        id: 'crit-l-6',
        code_criteria: 6,
        title_criteria: 'Pendidikan & Kurikulum Outcome-Based Education (OBE) Berstandar IEEE/ACM',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [
            {
                id: 'act-ti-6',
                title_activity: 'Review Kurikulum OBE & Pemetaan Capaian Pembelajaran Lulusan (CPL)',
                ts_key: 'ts-0',
                ts_label: 'TS (2024)',
                year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-4', name: 'Dokumen_Kurikulum_OBE_Standar_ACM.pdf', size: '5.8 MB', date: '10 Jan 2025' },
                        { id: 'fl-4b', name: 'Matrix_CPL_Terhadap_Profil_Lulusan.xlsx', size: '1.4 MB', date: '15 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-5', name: 'Kompilasi_RPS_OBE_Mata_Kuliah_Inti.pdf', size: '12.4 MB', date: '01 Feb 2025' },
                    ],
                    evaluasi: [
                        { id: 'fl-6', name: 'Laporan_Asesmen_Ketercapaian_CPL_Semester.pdf', size: '3.1 MB', date: '15 Mar 2025' },
                    ],
                    pengendalian: [
                        { id: 'fl-7', name: 'Berita_Acara_RTM_Remedial_CPL_Rendah.pdf', size: '820 KB', date: '20 Mar 2025' },
                    ],
                    peningkatan: [
                        { id: 'fl-8', name: 'Rencana_Upgrade_Modul_Microcredentials_AI.pdf', size: '1.5 MB', date: '02 Apr 2025' },
                    ],
                },
            },
            {
                id: 'act-ti-6b',
                title_activity: 'Lokakarya Peninjauan Silabus & Rubrik Penilaian Capstone Project',
                ts_key: 'ts-1',
                ts_label: 'TS-1 (2023)',
                year: 2023,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-40', name: 'Pedoman_Tugas_Akhir_Capstone_2023.pdf', size: '2.8 MB', date: '12 Des 2023' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-41', name: 'Berita_Acara_Sidang_Komprehensif.pdf', size: '3.6 MB', date: '15 Jan 2024' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-l-7',
        code_criteria: 7,
        title_criteria: 'Penelitian Dosen Bersama Mahasiswa Bereputasi Nasional/Internasional',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [
            {
                id: 'act-ti-7',
                title_activity: 'Hibah Penelitian Terapan Kemendikbudristek & Publikasi IEEE Access',
                ts_key: 'ts-0',
                ts_label: 'TS (2024)',
                year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'fl-9', name: 'Roadmap_Penelitian_Prodi_TI_2024_2029.pdf', size: '2.2 MB', date: '05 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'fl-10', name: 'Draft_Naskah_Publikasi_IEEE_Access_Q2.pdf', size: '4.6 MB', date: '22 Feb 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-l-8',
        code_criteria: 8,
        title_criteria: 'Pengabdian kepada Masyarakat (PkM) Penerapan IPTEK bagi Masyarakat',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [],
    },
    {
        id: 'crit-l-9',
        code_criteria: 9,
        title_criteria: 'Luaran dan Capaian Tridharma (Tracer Study & Waktu Tunggu Lulusan)',
        default_ts_enabled: ['all', 'ts-0', 'ts-1', 'ts-2'],
        activities: [],
    },
];

export default function LamIndex({ prodis = defaultProdis }) {
    const prodiList = prodis?.length > 0 ? prodis : defaultProdis;

    // Filter Prodi: Awalnya kosong agar tidak memicu kerancuan
    const [selectedProdi, setSelectedProdi] = useState('');

    // Konfigurasi Sesi Akreditasi Aktif
    const [tsYear, setTsYear] = useState(2024); // TS acuan
    const [tsCount, setTsCount] = useState(3);   // 3 tahun (LAMEMBA) atau 5 tahun (LAM-TEKNIK)
    const [hideEmptyTs, setHideEmptyTs] = useState(false); // Opsi sembunyikan folder TS kosong

    // State Kriteria beserta folder TS kustom per-kriteria
    const [criterias, setCriterias] = useState(baseLamCriterias);
    const [expandedCrit, setExpandedCrit] = useState('crit-l-1');

    // Folder TS yang dibuka/ditutup (Key: `${critId}-${tsKey}`)
    const [expandedTsFolders, setExpandedTsFolders] = useState({
        'crit-l-1-all': true,
        'crit-l-6-ts-0': true,
        'crit-l-6-ts-1': true,
        'crit-l-7-ts-0': true,
    });

    // Kegiatan yang dibuka/ditutup (Key: activityId)
    const [expandedActivities, setExpandedActivities] = useState({
        'act-ti-1': true,
        'act-ti-6': true,
    });

    // Subfolder PPEPP yang dibuka/ditutup (Key: `${activityId}-${stageKey}`)
    const [expandedPpepp, setExpandedPpepp] = useState({
        'act-ti-1-penetapan': true,
        'act-ti-1-pelaksanaan': true,
        'act-ti-6-penetapan': true,
        'act-ti-6-pelaksanaan': true,
    });

    // Modal Tambah Kegiatan
    const [newActivityModal, setNewActivityModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
        critTitle: '',
        presetTsKey: 'all',
    });
    const [formTitleActivity, setFormTitleActivity] = useState('');
    const [formSelectedTsKey, setFormSelectedTsKey] = useState('all');

    // Modal Tambah Folder TS Baru ke Kriteria
    const [addTsFolderModal, setAddTsFolderModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
        critTitle: '',
    });
    const [selectedNewTsKey, setSelectedNewTsKey] = useState('ts-3');

    // Modal Upload File PPEPP
    const [uploadModal, setUploadModal] = useState({
        isOpen: false,
        critId: null,
        activityId: null,
        stageKey: null,
        stageLabel: null,
        activityTitle: '',
    });
    const [fileNameInput, setFileNameInput] = useState('');

    // Objek prodi yang dipilih
    const activeProdi = prodiList.find((p) => p.id === selectedProdi);

    // Opsi TS yang tersedia sesuai tsCount
    const allPossibleTsOptions = useMemo(() => {
        return generateTsOptions(tsYear, 5); // Sampai TS-4
    }, [tsYear]);

    const activeTsOptions = useMemo(() => {
        return generateTsOptions(tsYear, tsCount);
    }, [tsYear, tsCount]);

    // Handler Ganti Prodi
    const handleSelectProdi = (prodiId) => {
        setSelectedProdi(prodiId);
        const p = prodiList.find((x) => x.id === prodiId);
        if (p?.default_ts_count) {
            setTsCount(p.default_ts_count);
        }
        setExpandedCrit('crit-l-1');
    };

    // Toggle Kriteria
    const toggleCrit = (critId) => {
        setExpandedCrit(expandedCrit === critId ? null : critId);
    };

    // Toggle Folder TS
    const toggleTsFolder = (folderKey) => {
        setExpandedTsFolders((prev) => ({
            ...prev,
            [folderKey]: !prev[folderKey],
        }));
    };

    // Toggle Kegiatan
    const toggleActivity = (actId) => {
        setExpandedActivities((prev) => ({
            ...prev,
            [actId]: !prev[actId],
        }));
    };

    // Toggle Folder PPEPP
    const togglePpepp = (ppeppKey) => {
        setExpandedPpepp((prev) => ({
            ...prev,
            [ppeppKey]: !prev[ppeppKey],
        }));
    };

    // Buka Modal Tambah Kegiatan (Dengan preset TS jika diklik dari dalam folder TS)
    const handleOpenAddActivity = (critId, critCode, critTitle, presetTsKey = 'all') => {
        setNewActivityModal({
            isOpen: true,
            critId,
            critCode,
            critTitle,
            presetTsKey,
        });
        setFormTitleActivity('');
        setFormSelectedTsKey(presetTsKey);
    };

    // Submit Tambah Kegiatan Baru
    const handleSubmitActivity = (e) => {
        e.preventDefault();
        if (!formTitleActivity.trim()) return;

        const tsObj = allPossibleTsOptions.find((t) => t.key === formSelectedTsKey) || allPossibleTsOptions[0];

        const newAct = {
            id: `act-${Date.now()}`,
            title_activity: formTitleActivity.trim(),
            ts_key: tsObj.key,
            ts_label: tsObj.short,
            year: tsObj.year,
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
                // Pastikan folder TS ini masuk ke daftar enabled kriteria jika belum ada
                const currentEnabled = crit.default_ts_enabled || ['all'];
                const updatedEnabled = currentEnabled.includes(tsObj.key) ? currentEnabled : [...currentEnabled, tsObj.key];

                return {
                    ...crit,
                    default_ts_enabled: updatedEnabled,
                    activities: [newAct, ...(crit.activities || [])],
                };
            })
        );

        // Buka folder TS dan buka kegiatan yang baru dibuat
        setExpandedTsFolders((prev) => ({
            ...prev,
            [`${newActivityModal.critId}-${tsObj.key}`]: true,
        }));
        setExpandedActivities((prev) => ({
            ...prev,
            [newAct.id]: true,
        }));

        setNewActivityModal({ isOpen: false, critId: null, critCode: null, critTitle: '', presetTsKey: 'all' });
        setFormTitleActivity('');
    };

    // Hapus Folder TS dari Kriteria (Hanya jika folder kosong)
    const handleDeleteTsFolder = (critId, tsKey, tsLabel) => {
        if (!confirm(`Hapus folder ${tsLabel} dari kriteria ini?`)) return;

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== critId) return crit;
                const currentEnabled = crit.default_ts_enabled || ['all'];
                return {
                    ...crit,
                    default_ts_enabled: currentEnabled.filter((k) => k !== tsKey),
                };
            })
        );
    };

    // Tambah Folder TS Baru ke Kriteria
    const handleAddTsFolderToCrit = (e) => {
        e.preventDefault();
        const { critId } = addTsFolderModal;
        if (!critId) return;

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== critId) return crit;
                const currentEnabled = crit.default_ts_enabled || ['all'];
                if (currentEnabled.includes(selectedNewTsKey)) return crit;
                return {
                    ...crit,
                    default_ts_enabled: [...currentEnabled, selectedNewTsKey],
                };
            })
        );

        setExpandedTsFolders((prev) => ({
            ...prev,
            [`${critId}-${selectedNewTsKey}`]: true,
        }));

        setAddTsFolderModal({ isOpen: false, critId: null, critCode: null, critTitle: '' });
    };

    // Buka Modal Upload Dokumen PPEPP
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

    // Konfirmasi Upload Dokumen
    const handleConfirmUpload = (e) => {
        e.preventDefault();
        if (!fileNameInput.trim()) return;

        const newDoc = {
            id: `doc-${Date.now()}`,
            name: fileNameInput.endsWith('.pdf') || fileNameInput.endsWith('.docx') ? fileNameInput : `${fileNameInput}.pdf`,
            size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== uploadModal.critId) return crit;
                return {
                    ...crit,
                    activities: (crit.activities || []).map((act) => {
                        if (act.id !== uploadModal.activityId) return act;
                        const currentStageDocs = act.ppepp_docs?.[uploadModal.stageKey] || [];
                        return {
                            ...act,
                            ppepp_docs: {
                                ...act.ppepp_docs,
                                [uploadModal.stageKey]: [...currentStageDocs, newDoc],
                            },
                        };
                    }),
                };
            })
        );

        setExpandedPpepp((prev) => ({
            ...prev,
            [`${uploadModal.activityId}-${uploadModal.stageKey}`]: true,
        }));

        setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' });
    };

    // Hapus File Dokumen
    const handleDeleteFile = (critId, activityId, stageKey, fileId, fileName) => {
        if (!confirm(`Hapus file "${fileName}" dari tahap PPEPP?`)) return;

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== critId) return crit;
                return {
                    ...crit,
                    activities: (crit.activities || []).map((act) => {
                        if (act.id !== activityId) return act;
                        return {
                            ...act,
                            ppepp_docs: {
                                ...act.ppepp_docs,
                                [stageKey]: (act.ppepp_docs?.[stageKey] || []).filter((f) => f.id !== fileId),
                            },
                        };
                    }),
                };
            })
        );
    };

    // Hapus Kegiatan
    const handleDeleteActivity = (critId, actId, title) => {
        if (!confirm(`Hapus seluruh kegiatan "${title}" beserta semua dokumen PPEPP di dalamnya?`)) return;

        setCriterias((prev) =>
            prev.map((crit) => {
                if (crit.id !== critId) return crit;
                return {
                    ...crit,
                    activities: (crit.activities || []).filter((a) => a.id !== actId),
                };
            })
        );
    };

    // Total kegiatan di seluruh kriteria
    const totalAllActivities = criterias.reduce((acc, c) => acc + (c.activities?.length || 0), 0);

    return (
        <AuthenticatedLayout>
            <Head title="Dokumen Akreditasi LAM (9 Kriteria & Folderisasi TS)" />

            <div className="space-y-6">
                {/* Header Utama Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase mb-1">
                            <Layers className="w-4 h-4" />
                            <span>Dokumen Akreditasi LAM (Per Program Studi & TS)</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Instrumen Akreditasi LAM (9 Kriteria)</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                            Repositori pohon folder evidensi 5 siklus penjaminan mutu PPEPP berbasis rentang evaluasi Tahun Akademik (TS, TS-1, TS-2).
                        </p>
                    </div>

                    {/* Indikator Folder */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs shrink-0">
                        <span className="font-semibold text-slate-700">Indikator PPEPP:</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                            <span>Lengkap</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Ada File</span>
                        </div>
                    </div>
                </div>

                {/* Filter Bar: Hanya Berbasis Prodi */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                            <Filter className="w-4 h-4 text-emerald-600" />
                            <span>Pilih Program Studi:</span>
                        </div>

                        {/* Dropdown Program Studi */}
                        <div className="relative min-w-[280px] sm:min-w-[340px]">
                            <select
                                id="lam-filter-prodi"
                                value={selectedProdi}
                                onChange={(e) => handleSelectProdi(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
                            >
                                <option value="">-- Silakan Pilih Program Studi --</option>
                                {prodiList.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name_prodi} ({p.degree}) - {p.faculty} [{p.agency_code}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedProdi && (
                            <button
                                type="button"
                                onClick={() => setSelectedProdi('')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        {selectedProdi ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                Prodi Aktif: <strong className="font-bold">{activeProdi?.name_prodi}</strong> ({activeProdi?.agency_code})
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Pilih prodi untuk menampilkan kriteria</span>
                        )}
                    </div>
                </div>

                {/* ======================================================== */}
                {/* KONDISI 1: JIKA BELUM PILIH PRODI (EMPTY STATE BERSIH)   */}
                {/* ======================================================== */}
                {!selectedProdi ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 mb-4 shadow-sm">
                            <GraduationCap className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200/60">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pilih Program Studi Terlebih Dahulu</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Tidak Ada Dokumen yang Ditampilkan
                        </h2>

                        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                            Instrumen Akreditasi 9 Kriteria LAM bersifat khusus per-Program Studi. Silakan tentukan Program Studi melalui dropdown filter di atas untuk meninjau pohon folder kriteria, sesi evaluasi TS, dan eviden PPEPP.
                        </p>

                        {/* Quick Selection Cards */}
                        <div className="mt-8 pt-8 border-t border-slate-100 max-w-3xl mx-auto">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Atau Pilih Cepat Program Studi Di Bawah Ini:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {prodiList.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectProdi(p.id)}
                                        className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                                    {p.degree} {p.acronym}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-200 text-slate-700">
                                                    {p.agency_code}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                {p.name_prodi}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">{p.faculty}</p>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-600 flex items-center justify-between">
                                            <span>Buka Borang LAM &rarr;</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ======================================================== */
                    /* KONDISI 2: PRODI DIPILIH (SESI AKREDITASI & FOLDERISASI TS)*/
                    /* ======================================================== */
                    <div className="space-y-4 animate-fade-in">
                        {/* Panel Sesi Akreditasi & Konfigurasi Rentang TS */}
                        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-emerald-800/40 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                                Lembaga: {activeProdi?.agency_code}
                                            </span>
                                            <span className="text-xs text-slate-300">• {activeProdi?.faculty}</span>
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                                            {activeProdi?.name_prodi} ({activeProdi?.degree}) — Sesi Akreditasi 2024–2029
                                        </h2>
                                    </div>
                                </div>

                                {/* Statistik Cepat */}
                                <div className="flex items-center gap-2.5 text-xs">
                                    <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10 text-emerald-100">
                                        <span>Tahun Acuan TS: </span>
                                        <strong className="text-white font-bold">{tsYear}</strong>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10 text-emerald-100">
                                        <span>Total: </span>
                                        <strong className="text-white font-bold">{totalAllActivities} Kegiatan</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Pengaturan Fleksibilitas TS (LAMEMBA 3 Tahun vs LAM-TEKNIK 5 Tahun) */}
                            <div className="pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                        Rentang Evaluasi TS:
                                    </span>

                                    {/* Selector Rentang TS */}
                                    <div className="inline-flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/80">
                                        <button
                                            type="button"
                                            onClick={() => setTsCount(3)}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                                                tsCount === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                                            }`}
                                            title="Standar LAMEMBA (3 Tahun Terakhir: TS, TS-1, TS-2)"
                                        >
                                            3 Tahun (TS s/d TS-2)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTsCount(5)}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                                                tsCount === 5 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                                            }`}
                                            title="Standar LAM-TEKNIK / BAN-PT (5 Tahun Terakhir: TS s/d TS-4)"
                                        >
                                            5 Tahun (TS s/d TS-4)
                                        </button>
                                    </div>

                                    {activeProdi?.agency_code === 'LAMEMBA' && (
                                        <span className="text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                                            Direkomendasikan 3 Tahun untuk {activeProdi.agency_code}
                                        </span>
                                    )}
                                </div>

                                {/* Toggle Sembunyikan Folder TS Kosong */}
                                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                                    <input
                                        type="checkbox"
                                        checked={hideEmptyTs}
                                        onChange={(e) => setHideEmptyTs(e.target.checked)}
                                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500/20 bg-slate-800"
                                    />
                                    <span>Sembunyikan Folder TS Kosong</span>
                                </label>
                            </div>
                        </div>

                        {/* Accordion 9 Kriteria LAM */}
                        <div className="space-y-3">
                            {criterias.map((crit) => {
                                const isCritExpanded = expandedCrit === crit.id;
                                const critActivities = crit.activities || [];
                                const totalActsInCrit = critActivities.length;

                                // Filter folder TS yang aktif untuk kriteria ini
                                const enabledTsKeys = crit.default_ts_enabled || ['all'];

                                // Daftar opsi TS yang tampil di kriteria ini
                                const visibleTsList = allPossibleTsOptions.filter((opt) => {
                                    // Jika 'all', selalu sertakan jika ada di enabledTsKeys
                                    if (opt.key === 'all') return enabledTsKeys.includes('all');
                                    // Cek apakah nomor indeks TS <= tsCount
                                    const tsIndex = parseInt(opt.key.replace('ts-', ''), 10);
                                    const isInCount = tsIndex < tsCount;
                                    const isExplicitlyEnabled = enabledTsKeys.includes(opt.key);

                                    // Cek apakah ada kegiatan di TS ini
                                    const hasActivities = critActivities.some((a) => a.ts_key === opt.key);

                                    // Jika filter sembunyikan TS kosong aktif, hanya tampilkan jika ada kegiatannya
                                    if (hideEmptyTs && !hasActivities) return false;

                                    return (isInCount || isExplicitlyEnabled) && (enabledTsKeys.includes(opt.key) || hasActivities);
                                });

                                return (
                                    <div
                                        key={crit.id}
                                        className={`rounded-xl bg-white border transition-all duration-200 overflow-hidden shadow-xs ${
                                            isCritExpanded ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Header Accordion Kriteria */}
                                        <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between bg-white border-b border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => toggleCrit(crit.id)}
                                                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2 cursor-pointer"
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
                                                        <span className={`text-[11px] font-semibold ${totalActsInCrit > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            • {totalActsInCrit} Kegiatan Terdata
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate mt-0.5" title={crit.title_criteria}>
                                                        {crit.title_criteria}
                                                    </h3>
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                {/* Tombol Tambah Folder TS */}
                                                <button
                                                    type="button"
                                                    onClick={() => setAddTsFolderModal({ isOpen: true, critId: crit.id, critCode: crit.code_criteria, critTitle: crit.title_criteria })}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                                    title="Tambah Folder TS Baru ke Kriteria Ini"
                                                >
                                                    <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                                                    <span className="hidden md:inline">+ Folder TS</span>
                                                </button>

                                                {/* Tombol Tambah Kegiatan Umum */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria, crit.title_criteria, 'all')}
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
                                                    {isCritExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Isi Kriteria: Pohon Folder TS & PPEPP */}
                                        {isCritExpanded && (
                                            <div className="p-3 sm:p-4 bg-slate-50/60 space-y-3">
                                                {visibleTsList.length === 0 ? (
                                                    <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                                        Tidak ada folder TS yang aktif atau memiliki kegiatan.
                                                    </div>
                                                ) : (
                                                    visibleTsList.map((tsOpt) => {
                                                        const folderKey = `${crit.id}-${tsOpt.key}`;
                                                        const isTsFolderOpen = !!expandedTsFolders[folderKey];

                                                        // Filter kegiatan yang termasuk dalam folder TS ini
                                                        const activitiesInTs = critActivities.filter((a) => a.ts_key === tsOpt.key);
                                                        const actCount = activitiesInTs.length;
                                                        const isDeletable = actCount === 0 && tsOpt.key !== 'all';

                                                        return (
                                                            <div
                                                                key={tsOpt.key}
                                                                className={`rounded-xl border transition-all duration-200 bg-white overflow-hidden shadow-xs ${
                                                                    isTsFolderOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/80 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {/* Header Subfolder TS */}
                                                                <div className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleTsFolder(folderKey)}
                                                                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 mr-2 cursor-pointer"
                                                                    >
                                                                        {isTsFolderOpen ? (
                                                                            <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
                                                                        ) : (
                                                                            <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                                                                        )}

                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                                                                                    tsOpt.key === 'all'
                                                                                        ? 'bg-purple-100 text-purple-700'
                                                                                        : tsOpt.key === 'ts-0'
                                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                                        : 'bg-blue-100 text-blue-800'
                                                                                }`}>
                                                                                    {tsOpt.short}
                                                                                </span>
                                                                                <span className="text-xs font-bold text-slate-800 truncate">
                                                                                    {tsOpt.label}
                                                                                </span>
                                                                                <span className="text-[11px] text-slate-400 font-medium">
                                                                                    ({actCount} Kegiatan)
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </button>

                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        {/* Tombol Tambah Kegiatan Khusus di TS Ini */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria, crit.title_criteria, tsOpt.key)}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                                                            title={`Tambah Kegiatan di ${tsOpt.short}`}
                                                                        >
                                                                            <Plus className="w-3 h-3" />
                                                                            <span>Kegiatan</span>
                                                                        </button>

                                                                        {/* Tombol Hapus Folder TS (Hanya Jika Kosong) */}
                                                                        {isDeletable && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteTsFolder(crit.id, tsOpt.key, tsOpt.short)}
                                                                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                                title="Hapus Folder TS Kosong Ini"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleTsFolder(folderKey)}
                                                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                                                                        >
                                                                            {isTsFolderOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Daftar Kegiatan di Dalam Folder TS Ini */}
                                                                {isTsFolderOpen && (
                                                                    <div className="p-3 sm:p-4 space-y-3 bg-white">
                                                                        {actCount === 0 ? (
                                                                            <div className="py-4 px-3 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                                                                                <span>Belum ada kegiatan pada {tsOpt.label}.</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria, crit.title_criteria, tsOpt.key)}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                                                                                >
                                                                                    <Plus className="w-3 h-3" />
                                                                                    <span>Tambah Kegiatan Pertama</span>
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            activitiesInTs.map((act) => {
                                                                                const isActOpen = !!expandedActivities[act.id];

                                                                                return (
                                                                                    <div
                                                                                        key={act.id}
                                                                                        className="rounded-lg border border-slate-200/90 overflow-hidden bg-slate-50/40"
                                                                                    >
                                                                                        {/* Header Kegiatan */}
                                                                                        <div className="px-3 py-2 flex items-center justify-between bg-white border-b border-slate-100">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => toggleActivity(act.id)}
                                                                                                className="flex items-center gap-2 text-left flex-1 min-w-0 mr-2"
                                                                                            >
                                                                                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                                                <div className="min-w-0">
                                                                                                    <span className="text-xs font-bold text-slate-800 truncate block">
                                                                                                        {act.title_activity}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </button>

                                                                                            <div className="flex items-center gap-2 shrink-0">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleDeleteActivity(crit.id, act.id, act.title_activity)}
                                                                                                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                                                                                                    title="Hapus Kegiatan Ini"
                                                                                                >
                                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => toggleActivity(act.id)}
                                                                                                    className="p-1 text-slate-400 hover:text-slate-600"
                                                                                                >
                                                                                                    {isActOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* 5 Subfolder Tahap PPEPP di Dalam Kegiatan */}
                                                                                        {isActOpen && (
                                                                                            <div className="p-2 sm:p-3 space-y-1.5 bg-slate-50/80">
                                                                                                {PPEPP_STAGES.map((stage) => {
                                                                                                    const stageDocs = act.ppepp_docs?.[stage.key] || [];
                                                                                                    const hasDocs = stageDocs.length > 0;
                                                                                                    const ppeppKey = `${act.id}-${stage.key}`;
                                                                                                    const isPpeppOpen = !!expandedPpepp[ppeppKey];

                                                                                                    return (
                                                                                                        <div
                                                                                                            key={stage.key}
                                                                                                            className="rounded-md border border-slate-200/80 bg-white overflow-hidden text-xs"
                                                                                                        >
                                                                                                            {/* Header Tahap PPEPP */}
                                                                                                            <div className="px-2.5 py-1.5 flex items-center justify-between bg-white hover:bg-slate-50">
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => togglePpepp(ppeppKey)}
                                                                                                                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                                                                                                                >
                                                                                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${hasDocs ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                                                                    <span className="font-bold text-slate-700 truncate">
                                                                                                                        {stage.label}
                                                                                                                    </span>
                                                                                                                    <span className="text-[10px] text-slate-400">
                                                                                                                        ({stageDocs.length} file)
                                                                                                                    </span>
                                                                                                                </button>

                                                                                                                <div className="flex items-center gap-1">
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        onClick={() => handleOpenUpload(crit.id, act.id, stage.key, stage.label, act.title_activity)}
                                                                                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                                                                                                    >
                                                                                                                        <Plus className="w-2.5 h-2.5" />
                                                                                                                        <span>Upload</span>
                                                                                                                    </button>
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        onClick={() => togglePpepp(ppeppKey)}
                                                                                                                        className="p-1 text-slate-400 hover:text-slate-600"
                                                                                                                    >
                                                                                                                        {isPpeppOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            {/* List Dokumen Eviden di Tahap Ini */}
                                                                                                            {isPpeppOpen && (
                                                                                                                <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-100 space-y-1">
                                                                                                                    {stageDocs.length === 0 ? (
                                                                                                                        <div className="text-[11px] text-rose-500 italic py-1 flex items-center gap-1">
                                                                                                                            <AlertCircle className="w-3 h-3" />
                                                                                                                            <span>Belum ada dokumen eviden yang diunggah.</span>
                                                                                                                        </div>
                                                                                                                    ) : (
                                                                                                                        stageDocs.map((doc) => (
                                                                                                                            <div
                                                                                                                                key={doc.id}
                                                                                                                                className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200/60 hover:border-slate-300 text-[11px]"
                                                                                                                            >
                                                                                                                                <div className="flex items-center gap-2 min-w-0 mr-2">
                                                                                                                                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                                                                                                    <span className="font-medium text-slate-700 truncate" title={doc.name}>
                                                                                                                                        {doc.name}
                                                                                                                                    </span>
                                                                                                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                                                                                                        ({doc.size})
                                                                                                                                    </span>
                                                                                                                                </div>

                                                                                                                                <div className="flex items-center gap-1 shrink-0">
                                                                                                                                    <button
                                                                                                                                        type="button"
                                                                                                                                        onClick={() => alert(`Preview file: ${doc.name}`)}
                                                                                                                                        className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                                                                                                                                        title="Lihat / Unduh Dokumen"
                                                                                                                                    >
                                                                                                                                        <Eye className="w-3.5 h-3.5" />
                                                                                                                                    </button>
                                                                                                                                    <button
                                                                                                                                        type="button"
                                                                                                                                        onClick={() => handleDeleteFile(crit.id, act.id, stage.key, doc.id, doc.name)}
                                                                                                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                                                                                                        title="Hapus Dokumen"
                                                                                                                                    >
                                                                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                                                                    </button>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        ))
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODAL TAMBAH KEGIATAN BARU (DENGAN PILIHAN TS)          */}
            {/* ======================================================== */}
            {newActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Kegiatan / Eviden Baru
                                </h3>
                                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    Kriteria {newActivityModal.critCode} — {newActivityModal.critTitle}
                                </p>
                            </div>
                            <button
                                onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null, critTitle: '', presetTsKey: 'all' })}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitActivity} className="mt-4 space-y-4">
                            {/* Pilihan Cakupan Evaluasi (TS) */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Cakupan Tahun Evaluasi (TS) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formSelectedTsKey}
                                    onChange={(e) => setFormSelectedTsKey(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                                >
                                    {allPossibleTsOptions.map((opt) => (
                                        <option key={opt.key} value={opt.key}>
                                            {opt.label} — {opt.desc}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Pilih "Semua TS" untuk dokumen umum/kebijakan, atau pilih tahun spesifik untuk eviden kurikulum/penelitian.
                                </p>
                            </div>

                            {/* Judul Kegiatan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama / Judul Kegiatan Baru <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formTitleActivity}
                                    onChange={(e) => setFormTitleActivity(e.target.value)}
                                    placeholder="Contoh: Lokakarya Evaluasi Kurikulum OBE & Pemetaan CPL"
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Setelah disimpan, kegiatan akan otomatis dimasukkan ke folder tahun tersebut dan memiliki 5 subfolder siklus PPEPP.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null, critTitle: '', presetTsKey: 'all' })}
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

            {/* ======================================================== */}
            {/* MODAL TAMBAH FOLDER TS BARU KE KRITERIA                 */}
            {/* ======================================================== */}
            {addTsFolderModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Folder Tahun TS
                                </h3>
                                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    Kriteria {addTsFolderModal.critCode}
                                </p>
                            </div>
                            <button
                                onClick={() => setAddTsFolderModal({ isOpen: false, critId: null, critCode: null, critTitle: '' })}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTsFolderToCrit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Pilih Tahun TS yang Ingin Ditambahkan
                                </label>
                                <select
                                    value={selectedNewTsKey}
                                    onChange={(e) => setSelectedNewTsKey(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                                >
                                    {allPossibleTsOptions.map((opt) => (
                                        <option key={opt.key} value={opt.key}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Folder baru akan langsung disiapkan di dalam kriteria dan siap diisi kegiatan.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAddTsFolderModal({ isOpen: false, critId: null, critCode: null, critTitle: '' })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                                >
                                    Tambahkan Folder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL UPLOAD FILE PPEPP                                  */}
            {/* ======================================================== */}
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
                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Format: PDF, Word (.docx), Excel (.xlsx), atau scan dokumen resmi.
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
        </AuthenticatedLayout>
    );
}
