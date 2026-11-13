import React, { useState, useMemo } from 'react';
import { toastInfo } from '@/Utils/alert';
import {
    Folder,
    FolderOpen,
    FileText,
    FileSpreadsheet,
    FileCode,
    ChevronDown,
    ChevronRight,
    Plus,
    Eye,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Search,
    List,
    LayoutGrid,
    Layers,
    SlidersHorizontal,
    ChevronsUpDown,
    Check,
    Edit2,
    ExternalLink,
    Download,
    X,
    Info
} from 'lucide-react';

/**
 * PpeppFolderExplorer
 * Komponen penampil struktur folder kegiatan & 5 tahap PPEPP bergaya Windows File Explorer.
 * Mendukung 3 mode tampilan:
 * 1. 'compact' : List Ramping (Windows Tree View) - hemat ruang vertikal maksimal
 * 2. 'grid'    : Grid Folder (Windows Tiles View) - tampilan multi-kolom horizontal
 * 3. 'spacious': Tampilan Lengkap (Kartu lebar dengan deskripsi)
 */
export default function PpeppFolderExplorer({
    critId,
    critCode,
    critTitle,
    activities = [],
    ppeppStages = [],
    theme = 'indigo', // 'indigo' (BAN-PT) atau 'emerald' (LAM)
    onOpenUpload,
    onDeleteFile,
    onAddActivity,
    onEditActivity,
    onDeleteActivity,
}) {
    // Mode tampilan: 'compact' (default), 'grid', 'spacious'
    const [viewMode, setViewMode] = useState('compact');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal Pratinjau Dokumen Eviden (Preview)
    const [previewDoc, setPreviewDoc] = useState(null);

    // State buka-tutup kegiatan & subfolder
    const [expandedActivities, setExpandedActivities] = useState(() => {
        // Default: buka 2 kegiatan pertama agar langsung informatif
        const initial = {};
        activities.slice(0, 2).forEach((a) => {
            initial[a.id] = true;
        });
        return initial;
    });

    const [expandedFolders, setExpandedFolders] = useState(() => {
        const initial = {};
        if (activities[0]) {
            ppeppStages.forEach((s) => {
                initial[`${activities[0].id}-${s.key}`] = true;
            });
        }
        return initial;
    });

    // Untuk mode grid: folder kegiatan yang sedang aktif/dipilih untuk melihat isinya
    const [selectedGridActivityId, setSelectedGridActivityId] = useState(() => {
        return activities[0]?.id || null;
    });

    // Theme color helpers
    const isEmerald = theme === 'emerald';
    const primaryColor = isEmerald ? 'emerald' : 'indigo';
    const textTheme = isEmerald ? 'text-emerald-600' : 'text-indigo-600';
    const textThemeHover = isEmerald ? 'hover:text-emerald-700' : 'hover:text-indigo-700';
    const bgThemeLight = isEmerald ? 'bg-emerald-50' : 'bg-indigo-50';
    const bgThemeLightHover = isEmerald ? 'hover:bg-emerald-100' : 'hover:bg-indigo-100';
    const borderThemeLight = isEmerald ? 'border-emerald-200' : 'border-indigo-200';
    const ringTheme = isEmerald ? 'focus:ring-emerald-500/20' : 'focus:ring-indigo-500/20';

    // Toggle expand activity
    const toggleActivity = (actId) => {
        setExpandedActivities((prev) => ({
            ...prev,
            [actId]: !prev[actId],
        }));
    };

    // Toggle expand PPEPP stage folder
    const toggleFolder = (folderKey) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folderKey]: !prev[folderKey],
        }));
    };

    // Expand / Collapse All
    const handleExpandAll = () => {
        const newAct = {};
        const newFolders = {};
        activities.forEach((act) => {
            newAct[act.id] = true;
            ppeppStages.forEach((s) => {
                newFolders[`${act.id}-${s.key}`] = true;
            });
        });
        setExpandedActivities(newAct);
        setExpandedFolders(newFolders);
    };

    const handleCollapseAll = () => {
        setExpandedActivities({});
        setExpandedFolders({});
    };

    // Filter activities by search query
    const filteredActivities = useMemo(() => {
        if (!searchQuery.trim()) return activities;
        const q = searchQuery.toLowerCase();
        return activities.filter((act) => {
            const matchTitle = act.title_activity?.toLowerCase().includes(q);
            const matchDesc = act.description?.toLowerCase().includes(q);
            const matchYear = String(act.academic_year).includes(q);
            // Search inside file names as well
            let matchFile = false;
            if (act.ppepp_docs) {
                Object.values(act.ppepp_docs).forEach((fileList) => {
                    if (Array.isArray(fileList)) {
                        fileList.forEach((f) => {
                            if (f.name?.toLowerCase().includes(q)) matchFile = true;
                        });
                    }
                });
            }
            return matchTitle || matchDesc || matchYear || matchFile;
        });
    }, [activities, searchQuery]);

    // Helper to determine file icon
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

    // Selected activity for grid view
    const selectedGridAct = useMemo(() => {
        return activities.find((a) => a.id === selectedGridActivityId) || activities[0] || null;
    }, [activities, selectedGridActivityId]);

    return (
        <div className="bg-slate-50/70 p-3 sm:p-4  border border-slate-200/80 space-y-3">
            {/* Windows File Explorer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 bg-white/60 p-2.5  border">
                {/* Search / Filter input */}
                <div className="relative flex-1 min-w-[200px] max-w-xs sm:max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari kegiatan atau nama file..."
                        className={`w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200  focus:outline-none focus:ring-2 ${ringTheme} text-slate-700 placeholder:text-slate-400`}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Quick Info & Action Controls */}
                <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 hidden md:inline-block">
                        Total: <strong className="text-slate-700">{filteredActivities.length}</strong> Kegiatan
                    </span>

                    {/* Expand/Collapse All Buttons */}
                    <div className="flex items-center bg-white border border-slate-200  overflow-hidden shadow-xs">
                        <button
                            type="button"
                            onClick={handleExpandAll}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors border-r border-slate-200"
                            title="Buka semua folder kegiatan dan PPEPP"
                        >
                            Buka Semua
                        </button>
                        <button
                            type="button"
                            onClick={handleCollapseAll}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Ciutkan semua folder menjadi satu baris"
                        >
                            Ciutkan
                        </button>
                    </div>

                    {/* View Switcher: List Ramping | Grid Folder | Nyaman */}
                    <div className="flex items-center bg-white border border-slate-200  p-0.5 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('compact')}
                            className={`flex items-center gap-1 px-2 py-1  text-[11px] font-semibold transition-all ${
                                viewMode === 'compact'
                                    ? `${bgThemeLight} ${textTheme} shadow-xs font-bold`
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title="Tampilan List Ramping (Folder Tree Windows - Sangat Ringkas)"
                        >
                            <List className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">List Ramping</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1 px-2 py-1  text-[11px] font-semibold transition-all ${
                                viewMode === 'grid'
                                    ? `${bgThemeLight} ${textTheme} shadow-xs font-bold`
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title="Tampilan Grid Folder (Windows Tiles - Multi Kolom)"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Grid Folder</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('spacious')}
                            className={`flex items-center gap-1 px-2 py-1  text-[11px] font-semibold transition-all ${
                                viewMode === 'spacious'
                                    ? `${bgThemeLight} ${textTheme} shadow-xs font-bold`
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title="Tampilan Penuh (Kartu Luas dengan deskripsi)"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Penuh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty States */}
            {activities.length === 0 ? (
                <div className="p-8 text-center bg-white  border border-dashed border-slate-300">
                    <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Belum ada kegiatan di Kriteria {critCode}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Klik tombol Tambah Kegiatan untuk membuat folder kegiatan baru.</p>
                    <button
                        type="button"
                        onClick={onAddActivity}
                        className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5  text-xs font-semibold text-white ${
                            isEmerald ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                        } transition-colors shadow-xs`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Kegiatan</span>
                    </button>
                </div>
            ) : filteredActivities.length === 0 ? (
                <div className="p-6 text-center bg-white  border border-slate-200 text-xs text-slate-500">
                    Tidak ditemukan kegiatan atau berkas yang cocok dengan pencarian "{searchQuery}".
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className={`block mx-auto mt-2 font-semibold ${textTheme} underline`}
                    >
                        Reset Pencarian
                    </button>
                </div>
            ) : null}

            {/* ============================================================== */}
            {/* MODE 1: COMPACT LIST (WINDOWS EXPLORER TREE VIEW - DEFAULT)     */}
            {/* ============================================================== */}
            {viewMode === 'compact' && filteredActivities.length > 0 && (
                <div className="space-y-1.5">
                    {filteredActivities.map((act) => {
                        const isActOpen = !!expandedActivities[act.id];
                        const stagesWithFiles = ppeppStages.filter(
                            (s) => act.ppepp_docs[s.key] && act.ppepp_docs[s.key].length > 0
                        ).length;
                        const isAllStagesComplete = stagesWithFiles === 5;

                        // Total files across all PPEPP stages in this activity
                        const totalFilesInAct = Object.values(act.ppepp_docs || {}).reduce(
                            (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
                            0
                        );

                        return (
                            <div
                                key={act.id}
                                className={` border transition-all duration-150 ${
                                    isActOpen
                                        ? 'bg-white border-slate-300 shadow-xs'
                                        : 'bg-white/95 border-slate-200 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                                {/* Activity Folder Row (Windows Explorer Style) */}
                                <div className="py-2 px-2.5 sm:px-3 flex items-center justify-between gap-2.5 group">
                                    <button
                                        type="button"
                                        onClick={() => toggleActivity(act.id)}
                                        className="flex items-center gap-2 sm:gap-2.5 text-left flex-1 min-w-0"
                                    >
                                        {/* Chevron Toggle */}
                                        <div className="text-slate-400 group-hover:text-slate-700 transition-transform">
                                            {isActOpen ? (
                                                <ChevronDown className="w-4 h-4 text-indigo-600" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>

                                        {/* Classic Windows Explorer Yellow/Amber Folder Icon */}
                                        <div className="shrink-0">
                                            {isActOpen ? (
                                                <FolderOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-400/30" />
                                            ) : (
                                                <Folder className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-400/25" />
                                            )}
                                        </div>

                                        {/* Folder Name & Year */}
                                        <div className="flex items-center gap-2 min-w-0 truncate">
                                            <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                                {act.title_activity}
                                            </span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.2  bg-slate-100 text-slate-500 shrink-0 font-medium border border-slate-200/60">
                                                Th. {act.academic_year}
                                            </span>
                                            <span className="text-[10px] text-slate-400 hidden lg:inline shrink-0">
                                                • {totalFilesInAct} berkas
                                            </span>
                                        </div>
                                    </button>

                                    {/* Status Badge 5 PPEPP (Compact) */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* 5-segment mini progress bar */}
                                        <div
                                            className="hidden sm:flex items-center gap-0.5"
                                            title={`${stagesWithFiles} dari 5 siklus PPEPP memiliki eviden berkas`}
                                        >
                                            {ppeppStages.map((stage) => {
                                                const hasF = act.ppepp_docs[stage.key]?.length > 0;
                                                return (
                                                    <span
                                                        key={stage.key}
                                                        className={`w-1.5 h-3  ${
                                                            hasF ? 'bg-emerald-500' : 'bg-slate-200'
                                                        }`}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5  text-[11px] font-semibold border ${
                                                isAllStagesComplete
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}
                                        >
                                            {isAllStagesComplete ? (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                            )}
                                            <span>{stagesWithFiles}/5 PPEPP</span>
                                        </span>

                                        {/* Aksi Edit & Hapus Folder Kegiatan */}
                                        {onEditActivity && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditActivity(critId, act);
                                                }}
                                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                                title="Edit Nama / Tahun Kegiatan"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {onDeleteActivity && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteActivity(critId, act);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Hapus Kegiatan & Seluruh Berkas"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-Folders PPEPP Tree Structure */}
                                {isActOpen && (
                                    <div className="ml-5 sm:ml-7 pl-3.5 border-l-2 border-indigo-100 my-1 pb-2 space-y-1">
                                        {act.description && (
                                            <p className="text-[11px] text-slate-400 py-0.5 pr-3 line-clamp-1 italic">
                                                Catatan: {act.description}
                                            </p>
                                        )}

                                        {ppeppStages.map((stage) => {
                                            const folderKey = `${act.id}-${stage.key}`;
                                            const isFolderOpen = !!expandedFolders[folderKey];
                                            const files = act.ppepp_docs[stage.key] || [];
                                            const hasFiles = files.length > 0;

                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={` border transition-all ${
                                                        hasFiles
                                                            ? 'bg-white border-slate-200/80 hover:border-slate-300'
                                                            : 'bg-rose-50/30 border-rose-200/80 hover:bg-rose-50/50'
                                                    }`}
                                                >
                                                    {/* PPEPP Subfolder Row */}
                                                    <div className="py-1 px-2 sm:px-2.5 flex items-center justify-between text-xs gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFolder(folderKey)}
                                                            className="flex items-center gap-2 text-left flex-1 min-w-0"
                                                        >
                                                            <span className="text-slate-400">
                                                                {isFolderOpen ? (
                                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                                                ) : (
                                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                                )}
                                                            </span>

                                                            {/* Windows Yellow Folder Icon for Subfolder */}
                                                            <div className="shrink-0">
                                                                {isFolderOpen ? (
                                                                    <FolderOpen
                                                                        className={`w-4 h-4 ${
                                                                            hasFiles
                                                                                ? 'text-amber-500 fill-amber-400/30'
                                                                                : 'text-rose-500 fill-rose-400/20'
                                                                        }`}
                                                                    />
                                                                ) : (
                                                                    <Folder
                                                                        className={`w-4 h-4 ${
                                                                            hasFiles
                                                                                ? 'text-amber-500 fill-amber-400/25'
                                                                                : 'text-rose-500 fill-rose-400/15'
                                                                        }`}
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 min-w-0 truncate">
                                                                <span
                                                                    className={`font-semibold text-xs truncate ${
                                                                        hasFiles ? 'text-slate-700' : 'text-rose-600'
                                                                    }`}
                                                                >
                                                                    {stage.label}
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] px-1.5 py-0.2  font-medium shrink-0 ${
                                                                        hasFiles
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                            : 'bg-rose-100 text-rose-700 font-bold'
                                                                    }`}
                                                                >
                                                                    {hasFiles
                                                                        ? `${files.length} berkas`
                                                                        : 'Kosong (Belum Ada File)'}
                                                                </span>
                                                            </div>
                                                        </button>

                                                        {/* Quick Upload Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onOpenUpload(
                                                                    critId,
                                                                    act.id,
                                                                    stage.key,
                                                                    stage.label,
                                                                    act.title_activity
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5  text-[11px] font-semibold transition-all shrink-0 ${
                                                                hasFiles
                                                                    ? `${bgThemeLight} ${textTheme} ${bgThemeLightHover} border border-slate-200`
                                                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                                            }`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            <span>Upload</span>
                                                        </button>
                                                    </div>

                                                    {/* Files List Inside Subfolder */}
                                                    {isFolderOpen && (
                                                        <div className="ml-5 sm:ml-6 pl-3 border-l border-slate-200 py-1 pr-2 space-y-0.5 bg-slate-50/50 -lg">
                                                            {!hasFiles ? (
                                                                <div className="py-1 px-2 text-[11px] text-rose-600 flex items-center justify-between">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <AlertCircle className="w-3 h-3 text-rose-500" />
                                                                        Belum ada eviden berkas. Klik Upload untuk menambahkan dokumen.
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            onOpenUpload(
                                                                                critId,
                                                                                act.id,
                                                                                stage.key,
                                                                                stage.label,
                                                                                act.title_activity
                                                                            )
                                                                        }
                                                                        className="underline font-bold text-rose-700 hover:text-rose-800 ml-2"
                                                                    >
                                                                        Upload Sekarang
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                files.map((file) => (
                                                                    <div
                                                                        key={file.id}
                                                                        className="py-1 px-2  hover:bg-white flex items-center justify-between text-xs group transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-2 min-w-0 truncate">
                                                                            {getFileIcon(file.name)}
                                                                            <span
                                                                                className="text-slate-700 font-medium truncate hover:text-indigo-600 cursor-pointer text-xs"
                                                                                onClick={() => {
                                                                                    if (file.url) {
                                                                                        window.open(file.url, '_blank');
                                                                                    } else {
                                                                                        toastInfo(`Membuka berkas: ${file.name}`);
                                                                                    }
                                                                                }}
                                                                                title={file.name}
                                                                            >
                                                                                {file.name}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                                                ({file.size} • {file.date})
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setPreviewDoc(file)}
                                                                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                                title="Pratinjau Dokumen (Preview)"
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                            </button>
                                                                            {(file.download_url || file.url) && (
                                                                                <a
                                                                                    href={file.download_url || file.url}
                                                                                    download
                                                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                                                    title="Unduh Berkas Langsung"
                                                                                >
                                                                                    <Download className="w-3 h-3" />
                                                                                </a>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    onDeleteFile(
                                                                                        critId,
                                                                                        act.id,
                                                                                        stage.key,
                                                                                        file.id,
                                                                                        file.name
                                                                                    )
                                                                                }
                                                                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                                                title="Hapus Berkas"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
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
                    })}
                </div>
            )}

            {/* ============================================================== */}
            {/* MODE 2: GRID FOLDER (WINDOWS TILES VIEW - HORIZONTAL COMPACT)   */}
            {/* ============================================================== */}
            {viewMode === 'grid' && filteredActivities.length > 0 && (
                <div className="space-y-3">
                    {/* Folder Tiles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {filteredActivities.map((act) => {
                            const isSelected = selectedGridActivityId === act.id;
                            const stagesWithFiles = ppeppStages.filter(
                                (s) => act.ppepp_docs[s.key] && act.ppepp_docs[s.key].length > 0
                            ).length;
                            const isAllStagesComplete = stagesWithFiles === 5;

                            return (
                                <div
                                    key={act.id}
                                    onClick={() => setSelectedGridActivityId(act.id)}
                                    className={`p-2.5  border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left group ${
                                        isSelected
                                            ? `bg-white ${borderThemeLight} ring-2 ring-indigo-500/15 shadow-sm`
                                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {/* Windows Folder Icon */}
                                        <div className="shrink-0 p-1">
                                            {isSelected ? (
                                                <FolderOpen className="w-7 h-7 text-amber-500 fill-amber-400/30 group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <Folder className="w-7 h-7 text-amber-500 fill-amber-400/25 group-hover:scale-105 transition-transform" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-xs font-bold line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors ${
                                                    isSelected ? textTheme : 'text-slate-800'
                                                }`}
                                                title={act.title_activity}
                                            >
                                                {act.title_activity}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                                                Th. {act.academic_year}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer: Mini PPEPP indicator */}
                                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                                        <span className="text-slate-400 font-medium">PPEPP:</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center gap-0.5">
                                                {ppeppStages.map((stage) => {
                                                    const hasF = act.ppepp_docs[stage.key]?.length > 0;
                                                    return (
                                                        <span
                                                            key={stage.key}
                                                            className={`w-1.5 h-2  ${
                                                                hasF ? 'bg-emerald-500' : 'bg-slate-200'
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span
                                                className={`font-semibold px-1.5 py-0.2  ${
                                                    isAllStagesComplete
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-rose-50 text-rose-700'
                                                }`}
                                            >
                                                {stagesWithFiles}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Pane untuk Folder yang Dipilih di Mode Grid */}
                    {selectedGridAct && (
                        <div className="bg-white  border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-amber-500 fill-amber-400/30" />
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                            {selectedGridAct.title_activity}
                                        </h4>
                                        <p className="text-[10px] text-slate-400">
                                            Tahun Akademik: {selectedGridAct.academic_year} • 5 Tahap Siklus PPEPP
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PPEPP Stages Tree for Selected Activity */}
                            <div className="space-y-1.5">
                                {ppeppStages.map((stage) => {
                                    const folderKey = `${selectedGridAct.id}-${stage.key}`;
                                    const isFolderOpen = !!expandedFolders[folderKey];
                                    const files = selectedGridAct.ppepp_docs[stage.key] || [];
                                    const hasFiles = files.length > 0;

                                    return (
                                        <div
                                            key={stage.key}
                                            className={` border transition-all ${
                                                hasFiles ? 'bg-slate-50/50 border-slate-200' : 'bg-rose-50/30 border-rose-200'
                                            }`}
                                        >
                                            <div className="py-1.5 px-2.5 flex items-center justify-between text-xs gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFolder(folderKey)}
                                                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                                                >
                                                    <span className="text-slate-400">
                                                        {isFolderOpen ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                        )}
                                                    </span>
                                                    <Folder
                                                        className={`w-4 h-4 shrink-0 ${
                                                            hasFiles
                                                                ? 'text-amber-500 fill-amber-400/25'
                                                                : 'text-rose-500 fill-rose-400/20'
                                                        }`}
                                                    />
                                                    <span
                                                        className={`font-semibold text-xs truncate ${
                                                            hasFiles ? 'text-slate-700' : 'text-rose-600'
                                                        }`}
                                                    >
                                                        {stage.label}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] px-1.5 py-0.2  font-medium shrink-0 ${
                                                            hasFiles
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-rose-100 text-rose-700'
                                                        }`}
                                                    >
                                                        {hasFiles ? `${files.length} berkas` : 'Belum Ada'}
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onOpenUpload(
                                                            critId,
                                                            selectedGridAct.id,
                                                            stage.key,
                                                            stage.label,
                                                            selectedGridAct.title_activity
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5  text-[11px] font-semibold ${
                                                        hasFiles
                                                            ? `${bgThemeLight} ${textTheme} ${bgThemeLightHover}`
                                                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                                    }`}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>Upload</span>
                                                </button>
                                            </div>

                                            {isFolderOpen && (
                                                <div className="ml-5 sm:ml-6 pl-3 border-l border-slate-200 py-1 pr-2 space-y-0.5 bg-white -lg">
                                                    {!hasFiles ? (
                                                        <div className="py-1 px-2 text-[11px] text-rose-600 flex items-center justify-between">
                                                            <span>Belum ada eviden berkas.</span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    onOpenUpload(
                                                                        critId,
                                                                        selectedGridAct.id,
                                                                        stage.key,
                                                                        stage.label,
                                                                        selectedGridAct.title_activity
                                                                    )
                                                                }
                                                                className="underline font-bold text-rose-700 hover:text-rose-800"
                                                            >
                                                                Upload Sekarang
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        files.map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className="py-1 px-2  hover:bg-slate-50 flex items-center justify-between text-xs group"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0 truncate">
                                                                    {getFileIcon(file.name)}
                                                                    <span
                                                                        className="text-slate-700 font-medium truncate hover:text-indigo-600 cursor-pointer text-xs"
                                                                        onClick={() =>
                                                                            toastInfo(`Membuka berkas: ${file.name}`)
                                                                        }
                                                                    >
                                                                        {file.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                                        ({file.size})
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewDoc(file)}
                                                                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                        title="Pratinjau Dokumen (Preview)"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                    </button>
                                                                    {(file.download_url || file.url) && (
                                                                        <a
                                                                            href={file.download_url || file.url}
                                                                            download
                                                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                                            title="Unduh Berkas Langsung"
                                                                        >
                                                                            <Download className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            onDeleteFile(
                                                                                critId,
                                                                                selectedGridAct.id,
                                                                                stage.key,
                                                                                file.id,
                                                                                file.name
                                                                            )
                                                                        }
                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                                        title="Hapus Berkas"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
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
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* MODE 3: SPACIOUS CARDS (TAMPILAN NYAMAN / ORIGINAL KARTU)      */}
            {/* ============================================================== */}
            {viewMode === 'spacious' && filteredActivities.length > 0 && (
                <div className="space-y-3">
                    {filteredActivities.map((act) => {
                        const isActOpen = !!expandedActivities[act.id];
                        const stagesWithFiles = ppeppStages.filter(
                            (s) => act.ppepp_docs[s.key] && act.ppepp_docs[s.key].length > 0
                        ).length;
                        const isAllStagesComplete = stagesWithFiles === 5;

                        return (
                            <div
                                key={act.id}
                                className=" bg-white border border-slate-200/90 shadow-xs overflow-hidden"
                            >
                                <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => toggleActivity(act.id)}
                                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                                    >
                                        <div className={`${textTheme} p-1`}>
                                            {isActOpen ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="p-2  bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
                                            {isActOpen ? (
                                                <FolderOpen className="w-5 h-5 text-amber-500" />
                                            ) : (
                                                <Folder className="w-5 h-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {act.title_activity}
                                                </span>
                                                <span className="text-[10px] font-mono px-2 py-0.2  bg-slate-100 text-slate-600">
                                                    Th. {act.academic_year}
                                                </span>
                                            </div>
                                            {act.description && (
                                                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl line-clamp-1">
                                                    {act.description}
                                                </p>
                                            )}
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1  text-xs font-semibold ${
                                                isAllStagesComplete
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}
                                        >
                                            {isAllStagesComplete ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                            )}
                                            <span>{stagesWithFiles}/5 PPEPP</span>
                                        </span>

                                        {/* Aksi Edit & Hapus Folder Kegiatan */}
                                        {onEditActivity && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditActivity(critId, act);
                                                }}
                                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                                title="Edit Nama / Tahun Kegiatan"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {onDeleteActivity && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteActivity(critId, act);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Hapus Kegiatan & Seluruh Berkas"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isActOpen && (
                                    <div className="p-3 pl-6 sm:pl-10 bg-slate-50/70 border-t border-slate-100 space-y-2">
                                        {ppeppStages.map((stage) => {
                                            const folderKey = `${act.id}-${stage.key}`;
                                            const isFolderOpen = !!expandedFolders[folderKey];
                                            const files = act.ppepp_docs[stage.key] || [];
                                            const hasFiles = files.length > 0;

                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={` border transition-all ${
                                                        hasFiles
                                                            ? 'bg-white border-slate-200 shadow-xs'
                                                            : 'bg-rose-50/40 border-rose-200 shadow-xs'
                                                    }`}
                                                >
                                                    <div className="p-2.5 flex items-center justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFolder(folderKey)}
                                                            className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                                                        >
                                                            <div className="text-slate-400">
                                                                {isFolderOpen ? (
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                                )}
                                                            </div>
                                                            <div
                                                                className={`p-1  ${
                                                                    hasFiles ? bgThemeLight : 'bg-rose-100'
                                                                }`}
                                                            >
                                                                <Folder
                                                                    className={`w-4 h-4 ${
                                                                        hasFiles ? 'text-amber-500' : 'text-rose-600'
                                                                    }`}
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span
                                                                    className={`text-xs font-bold ${
                                                                        hasFiles ? 'text-slate-800' : 'text-rose-600'
                                                                    }`}
                                                                >
                                                                    {stage.label}
                                                                </span>
                                                                <span
                                                                    className={`ml-2 text-[10px] font-bold px-1.5 py-0.2  ${
                                                                        hasFiles
                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                            : 'bg-rose-100 text-rose-700'
                                                                    }`}
                                                                >
                                                                    {hasFiles
                                                                        ? `${files.length} File`
                                                                        : 'Belum Ada'}
                                                                </span>
                                                            </div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onOpenUpload(
                                                                    critId,
                                                                    act.id,
                                                                    stage.key,
                                                                    stage.label,
                                                                    act.title_activity
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1  text-xs font-semibold ${
                                                                hasFiles
                                                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                                                            }`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            <span>Add File</span>
                                                        </button>
                                                    </div>

                                                    {isFolderOpen && (
                                                        <div className="p-2.5 pl-8 border-t border-slate-100 bg-white/70 space-y-1.5">
                                                            {files.map((file) => (
                                                                <div
                                                                    key={file.id}
                                                                    className="flex items-center justify-between p-2  bg-slate-50 border border-slate-200/70 text-xs"
                                                                >
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        {getFileIcon(file.name)}
                                                                        <span className="font-semibold text-slate-800 truncate">
                                                                            {file.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 shrink-0">
                                                                            ({file.size} • {file.date})
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewDoc(file)}
                                                                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                            title="Pratinjau Dokumen (Preview)"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        {(file.download_url || file.url) && (
                                                                            <a
                                                                                href={file.download_url || file.url}
                                                                                download
                                                                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                                                title="Unduh Berkas Langsung"
                                                                            >
                                                                                <Download className="w-3.5 h-3.5" />
                                                                            </a>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                onDeleteFile(
                                                                                    critId,
                                                                                    act.id,
                                                                                    stage.key,
                                                                                    file.id,
                                                                                    file.name
                                                                                )
                                                                            }
                                                                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                                            title="Hapus Berkas"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Modal Pratinjau Dokumen Eviden (Preview Modal) */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fade-in text-left">
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
                                {(previewDoc.preview_url || previewDoc.url) && (
                                    <a
                                        href={previewDoc.preview_url || previewDoc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                                        title="Buka di Jendela / Tab Baru"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Tab Baru</span>
                                    </a>
                                )}

                                {(previewDoc.download_url || previewDoc.url) && (
                                    <a
                                        href={previewDoc.download_url || previewDoc.url}
                                        download
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                                        title="Unduh Berkas Dokumen"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Unduh Berkas</span>
                                    </a>
                                )}

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
                                const previewUrl = previewDoc.preview_url || previewDoc.url;

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

                                // Dokumen Office atau tipe berkas lain
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
                                                    Format dokumen ini (.docx / .xlsx / .pptx) membutuhkan aplikasi pembaca di komputer Anda untuk melihat isinya secara lengkap.
                                                </p>
                                            </div>
                                            <div>
                                                <a
                                                    href={previewDoc.download_url || previewDoc.url}
                                                    download
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
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
        </div>
    );
}
