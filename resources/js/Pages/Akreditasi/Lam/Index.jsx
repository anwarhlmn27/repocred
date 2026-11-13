import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useMemo, useRef } from 'react';
import { confirmAlert, toastSuccess, toastError, toastInfo } from '@/Utils/alert';
import {
    Award,
    Filter,
    FolderCheck,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    FileText,
    FileSpreadsheet,
    FileCode,
    Plus,
    Folder,
    FolderOpen,
    UploadCloud,
    Trash2,
    Edit2,
    CheckCircle2,
    AlertCircle,
    Eye,
    Download,
    ExternalLink,
    Info,
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
    Search,
    Loader2
} from 'lucide-react';

const PPEPP_STAGES = [
    { key: 'penetapan', label: '1. Penetapan (P)', desc: 'Standar Mutu, SK Kurikulum OBE, VMTS Keilmuan Prodi' },
    { key: 'pelaksanaan', label: '2. Pelaksanaan (P)', desc: 'Perkuliahan, RPS OBE, Riset Dosen, Realisasi Kerjasama' },
    { key: 'evaluasi', label: '3. Evaluasi (E)', desc: 'Asesmen CPL Mahasiswa, Monev Internal, Survei Kepuasan' },
    { key: 'pengendalian', label: '4. Pengendalian (P)', desc: 'Kaji Ulang Kurikulum, Rapat Tinjauan Manajemen (RTM)' },
    { key: 'peningkatan', label: '5. Peningkatan (P)', desc: 'Akreditasi Internasional, Pemutakhiran Lab & Standar Baru' },
];

/**
 * Helper kalkulasi daftar opsi tahun TS berdasarkan tahun acuan TS dan jumlah TS
 */
const generateTsOptions = (tsYear, count = 3) => {
    const list = [
        {
            key: 'all',
            label: 'Semua TS (Kebijakan/Siklus 5 Tahun)',
            short: 'Semua TS',
            year: null,
            desc: 'Untuk dokumen Renstra, VMTS, Kebijakan Lintas Tahun',
        },
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

/**
 * Helper icon file berdasarkan ekstensi
 */
const getFileIcon = (fileName = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) {
        return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
        return <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
};

export default function LamIndex({
    prodis = [],
    selectedProdiId = '',
    activeSession = null,
    criterias = [],
    academicYears = [],
    ppepps = [],
}) {
    // Program Studi yang sedang aktif dipilih
    const [selectedProdi, setSelectedProdi] = useState(selectedProdiId || '');

    // Konfigurasi Sesi Akreditasi Aktif
    const tsYear = activeSession?.ts_year ?? new Date().getFullYear();
    const tsCount = activeSession?.ts_count ?? 3;

    // Filter lokal
    const [hideEmptyTs, setHideEmptyTs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Accordion Kriteria (Default buka kriteria pertama jika ada data)
    const [expandedCrit, setExpandedCrit] = useState(() => criterias[0]?.id || null);

    // Folder TS yang dibuka/ditutup (Key: `${critId}-${tsKey}`)
    const [expandedTsFolders, setExpandedTsFolders] = useState(() => {
        const initial = {};
        if (criterias[0]) {
            initial[`${criterias[0].id}-all`] = true;
            initial[`${criterias[0].id}-ts-0`] = true;
        }
        return initial;
    });

    // Folder Kegiatan yang dibuka/ditutup (Key: activityId)
    const [expandedActivities, setExpandedActivities] = useState(() => {
        const initial = {};
        if (criterias[0]?.activities?.[0]) {
            initial[criterias[0].activities[0].id] = true;
        }
        return initial;
    });

    // Subfolder PPEPP yang dibuka/ditutup (Key: `${activityId}-${stageKey}`)
    const [expandedPpepp, setExpandedPpepp] = useState(() => {
        const initial = {};
        if (criterias[0]?.activities?.[0]) {
            const actId = criterias[0].activities[0].id;
            initial[`${actId}-penetapan`] = true;
            initial[`${actId}-pelaksanaan`] = true;
        }
        return initial;
    });

    // Modal Pratinjau Dokumen Eviden (Preview)
    const [previewDoc, setPreviewDoc] = useState(null);

    // Modal Tambah Kegiatan
    const [newActivityModal, setNewActivityModal] = useState({
        isOpen: false,
        critId: null,
        critCode: null,
        critTitle: '',
        presetTsKey: 'all',
    });
    const [formTitleActivity, setFormTitleActivity] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSelectedTsKey, setFormSelectedTsKey] = useState('all');
    const [isSavingActivity, setIsSavingActivity] = useState(false);

    // Modal Edit Kegiatan
    const [editActivityModal, setEditActivityModal] = useState({
        isOpen: false,
        activityId: null,
        critId: null,
        critCode: null,
        critTitle: '',
        title_activity: '',
        description: '',
        ts_key: 'all',
    });
    const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

    // Modal Upload File PPEPP
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

    // Objek prodi yang dipilih
    const activeProdi = useMemo(() => {
        return prodis.find((p) => String(p.id) === String(selectedProdi)) || null;
    }, [prodis, selectedProdi]);

    // Opsi TS yang tersedia sesuai tsCount
    const allPossibleTsOptions = useMemo(() => {
        return generateTsOptions(tsYear, 5); // Hingga TS-4
    }, [tsYear]);

    // Handler Ganti Prodi via Inertia
    const handleSelectProdi = (prodiId) => {
        setSelectedProdi(prodiId);
        if (!prodiId) {
            router.get(route('akreditasi.lam'), {}, { preserveScroll: true });
        } else {
            router.get(route('akreditasi.lam'), { prodi_id: prodiId }, { preserveScroll: true });
        }
    };

    // Handler Update Rentang TS (3 Tahun / 5 Tahun)
    const handleUpdateTsCount = (newCount) => {
        if (!activeSession) return;
        router.put(
            route('akreditasi.lam.sesi.update', { session: activeSession.id }),
            {
                ts_year: tsYear,
                ts_count: newCount,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toastSuccess(`Rentang evaluasi TS berhasil diubah menjadi ${newCount} tahun.`);
                },
                onError: (err) => {
                    const msg = Object.values(err)[0] || 'Gagal memperbarui rentang TS.';
                    toastError(msg);
                },
            }
        );
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

    // Buka Modal Tambah Kegiatan
    const handleOpenAddActivity = (critId, critCode, critTitle, presetTsKey = 'all') => {
        setNewActivityModal({
            isOpen: true,
            critId,
            critCode,
            critTitle,
            presetTsKey,
        });
        setFormTitleActivity('');
        setFormDescription('');
        setFormSelectedTsKey(presetTsKey);
    };

    // Submit Tambah Kegiatan Baru via Inertia
    const handleSubmitActivity = (e) => {
        e.preventDefault();
        if (!formTitleActivity.trim() || !activeSession || !newActivityModal.critId) {
            toastError('Nama kegiatan wajib diisi.');
            return;
        }

        setIsSavingActivity(true);

        const tsObj = allPossibleTsOptions.find((t) => t.key === formSelectedTsKey) || allPossibleTsOptions[0];

        // Cari master academicyear jika tahun spesifik
        const matchedAy = tsObj.year ? academicYears.find((ay) => Number(ay.year) === Number(tsObj.year)) : null;

        router.post(
            route('akreditasi.lam.kegiatan.store'),
            {
                session_id: activeSession.id,
                criteria_id: newActivityModal.critId,
                title_activity: formTitleActivity.trim(),
                description: formDescription.trim() || null,
                ts_key: tsObj.key,
                year: tsObj.year,
                academic_year: tsObj.year,
                academicyear_id: matchedAy?.id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const critId = newActivityModal.critId;
                    setExpandedTsFolders((prev) => ({
                        ...prev,
                        [`${critId}-${tsObj.key}`]: true,
                    }));
                    setNewActivityModal({
                        isOpen: false,
                        critId: null,
                        critCode: null,
                        critTitle: '',
                        presetTsKey: 'all',
                    });
                    setFormTitleActivity('');
                    setFormDescription('');
                    toastSuccess('Kegiatan akreditasi LAM berhasil ditambahkan.');
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
    const handleOpenEditActivity = (crit, act) => {
        setEditActivityModal({
            isOpen: true,
            activityId: act.id,
            critId: crit.id,
            critCode: crit.code_criteria,
            critTitle: crit.title_criteria,
            title_activity: act.title_activity || '',
            description: act.description || '',
            ts_key: act.ts_key || 'all',
        });
    };

    // Submit Update Kegiatan via Inertia
    const handleUpdateActivity = (e) => {
        e.preventDefault();
        if (!editActivityModal.title_activity.trim() || !editActivityModal.activityId) {
            toastError('Nama kegiatan wajib diisi.');
            return;
        }

        setIsUpdatingActivity(true);

        const tsObj = allPossibleTsOptions.find((t) => t.key === editActivityModal.ts_key) || allPossibleTsOptions[0];
        const matchedAy = tsObj.year ? academicYears.find((ay) => Number(ay.year) === Number(tsObj.year)) : null;

        router.put(
            route('akreditasi.lam.kegiatan.update', { activity: editActivityModal.activityId }),
            {
                title_activity: editActivityModal.title_activity.trim(),
                description: editActivityModal.description.trim() || null,
                ts_key: tsObj.key,
                year: tsObj.year,
                academic_year: tsObj.year,
                academicyear_id: matchedAy?.id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditActivityModal({
                        isOpen: false,
                        activityId: null,
                        critId: null,
                        critCode: null,
                        critTitle: '',
                        title_activity: '',
                        description: '',
                        ts_key: 'all',
                    });
                    toastSuccess('Data kegiatan berhasil diperbarui.');
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

    // Hapus Kegiatan via Inertia
    const handleDeleteActivity = async (critId, act) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Kegiatan?',
            text: `Apakah Anda yakin ingin menghapus kegiatan "${act.title_activity}"? Seluruh dokumen eviden PPEPP di dalamnya juga akan terhapus.`,
            confirmButtonText: 'Ya, Hapus Semua',
            cancelButtonText: 'Batal',
        });
        if (!confirmed) return;

        router.delete(route('akreditasi.lam.kegiatan.destroy', { activity: act.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess('Kegiatan beserta seluruh dokumen di dalamnya berhasil dihapus.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menghapus kegiatan.';
                toastError(msg);
            },
        });
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
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                setCustomFileName(nameWithoutExt);
            }
        }
    };

    // Konfirmasi Upload Dokumen Real via FormData
    const handleConfirmUpload = (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadModal.activityId || !uploadModal.stageKey) {
            toastError('Silakan pilih file dokumen yang ingin diunggah.');
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

        router.post(route('akreditasi.lam.dokumen.upload'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                const actId = uploadModal.activityId;
                const stage = uploadModal.stageKey;
                setExpandedActivities((prev) => ({ ...prev, [actId]: true }));
                setExpandedPpepp((prev) => ({ ...prev, [`${actId}-${stage}`]: true }));
                handleCloseUpload();
                toastSuccess('Dokumen eviden PPEPP berhasil diunggah.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal mengunggah dokumen.';
                toastError(msg);
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    // Hapus File Dokumen via Inertia
    const handleDeleteFile = async (docId, fileName) => {
        const confirmed = await confirmAlert({
            title: 'Hapus Dokumen Eviden?',
            text: `Apakah Anda yakin ingin menghapus berkas "${fileName}" dari server secara permanen?`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });
        if (!confirmed) return;

        router.delete(route('akreditasi.lam.dokumen.destroy', { document: docId }), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess(`Dokumen "${fileName}" berhasil dihapus.`);
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menghapus dokumen.';
                toastError(msg);
            },
        });
    };

    // Total kegiatan di seluruh kriteria pada prodi terpilih
    const totalAllActivities = useMemo(() => {
        return criterias.reduce((acc, c) => acc + (c.activities?.length || 0), 0);
    }, [criterias]);

    // Total file dokumen di seluruh kriteria
    const totalAllDocuments = useMemo(() => {
        let count = 0;
        criterias.forEach((c) => {
            (c.activities || []).forEach((a) => {
                if (a.ppepp_docs) {
                    Object.values(a.ppepp_docs).forEach((arr) => {
                        if (Array.isArray(arr)) count += arr.length;
                    });
                }
            });
        });
        return count;
    }, [criterias]);

    // Filter pencarian kriteria & kegiatan
    const filteredCriterias = useMemo(() => {
        if (!searchQuery.trim()) return criterias;
        const q = searchQuery.toLowerCase();

        return criterias.map((crit) => {
            const matchesCrit = crit.title_criteria?.toLowerCase().includes(q);
            const filteredActivities = (crit.activities || []).filter((act) => {
                const matchTitle = act.title_activity?.toLowerCase().includes(q);
                const matchDesc = act.description?.toLowerCase().includes(q);
                const matchTs = act.ts_label?.toLowerCase().includes(q);
                let matchDoc = false;
                if (act.ppepp_docs) {
                    Object.values(act.ppepp_docs).forEach((docs) => {
                        if (Array.isArray(docs)) {
                            docs.forEach((d) => {
                                if (d.name?.toLowerCase().includes(q)) matchDoc = true;
                            });
                        }
                    });
                }
                return matchTitle || matchDesc || matchTs || matchDoc;
            });

            return {
                ...crit,
                activities: matchesCrit ? crit.activities : filteredActivities,
            };
        });
    }, [criterias, searchQuery]);

    return (
        <AuthenticatedLayout>
            <Head title="Dokumen Akreditasi LAM (6 Kriteria & Folderisasi TS)" />

            <div className="space-y-6">
                {/* Header Utama Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase mb-1">
                            <Layers className="w-4 h-4" />
                            <span>Dokumen Akreditasi LAM</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Instrumen Akreditasi LAM (6 Kriteria)
                        </h1>
                        {/* <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                            Pengelolaan dokumen borang, evaluasi capaian kurikulum OBE, dan evidensi penjaminan mutu PPEPP tingkat Program Studi berbasis siklus Tahun Sekarang (TS).
                        </p> */}
                    </div>

                    {/* Indikator Folder PPEPP */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-2.5 border border-slate-200 text-xs shrink-0">
                        <span className="font-semibold text-slate-700">Indikator PPEPP:</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2.5 h-2.5 bg-emerald-500 inline-block" />
                            <span>Lengkap</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Ada File</span>
                        </div>
                    </div>
                </div>

                {/* Filter Bar: Hanya Berbasis Prodi (Gambar 2 Format) */}
                <div className="bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                            <Filter className="w-4 h-4 text-emerald-600" />
                            <span>Pilih Program Studi:</span>
                        </div>

                        {/* Dropdown Program Studi */}
                        <div className="relative min-w-[280px] sm:min-w-[360px]">
                            <select
                                id="lam-filter-prodi"
                                value={selectedProdi || ''}
                                onChange={(e) => handleSelectProdi(e.target.value)}
                                className="w-full px-4 py-2.5 text-xs border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                            >
                                <option value="">-- Silakan Pilih Program Studi --</option>
                                {prodis.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name_prodi} ({p.degree}) - {p.faculty} [{p.agency_code}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedProdi && (
                            <button
                                type="button"
                                onClick={() => handleSelectProdi('')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        {selectedProdi && activeProdi ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 border border-emerald-200/60 font-medium">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Prodi Aktif: <strong className="font-bold">{activeProdi.name_prodi}</strong> ({activeProdi.agency_code})
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
                    <div className="border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
                            <GraduationCap className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200/60">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pilih Program Studi Terlebih Dahulu</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Tidak Ada Dokumen yang Ditampilkan
                        </h2>

                        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                            Instrumen Akreditasi 6 Kriteria LAM bersifat khusus per-Program Studi. Silakan tentukan Program Studi melalui dropdown filter di atas untuk meninjau pohon folder kriteria, sesi evaluasi TS, dan eviden PPEPP.
                        </p>

                        {/* Pilihan Cepat Prodi */}
                        {prodis.length > 0 && (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <span className="text-xs font-semibold text-slate-400 block w-full mb-1">
                                    Pilih Cepat Program Studi:
                                </span>
                                {prodis.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectProdi(p.id)}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 shadow-xs transition-all cursor-pointer"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{p.name_prodi}</span>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 border border-emerald-300 font-bold">
                                            {p.agency_code}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ======================================================== */
                    /* KONDISI 2: PRODI DIPILIH (SESI AKREDITASI & FOLDERISASI TS)*/
                    /* ======================================================== */
                    <div className="space-y-4">
                        {/* Panel Sesi Akreditasi & Konfigurasi Rentang TS */}
                        <div className="bg-slate-900 text-white p-5 sm:p-6 border border-slate-800 space-y-4 shadow-xs">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                                Lembaga: {activeProdi?.agency_code}
                                            </span>
                                            <span className="text-xs text-slate-300">• {activeProdi?.faculty}</span>
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                                            {activeSession?.name ?? `${activeProdi?.name_prodi} (${activeProdi?.degree})`}
                                        </h2>
                                    </div>
                                </div>

                                {/* Statistik Cepat */}
                                <div className="flex items-center gap-2.5 text-xs">
                                    <div className="bg-slate-800/80 px-3.5 py-1.5 border border-slate-700 text-emerald-300">
                                        <span>Tahun Acuan TS: </span>
                                        <strong className="text-white font-bold">{tsYear}</strong>
                                    </div>
                                    <div className="bg-slate-800/80 px-3.5 py-1.5 border border-slate-700 text-emerald-300">
                                        <span>Total: </span>
                                        <strong className="text-white font-bold">{totalAllActivities} Kegiatan</strong>
                                    </div>
                                    <div className="bg-slate-800/80 px-3.5 py-1.5 border border-slate-700 text-emerald-300">
                                        <span>Eviden: </span>
                                        <strong className="text-white font-bold">{totalAllDocuments} Berkas</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accordion 6 Kriteria LAM */}
                        <div className="space-y-3">
                            {filteredCriterias.map((crit) => {
                                const isCritExpanded = expandedCrit === crit.id;
                                const critActivities = crit.activities || [];
                                const totalActsInCrit = critActivities.length;

                                // Filter folder TS yang aktif untuk kriteria ini
                                const enabledTsKeys = crit.default_ts_enabled || ['all'];

                                // Daftar opsi TS yang tampil di kriteria ini
                                const visibleTsList = allPossibleTsOptions.filter((opt) => {
                                    if (opt.key === 'all') return enabledTsKeys.includes('all');
                                    const tsIndex = parseInt(opt.key.replace('ts-', ''), 10);
                                    const isInCount = tsIndex < tsCount;
                                    const isExplicitlyEnabled = enabledTsKeys.includes(opt.key);
                                    const hasActivities = critActivities.some((a) => a.ts_key === opt.key);

                                    if (hideEmptyTs && !hasActivities) return false;

                                    return (isInCount || isExplicitlyEnabled) && (enabledTsKeys.includes(opt.key) || hasActivities);
                                });

                                return (
                                    <div
                                        key={crit.id}
                                        className={`bg-white border transition-all duration-200 overflow-hidden shadow-xs ${isCritExpanded ? 'border-emerald-300' : 'border-slate-200/80 hover:border-slate-300'
                                            }`}
                                    >
                                        {/* Header Accordion Kriteria */}
                                        <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between bg-white border-b border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => toggleCrit(crit.id)}
                                                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2 cursor-pointer"
                                            >
                                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-xs">
                                                    C{crit.code_criteria}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                            Kriteria {crit.code_criteria}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                                                            • Standar LAM 6 Kriteria
                                                        </span>
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
                                                {/* Tombol Tambah Kegiatan Umum di Kriteria */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria, crit.title_criteria, 'all')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Tambah Kegiatan</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleCrit(crit.id)}
                                                    className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                                                >
                                                    {isCritExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Isi Kriteria: Pohon Folder TS & PPEPP */}
                                        {isCritExpanded && (
                                            <div className="p-3 sm:p-4 bg-slate-50/60 space-y-3">
                                                {visibleTsList.length === 0 ? (
                                                    <div className="py-6 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200">
                                                        Tidak ada folder TS yang aktif atau memiliki kegiatan.
                                                    </div>
                                                ) : (
                                                    visibleTsList.map((tsOpt) => {
                                                        const folderKey = `${crit.id}-${tsOpt.key}`;
                                                        const isTsFolderOpen = !!expandedTsFolders[folderKey];

                                                        // Filter kegiatan yang termasuk dalam folder TS ini
                                                        const activitiesInTs = critActivities.filter((a) => a.ts_key === tsOpt.key);
                                                        const actCount = activitiesInTs.length;

                                                        return (
                                                            <div
                                                                key={tsOpt.key}
                                                                className={`border transition-all duration-200 bg-white overflow-hidden shadow-xs ${isTsFolderOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/80 hover:border-slate-300'
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
                                                                                <span
                                                                                    className={`px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${tsOpt.key === 'all'
                                                                                        ? 'bg-purple-100 text-purple-700'
                                                                                        : tsOpt.key === 'ts-0'
                                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                                            : 'bg-blue-100 text-blue-800'
                                                                                        }`}
                                                                                >
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
                                                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                                                            title={`Tambah Kegiatan di ${tsOpt.short}`}
                                                                        >
                                                                            <Plus className="w-3 h-3" />
                                                                            <span>Kegiatan</span>
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleTsFolder(folderKey)}
                                                                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                                        >
                                                                            {isTsFolderOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Daftar Kegiatan di Dalam Folder TS Ini */}
                                                                {isTsFolderOpen && (
                                                                    <div className="p-3 sm:p-4 space-y-3 bg-white">
                                                                        {actCount === 0 ? (
                                                                            <div className="py-4 px-3 text-center bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                                                                                <span>Belum ada kegiatan pada {tsOpt.label}.</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOpenAddActivity(crit.id, crit.code_criteria, crit.title_criteria, tsOpt.key)}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
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
                                                                                        className="border border-slate-200/90 overflow-hidden bg-slate-50/40"
                                                                                    >
                                                                                        {/* Header Kegiatan */}
                                                                                        <div className="px-3 py-2 flex items-center justify-between bg-white border-b border-slate-100">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => toggleActivity(act.id)}
                                                                                                className="flex items-center gap-2 text-left flex-1 min-w-0 mr-2 cursor-pointer"
                                                                                            >
                                                                                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                                                <div className="min-w-0">
                                                                                                    <span className="text-xs font-bold text-slate-800 truncate block">
                                                                                                        {act.title_activity}
                                                                                                    </span>
                                                                                                    {act.description && (
                                                                                                        <span className="text-[11px] text-slate-400 truncate block">
                                                                                                            {act.description}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </button>

                                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                                {/* Tombol Edit Kegiatan */}
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleOpenEditActivity(crit, act)}
                                                                                                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                                                                                    title="Edit Nama/Deskripsi Kegiatan"
                                                                                                >
                                                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                                                </button>

                                                                                                {/* Tombol Hapus Kegiatan */}
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleDeleteActivity(crit.id, act)}
                                                                                                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                                                                                    title="Hapus Kegiatan Ini"
                                                                                                >
                                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                                </button>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => toggleActivity(act.id)}
                                                                                                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                                                                                                            className="border border-slate-200/80 bg-white overflow-hidden text-xs"
                                                                                                        >
                                                                                                            {/* Header Tahap PPEPP */}
                                                                                                            <div className="px-2.5 py-1.5 flex items-center justify-between bg-white hover:bg-slate-50">
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => togglePpepp(ppeppKey)}
                                                                                                                    className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                                                                                                                >
                                                                                                                    <span className={`w-2 h-2 shrink-0 ${hasDocs ? 'bg-emerald-500' : 'bg-rose-500'}`} />
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
                                                                                                                        onClick={() =>
                                                                                                                            handleOpenUpload(
                                                                                                                                crit.id,
                                                                                                                                act.id,
                                                                                                                                stage.key,
                                                                                                                                stage.label,
                                                                                                                                act.title_activity
                                                                                                                            )
                                                                                                                        }
                                                                                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                                                                                                                    >
                                                                                                                        <Plus className="w-2.5 h-2.5" />
                                                                                                                        <span>Upload</span>
                                                                                                                    </button>
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        onClick={() => togglePpepp(ppeppKey)}
                                                                                                                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                                                                                                                                className="flex items-center justify-between p-1.5 bg-white border border-slate-200/60 hover:border-slate-300 text-[11px]"
                                                                                                                            >
                                                                                                                                <div className="flex items-center gap-2 min-w-0 mr-2">
                                                                                                                                    {getFileIcon(doc.name)}
                                                                                                                                    <span className="font-medium text-slate-700 truncate" title={doc.name}>
                                                                                                                                        {doc.name}
                                                                                                                                    </span>
                                                                                                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                                                                                                        ({doc.size})
                                                                                                                                    </span>
                                                                                                                                </div>

                                                                                                                                <div className="flex items-center gap-1 shrink-0">
                                                                                                                                    {/* Pratinjau Dokumen (Preview) */}
                                                                                                                                    <button
                                                                                                                                        type="button"
                                                                                                                                        onClick={() => setPreviewDoc(doc)}
                                                                                                                                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                                                                                                                                        title="Pratinjau Dokumen (Preview)"
                                                                                                                                    >
                                                                                                                                        <Eye className="w-3.5 h-3.5" />
                                                                                                                                    </button>

                                                                                                                                    {/* Unduh Berkas Langsung */}
                                                                                                                                    <a
                                                                                                                                        href={doc.download_url || route('akreditasi.lam.dokumen.download', { document: doc.id })}
                                                                                                                                        className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                                                                                                                                        title="Unduh Berkas Dokumen"
                                                                                                                                    >
                                                                                                                                        <Download className="w-3.5 h-3.5" />
                                                                                                                                    </a>

                                                                                                                                    {/* Hapus Dokumen */}
                                                                                                                                    <button
                                                                                                                                        type="button"
                                                                                                                                        onClick={() => handleDeleteFile(doc.id, doc.name)}
                                                                                                                                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
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
            {/* MODAL 1: TAMBAH KEGIATAN BARU (DENGAN PILIHAN TS)        */}
            {/* ======================================================== */}
            {newActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Tambah Kegiatan / Eviden Baru
                                </h3>
                                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                                    Kriteria {newActivityModal.critCode} — {newActivityModal.critTitle}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setNewActivityModal({
                                        isOpen: false,
                                        critId: null,
                                        critCode: null,
                                        critTitle: '',
                                        presetTsKey: 'all',
                                    })
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer"
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
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 text-slate-800"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Deskripsi Kegiatan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Deskripsi / Keterangan (Opsional)
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows="2"
                                    placeholder="Penjelasan ringkas terkait konteks kegiatan atau pemenuhan kriteria..."
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 text-slate-800"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNewActivityModal({
                                            isOpen: false,
                                            critId: null,
                                            critCode: null,
                                            critTitle: '',
                                            presetTsKey: 'all',
                                        })
                                    }
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingActivity}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingActivity && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan Kegiatan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: EDIT KEGIATAN                                   */}
            {/* ======================================================== */}
            {editActivityModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Edit Kegiatan Akreditasi
                                </h3>
                                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                                    Kriteria {editActivityModal.critCode} — {editActivityModal.critTitle}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setEditActivityModal({
                                        isOpen: false,
                                        activityId: null,
                                        critId: null,
                                        critCode: null,
                                        critTitle: '',
                                        title_activity: '',
                                        description: '',
                                        ts_key: 'all',
                                    })
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateActivity} className="mt-4 space-y-4">
                            {/* Pilihan Cakupan Evaluasi (TS) */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Cakupan Tahun Evaluasi (TS) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={editActivityModal.ts_key}
                                    onChange={(e) =>
                                        setEditActivityModal((prev) => ({
                                            ...prev,
                                            ts_key: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 bg-slate-50 focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer"
                                >
                                    {allPossibleTsOptions.map((opt) => (
                                        <option key={opt.key} value={opt.key}>
                                            {opt.label} — {opt.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Judul Kegiatan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama / Judul Kegiatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editActivityModal.title_activity}
                                    onChange={(e) =>
                                        setEditActivityModal((prev) => ({
                                            ...prev,
                                            title_activity: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 text-slate-800"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Deskripsi Kegiatan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Deskripsi / Keterangan (Opsional)
                                </label>
                                <textarea
                                    value={editActivityModal.description}
                                    onChange={(e) =>
                                        setEditActivityModal((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    rows="2"
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 text-slate-800"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditActivityModal({
                                            isOpen: false,
                                            activityId: null,
                                            critId: null,
                                            critCode: null,
                                            critTitle: '',
                                            title_activity: '',
                                            description: '',
                                            ts_key: 'all',
                                        })
                                    }
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingActivity}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isUpdatingActivity && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Perbarui Kegiatan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3: UPLOAD REAL BERKAS PPEPP                        */}
            {/* ======================================================== */}
            {uploadModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Upload Dokumen Eviden PPEPP
                                </h3>
                                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                                    {uploadModal.stageLabel}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseUpload}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmUpload} className="mt-4 space-y-4">
                            <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                                <span className="text-slate-400 block font-medium">Kegiatan Terkait:</span>
                                <span className="font-bold text-slate-800">{uploadModal.activityTitle}</span>
                            </div>

                            {/* Dropzone File Picker */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Pilih Berkas Dokumen <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg"
                                    className="hidden"
                                    id="file-upload-input"
                                />

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 text-center cursor-pointer transition-colors"
                                >
                                    <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                                    {uploadFile ? (
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800">
                                                {uploadFile.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                {(uploadFile.size / 1048576).toFixed(2)} MB • Klik untuk mengganti berkas
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-800">
                                                Klik untuk memilih berkas dari komputer
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Format: PDF, Word, Excel, PPT, ZIP, RAR, Gambar (Maks. 25 MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Judul / Nama Kustom File */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                    Nama / Judul Dokumen (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={customFileName}
                                    onChange={(e) => setCustomFileName(e.target.value)}
                                    placeholder="Contoh: SK_Rektor_Pedoman_Kurikulum_OBE_2024"
                                    className="w-full px-3.5 py-2 text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 text-slate-800"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Jika dikosongkan, nama asli berkas akan digunakan secara otomatis.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseUpload}
                                    disabled={isUploading}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadFile}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{isUploading ? 'Mengunggah...' : 'Upload & Simpan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Pratinjau Dokumen Eviden (Preview Modal) */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-300">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
                            <div className="flex items-center gap-3 min-w-0 mr-4">
                                <div className="p-2 bg-slate-100 border border-slate-200 shrink-0">
                                    {getFileIcon(previewDoc.name)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-800 truncate" title={previewDoc.name}>
                                            {previewDoc.name}
                                        </h3>
                                        <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                            {previewDoc.name?.split('.').pop() || 'DOKUMEN'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                        Ukuran: {previewDoc.size} • Diunggah {previewDoc.date || '-'} {previewDoc.uploader ? `oleh ${previewDoc.uploader}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={previewDoc.preview_url || route('akreditasi.lam.dokumen.preview', { document: previewDoc.id })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                                    title="Buka di Jendela / Tab Baru"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Tab Baru</span>
                                </a>

                                <a
                                    href={previewDoc.download_url || route('akreditasi.lam.dokumen.download', { document: previewDoc.id })}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                                    title="Unduh Berkas Dokumen"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Unduh Berkas</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                                    title="Tutup Pratinjau"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Isi Modal / Penampil Berkas */}
                        <div className="flex-1 bg-slate-100 overflow-hidden relative">
                            {(() => {
                                const lowerName = (previewDoc.name || '').toLowerCase();
                                const isPdf = lowerName.endsWith('.pdf');
                                const isImage =
                                    lowerName.endsWith('.png') ||
                                    lowerName.endsWith('.jpg') ||
                                    lowerName.endsWith('.jpeg') ||
                                    lowerName.endsWith('.webp') ||
                                    lowerName.endsWith('.gif') ||
                                    lowerName.endsWith('.svg');
                                const previewUrl =
                                    previewDoc.preview_url ||
                                    route('akreditasi.lam.dokumen.preview', { document: previewDoc.id });

                                if (isPdf) {
                                    return (
                                        <iframe
                                            src={`${previewUrl}#toolbar=1&navpanes=1`}
                                            className="w-full h-full border-0 bg-white"
                                            title={`Pratinjau ${previewDoc.name}`}
                                        />
                                    );
                                }

                                if (isImage) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto bg-slate-900/5">
                                            <img
                                                src={previewUrl}
                                                alt={previewDoc.name}
                                                className="max-w-full max-h-full object-contain border border-slate-200 bg-white shadow-xs"
                                            />
                                        </div>
                                    );
                                }

                                // Dokumen Office atau tipe berkas lain yang tidak mendukung render langsung di browser
                                return (
                                    <div className="w-full h-full flex items-center justify-center p-6">
                                        <div className="max-w-md w-full bg-white p-6 border border-slate-200 text-center shadow-xs space-y-4">
                                            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{previewDoc.name}</h4>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                                    Ukuran Berkas: {previewDoc.size}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                                                <div className="font-bold flex items-center gap-1.5">
                                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                    <span>Pratinjau Browser Tidak Didukung</span>
                                                </div>
                                                <p className="text-[11px] text-amber-800">
                                                    Format dokumen ini (.docx / .xlsx / .pptx) membutuhkan aplikasi pembaca di komputer Anda untuk melihat isinya secara menyeluruh.
                                                </p>
                                            </div>
                                            <div>
                                                <a
                                                    href={previewDoc.download_url || route('akreditasi.lam.dokumen.download', { document: previewDoc.id })}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Unduh & Buka Berkas Sekarang</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Gunakan bilah alat PDF bawaan di dalam penampil untuk memperbesar, memutar, atau mencetak borang.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewDoc(null)}
                                className="px-3 py-1 font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
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
