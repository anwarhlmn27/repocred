import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import {
    Award,
    Filter,
    Search,
    RotateCcw,
    Download,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    AlertCircle,
    Eye,
    FolderOpen,
    ExternalLink,
    TrendingUp,
    ShieldCheck,
    Layers,
    Clock,
    FileCheck2,
    X,
    GraduationCap,
    Calendar,
    HelpCircle,
    UploadCloud
} from 'lucide-react';

// Definisi 5 Tahapan PPEPP
const PPEPP_STAGES_CONFIG = [
    {
        key: 'penetapan',
        code: 'P1',
        title: 'Penetapan',
        shortDesc: 'Standar, Pedoman, & SK Kebijakan',
        fullDesc: 'Dokumen penetapan standar SPMI, kebijakan mutu, manual mutu, pedoman akademik, dan surat keputusan legalitas pimpinan perguruan tinggi.',
        color: 'from-blue-600 to-indigo-600'
    },
    {
        key: 'pelaksanaan',
        code: 'P2',
        title: 'Pelaksanaan',
        shortDesc: 'Realisasi, Bukti Fisik, & Notulen',
        fullDesc: 'Dokumen pelaksanaan dan pemenuhan standar mutu, seperti laporan kegiatan, daftar hadir sosialisasi, notulen rapat, MOU/PKS, dan bukti luaran.',
        color: 'from-sky-600 to-blue-600'
    },
    {
        key: 'evaluasi',
        code: 'E',
        title: 'Evaluasi',
        shortDesc: 'Audit Mutu Internal & Survei',
        fullDesc: 'Dokumen evaluasi pelaksanaan standar mutu secara berkala, audit mutu internal (AMI), hasil survei kepuasan sivitas akademika, dan penilaian berkala.',
        color: 'from-amber-500 to-orange-500'
    },
    {
        key: 'pengendalian',
        code: 'P3',
        title: 'Pengendalian',
        shortDesc: 'Rapat Tinjauan Manajemen & Koreksi',
        fullDesc: 'Dokumen tindak lanjut hasil evaluasi dan audit, berita acara Rapat Tinjauan Manajemen (RTM), formulir koreksi temuan mutu, serta pencegahan.',
        color: 'from-purple-600 to-violet-600'
    },
    {
        key: 'peningkatan',
        code: 'P4',
        title: 'Peningkatan',
        shortDesc: 'Benchmarking & Peningkatan Standar',
        fullDesc: 'Dokumen penyesuaian standar baru yang lebih tinggi (kaizen), hasil benchmarking nasional/internasional, dan inovasi mutu berkelanjutan.',
        color: 'from-emerald-600 to-teal-600'
    }
];

// Mock Dokumen Default untuk Interaktivitas Modal Dialog Eviden
const DEFAULT_EVIDENCE_FILES = {
    '1-penetapan': [
        { id: 'f-101', name: 'SK_Rektor_Penetapan_VMTS_2025.pdf', size: '2.4 MB', date: '10 Jan 2025', activity: 'Penyusunan & Pengesahan VMTS Institusi', uploader: 'Admin LPM', verified: true },
        { id: 'f-102', name: 'Buku_Rencana_Strategis_2024_2029.pdf', size: '5.1 MB', date: '14 Jan 2025', activity: 'Penyusunan Dokumen Renstra', uploader: 'Biro Renbang', verified: true }
    ],
    '1-pelaksanaan': [
        { id: 'f-103', name: 'Notulen_Sosialisasi_VMTS_Dosen_Tendik.pdf', size: '1.2 MB', date: '02 Feb 2025', activity: 'Sosialisasi VMTS Kepada Sivitas Akademika', uploader: 'Sekretariat Dekanat', verified: true },
        { id: 'f-104', name: 'Daftar_Hadir_Sosialisasi_Mahasiswa.pdf', size: '890 KB', date: '04 Feb 2025', activity: 'Sosialisasi VMTS Mahasiswa Baru', uploader: 'BEM & DPM', verified: true },
        { id: 'f-105', name: 'Bukti_Publikasi_VMTS_Website_Banner.pdf', size: '3.6 MB', date: '10 Feb 2025', activity: 'Publikasi Media Informasi VMTS', uploader: 'Humas Kampus', verified: true },
        { id: 'f-106', name: 'Dokumentasi_Foto_Sosialisasi_Mitra.pdf', size: '4.1 MB', date: '18 Feb 2025', activity: 'Temu Mitra Industri dan Stakeholder', uploader: 'Pusat Karir & Kerjasama', verified: true }
    ],
    '1-evaluasi': [
        { id: 'f-107', name: 'Laporan_Survei_Pemahaman_VMTS_2025.pdf', size: '1.8 MB', date: '15 Mar 2025', activity: 'Survei Berkala Pemahaman Visi Misi', uploader: 'Lembaga Penjaminan Mutu (LPM)', verified: true }
    ],
    '1-pengendalian': [
        { id: 'f-108', name: 'Berita_Acara_RTM_Review_VMTS.pdf', size: '950 KB', date: '28 Mar 2025', activity: 'Rapat Tinjauan Manajemen Awal Semester', uploader: 'Ketua LPM', verified: true }
    ],
    '2-penetapan': [
        { id: 'f-201', name: 'Statuta_Perguruan_Tinggi_Final.pdf', size: '6.2 MB', date: '05 Jan 2025', activity: 'Pengesahan Tata Pamong & Statuta', uploader: 'Biro Hukum & Tata Kelola', verified: true }
    ],
    '2-pelaksanaan': [
        { id: 'f-202', name: 'Laporan_Kinerja_Kepemimpinan_2024.pdf', size: '3.4 MB', date: '12 Jan 2025', activity: 'Evaluasi Akuntabilitas Tata Pamong', uploader: 'Sekretariat Rektorat', verified: true },
        { id: 'f-203', name: 'MoU_Kerjasama_Industri_Google_AWS.pdf', size: '2.9 MB', date: '20 Jan 2025', activity: 'Kemitraan Strategis Dunia Usaha & Industri', uploader: 'Kantor Urusan Internasional', verified: true },
        { id: 'f-204', name: 'Sertifikat_Akreditasi_ISO_9001_2015.pdf', size: '1.1 MB', date: '25 Jan 2025', activity: 'Sertifikasi Sistem Manajemen Mutu', uploader: 'Admin LPM', verified: true }
    ],
    '3-penetapan': [
        { id: 'f-301', name: 'Pedoman_Penerimaan_Mahasiswa_Baru.pdf', size: '2.1 MB', date: '10 Feb 2025', activity: 'Penetapan Kebijakan SPMB', uploader: 'Panitia PMB', verified: true }
    ],
    '3-pelaksanaan': [
        { id: 'f-302', name: 'Laporan_Hasil_Seleksi_PMB_Gelombang_1.pdf', size: '3.0 MB', date: '22 Feb 2025', activity: 'Pelaksanaan Seleksi Calon Mahasiswa', uploader: 'Biro Akademik', verified: true },
        { id: 'f-303', name: 'Rekapitulasi_Prestasi_Mahasiswa_Nasional.pdf', size: '4.5 MB', date: '01 Mar 2025', activity: 'Pendampingan Lomba Kemahasiswaan', uploader: 'Kemahasiswaan', verified: true }
    ],
    '3-evaluasi': [
        { id: 'f-304', name: 'Survei_Kepuasan_Layanan_Mahasiswa.pdf', size: '1.5 MB', date: '15 Mar 2025', activity: 'Survei Layanan Bimbingan & Konseling', uploader: 'LPM', verified: true }
    ],
    '4-penetapan': [
        { id: 'f-401', name: 'Pedoman_Pengelolaan_SDM_Dosen_Tendik.pdf', size: '3.1 MB', date: '15 Jan 2025', activity: 'Penetapan Standar Kualifikasi Dosen', uploader: 'Biro Kepegawaian', verified: true }
    ],
    '4-pelaksanaan': [
        { id: 'f-402', name: 'Data_Dosen_Jabatan_Lektor_Kepala_GuruBesar.xlsx', size: '780 KB', date: '02 Feb 2025', activity: 'Pemutakhiran Sister BKD Dosen', uploader: 'Operator BKD', verified: true },
        { id: 'f-403', name: 'Laporan_Pelatihan_Pekerti_AppliedApproach.pdf', size: '2.7 MB', date: '18 Feb 2025', activity: 'Peningkatan Kompetensi Pedagogik', uploader: 'LP3M', verified: true }
    ],
    '4-evaluasi': [
        { id: 'f-404', name: 'Hasil_Audit_Beban_Kerja_Dosen_Ganjil.pdf', size: '1.9 MB', date: '05 Mar 2025', activity: 'Audit Mutu Internal Dosen', uploader: 'Auditor AMI', verified: true }
    ],
    '4-pengendalian': [
        { id: 'f-405', name: 'Surat_Peringatan_Dan_Tindaklanjut_BKD.pdf', size: '840 KB', date: '20 Mar 2025', activity: 'Tindak Lanjut Temuan Dosen Tidak Memenuhi BKD', uploader: 'Dekanat', verified: true }
    ],
    '4-peningkatan': [
        { id: 'f-406', name: 'Program_Akselerasi_Doktor_Luar_Negeri.pdf', size: '2.2 MB', date: '25 Mar 2025', activity: 'Peningkatan Kualifikasi Dosen S3', uploader: 'Wakil Rektor 1', verified: true }
    ]
};

// 9 Kriteria Lengkap LAM & BAN-PT dengan default data
const DEFAULT_INITIAL_DATA = {
    summary: {
        total_activities: 12,
        overall_completion: 68,
        completed_criteria: 4,
        total_criteria: 9
    },
    matrix_data: [
        {
            criteria_id: 1,
            criteria_code: 'K1',
            criteria_title: 'Visi, Misi, Tujuan dan Strategi',
            stages: {
                penetapan: { count: 2, status: 'complete' },
                pelaksanaan: { count: 4, status: 'complete' },
                evaluasi: { count: 1, status: 'complete' },
                pengendalian: { count: 1, status: 'complete' },
                peningkatan: { count: 0, status: 'empty' }
            },
            progress: 80
        },
        {
            criteria_id: 2,
            criteria_code: 'K2',
            criteria_title: 'Tata Kelola, Tata Pamong, dan Kerjasama',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 3, status: 'complete' },
                evaluasi: { count: 0, status: 'empty' },
                pengendalian: { count: 0, status: 'empty' },
                peningkatan: { count: 0, status: 'empty' }
            },
            progress: 40
        },
        {
            criteria_id: 3,
            criteria_code: 'K3',
            criteria_title: 'Mahasiswa',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 2, status: 'complete' },
                evaluasi: { count: 1, status: 'warning' },
                pengendalian: { count: 0, status: 'empty' },
                peningkatan: { count: 0, status: 'empty' }
            },
            progress: 50
        },
        {
            criteria_id: 4,
            criteria_code: 'K4',
            criteria_title: 'Sumber Daya Manusia',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 2, status: 'complete' },
                evaluasi: { count: 1, status: 'complete' },
                pengendalian: { count: 1, status: 'complete' },
                peningkatan: { count: 1, status: 'complete' }
            },
            progress: 100
        },
        {
            criteria_id: 5,
            criteria_code: 'K5',
            criteria_title: 'Keuangan, Sarana dan Prasarana',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 2, status: 'complete' },
                evaluasi: { count: 1, status: 'complete' },
                pengendalian: { count: 1, status: 'complete' },
                peningkatan: { count: 1, status: 'complete' }
            },
            progress: 100
        },
        {
            criteria_id: 6,
            criteria_code: 'K6',
            criteria_title: 'Pendidikan',
            stages: {
                penetapan: { count: 2, status: 'complete' },
                pelaksanaan: { count: 5, status: 'complete' },
                evaluasi: { count: 2, status: 'complete' },
                pengendalian: { count: 1, status: 'complete' },
                peningkatan: { count: 1, status: 'complete' }
            },
            progress: 100
        },
        {
            criteria_id: 7,
            criteria_code: 'K7',
            criteria_title: 'Penelitian',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 3, status: 'complete' },
                evaluasi: { count: 1, status: 'warning' },
                pengendalian: { count: 0, status: 'empty' },
                peningkatan: { count: 0, status: 'empty' }
            },
            progress: 50
        },
        {
            criteria_id: 8,
            criteria_code: 'K8',
            criteria_title: 'Pengabdian kepada Masyarakat (PkM)',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 2, status: 'complete' },
                evaluasi: { count: 0, status: 'empty' },
                pengendalian: { count: 0, status: 'empty' },
                peningkatan: { count: 0, status: 'empty' }
            },
            progress: 40
        },
        {
            criteria_id: 9,
            criteria_code: 'K9',
            criteria_title: 'Luaran dan Capaian Tridharma',
            stages: {
                penetapan: { count: 1, status: 'complete' },
                pelaksanaan: { count: 2, status: 'complete' },
                evaluasi: { count: 1, status: 'complete' },
                pengendalian: { count: 1, status: 'complete' },
                peningkatan: { count: 1, status: 'complete' }
            },
            progress: 100
        }
    ]
};

export default function MatriksPpeppIndex({
    summary: propSummary,
    matrix_data: propMatrixData,
    agencies: propAgencies,
    prodis: propProdis,
    academic_years: propAcademicYears,
}) {
    // State Filter
    const [selectedAgency, setSelectedAgency] = useState('LAM-INFOKOM');
    const [selectedProdi, setSelectedProdi] = useState('55201');
    const [selectedYear, setSelectedYear] = useState('2025/2026');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data State
    const summaryData = propSummary || DEFAULT_INITIAL_DATA.summary;
    const matrixData = propMatrixData || DEFAULT_INITIAL_DATA.matrix_data;

    // Modal Detail Eviden PPEPP State
    const [selectedCell, setSelectedCell] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // List Pilihan Filter
    const agencyOptions = propAgencies || [
        { code: 'LAM-INFOKOM', name: 'LAM-INFOKOM (Informatika & Komputer)' },
        { code: 'BAN-PT', name: 'BAN-PT (Nasional)' },
        { code: 'LAM-TEKNIK', name: 'LAM-TEKNIK (Keteknikan)' },
        { code: 'LAM-EMBA', name: 'LAM-EMBA (Ekonomi, Bisnis & Akuntansi)' }
    ];

    const prodiOptions = propProdis || [
        { code: '55201', name: 'S1 Teknik Informatika', faculty: 'Fakultas Ilmu Komputer' },
        { code: '57201', name: 'S1 Sistem Informasi', faculty: 'Fakultas Ilmu Komputer' },
        { code: '61201', name: 'S1 Manajemen', faculty: 'Fakultas Ekonomi dan Bisnis' },
        { code: 'all', name: 'Semua Program Studi (Universitas)', faculty: 'Universitas' }
    ];

    const yearOptions = propAcademicYears || [
        '2025/2026',
        '2024/2025',
        '2023/2024',
        '2022/2023'
    ];

    // Filter Logic
    const filteredRows = useMemo(() => {
        return matrixData.filter((item) => {
            const matchesSearch =
                item.criteria_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.criteria_title.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === 'complete') {
                return item.progress === 100;
            } else if (statusFilter === 'incomplete') {
                return item.progress < 100;
            } else if (statusFilter === 'warning') {
                const hasWarning = Object.values(item.stages).some(
                    (s) => s.status === 'warning' || (s.count === 0 && item.progress > 0)
                );
                return hasWarning;
            }

            return true;
        });
    }, [matrixData, searchQuery, statusFilter]);

    // Handler klik sel matriks
    const handleCellClick = (criteria, stageKey) => {
        const stageConfig = PPEPP_STAGES_CONFIG.find((s) => s.key === stageKey);
        const cellData = criteria.stages[stageKey] || { count: 0, status: 'empty' };

        const keyLookup = `${criteria.criteria_id}-${stageKey}`;
        const files = DEFAULT_EVIDENCE_FILES[keyLookup] || [];

        setSelectedCell({
            criteria,
            stageKey,
            stageConfig,
            cellData,
            files
        });
        setIsModalOpen(true);
    };

    const handleResetFilter = () => {
        setSelectedAgency('LAM-INFOKOM');
        setSelectedProdi('55201');
        setSelectedYear('2025/2026');
        setSearchQuery('');
        setStatusFilter('all');
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Matriks Kelengkapan PPEPP - Repository Akreditasi" />

            <div className="space-y-4 pb-10">
                {/* Toast Notification (], smaller font) */}
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 ] bg-slate-900 px-3.5 py-2 text-[11px] font-medium text-white shadow-lg transition-all">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────
                    1. Header & Deskripsi Halaman (Font turun 4px, border radius 2px)
                ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 ] bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-600/20">
                                <ShieldCheck className="h-3 w-3" />
                                Monitoring Penjaminan Mutu SPMI
                            </span>
                            <span className="] bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
                                Real-time Aggregation
                            </span>
                        </div>
                        <h1 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                            Matriks Kelengkapan PPEPP
                        </h1>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                            Dashboard pemantauan keterisian bukti fisik dan eviden 5 siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) per kriteria akreditasi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 ] border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                        >
                            <FileText className="h-3.5 w-3.5 text-slate-500" />
                            Cetak Laporan
                        </button>
                        <button
                            onClick={() => showToast('Mengekspor data matriks PPEPP ke Excel (.xlsx)...')}
                            className="inline-flex items-center gap-1.5 ] border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            Export Excel
                        </button>
                        <Link
                            href="/kegiatan"
                            className="inline-flex items-center gap-1.5 ] bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                        >
                            <UploadCloud className="h-3.5 w-3.5" />
                            Kelola Kegiatan
                        </Link>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    2. Summary Cards (], fonts reduced 4px)
                ────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Kegiatan Terdaftar */}
                    <div className="relative overflow-hidden ] border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Kegiatan Terdaftar
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center ] bg-blue-50 text-blue-600">
                                <Layers className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[22px] font-extrabold text-slate-900 leading-none">
                                {summaryData.total_activities}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Kegiatan Tridharma</span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-600 flex items-center gap-1">
                            <span className="text-emerald-600 font-semibold inline-flex items-center">
                                Terverifikasi
                            </span>
                            <span>dari semua kriteria akreditasi</span>
                        </p>
                    </div>

                    {/* Card 2: Overall Completion Rate (%) */}
                    <div className="relative overflow-hidden ] border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Kelengkapan PPEPP
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center ] bg-emerald-50 text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[22px] font-extrabold text-slate-900 leading-none">
                                {summaryData.overall_completion}%
                            </span>
                            <span className="inline-flex items-center ] bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700">
                                Cukup Baik
                            </span>
                        </div>
                        <div className="mt-2.5 w-full bg-slate-100 ] h-1.5 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-1.5 ] transition-all duration-700"
                                style={{ width: `${summaryData.overall_completion}%` }}
                            />
                        </div>
                    </div>

                    {/* Card 3: Kriteria Terpenuhi vs Belum Lengkap */}
                    <div className="relative overflow-hidden ] border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Status Kriteria
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center ] bg-indigo-50 text-indigo-600">
                                <FileCheck2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-[22px] font-extrabold text-slate-900 leading-none">
                                {summaryData.completed_criteria}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                                / {summaryData.total_criteria} Kriteria Lengkap
                            </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                            <span className="text-emerald-700 font-medium">
                                {summaryData.completed_criteria} Terpenuhi (100%)
                            </span>
                            <span className="text-amber-600 font-medium">
                                {summaryData.total_criteria - summaryData.completed_criteria} Perlu Dilengkapi
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Lembaga & Tahun Aktif */}
                    <div className="relative overflow-hidden ] border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Fokus Instrumen
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center ] bg-purple-50 text-purple-600">
                                <Award className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5">
                            <span className="text-[14px] font-bold text-slate-900 block truncate">
                                {selectedAgency}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                Tahun Akademik {selectedYear}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-purple-700 font-medium">
                            Basis 9 Kriteria Akreditasi OBE
                        </p>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    3. Filter Bar & Search Box (])
                ────────────────────────────────────────────────────────── */}
                <div className="] border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 flex-1">
                            {/* Lembaga Akreditasi */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Award className="h-3 w-3 text-blue-600" />
                                    Lembaga Akreditasi
                                </label>
                                <select
                                    value={selectedAgency}
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                    className="w-full ] border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                >
                                    {agencyOptions.map((agency) => (
                                        <option key={agency.code} value={agency.code}>
                                            {agency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Program Studi (Akses Super Admin / LPM) */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3 text-blue-600" />
                                        Program Studi
                                    </span>
                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 ]">
                                        LPM / Admin
                                    </span>
                                </label>
                                <select
                                    value={selectedProdi}
                                    onChange={(e) => setSelectedProdi(e.target.value)}
                                    className="w-full ] border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                >
                                    {prodiOptions.map((prodi) => (
                                        <option key={prodi.code} value={prodi.code}>
                                            {prodi.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tahun Akademik */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-blue-600" />
                                    Tahun Akademik
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full ] border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                >
                                    {yearOptions.map((yr) => (
                                        <option key={yr} value={yr}>
                                            {yr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search & Reset */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 lg:pt-0">
                            <div className="relative w-full sm:w-60">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kode atau nama kriteria..."
                                    className="w-full ] border border-slate-300 bg-slate-50/50 pl-8 pr-7 py-1.5 text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleResetFilter}
                                title="Reset Filter"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1 ] border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                                <RotateCcw className="h-3 w-3 text-slate-500" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Status Pill Filters (]) */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[10px]">
                        <span className="font-semibold text-slate-500 mr-1">Filter Status:</span>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`] px-2.5 py-0.5 font-medium transition-colors ${
                                statusFilter === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Kriteria ({matrixData.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('complete')}
                            className={`] px-2.5 py-0.5 font-medium transition-colors ${
                                statusFilter === 'complete'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Lengkap 100% ({matrixData.filter((i) => i.progress === 100).length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('incomplete')}
                            className={`] px-2.5 py-0.5 font-medium transition-colors ${
                                statusFilter === 'incomplete'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            Belum Lengkap ({matrixData.filter((i) => i.progress < 100).length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('warning')}
                            className={`] px-2.5 py-0.5 font-medium transition-colors ${
                                statusFilter === 'warning'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            Ada Tahap Kosong / Draft
                        </button>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    4. Tabel Matriks Utama (])
                ────────────────────────────────────────────────────────── */}
                <div className="] border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                            <h2 className="text-xs font-bold text-slate-800">
                                Matriks Evaluasi Siklus Mutu PPEPP Berkelanjutan
                            </h2>
                        </div>
                        <span className="text-[10px] text-slate-500">
                            Menampilkan <strong className="text-slate-800">{filteredRows.length}</strong> dari {matrixData.length} kriteria
                        </span>
                    </div>

                    {/* Responsive Container Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700">
                                    <th className="sticky left-0 z-10 bg-slate-100/95 backdrop-blur-2xs py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] min-w-[260px] max-w-[320px]">
                                        Kriteria Akreditasi
                                    </th>
                                    {PPEPP_STAGES_CONFIG.map((stage) => (
                                        <th
                                            key={stage.key}
                                            className="py-2.5 px-2 font-bold uppercase tracking-wider text-[10px] text-center min-w-[110px]"
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-900 font-extrabold">{stage.title}</span>
                                                <span className="text-[9px] font-semibold text-blue-700 bg-blue-100/70 px-1 py-0.2 ] mt-0.5">
                                                    {stage.code}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center min-w-[130px]">
                                        Kelengkapan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500">
                                            <AlertCircle className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
                                            <p className="font-semibold text-slate-700 text-xs">Tidak ada data kriteria yang sesuai</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                                            <button
                                                onClick={handleResetFilter}
                                                className="mt-2.5 inline-flex items-center gap-1 ] border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset Filter
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => (
                                        <tr
                                            key={row.criteria_id}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            {/* Kolom 1: Kode & Nama Kriteria (Sticky Left) */}
                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/40 py-2.5 px-3 border-r border-slate-200">
                                                <div className="flex items-start gap-2">
                                                    <span className="inline-flex shrink-0 items-center justify-center h-5 w-7 ] bg-slate-100 font-bold text-slate-800 text-[10px] border border-slate-200">
                                                        {row.criteria_code}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-[11px] leading-snug">
                                                            {row.criteria_title}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            Kriteria {row.criteria_id} • Standar Mutu SPMI
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kolom 2-6: Sel Tahapan PPEPP (]) */}
                                            {PPEPP_STAGES_CONFIG.map((stage) => {
                                                const cell = row.stages[stage.key] || { count: 0, status: 'empty' };
                                                const isComplete = cell.status === 'complete' && cell.count > 0;
                                                const isWarning = cell.status === 'warning';
                                                const isEmpty = cell.status === 'empty' || cell.count === 0;

                                                return (
                                                    <td
                                                        key={stage.key}
                                                        className="py-2 px-1.5 text-center align-middle"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCellClick(row, stage.key)}
                                                            className={`w-full group/btn relative inline-flex items-center justify-center gap-1 ] px-2 py-1.5 text-[10px] font-semibold transition-all duration-150 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs ${
                                                                isComplete
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                                    : isWarning
                                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                                    : 'bg-rose-50/70 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                                            }`}
                                                            title={`Klik untuk melihat detail dokumen eviden ${stage.title} pada ${row.criteria_code}`}
                                                        >
                                                            {isComplete && (
                                                                <>
                                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                                                    <span>{cell.count} File</span>
                                                                </>
                                                            )}
                                                            {isWarning && (
                                                                <>
                                                                    <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                                                                    <span>{cell.count} Draft</span>
                                                                </>
                                                            )}
                                                            {isEmpty && (
                                                                <>
                                                                    <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                                                                    <span className="font-medium text-rose-600">0 File</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                );
                                            })}

                                            {/* Kolom 7: Progres Bar (%) */}
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex w-full items-center justify-between text-[10px] font-bold">
                                                        <span
                                                            className={
                                                                row.progress === 100
                                                                    ? 'text-emerald-700'
                                                                    : row.progress >= 60
                                                                    ? 'text-blue-700'
                                                                    : 'text-amber-700'
                                                            }
                                                        >
                                                            {row.progress}%
                                                        </span>
                                                        <span className="text-[9px] font-semibold text-slate-500">
                                                            {row.progress === 100 ? 'Lengkap' : `${Math.round((row.progress / 100) * 5)}/5 Tahap`}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 ] h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-1.5 ] transition-all duration-500 ${
                                                                row.progress === 100
                                                                    ? 'bg-emerald-500'
                                                                    : row.progress >= 60
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${row.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer Summary Bar */}
                    <div className="border-t border-slate-200 bg-slate-50/90 px-4 py-2.5 text-[10px] text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">Keterangan Indikator Sel:</span>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2  bg-emerald-500" />
                                    <span>Ada Dokumen Lengkap (Hijau)</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2  bg-amber-500" />
                                    <span>Draft / Butuh Perhatian (Kuning)</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2  bg-rose-500" />
                                    <span>Kosong / Belum Diunggah (Merah)</span>
                                </span>
                            </div>
                        </div>

                        <div className="text-slate-500 font-medium">
                            * Klik salah satu sel badge untuk membuka dokumen eviden & link kelola kegiatan
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    5. Kartu Penjelasan Siklus PPEPP (])
                ────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                    {PPEPP_STAGES_CONFIG.map((stage, idx) => (
                        <div
                            key={stage.key}
                            className="] border border-slate-200 bg-white p-3 shadow-2xs"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex h-5 w-5 items-center justify-center ] bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                    {stage.code}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    Tahap {idx + 1}
                                </span>
                            </div>
                            <h3 className="mt-1.5 text-[11px] font-bold text-slate-900">
                                {stage.title}
                            </h3>
                            <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed">
                                {stage.shortDesc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                6. Modal Dialog Interaktif: Daftar File Eviden Mutu PPEPP (])
            ────────────────────────────────────────────────────────── */}
            {isModalOpen && selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-2xs transition-opacity animate-fade-in">
                    <div className="relative w-full max-w-xl transform overflow-hidden ] bg-white shadow-2xl transition-all border border-slate-200">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="] bg-blue-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-800">
                                        {selectedCell.criteria.criteria_code}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500">
                                        {selectedCell.criteria.criteria_title}
                                    </span>
                                </div>
                                <h3 className="mt-1 text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>Dokumen Tahap {selectedCell.stageConfig.title}</span>
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 ]">
                                        {selectedCell.stageConfig.code}
                                    </span>
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="] p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Deskripsi Tahap PPEPP */}
                        <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-2.5 text-[10px] text-blue-900 flex items-start gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Panduan Tahap {selectedCell.stageConfig.title}:</strong> {selectedCell.stageConfig.fullDesc}
                            </p>
                        </div>

                        {/* Modal Body: Daftar Dokumen */}
                        <div className="max-h-[340px] overflow-y-auto px-5 py-3 space-y-2.5">
                            {selectedCell.files.length === 0 ? (
                                <div className="py-6 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center ] bg-rose-50 text-rose-500">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h4 className="mt-2 text-xs font-bold text-slate-800">
                                        Belum Ada Dokumen Eviden
                                    </h4>
                                    <p className="mt-1 text-[10px] text-slate-500 max-w-sm mx-auto">
                                        Tahap <span className="font-semibold text-slate-700">{selectedCell.stageConfig.title} ({selectedCell.stageConfig.code})</span> pada kriteria ini masih kosong. Silakan unggah berkas bukti fisik melalui menu Kegiatan & Eviden.
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href="/kegiatan"
                                            className="inline-flex items-center gap-1.5 ] bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                                        >
                                            <UploadCloud className="h-3.5 w-3.5" />
                                            Unggah Dokumen Eviden Sekarang
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                                        <span>Daftar Berkas Eviden Terunggah ({selectedCell.files.length} file)</span>
                                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Terverifikasi SPMI
                                        </span>
                                    </div>

                                    {selectedCell.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ] border border-slate-200 bg-slate-50/50 p-2.5 hover:bg-white hover:border-blue-200 hover:shadow-2xs transition-all"
                                        >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center ] bg-red-100 text-red-700 font-bold text-[10px]">
                                                    PDF
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[10px] text-blue-700 font-medium mt-0.5 truncate">
                                                        Kegiatan: {file.activity}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5">
                                                        <span>Ukuran: {file.size}</span>
                                                        <span>•</span>
                                                        <span>Tanggal: {file.date}</span>
                                                        <span>•</span>
                                                        <span className="text-slate-600">Oleh: {file.uploader}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                <button
                                                    onClick={() => showToast(`Membuka pratinjau ${file.name}...`)}
                                                    className="inline-flex items-center gap-1 ] border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                    title="Pratinjau Dokumen"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => showToast(`Mengunduh file ${file.name}...`)}
                                                    className="inline-flex items-center gap-1 ] border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                                    title="Unduh Berkas"
                                                >
                                                    <Download className="h-3 w-3" />
                                                    Unduh
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-2.5">
                            <span className="text-[10px] text-slate-500">
                                Terhubung langsung ke modul Kegiatan & Dokumen Akreditasi
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href="/akreditasi/lam"
                                    className="inline-flex items-center gap-1 ] border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3 text-slate-500" />
                                    Buka Halaman Pohon Eviden
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="] bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
