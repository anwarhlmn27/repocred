import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
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
    UploadCloud,
    Printer
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

export default function MatriksPpeppIndex({
    summary: propSummary,
    matrix_data: propMatrixData = [],
    evidence_files: propEvidenceFiles = {},
    agencies: propAgencies = [],
    prodis: propProdis = [],
    academic_years: propAcademicYears = [],
    filters = {},
}) {
    // State Filter
    const [selectedAgency, setSelectedAgency] = useState(filters.agency || 'LAM-INFOKOM');
    const [selectedProdi, setSelectedProdi] = useState(filters.prodi_id || '');
    const [selectedYear, setSelectedYear] = useState(filters.academic_year || '2025');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal Detail Eviden PPEPP State
    const [selectedCell, setSelectedCell] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // List Pilihan Filter
    const agencyOptions = useMemo(() => {
        if (propAgencies.length > 0) return propAgencies;
        return [
            { code: 'LAM-INFOKOM', name: 'LAM-INFOKOM (Informatika & Komputer)' },
            { code: 'BAN-PT', name: 'BAN-PT (Nasional)' },
            { code: 'LAMEMBA', name: 'LAMEMBA (Ekonomi, Bisnis & Akuntansi)' }
        ];
    }, [propAgencies]);

    const prodiOptions = useMemo(() => {
        if (propProdis.length > 0) return propProdis;
        return [
            { id: 'ti', code: '55201', name: 'S1 Teknik Informatika', faculty: 'Fakultas Ilmu Komputer' },
            { id: 'si', code: '57201', name: 'S1 Sistem Informasi', faculty: 'Fakultas Ilmu Komputer' },
            { id: 'mnj', code: '61201', name: 'S1 Manajemen', faculty: 'Fakultas Ekonomi dan Bisnis' }
        ];
    }, [propProdis]);

    const yearOptions = useMemo(() => {
        if (propAcademicYears.length > 0) return propAcademicYears;
        return [
            { id: '1', year: '2025', label: '2025/2026' },
            { id: '2', year: '2024', label: '2024/2025' },
            { id: '3', year: '2023', label: '2023/2024' },
            { id: '4', year: '2022', label: '2022/2023' }
        ];
    }, [propAcademicYears]);

    // Data Summary
    const summaryData = useMemo(() => {
        if (propSummary && propSummary.total_criteria > 0) return propSummary;
        const totalCriteria = propMatrixData.length || 9;
        const totalActivities = propMatrixData.reduce((acc, row) => acc + (row.activities_count || 0), 0);
        const completedCriteria = propMatrixData.filter((row) => row.progress === 100).length;
        const avgProgress = totalCriteria > 0
            ? Math.round(propMatrixData.reduce((acc, row) => acc + (row.progress || 0), 0) / totalCriteria)
            : 0;

        return {
            total_activities: totalActivities,
            overall_completion: avgProgress,
            completed_criteria: completedCriteria,
            total_criteria: totalCriteria
        };
    }, [propSummary, propMatrixData]);

    const matrixData = propMatrixData;

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

    // Handle filter perubahan
    const handleFilterChange = (newAgency, newProdi, newYear) => {
        router.get(
            route('akreditasi.matriks-ppepp'),
            {
                agency: newAgency !== undefined ? newAgency : selectedAgency,
                prodi_id: newProdi !== undefined ? newProdi : selectedProdi,
                academic_year: newYear !== undefined ? newYear : selectedYear,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    // Handler klik sel matriks
    const handleCellClick = (criteria, stageKey) => {
        const stageConfig = PPEPP_STAGES_CONFIG.find((s) => s.key === stageKey);
        const cellData = criteria.stages[stageKey] || { count: 0, status: 'empty' };

        const keyLookup = `${criteria.criteria_id}-${stageKey}`;
        const files = propEvidenceFiles[keyLookup] || [];

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
        setSearchQuery('');
        setStatusFilter('all');
        const defaultAg = agencyOptions[0]?.code || 'LAM-INFOKOM';
        const defaultPr = prodiOptions[0]?.id || '';
        const defaultYr = yearOptions[0]?.year || '2025';

        setSelectedAgency(defaultAg);
        setSelectedProdi(defaultPr);
        setSelectedYear(defaultYr);

        router.get(route('akreditasi.matriks-ppepp'), {}, { preserveScroll: true });
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Export CSV data matriks
    const handleExportCsv = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Kode,Kriteria,Penetapan (P1),Pelaksanaan (P2),Evaluasi (E),Pengendalian (P3),Peningkatan (P4),Kelengkapan (%)\n';

        matrixData.forEach((row) => {
            const rowData = [
                `"${row.criteria_code}"`,
                `"${row.criteria_title}"`,
                row.stages.penetapan?.count || 0,
                row.stages.pelaksanaan?.count || 0,
                row.stages.evaluasi?.count || 0,
                row.stages.pengendalian?.count || 0,
                row.stages.peningkatan?.count || 0,
                `${row.progress}%`
            ];
            csvContent += rowData.join(',') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Matriks_PPEPP_${selectedAgency}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Data matriks kelengkapan PPEPP berhasil diekspor ke CSV.');
    };

    // Cari label tahun aktif
    const activeYearLabel = useMemo(() => {
        const found = yearOptions.find((y) => String(y.year) === String(selectedYear));
        return found ? found.label : selectedYear;
    }, [yearOptions, selectedYear]);

    return (
        <AuthenticatedLayout>
            <Head title="Matriks Kelengkapan PPEPP - Repositori Akreditasi" />

            <div className="space-y-4 pb-10">
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-lg transition-all border border-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────
                    1. Header & Deskripsi Halaman
                ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 uppercase tracking-wide">
                                <ShieldCheck className="h-3 w-3" />
                                Monitoring Penjaminan Mutu SPMI
                            </span>
                            <span className="bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                                Real-time Aggregation
                            </span>
                        </div>
                        <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                            Matriks Kelengkapan PPEPP
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500 max-w-3xl leading-relaxed">
                            Dashboard pemantauan keterisian bukti fisik dan eviden 5 siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) per kriteria akreditasi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                            <span>Cetak Laporan</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Export Excel</span>
                        </button>
                        <Link
                            href="/kegiatan"
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                        >
                            <UploadCloud className="h-3.5 w-3.5" />
                            <span>Kelola Kegiatan</span>
                        </Link>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    2. Summary Cards (4 Kartu KPI)
                ────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Kegiatan Terdaftar */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Kegiatan Terdaftar
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
                                <Layers className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-800 leading-none">
                                {summaryData.total_activities}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">Kegiatan Tridharma</span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="text-emerald-600 font-bold inline-flex items-center">
                                Terverifikasi
                            </span>
                            <span>dari semua kriteria akreditasi</span>
                        </p>
                    </div>

                    {/* Card 2: Overall Completion Rate (%) */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Kelengkapan PPEPP
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-800 leading-none">
                                {summaryData.overall_completion}%
                            </span>
                            <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold border border-emerald-300">
                                {summaryData.overall_completion >= 80 ? 'Sangat Baik' : summaryData.overall_completion >= 60 ? 'Cukup Baik' : 'Perlu Peningkatan'}
                            </span>
                        </div>
                        <div className="mt-2.5 w-full bg-slate-100 h-1.5 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-1.5 transition-all duration-700"
                                style={{ width: `${summaryData.overall_completion}%` }}
                            />
                        </div>
                    </div>

                    {/* Card 3: Kriteria Terpenuhi vs Belum Lengkap */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Status Kriteria
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-200">
                                <FileCheck2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-slate-800 leading-none">
                                {summaryData.completed_criteria}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                / {summaryData.total_criteria} Kriteria Lengkap
                            </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                            <span className="text-emerald-700 font-bold">
                                {summaryData.completed_criteria} Terpenuhi (100%)
                            </span>
                            <span className="text-amber-600 font-bold">
                                {summaryData.total_criteria - summaryData.completed_criteria} Perlu Dilengkapi
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Lembaga & Tahun Aktif */}
                    <div className="border border-slate-200 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Fokus Instrumen
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center bg-purple-50 text-purple-600 border border-purple-200">
                                <Award className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2.5">
                            <span className="text-sm font-black text-slate-800 block truncate">
                                {selectedAgency}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                Tahun Akademik {activeYearLabel}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-purple-700 font-bold">
                            Basis {summaryData.total_criteria} Kriteria Akreditasi
                        </p>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    3. Filter Bar & Search Box (Gambar 2 Format)
                ────────────────────────────────────────────────────────── */}
                <div className="border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 flex-1">
                            {/* Lembaga Akreditasi */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1 uppercase tracking-wide">
                                    <Award className="h-3.5 w-3.5 text-blue-600" />
                                    Lembaga Akreditasi
                                </label>
                                <select
                                    value={selectedAgency}
                                    onChange={(e) => {
                                        setSelectedAgency(e.target.value);
                                        handleFilterChange(e.target.value, selectedProdi, selectedYear);
                                    }}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 transition-all cursor-pointer shadow-xs"
                                >
                                    {agencyOptions.map((agency) => (
                                        <option key={agency.code} value={agency.code}>
                                            {agency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Program Studi */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between uppercase tracking-wide">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                                        Program Studi
                                    </span>
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2">
                                        LPM / Admin
                                    </span>
                                </label>
                                <select
                                    value={selectedProdi}
                                    onChange={(e) => {
                                        setSelectedProdi(e.target.value);
                                        handleFilterChange(selectedAgency, e.target.value, selectedYear);
                                    }}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 transition-all cursor-pointer shadow-xs"
                                >
                                    <option value="">Semua Program Studi (Universitas)</option>
                                    {prodiOptions.map((prodi) => (
                                        <option key={prodi.id} value={prodi.id}>
                                            {prodi.name} [{prodi.faculty}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tahun Akademik */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1 uppercase tracking-wide">
                                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                    Tahun Akademik
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        handleFilterChange(selectedAgency, selectedProdi, e.target.value);
                                    }}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 transition-all cursor-pointer shadow-xs"
                                >
                                    <option value="all">Semua Tahun</option>
                                    {yearOptions.map((yr) => (
                                        <option key={yr.id || yr.year} value={yr.year}>
                                            {yr.label || yr.year}
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
                                    className="w-full border border-slate-300 bg-slate-50/50 pl-8 pr-7 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleResetFilter}
                                title="Reset Filter"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Pill Filters */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs">
                        <span className="font-bold text-slate-500 mr-1">Filter Status:</span>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-2.5 py-1 font-semibold text-xs transition-colors cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Kriteria ({matrixData.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('complete')}
                            className={`px-2.5 py-1 font-semibold text-xs transition-colors cursor-pointer ${
                                statusFilter === 'complete'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Lengkap 100% ({matrixData.filter((i) => i.progress === 100).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('incomplete')}
                            className={`px-2.5 py-1 font-semibold text-xs transition-colors cursor-pointer ${
                                statusFilter === 'incomplete'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            Belum Lengkap ({matrixData.filter((i) => i.progress < 100).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('warning')}
                            className={`px-2.5 py-1 font-semibold text-xs transition-colors cursor-pointer ${
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
                    4. Tabel Matriks Utama
                ────────────────────────────────────────────────────────── */}
                <div className="border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                                Matriks Evaluasi Siklus Mutu PPEPP Berkelanjutan
                            </h2>
                        </div>
                        <span className="text-xs text-slate-500">
                            Menampilkan <strong className="text-slate-800">{filteredRows.length}</strong> dari {matrixData.length} kriteria
                        </span>
                    </div>

                    {/* Responsive Container Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="sticky left-0 z-10 bg-slate-100 py-3 px-3 min-w-[260px] max-w-[320px]">
                                        Kriteria Akreditasi
                                    </th>
                                    {PPEPP_STAGES_CONFIG.map((stage) => (
                                        <th
                                            key={stage.key}
                                            className="py-3 px-2 text-center min-w-[110px]"
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-900 font-extrabold">{stage.title}</span>
                                                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1 py-0.2 mt-0.5 border border-blue-200">
                                                    {stage.code}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="py-3 px-3 text-center min-w-[130px]">
                                        Kelengkapan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500">
                                            <AlertCircle className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
                                            <p className="font-bold text-slate-700 text-xs">Tidak ada data kriteria yang sesuai</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                                            <button
                                                type="button"
                                                onClick={handleResetFilter}
                                                className="mt-2.5 inline-flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Reset Filter</span>
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
                                                    <span className="inline-flex shrink-0 items-center justify-center h-5 w-7 bg-slate-100 font-bold text-slate-800 text-[10px] border border-slate-200">
                                                        {row.criteria_code}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-xs leading-snug">
                                                            {row.criteria_title}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            Kriteria {row.criteria_sequence || row.criteria_id} • Standar Mutu SPMI
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kolom 2-6: Sel Tahapan PPEPP */}
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
                                                            className={`w-full group/btn relative inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer ${
                                                                isComplete
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                                    : isWarning
                                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
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
                                                    <div className="flex w-full items-center justify-between text-xs font-bold">
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
                                                        <span className="text-[10px] font-semibold text-slate-500">
                                                            {row.progress === 100 ? 'Lengkap' : `${Math.round((row.progress / 100) * 5)}/5 Tahap`}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-1.5 transition-all duration-500 ${
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
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Keterangan Indikator Sel:</span>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 bg-emerald-500 inline-block" />
                                    <span>Ada Dokumen Lengkap (Hijau)</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 bg-amber-500 inline-block" />
                                    <span>Draft / Butuh Perhatian (Kuning)</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-2 w-2 bg-rose-500 inline-block" />
                                    <span>Kosong / Belum Diunggah (Merah)</span>
                                </span>
                            </div>
                        </div>

                        <div className="text-slate-500 text-[11px]">
                            * Klik salah satu sel untuk melihat detail file eviden atau menambah kegiatan
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    5. Kartu Penjelasan Siklus PPEPP
                ────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                    {PPEPP_STAGES_CONFIG.map((stage, idx) => (
                        <div
                            key={stage.key}
                            className="border border-slate-200 bg-white p-3 shadow-xs"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex h-5 w-5 items-center justify-center bg-blue-100 text-blue-800 font-extrabold text-[10px] border border-blue-200">
                                    {stage.code}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Tahap {idx + 1}
                                </span>
                            </div>
                            <h3 className="mt-1.5 text-xs font-bold text-slate-900">
                                {stage.title}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                                {stage.shortDesc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                6. Modal Dialog Interaktif: Daftar File Eviden Mutu PPEPP
            ────────────────────────────────────────────────────────── */}
            {isModalOpen && selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity animate-fade-in">
                    <div className="relative w-full max-w-xl bg-white shadow-2xl transition-all border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-blue-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-800 border border-blue-200">
                                        {selectedCell.criteria.criteria_code}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {selectedCell.criteria.criteria_title}
                                    </span>
                                </div>
                                <h3 className="mt-1 text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>Dokumen Tahap {selectedCell.stageConfig.title}</span>
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2">
                                        {selectedCell.stageConfig.code}
                                    </span>
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Deskripsi Tahap PPEPP */}
                        <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-2.5 text-xs text-blue-900 flex items-start gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Panduan Tahap {selectedCell.stageConfig.title}:</strong> {selectedCell.stageConfig.fullDesc}
                            </p>
                        </div>

                        {/* Modal Body: Daftar Dokumen */}
                        <div className="max-h-[340px] overflow-y-auto px-5 py-3.5 space-y-2.5">
                            {selectedCell.files.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center bg-rose-50 text-rose-500 border border-rose-200 mb-2">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">
                                        Belum Ada Dokumen Eviden
                                    </h4>
                                    <p className="mt-1 text-[11px] text-slate-500 max-w-sm mx-auto">
                                        Tahap <span className="font-semibold text-slate-700">{selectedCell.stageConfig.title} ({selectedCell.stageConfig.code})</span> pada kriteria ini masih kosong. Silakan unggah berkas bukti fisik melalui modul Kegiatan & Dokumen.
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href={route('akreditasi.lam')}
                                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                                        >
                                            <UploadCloud className="h-3.5 w-3.5" />
                                            <span>Unggah Dokumen Eviden Sekarang</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                                        <span>Daftar Berkas Eviden Terunggah ({selectedCell.files.length} file)</span>
                                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Terverifikasi SPMI
                                        </span>
                                    </div>

                                    {selectedCell.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border border-slate-200 bg-slate-50/50 p-2.5 hover:bg-white hover:border-blue-200 transition-all text-xs"
                                        >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-100 text-red-700 font-bold text-[10px] border border-red-200">
                                                    {(file.file_type || 'PDF').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">
                                                        Kegiatan: {file.activity}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                                        <span>{file.size}</span>
                                                        <span>•</span>
                                                        <span>{file.date}</span>
                                                        <span>•</span>
                                                        <span className="text-slate-600">Oleh: {file.uploader}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                {file.url ? (
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Lihat</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => showToast(`Membuka pratinjau ${file.name}...`)}
                                                        className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Preview</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
                            <span className="text-[11px] text-slate-500">
                                Terhubung langsung ke modul Kegiatan & Dokumen Akreditasi
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href={route('akreditasi.lam')}
                                    className="inline-flex items-center gap-1 border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Buka Borang LAM</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
