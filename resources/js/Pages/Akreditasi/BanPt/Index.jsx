import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useMemo, useRef } from 'react';
import PpeppFolderExplorer from '@/Components/PpeppFolderExplorer';
import { confirmAlert, toastSuccess, toastError } from '@/Utils/alert';
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
    FileCheck2,
    FileText,
    Trash2,
    Edit2,
    Loader2
} from 'lucide-react';

const PPEPP_STAGES = [
    { key: 'penetapan', label: '1. Penetapan (P)', desc: 'Standar Mutu Institusi, SK Kebijakan Rektor, Pedoman SPMI' },
    { key: 'pelaksanaan', label: '2. Pelaksanaan (P)', desc: 'Bukti Kegiatan Institusi, Notulen Rapat, Kerjasama, Realisasi' },
    { key: 'evaluasi', label: '3. Evaluasi (E)', desc: 'Laporan Monev Institusi, Audit Mutu Internal (AMI), Survei Kepuasan' },
    { key: 'pengendalian', label: '4. Pengendalian (P)', desc: 'Rapat Tinjauan Manajemen (RTM) Universitas, Tindak Lanjut Temuan' },
    { key: 'peningkatan', label: '5. Peningkatan (P)', desc: 'Benchmarking Institusi, Rencana Pengembangan & Standar Mutu Baru' },
];

export default function BanPtIndex({
    sessions = [],
    selectedSessionId = '',
    criterias = [],
    academicYears = [],
    ppepps = [],
}) {
    // Sesi aktif terpilih
    const activeSession = useMemo(() => {
        return sessions.find((s) => String(s.id) === String(selectedSessionId)) || null;
    }, [sessions, selectedSessionId]);

    // Accordion kriteria aktif: buka kriteria pertama secara default jika ada data
    const [expandedCrit, setExpandedCrit] = useState(() => {
        return criterias[0]?.id || null;
    });

    // Filter tahun kegiatan di dalam sesi (opsional)
    const [selectedYearFilter, setSelectedYearFilter] = useState('');

    // Modal Upload Berkas PPEPP
    const [uploadModal, setUploadModal] = useState({
        isOpen: false,
        critId: null,
        activityId: null,
        stageKey: null,
        stageLabel: null,
        activityTitle: '',
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [customFileName, setCustomFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Modal Tambah Kegiatan
    const [newActivityModal, setNewActivityModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
        title_activity: '',
        description: '',
        academicyear_id: '',
    });
    const [isSavingActivity, setIsSavingActivity] = useState(false);

    // Modal Edit Kegiatan
    const [editActivityModal, setEditActivityModal] = useState({
        isOpen: false,
        activityId: null,
        critId: null,
        title_activity: '',
        description: '',
        academicyear_id: '',
    });
    const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

    // Handler ganti sesi akreditasi
    const handleSelectSession = (sessionId) => {
        setSelectedYearFilter('');
        if (!sessionId) {
            router.get(route('akreditasi.ban-pt'), {}, { preserveScroll: true });
        } else {
            router.get(route('akreditasi.ban-pt'), { session_id: sessionId }, { preserveScroll: true });
        }
    };

    // Toggle Kriteria Accordion
    const toggleCrit = (critId) => {
        setExpandedCrit(expandedCrit === critId ? null : critId);
    };

    // Buka Modal Upload Berkas
    const handleOpenUpload = (critId, activityId, stageKey, stageLabel, activityTitle) => {
        setUploadModal({
            isOpen: true,
            critId,
            activityId,
            stageKey,
            stageLabel,
            activityTitle,
        });
        setUploadFile(null);
        setCustomFileName('');
        setIsUploading(false);
    };

    // Tutup Modal Upload
    const handleCloseUpload = () => {
        if (isUploading) return;
        setUploadModal({
            isOpen: false,
            critId: null,
            activityId: null,
            stageKey: null,
            stageLabel: null,
            activityTitle: '',
        });
        setUploadFile(null);
        setCustomFileName('');
    };

    // File selection handler
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            if (!customFileName) {
                // Buang ekstensi untuk isian custom nama awal
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                setCustomFileName(nameWithoutExt);
            }
        }
    };

    // Konfirmasi Upload Berkas Real via Inertia FormData
    const handleConfirmUpload = (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadModal.activityId || !uploadModal.stageKey) {
            toastError('Silakan pilih berkas dokumen yang ingin diunggah.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('activity_id', uploadModal.activityId);
        formData.append('stage_key', uploadModal.stageKey);
        formData.append('file', uploadFile);
        if (customFileName.trim()) {
            formData.append('custom_name', customFileName.trim());
        }

        router.post(route('akreditasi.ban-pt.dokumen.upload'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseUpload();
            },
            onError: (err) => {
                const firstError = Object.values(err)[0] || 'Gagal mengunggah dokumen.';
                toastError(firstError);
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    // Hapus Berkas Eviden PPEPP
    const handleDeleteFile = async (critId, activityId, stageKey, fileId, fileName) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Berkas PPEPP?',
            text: `Apakah Anda yakin ingin menghapus dokumen "${fileName}" dari server secara permanen?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });
        if (!confirmed) return;

        router.delete(route('akreditasi.ban-pt.dokumen.destroy', { document: fileId }), {
            preserveScroll: true,
            onError: () => {
                toastError('Gagal menghapus berkas dokumen.');
            },
        });
    };

    // Buka Modal Tambah Kegiatan
    const handleOpenAddActivity = (critId, critCode) => {
        setNewActivityModal({
            isOpen: true,
            critId,
            critCode,
            title_activity: '',
            description: '',
            academicyear_id: academicYears[0]?.id || '',
        });
    };

    // Simpan Kegiatan Baru
    const handleSaveNewActivity = (e) => {
        e.preventDefault();
        if (!newActivityModal.title_activity.trim() || !selectedSessionId) return;

        setIsSavingActivity(true);

        router.post(
            route('akreditasi.ban-pt.kegiatan.store'),
            {
                session_id: selectedSessionId,
                criteria_id: newActivityModal.critId,
                title_activity: newActivityModal.title_activity.trim(),
                description: newActivityModal.description.trim() || null,
                academicyear_id: newActivityModal.academicyear_id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewActivityModal({
                        isOpen: false,
                        critId: null,
                        critCode: null,
                        title_activity: '',
                        description: '',
                        academicyear_id: '',
                    });
                },
                onError: (err) => {
                    const msg = Object.values(err)[0] || 'Gagal menambahkan kegiatan.';
                    toastError(msg);
                },
                onFinish: () => {
                    setIsSavingActivity(false);
                },
            }
        );
    };

    // Buka Modal Edit Kegiatan
    const handleOpenEditActivity = (critId, act) => {
        setEditActivityModal({
            isOpen: true,
            activityId: act.id,
            critId: critId,
            title_activity: act.title_activity || '',
            description: act.description || '',
            academicyear_id: act.academicyear_id || '',
        });
    };

    // Simpan Pembaruan Kegiatan
    const handleSaveEditActivity = (e) => {
        e.preventDefault();
        if (!editActivityModal.title_activity.trim() || !editActivityModal.activityId) return;

        setIsUpdatingActivity(true);

        router.put(
            route('akreditasi.ban-pt.kegiatan.update', { activity: editActivityModal.activityId }),
            {
                title_activity: editActivityModal.title_activity.trim(),
                description: editActivityModal.description.trim() || null,
                academicyear_id: editActivityModal.academicyear_id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditActivityModal({
                        isOpen: false,
                        activityId: null,
                        critId: null,
                        title_activity: '',
                        description: '',
                        academicyear_id: '',
                    });
                },
                onError: (err) => {
                    const msg = Object.values(err)[0] || 'Gagal memperbarui kegiatan.';
                    toastError(msg);
                },
                onFinish: () => {
                    setIsUpdatingActivity(false);
                },
            }
        );
    };

    // Hapus Kegiatan
    const handleDeleteActivity = async (critId, act) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Kegiatan Institusi?',
            text: `Apakah Anda yakin ingin menghapus folder kegiatan "${act.title_activity}"? Seluruh berkas eviden PPEPP di dalamnya juga akan terhapus.`,
            confirmButtonText: 'Ya, Hapus Semua',
            cancelButtonText: 'Batal',
        });
        if (!confirmed) return;

        router.delete(route('akreditasi.ban-pt.kegiatan.destroy', { activity: act.id }), {
            preserveScroll: true,
            onError: () => {
                toastError('Gagal menghapus kegiatan.');
            },
        });
    };

    // Total kegiatan di seluruh kriteria pada sesi aktif
    const totalAllActivities = useMemo(() => {
        return criterias.reduce((acc, c) => acc + (c.activities?.length || 0), 0);
    }, [criterias]);

    // Daftar tahun unik dalam sesi ini untuk filter tambahan
    const sessionYears = useMemo(() => {
        const years = new Set();
        criterias.forEach((c) => {
            (c.activities || []).forEach((a) => {
                if (a.academic_year) years.add(a.academic_year);
            });
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [criterias]);

    // Filter kriteria & kegiatan berdasarkan tahun akademik (jika diaktifkan)
    const filteredCriterias = useMemo(() => {
        if (!selectedYearFilter) return criterias;
        return criterias.map((crit) => ({
            ...crit,
            activities: (crit.activities || []).filter(
                (act) => String(act.academic_year) === String(selectedYearFilter)
            ),
        }));
    }, [criterias, selectedYearFilter]);

    return (
        <AuthenticatedLayout>
            <Head title="Dokumen Akreditasi BAN-PT (4 Kriteria & Sesi Akreditasi Institusi)" />

            <div className="space-y-6">
                {/* Header Utama Halaman BAN-PT */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase mb-1">
                            <Landmark className="w-4 h-4" />
                            <span>Dokumen Akreditasi BAN-PT (Tingkat Institusi / Perguruan Tinggi)</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Instrumen Akreditasi BAN-PT (4 Kriteria)
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                            Repositori pengumpulan dokumen borang dan evidensi penjaminan mutu PPEPP institusi perguruan tinggi berbasis standar BAN-PT.
                        </p>
                    </div>

                    {/* Indikator Status Kelengkapan Folder */}
                    <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 border border-slate-200 shrink-0">
                        <span className="text-slate-500 font-medium">Indikator Folder PPEPP:</span>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            <span className="w-2 h-2 bg-emerald-500 inline-block" />
                            <span>Lengkap (5/5)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Ada File (Merah)</span>
                        </div>
                    </div>
                </div>

                {/* Filter Bar: Berbasis Sesi Akreditasi Institusi */}
                <div className="bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                            <Filter className="w-4 h-4 text-indigo-600" />
                            <span>Pilih Sesi Akreditasi Institusi:</span>
                        </div>

                        {/* Dropdown Sesi Akreditasi Perguruan Tinggi (Permanent Gambar 2 Style) */}
                        <div className="relative min-w-[280px] sm:min-w-[360px]">
                            <select
                                id="banpt-filter-sesi"
                                value={selectedSessionId || ''}
                                onChange={(e) => handleSelectSession(e.target.value)}
                                className="w-full px-4 py-2.5 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-xs"
                            >
                                <option value="">-- Silakan Pilih Sesi Akreditasi Institusi --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.is_active ? '★ [Sesi Aktif]' : `[${s.year_start}–${s.year_end}]`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Tahun Akademik Tambahan (Jika Sesi Dipilih dan Memiliki Beragam Tahun) */}
                        {selectedSessionId && sessionYears.length > 1 && (
                            <div className="relative">
                                <select
                                    value={selectedYearFilter}
                                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                                    className="px-3.5 py-2.5 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Sesi</span>
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        {selectedSessionId && activeSession ? (
                            <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-3 py-1.5 border border-indigo-200/60 font-medium">
                                <Check className="w-3.5 h-3.5 text-indigo-600" />
                                Sesi Terpilih: <strong className="font-bold">{activeSession.name}</strong>
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
                    <div className="border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-indigo-50 text-indigo-600 mb-4 border border-indigo-200">
                            <Landmark className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold mb-2 border border-indigo-200/60">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pilih Sesi Akreditasi Institusi Terlebih Dahulu</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Tidak Ada Dokumen yang Ditampilkan
                        </h2>

                        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                            Instrumen Akreditasi BAN-PT dikelompokkan berdasarkan <strong>Sesi Akreditasi Perguruan Tinggi</strong>. Silakan tentukan Sesi Akreditasi melalui dropdown di atas untuk mengelola pohon folder 4 kriteria dan evidensi berkas PPEPP.
                        </p>

                        {/* Pilihan Cepat Daftar Sesi yang Tersedia */}
                        {sessions.length > 0 && (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <span className="text-xs font-semibold text-slate-400 block w-full mb-1">
                                    Pilih Cepat Sesi Tersedia:
                                </span>
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleSelectSession(s.id)}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 shadow-xs transition-all cursor-pointer"
                                    >
                                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>{s.name}</span>
                                        {s.is_active && (
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 border border-emerald-300 font-bold">
                                                Aktif
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ======================================================== */
                    /* KONDISI 2: SESI DIPILIH (BANNER SESI & POHON FOLDER PPEPP) */
                    /* ======================================================== */
                    <div className="space-y-4">
                        {/* Panel Sesi Akreditasi BAN-PT Aktif */}
                        <div className="bg-slate-900 text-white p-5 sm:p-6 shadow-xs border border-slate-800 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                                                {activeSession?.agency_code}
                                            </span>
                                            <span className="text-xs text-slate-400">• {activeSession?.univ_name}</span>
                                            <span className={`text-[10px] px-2 py-0.5 font-bold border ${activeSession?.status_badge}`}>
                                                {activeSession?.status_label}
                                            </span>
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                                            {activeSession?.name}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {activeSession?.sk_number ? `Status / No. SK: ${activeSession.sk_number}` : activeSession?.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Statistik Cepat Sesi */}
                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                    <div className="bg-slate-800 px-3 py-1.5 border border-slate-700 text-slate-300">
                                        <span>Tahun Acuan TS: </span>
                                        <strong className="text-white font-bold">{activeSession?.ts_year || '-'}</strong>
                                    </div>
                                    <div className="bg-slate-800 px-3 py-1.5 border border-slate-700 text-slate-300">
                                        <span>Target Peringkat: </span>
                                        <strong className="text-emerald-400 font-bold">{activeSession?.target_rating || '-'}</strong>
                                    </div>
                                    <div className="bg-slate-800 px-3 py-1.5 border border-slate-700 text-slate-300">
                                        <span>Total: </span>
                                        <strong className="text-white font-bold">{totalAllActivities} Kegiatan</strong>
                                    </div>
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
                                        className={`bg-white border transition-all duration-200 overflow-hidden shadow-xs ${
                                            isExpanded ? 'border-indigo-300' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Accordion Header Kriteria */}
                                        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between bg-white border-b border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => toggleCrit(crit.id)}
                                                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2 cursor-pointer"
                                            >
                                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center bg-indigo-600 text-white font-extrabold text-xs sm:text-sm">
                                                    C{crit.code_criteria}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            Kriteria {crit.code_criteria}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                                                            • Standar BAN-PT
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium">
                                                            • {activitiesCount} Kegiatan
                                                        </span>
                                                    </div>
                                                    <h3
                                                        className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate mt-0.5"
                                                        title={crit.title_criteria}
                                                    >
                                                        {crit.title_criteria}
                                                    </h3>
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Tambah Kegiatan</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleCrit(crit.id)}
                                                    className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                                                    onAddActivity={() => handleOpenAddActivity(crit.id, crit.code_criteria)}
                                                    onEditActivity={handleOpenEditActivity}
                                                    onDeleteActivity={handleDeleteActivity}
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

            {/* ======================================================== */}
            {/* MODAL 1: UPLOAD REAL BERKAS PPEPP                        */}
            {/* ======================================================== */}
            {uploadModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Upload Dokumen Eviden PPEPP
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    {uploadModal.stageLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseUpload}
                                disabled={isUploading}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmUpload} className="mt-4 space-y-4 text-xs">
                            <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                                <span className="text-slate-400 block font-medium">Folder Kegiatan:</span>
                                <span className="font-bold text-slate-800">{uploadModal.activityTitle}</span>
                            </div>

                            {/* Dropzone File Input */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Pilih Berkas Dokumen <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg"
                                    className="hidden"
                                    id="file-upload-input"
                                    required
                                />

                                <label
                                    htmlFor="file-upload-input"
                                    className={`p-5 border-2 border-dashed ${
                                        uploadFile ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                                    } block text-center cursor-pointer transition-colors`}
                                >
                                    <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-1.5" />
                                    {uploadFile ? (
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{uploadFile.name}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Klik untuk mengganti
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-700">
                                                Klik untuk memilih berkas dari komputer
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                PDF, DOCX, XLSX, PPTX, ZIP, RAR, atau Gambar (Maks. 25 MB)
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Nama Dokumen / Judul Khusus (Opsional) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama / Judul Dokumen (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={customFileName}
                                    onChange={(e) => setCustomFileName(e.target.value)}
                                    placeholder="Contoh: SK_Rektor_Standar_Mutu_Institusi"
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 font-medium"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Jika dikosongkan, nama asli file dari komputer akan digunakan secara otomatis.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseUpload}
                                    disabled={isUploading}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadFile}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Mengunggah...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-3.5 h-3.5" />
                                            <span>Upload & Simpan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: TAMBAH KEGIATAN BARU                            */}
            {/* ======================================================== */}
            {newActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Folder Kegiatan Institusi
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Kriteria {newActivityModal.critCode} • Sesi {activeSession?.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNewActivityModal({ ...newActivityModal, isOpen: false })}
                                disabled={isSavingActivity}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewActivity} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Kegiatan / Dokumen Induk <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newActivityModal.title_activity}
                                    onChange={(e) =>
                                        setNewActivityModal({ ...newActivityModal, title_activity: e.target.value })
                                    }
                                    placeholder="Contoh: Rapat Kerja Institusi Evaluasi Ketercapaian Renstra"
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                                    required
                                    autoFocus
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Setelah dibuat, kegiatan akan otomatis memiliki 5 subfolder PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan).
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Tahun Akademik Kegiatan
                                </label>
                                <select
                                    value={newActivityModal.academicyear_id}
                                    onChange={(e) =>
                                        setNewActivityModal({ ...newActivityModal, academicyear_id: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-indigo-600 cursor-pointer"
                                >
                                    <option value="">-- Berlaku untuk Semua Tahun / Siklus --</option>
                                    {academicYears.map((ay) => (
                                        <option key={ay.id} value={ay.id}>
                                            Tahun Akademik {ay.year}/{ay.year + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Deskripsi / Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={newActivityModal.description}
                                    onChange={(e) =>
                                        setNewActivityModal({ ...newActivityModal, description: e.target.value })
                                    }
                                    placeholder="Keterangan singkat mengenai lingkup kegiatan atau bukti eviden yang dibutuhkan..."
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setNewActivityModal({ ...newActivityModal, isOpen: false })}
                                    disabled={isSavingActivity}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingActivity}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingActivity ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Simpan Kegiatan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3: EDIT KEGIATAN                                   */}
            {/* ======================================================== */}
            {editActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Edit Folder Kegiatan
                                </h3>
                                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                                    Perbarui Data dan Tahun Akademik
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditActivityModal({ ...editActivityModal, isOpen: false })}
                                disabled={isUpdatingActivity}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditActivity} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Kegiatan / Dokumen Induk <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editActivityModal.title_activity}
                                    onChange={(e) =>
                                        setEditActivityModal({ ...editActivityModal, title_activity: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Tahun Akademik Kegiatan
                                </label>
                                <select
                                    value={editActivityModal.academicyear_id}
                                    onChange={(e) =>
                                        setEditActivityModal({ ...editActivityModal, academicyear_id: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-indigo-600 cursor-pointer"
                                >
                                    <option value="">-- Berlaku untuk Semua Tahun / Siklus --</option>
                                    {academicYears.map((ay) => (
                                        <option key={ay.id} value={ay.id}>
                                            Tahun Akademik {ay.year}/{ay.year + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Deskripsi / Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={editActivityModal.description}
                                    onChange={(e) =>
                                        setEditActivityModal({ ...editActivityModal, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setEditActivityModal({ ...editActivityModal, isOpen: false })}
                                    disabled={isUpdatingActivity}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingActivity}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isUpdatingActivity ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
