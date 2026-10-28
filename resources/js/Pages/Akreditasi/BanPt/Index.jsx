import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PpeppFolderExplorer from '@/Components/PpeppFolderExplorer';
import { confirmAlert, toastSuccess } from '@/Utils/alert';
import {
    Award,
    Filter,
    ChevronDown,
    ChevronUp,
    Plus,
    UploadCloud,
    AlertCircle,
    X,
    Layers,
    Landmark,
    Building2,
    Sparkles,
    RotateCcw,
    ArrowRight,
    Check,
    Calendar,
    SlidersHorizontal,
    FileCheck2
} from 'lucide-react';

const PPEPP_STAGES = [
    { key: 'penetapan', label: '1. Penetapan (P)', desc: 'Standar Mutu Institusi, SK Kebijakan Rektor, Pedoman SPMI' },
    { key: 'pelaksanaan', label: '2. Pelaksanaan (P)', desc: 'Bukti Kegiatan Institusi, Notulen Rapat, Kerjasama, Realisasi' },
    { key: 'evaluasi', label: '3. Evaluasi (E)', desc: 'Laporan Monev Institusi, Audit Mutu Internal (AMI), Survei Kepuasan' },
    { key: 'pengendalian', label: '4. Pengendalian (P)', desc: 'Rapat Tinjauan Manajemen (RTM) Universitas, Tindak Lanjut Temuan' },
    { key: 'peningkatan', label: '5. Peningkatan (P)', desc: 'Benchmarking Institusi, Rencana Pengembangan & Standar Mutu Baru' },
];

// Daftar Sesi Akreditasi Institusi BAN-PT
const defaultSessions = [
    {
        id: 'sesi-pt-2025',
        name: 'Akreditasi Perguruan Tinggi (AIPT) 2025–2030',
        agency_code: 'BAN-PT',
        agency_name: 'Badan Akreditasi Nasional Perguruan Tinggi',
        level: 'Institusi / Perguruan Tinggi',
        univ_name: 'Universitas Teknologi Digital',
        year_start: 2025,
        year_end: 2030,
        ts_year: 2025,
        ts_count: 5,
        status: 'active',
        status_label: 'Sesi Aktif Sedang Berjalan',
        status_badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        target_rating: 'Unggul',
        sk_number: 'Dalam Proses Penyusunan LKPT & LED Institusi 2025',
        description: 'Siklus akreditasi institusi berjalan periode 2025–2030 berbasis instrumen 4 Kriteria Standar BAN-PT.',
    },
    {
        id: 'sesi-pt-2020',
        name: 'Akreditasi Perguruan Tinggi (AIPT) 2020–2025',
        agency_code: 'BAN-PT',
        agency_name: 'Badan Akreditasi Nasional Perguruan Tinggi',
        level: 'Institusi / Perguruan Tinggi',
        univ_name: 'Universitas Teknologi Digital',
        year_start: 2020,
        year_end: 2025,
        ts_year: 2020,
        ts_count: 5,
        status: 'completed',
        status_label: 'Terakreditasi (Arsip)',
        status_badge: 'bg-blue-50 text-blue-700 border-blue-200',
        target_rating: 'Unggul (Tercapai)',
        sk_number: 'SK BAN-PT No. 1024/SK/BAN-PT/Akred/PT/XII/2020',
        description: 'Arsip berkas evidensi PPEPP dan instrumen akreditasi perguruan tinggi siklus sebelumnya.',
    },
    {
        id: 'sesi-pt-2030',
        name: 'Reakreditasi Perguruan Tinggi (AIPT) 2030–2035',
        agency_code: 'BAN-PT',
        agency_name: 'Badan Akreditasi Nasional Perguruan Tinggi',
        level: 'Institusi / Perguruan Tinggi',
        univ_name: 'Universitas Teknologi Digital',
        year_start: 2030,
        year_end: 2035,
        ts_year: 2030,
        ts_count: 5,
        status: 'draft',
        status_label: 'Persiapan Mendatang',
        status_badge: 'bg-amber-50 text-amber-700 border-amber-200',
        target_rating: 'Unggul / Internasional',
        sk_number: 'Dalam Perencanaan Strategis Jangka Panjang',
        description: 'Perencanaan dan pemetaan dokumen SPMI institusi untuk siklus reakreditasi 2030–2035.',
    },
];

// Data Kriteria BAN-PT untuk Sesi Aktif 2025-2030
const initialBanPtCriterias2025 = [
    {
        id: 'crit-b-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS) Perguruan Tinggi',
        activities: [
            {
                id: 'act-b-1',
                title_activity: 'Rapat Kerja Tahunan Penetapan & Review VMTS Universitas',
                description: 'Dokumen bukti SK Rektor, Berita Acara, dan daftar hadir peninjauan VMTS bersama Senat Universitas.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'f-1', name: 'SK_Rektor_Penetapan_VMTS_2025.pdf', size: '1.4 MB', date: '10 Jan 2025' },
                        { id: 'f-2', name: 'Buku_Renstra_Universitas_2024_2029.pdf', size: '4.8 MB', date: '12 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'f-3', name: 'Dokumentasi_Sosialisasi_VMTS_Sivitas.pdf', size: '3.2 MB', date: '02 Feb 2025' },
                    ],
                    evaluasi: [
                        { id: 'f-4', name: 'Laporan_Survei_Pemahaman_VMTS.pdf', size: '890 KB', date: '15 Mar 2025' },
                    ],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
            {
                id: 'act-b-2',
                title_activity: 'Survei Pemahaman VMTS oleh Sivitas Akademika dan Stakeholder',
                description: 'Hasil kuesioner pemahaman visi misi oleh dosen, mahasiswa, tendik, dan mitra industri.',
                academic_year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'f-5', name: 'Instrumen_Kuesioner_Pemahaman_VMTS.pdf', size: '540 KB', date: '10 Nov 2024' },
                    ],
                    pelaksanaan: [
                        { id: 'f-6', name: 'Rekapitulasi_Jawaban_Responden.xlsx', size: '1.2 MB', date: '20 Des 2024' },
                    ],
                    evaluasi: [
                        { id: 'f-7', name: 'Laporan_Analisis_Capaian_Survei_92Persen.pdf', size: '2.1 MB', date: '28 Des 2024' },
                    ],
                    pengendalian: [
                        { id: 'f-8', name: 'Notulen_RTM_Pengendalian_VMTS.pdf', size: '750 KB', date: '05 Jan 2025' },
                    ],
                    peningkatan: [
                        { id: 'f-9', name: 'Rencana_Tindak_Lanjut_Sosialisasi_Digital.pdf', size: '1.1 MB', date: '15 Jan 2025' },
                    ],
                },
            },
        ],
    },
    {
        id: 'crit-b-2',
        code_criteria: 2,
        title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Perguruan Tinggi',
        activities: [
            {
                id: 'act-b-3',
                title_activity: 'MoU & Perjanjian Kerjasama Magang Industri & Tridharma',
                description: 'Kerjasama resmi dengan BUMN dan industri dalam program magang bersertifikat dan penelitian bersama.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'f-10', name: 'Pedoman_Kerjasama_Kemitraan_Universitas.pdf', size: '2.5 MB', date: '05 Jan 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'f-11', name: 'Dokumen_MoU_15_Mitra_Industri.pdf', size: '8.4 MB', date: '18 Feb 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-b-3',
        code_criteria: 3,
        title_criteria: 'Mahasiswa, Dosen, dan Sumber Daya Penunjang Akademik',
        activities: [
            {
                id: 'act-b-4',
                title_activity: 'Pembinaan Prestasi Mahasiswa Tingkat Nasional & Internasional',
                description: 'Sertifikat kejuaraan Gemastik, PKM Kemendikbudristek, dan kompetisi inovasi global.',
                academic_year: 2025,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'f-12', name: 'SK_Pemberian_Insentif_Prestasi_Mahasiswa.pdf', size: '1.1 MB', date: '15 Feb 2025' },
                    ],
                    pelaksanaan: [
                        { id: 'f-13', name: 'Piagam_Juara_Gemastik_Nasional.pdf', size: '3.6 MB', date: '01 Mar 2025' },
                    ],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-b-4',
        code_criteria: 4,
        title_criteria: 'Luaran, Capaian Tridharma, dan Dampak Kemanfaatan Masyarakat',
        activities: [
            {
                id: 'act-b-5',
                title_activity: 'Tracer Study Lulusan dan Waktu Tunggu Kerja Pertama',
                description: 'Laporan tracer study dengan persentase lulusan bekerja dalam waktu kurang dari 3 bulan.',
                academic_year: 2024,
                status: 'published',
                ppepp_docs: {
                    penetapan: [
                        { id: 'f-14', name: 'SOP_Pelaksanaan_Tracer_Study.pdf', size: '980 KB', date: '01 Okt 2024' },
                    ],
                    pelaksanaan: [
                        { id: 'f-15', name: 'Kuesioner_Online_Alumni_Batch_2024.pdf', size: '1.3 MB', date: '15 Nov 2024' },
                    ],
                    evaluasi: [
                        { id: 'f-16', name: 'Laporan_Hasil_Tracer_Study_2024.pdf', size: '4.2 MB', date: '20 Des 2024' },
                    ],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
];

// Data Kriteria BAN-PT untuk Sesi Historis 2020-2025 (Arsip)
const initialBanPtCriterias2020 = [
    {
        id: 'crit-b20-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS) Perguruan Tinggi',
        activities: [
            {
                id: 'act-b20-1',
                title_activity: 'Penetapan Renstra Universitas 2020–2025 & Sosialisasi VMTS',
                description: 'Dokumen SK Rektor dan Notulen Pengesahan Senat Universitas.',
                academic_year: 2020,
                status: 'published',
                ppepp_docs: {
                    penetapan: [{ id: 'f-20-1', name: 'SK_Rektor_Renstra_2020_2025.pdf', size: '3.1 MB', date: '12 Jan 2020' }],
                    pelaksanaan: [{ id: 'f-20-2', name: 'Dokumentasi_Raker_Sosialisasi_2020.pdf', size: '2.4 MB', date: '18 Feb 2020' }],
                    evaluasi: [{ id: 'f-20-3', name: 'Laporan_Evaluasi_Pemahaman_VMTS_2020.pdf', size: '1.1 MB', date: '15 Des 2020' }],
                    pengendalian: [{ id: 'f-20-4', name: 'RTM_Pengendalian_Target_Renstra.pdf', size: '820 KB', date: '20 Des 2020' }],
                    peningkatan: [{ id: 'f-20-5', name: 'Rencana_Peningkatan_Kapasitas_2021.pdf', size: '1.5 MB', date: '05 Jan 2021' }],
                },
            },
        ],
    },
    {
        id: 'crit-b20-2',
        code_criteria: 2,
        title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Perguruan Tinggi',
        activities: [
            {
                id: 'act-b20-2',
                title_activity: 'Implementasi Tata Kelola SPMI dan Dokumen Kerjasama Nasional',
                description: 'Laporan implementasi sistem penjaminan mutu internal universitas.',
                academic_year: 2020,
                status: 'published',
                ppepp_docs: {
                    penetapan: [{ id: 'f-20-6', name: 'Manual_Mutu_SPMI_Universitas.pdf', size: '2.8 MB', date: '10 Jan 2020' }],
                    pelaksanaan: [{ id: 'f-20-7', name: 'Kompilasi_MoU_Kerjasama_2020.pdf', size: '5.2 MB', date: '15 Mar 2020' }],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-b20-3',
        code_criteria: 3,
        title_criteria: 'Mahasiswa, Dosen, dan Sumber Daya Penunjang Akademik',
        activities: [
            {
                id: 'act-b20-3',
                title_activity: 'Rekapitulasi Kualifikasi Dosen & Prestasi Kemahasiswaan 2020',
                description: 'Portofolio SDM Dosen dan capaian kejuaraan mahasiswa.',
                academic_year: 2020,
                status: 'published',
                ppepp_docs: {
                    penetapan: [{ id: 'f-20-8', name: 'Pedoman_Pengembangan_SDM_Dosen.pdf', size: '1.8 MB', date: '05 Jan 2020' }],
                    pelaksanaan: [{ id: 'f-20-9', name: 'Laporan_Prestasi_Mahasiswa_2020.pdf', size: '3.4 MB', date: '20 Des 2020' }],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-b20-4',
        code_criteria: 4,
        title_criteria: 'Luaran, Capaian Tridharma, dan Dampak Kemanfaatan Masyarakat',
        activities: [
            {
                id: 'act-b20-4',
                title_activity: 'Laporan Tracer Study & Publikasi Ilmiah Institusi 2020',
                description: 'Hasil pelacakan jejak alumni dan indeks publikasi institusi.',
                academic_year: 2020,
                status: 'published',
                ppepp_docs: {
                    penetapan: [{ id: 'f-20-10', name: 'Instrumen_Tracer_Study_2020.pdf', size: '750 KB', date: '01 Okt 2020' }],
                    pelaksanaan: [{ id: 'f-20-11', name: 'Laporan_Akhir_Tracer_Study_2020.pdf', size: '3.9 MB', date: '28 Des 2020' }],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
];

// Data Kriteria BAN-PT untuk Sesi Draft 2030-2035
const initialBanPtCriterias2030 = [
    {
        id: 'crit-b30-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS) Perguruan Tinggi',
        activities: [
            {
                id: 'act-b30-1',
                title_activity: 'Penyusunan Rencana Induk Pengembangan Menuju World Class University 2030–2035',
                description: 'Draft roadmap jangka panjang institusi dan sasaran strategis internasional.',
                academic_year: 2030,
                status: 'draft',
                ppepp_docs: {
                    penetapan: [{ id: 'f-30-1', name: 'Draft_Roadmap_WCU_Universitas_2030.pdf', size: '2.1 MB', date: '01 Jan 2030' }],
                    pelaksanaan: [],
                    evaluasi: [],
                    pengendalian: [],
                    peningkatan: [],
                },
            },
        ],
    },
    {
        id: 'crit-b30-2',
        code_criteria: 2,
        title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Perguruan Tinggi',
        activities: [],
    },
    {
        id: 'crit-b30-3',
        code_criteria: 3,
        title_criteria: 'Mahasiswa, Dosen, dan Sumber Daya Penunjang Akademik',
        activities: [],
    },
    {
        id: 'crit-b30-4',
        code_criteria: 4,
        title_criteria: 'Luaran, Capaian Tridharma, dan Dampak Kemanfaatan Masyarakat',
        activities: [],
    },
];

export default function BanPtIndex({ sessions = defaultSessions }) {
    const sessionList = sessions?.length > 0 ? sessions : defaultSessions;

    // Filter Sesi Akreditasi Institusi: Awalnya kosong agar konsisten seperti LAM
    const [selectedSessionId, setSelectedSessionId] = useState('');

    // State Kriteria per Sesi Akreditasi
    const [criteriasBySession, setCriteriasBySession] = useState({
        'sesi-pt-2025': initialBanPtCriterias2025,
        'sesi-pt-2020': initialBanPtCriterias2020,
        'sesi-pt-2030': initialBanPtCriterias2030,
    });

    // Filter Tahun Kegiatan di dalam sesi yang dipilih (opsional)
    const [selectedYearFilter, setSelectedYearFilter] = useState('');

    // Sesi aktif terpilih
    const activeSession = sessionList.find((s) => s.id === selectedSessionId);

    // Kriteria untuk sesi aktif
    const currentCriterias = useMemo(() => {
        if (!selectedSessionId) return [];
        return criteriasBySession[selectedSessionId] || initialBanPtCriterias2025;
    }, [selectedSessionId, criteriasBySession]);

    // Accordion kriteria aktif
    const [expandedCrit, setExpandedCrit] = useState('crit-b-1');

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

    // Modal Tambah Kegiatan Baru
    const [newActivityModal, setNewActivityModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
    });
    const [newActivityTitle, setNewActivityTitle] = useState('');

    // Handler Ganti Sesi
    const handleSelectSession = (sessionId) => {
        setSelectedSessionId(sessionId);
        setSelectedYearFilter('');
        if (sessionId) {
            const firstCrit = (criteriasBySession[sessionId] || initialBanPtCriterias2025)[0];
            setExpandedCrit(firstCrit?.id || null);
        }
    };

    // Toggle Kriteria Accordion
    const toggleCrit = (critId) => {
        setExpandedCrit(expandedCrit === critId ? null : critId);
    };

    // Buka Modal Upload
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

    // Konfirmasi Upload Dokumen Dummy
    const handleConfirmUpload = (e) => {
        e.preventDefault();
        if (!fileNameInput.trim() || !selectedSessionId) return;

        const newDoc = {
            id: `f-${Date.now()}`,
            name: fileNameInput.endsWith('.pdf') || fileNameInput.endsWith('.docx') ? fileNameInput : `${fileNameInput}.pdf`,
            size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        setCriteriasBySession((prev) => {
            const sessionData = prev[selectedSessionId] || [];
            const updated = sessionData.map((crit) => {
                if (crit.id !== uploadModal.critId) return crit;
                return {
                    ...crit,
                    activities: (crit.activities || []).map((act) => {
                        if (act.id !== uploadModal.activityId) return act;
                        const existingDocs = act.ppepp_docs?.[uploadModal.stageKey] || [];
                        return {
                            ...act,
                            ppepp_docs: {
                                ...act.ppepp_docs,
                                [uploadModal.stageKey]: [...existingDocs, newDoc],
                            },
                        };
                    }),
                };
            });
            return { ...prev, [selectedSessionId]: updated };
        });

        setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' });
    };

    // Hapus File Dokumen
    const handleDeleteFile = async (critId, activityId, stageKey, fileId, fileName) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Berkas PPEPP?',
            text: `Apakah Anda yakin ingin menghapus file "${fileName}" dari tahap PPEPP?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });
        if (!confirmed) return;

        setCriteriasBySession((prev) => {
            const sessionData = prev[selectedSessionId] || [];
            const updated = sessionData.map((crit) => {
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
            });
            return { ...prev, [selectedSessionId]: updated };
        });
    };

    // Tambah Kegiatan Baru ke Sesi Terpilih
    const handleAddActivity = (e) => {
        e.preventDefault();
        if (!newActivityTitle.trim() || !selectedSessionId) return;

        const newAct = {
            id: `act-${Date.now()}`,
            title_activity: newActivityTitle.trim(),
            description: 'Kegiatan pemenuhan butir standar akreditasi BAN-PT Institusi.',
            academic_year: activeSession?.ts_year || new Date().getFullYear(),
            status: 'published',
            ppepp_docs: {
                penetapan: [],
                pelaksanaan: [],
                evaluasi: [],
                pengendalian: [],
                peningkatan: [],
            },
        };

        setCriteriasBySession((prev) => {
            const sessionData = prev[selectedSessionId] || [];
            const updated = sessionData.map((crit) => {
                if (crit.id !== newActivityModal.critId) return crit;
                return {
                    ...crit,
                    activities: [newAct, ...(crit.activities || [])],
                };
            });
            return { ...prev, [selectedSessionId]: updated };
        });

        setNewActivityModal({ isOpen: false, critId: null, critCode: null });
        setNewActivityTitle('');
    };

    // Filter kriteria & kegiatan berdasarkan tahun akademik (jika diaktifkan)
    const filteredCriterias = useMemo(() => {
        if (!selectedYearFilter) return currentCriterias;
        return currentCriterias.map((crit) => ({
            ...crit,
            activities: (crit.activities || []).filter((act) => String(act.academic_year) === String(selectedYearFilter)),
        }));
    }, [currentCriterias, selectedYearFilter]);

    // Total kegiatan di seluruh kriteria pada sesi aktif
    const totalAllActivities = currentCriterias.reduce((acc, c) => acc + (c.activities?.length || 0), 0);

    // Daftar tahun unik dalam sesi ini untuk filter tambahan
    const sessionYears = useMemo(() => {
        const years = new Set();
        currentCriterias.forEach((c) => {
            (c.activities || []).forEach((a) => {
                if (a.academic_year) years.add(a.academic_year);
            });
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [currentCriterias]);

    return (
        <AuthenticatedLayout>
            <Head title="Dokumen Akreditasi BAN-PT (4 Kriteria & Sesi Akreditasi Institusi)" />

            <div className="space-y-6">
                {/* Header Utama Halaman BAN-PT */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6  border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase mb-1">
                            <Landmark className="w-4 h-4" />
                            <span>Dokumen Akreditasi BAN-PT (Tingkat Institusi / Perguruan Tinggi)</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Instrumen Akreditasi BAN-PT (4 Kriteria)</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                            Repositori pohon folder evidensi siklus penjaminan mutu PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) berbasis Sesi Akreditasi Institusi.
                        </p>
                    </div>

                    {/* Indikator Folder PPEPP */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-2.5  border border-slate-200 text-xs shrink-0">
                        <span className="font-semibold text-slate-700">Indikator Folder PPEPP:</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-3 h-3  bg-emerald-500 inline-block" />
                            <span>Lengkap</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-0.5  border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Ada File (Merah)</span>
                        </div>
                    </div>
                </div>

                {/* Filter Bar: Berbasis Sesi Akreditasi Institusi (Bukan Berbasis Prodi) */}
                <div className="bg-white p-4 sm:p-5  border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                            <Filter className="w-4 h-4 text-indigo-600" />
                            <span>Pilih Sesi Akreditasi Institusi:</span>
                        </div>

                        {/* Dropdown Sesi Akreditasi Perguruan Tinggi */}
                        <div className="relative min-w-[280px] sm:min-w-[360px]">
                            <select
                                id="banpt-filter-sesi"
                                value={selectedSessionId}
                                onChange={(e) => handleSelectSession(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm  border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
                            >
                                <option value="">-- Silakan Pilih Sesi Akreditasi Institusi --</option>
                                {sessionList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} [{s.status_label}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Tahun Akademik Tambahan (Jika Sesi Dipilih) */}
                        {selectedSessionId && sessionYears.length > 0 && (
                            <div className="relative">
                                <select
                                    value={selectedYearFilter}
                                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                                    className="px-3.5 py-2 text-xs  border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="">Semua Tahun ({sessionYears.join(', ')})</option>
                                    {sessionYears.map((yr) => (
                                        <option key={yr} value={yr}>
                                            Tahun Akademik {yr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedSessionId && (
                            <button
                                type="button"
                                onClick={() => handleSelectSession('')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50  border border-slate-200 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Sesi</span>
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        {selectedSessionId ? (
                            <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-3 py-1.5  border border-indigo-200/60 font-medium">
                                <Check className="w-3.5 h-3.5 text-indigo-600" />
                                Sesi Aktif: <strong className="font-bold">{activeSession?.name}</strong>
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Pilih sesi untuk menampilkan instrumen borang</span>
                        )}
                    </div>
                </div>

                {/* ======================================================== */}
                {/* KONDISI 1: JIKA BELUM PILIH SESI (EMPTY STATE BERSIH)    */}
                {/* ======================================================== */}
                {!selectedSessionId ? (
                    <div className=" border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center  bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 mb-4 shadow-sm">
                            <Landmark className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1  bg-indigo-50 text-indigo-700 text-xs font-bold mb-2 border border-indigo-200/60">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pilih Sesi Akreditasi Institusi Terlebih Dahulu</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Tidak Ada Dokumen yang Ditampilkan
                        </h2>

                        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                            Instrumen Akreditasi BAN-PT dikelompokkan berdasarkan <strong>Sesi Akreditasi Perguruan Tinggi</strong> (contoh: Akreditasi 2020–2025 vs 2025–2030). Silakan tentukan Sesi Akreditasi melalui dropdown di atas atau klik salah satu kartu pilihan cepat di bawah ini untuk menampilkan pohon folder 4 kriteria dan eviden PPEPP.
                        </p>

                        {/* Quick Selection Cards Sesi Akreditasi */}
                        <div className="mt-8 pt-8 border-t border-slate-100 max-w-4xl mx-auto">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Atau Pilih Cepat Sesi Akreditasi Institusi Di Bawah Ini:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {sessionList.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleSelectSession(s.id)}
                                        className="group p-5  border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2.5">
                                                <span className="px-2 py-0.5  text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                                                    {s.year_start}–{s.year_end}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5  font-bold border ${s.status_badge}`}>
                                                    {s.status === 'active' ? 'Aktif' : s.status === 'completed' ? 'Selesai' : 'Persiapan'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">
                                                {s.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                {s.description}
                                            </p>

                                            <div className="mt-3 pt-2.5 border-t border-slate-200/50 text-[11px] text-slate-500 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span>Target Peringkat:</span>
                                                    <strong className="text-slate-700 font-bold">{s.target_rating}</strong>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Tahun Acuan TS:</span>
                                                    <strong className="text-indigo-600 font-bold">{s.ts_year}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-indigo-600 flex items-center justify-between">
                                            <span>Buka Borang BAN-PT &rarr;</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ======================================================== */
                    /* KONDISI 2: SESI DIPILIH (BANNER SESI & POHON FOLDER PPEPP) */
                    /* ======================================================== */
                    <div className="space-y-4 animate-fade-in">
                        {/* Panel Sesi Akreditasi BAN-PT Aktif */}
                        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6  shadow-md border border-indigo-800/40 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center  bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-inner">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5  text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                                Lembaga: BAN-PT (Standar Institusi / AIPT)
                                            </span>
                                            <span className="text-xs text-slate-300">• {activeSession?.univ_name}</span>
                                            <span className={`text-[10px] px-2 py-0.5  font-bold border ${
                                                activeSession?.status === 'active'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                                    : activeSession?.status === 'completed'
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                            }`}>
                                                {activeSession?.status_label}
                                            </span>
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                                            {activeSession?.name}
                                        </h2>
                                        <p className="text-xs text-slate-300 mt-0.5">
                                            {activeSession?.sk_number ? `Status / No. SK: ${activeSession.sk_number}` : activeSession?.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Statistik Cepat Sesi */}
                                <div className="flex items-center gap-2.5 text-xs flex-wrap">
                                    <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5  border border-white/10 text-indigo-100">
                                        <span>Tahun Acuan TS: </span>
                                        <strong className="text-white font-bold">{activeSession?.ts_year}</strong>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5  border border-white/10 text-indigo-100">
                                        <span>Target Peringkat: </span>
                                        <strong className="text-white font-bold">{activeSession?.target_rating}</strong>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5  border border-white/10 text-indigo-100">
                                        <span>Total: </span>
                                        <strong className="text-white font-bold">{totalAllActivities} Kegiatan</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-bar Informasi Sesi & Navigasi Cepat */}
                            <div className="pt-3 border-t border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <FileCheck2 className="w-4 h-4 text-indigo-400" />
                                    <span>
                                        Instrumen: <strong>4 Kriteria BAN-PT</strong> • Siklus Evaluasi PPEPP Lengkap
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Ganti Sesi Cepat:</span>
                                    {sessionList
                                        .filter((s) => s.id !== activeSession?.id)
                                        .map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => handleSelectSession(s.id)}
                                                className="px-2.5 py-1  bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition-colors text-[11px] font-semibold border border-white/10"
                                            >
                                                {s.year_start}–{s.year_end}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Daftar 4 Kriteria Standar BAN-PT */}
                        <div className="space-y-3">
                            {filteredCriterias.map((crit) => {
                                const isExpanded = expandedCrit === crit.id;
                                const activitiesCount = crit.activities?.length || 0;

                                return (
                                    <div
                                        key={crit.id}
                                        className={` bg-white border transition-all duration-200 overflow-hidden shadow-xs ${
                                            isExpanded ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Accordion Header Kriteria */}
                                        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between bg-white border-b border-slate-100/80">
                                            <button
                                                type="button"
                                                onClick={() => toggleCrit(crit.id)}
                                                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2"
                                            >
                                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center  bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
                                                    C{crit.code_criteria}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-1.5 py-0.2  text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                                            Kriteria {crit.code_criteria}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• BAN-PT Standar Institusi</span>
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
                                                    className="inline-flex items-center gap-1 px-2.5 py-1  text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Tambah Kegiatan</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCrit(crit.id)}
                                                    className="p-1 sm:p-1.5  text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                                                    theme="indigo"
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
                )}
            </div>

            {/* Modal Upload File ke Tahap PPEPP */}
            {uploadModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white  max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Upload File Eviden PPEPP
                                </h3>
                                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                                    {uploadModal.stageLabel}
                                </p>
                            </div>
                            <button
                                onClick={() => setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' })}
                                className="p-1 text-slate-400 hover:text-slate-600 "
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmUpload} className="mt-4 space-y-4">
                            <div className="p-3  bg-slate-50 border border-slate-200/80 text-xs">
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
                                    placeholder="Contoh: SK_Rektor_Penetapan_Standar_Mutu_Institusi.pdf"
                                    className="w-full px-3.5 py-2.5 text-sm  border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Bisa berupa format PDF, Word (.docx), Excel (.xlsx), atau link berkas.
                                </p>
                            </div>

                            {/* Dropzone Simulation */}
                            <div className="p-5 border-2 border-dashed border-indigo-200 hover:border-indigo-400  bg-indigo-50/30 text-center cursor-pointer transition-colors">
                                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-indigo-700">Pilih berkas dari komputer atau drag & drop</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Ukuran maksimal file 25 MB</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setUploadModal({ isOpen: false, critId: null, activityId: null, stageKey: null, stageLabel: null, activityTitle: '' })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100  transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700  shadow-md shadow-indigo-500/20 transition-all"
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
                    <div className="bg-white  max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Kegiatan / Folder Utama Institusi
                                </h3>
                                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                                    Kriteria {newActivityModal.critCode} • Sesi {activeSession?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null })}
                                className="p-1 text-slate-400 hover:text-slate-600 "
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
                                    placeholder="Contoh: Rapat Kerja Institusi Evaluasi Ketercapaian Renstra"
                                    className="w-full px-3.5 py-2.5 text-sm  border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Setelah dibuat, kegiatan akan otomatis memiliki 5 subfolder PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan).
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setNewActivityModal({ isOpen: false, critId: null, critCode: null })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100  transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700  shadow-md shadow-indigo-500/20 transition-all"
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
