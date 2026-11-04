import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useMemo } from 'react';
import {
    Building2,
    GraduationCap,
    Award,
    FileSpreadsheet,
    FileText,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    FolderKanban,
    Layers,
    Landmark,
    Calendar,
    ChevronRight,
    Sparkles,
    Check,
    Database,
    Plus
} from 'lucide-react';

export default function Dashboard({
    auth,
    stats = {},
    ppeppStats = [],
    activeSessions = [],
    recentActivities = [],
}) {
    // Total kegiatan untuk kalkulasi persentase status
    const totalAct = (stats.status_published ?? 0) + (stats.status_draft ?? 0) + (stats.status_rejected ?? 0);
    const pubPercent = totalAct > 0 ? Math.round(((stats.status_published ?? 0) / totalAct) * 100) : 0;
    const draftPercent = totalAct > 0 ? Math.round(((stats.status_draft ?? 0) / totalAct) * 100) : 0;
    const rejPercent = totalAct > 0 ? Math.round(((stats.status_rejected ?? 0) / totalAct) * 100) : 0;

    // Total dokumen eviden di seluruh siklus PPEPP
    const totalPpeppDocs = useMemo(() => {
        return ppeppStats.reduce((acc, curr) => acc + (curr.count || 0), 0);
    }, [ppeppStats]);

    // Data kartu KPI
    const statCards = [
        {
            title: 'Program Studi',
            value: stats.total_prodis ?? 0,
            subtitle: `${stats.total_faculties ?? 0} Fakultas Terdaftar`,
            icon: GraduationCap,
            bgColor: 'bg-emerald-50 text-emerald-700',
            borderColor: 'border-emerald-200',
            href: '/master/prodi',
        },
        {
            title: 'Sesi Akreditasi Aktif',
            value: stats.total_active_sessions ?? 0,
            subtitle: `Dari total ${stats.total_sessions ?? 0} sesi`,
            icon: Award,
            bgColor: 'bg-indigo-50 text-indigo-700',
            borderColor: 'border-indigo-200',
            href: '/master/sesi',
        },
        {
            title: 'Dokumen Eviden PPEPP',
            value: stats.total_documents ?? 0,
            subtitle: 'Berkas tersimpan di storage',
            icon: FileText,
            bgColor: 'bg-blue-50 text-blue-700',
            borderColor: 'border-blue-200',
            href: '/kegiatan',
        },
        {
            title: 'Kegiatan Pemenuhan Mutu',
            value: stats.total_activities ?? 0,
            subtitle: `${stats.status_published ?? 0} berstatus published`,
            icon: FileSpreadsheet,
            bgColor: 'bg-amber-50 text-amber-700',
            borderColor: 'border-amber-200',
            href: '/kegiatan',
        },
    ];

    // Warna & keterangan tahapan PPEPP
    const ppeppColorMap = {
        1: { label: 'Penetapan (P)', color: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50', border: 'border-indigo-200' },
        2: { label: 'Pelaksanaan (P)', color: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200' },
        3: { label: 'Evaluasi (E)', color: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-200' },
        4: { label: 'Pengendalian (P)', color: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-200' },
        5: { label: 'Peningkatan (P)', color: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - Repositori Akreditasi" />

            <div className="space-y-6">
                {/* Hero / Welcome Banner */}
                <div className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-7 border border-slate-800 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-400/30">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Sistem Manajemen Repositori Akreditasi & PPEPP</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Selamat Datang, {auth?.user?.name || 'Administrator'}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                Kelola instrumen akreditasi BAN-PT, LAM, bukti kegiatan tridharma, serta siklus penjaminan mutu PPEPP perguruan tinggi secara terpusat.
                            </p>
                        </div>

                        {/* Pintasan Aksi Header */}
                        <div className="flex flex-wrap gap-2.5 shrink-0">
                            <Link
                                href="/akreditasi/ban-pt"
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Landmark className="w-3.5 h-3.5" />
                                <span>Instrumen BAN-PT</span>
                            </Link>
                            <Link
                                href="/akreditasi/lam"
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Instrumen LAM</span>
                            </Link>
                            <Link
                                href="/kegiatan"
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Data Kegiatan</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.href}
                                className="group bg-white p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 ${card.bgColor} border ${card.borderColor}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
                                    <p className="text-2xl font-black text-slate-800 mt-0.5">{card.value}</p>
                                </div>
                                <div className="mt-2 text-[11px] text-slate-400 font-medium">
                                    {card.subtitle}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Grid 2 Kolom: Kesiapan Dokumen PPEPP & Distribusi Status Kegiatan */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri (2 Kolom): Distribusi Dokumen Siklus PPEPP */}
                    <div className="lg:col-span-2 bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Kesiapan Berkas Penjaminan Mutu PPEPP (5 Tahapan)
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Distribusi berkas eviden yang telah terdistribusi pada siklus PPEPP.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
                                Total: {totalPpeppDocs} Dokumen
                            </span>
                        </div>

                        {/* List 5 Tahapan PPEPP */}
                        <div className="space-y-3.5 pt-1">
                            {ppeppStats.map((item) => {
                                const meta = ppeppColorMap[item.code_ppepp] || {
                                    label: item.title_ppepp,
                                    color: 'bg-slate-500',
                                    text: 'text-slate-700',
                                    bgLight: 'bg-slate-50',
                                    border: 'border-slate-200',
                                };
                                const percent = totalPpeppDocs > 0 ? Math.round((item.count / totalPpeppDocs) * 100) : 0;

                                return (
                                    <div key={item.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.bgLight} ${meta.text} border ${meta.border}`}>
                                                    Tahap {item.code_ppepp}
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {item.title_ppepp}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                <span>{item.count} Berkas</span>
                                                <span className="text-slate-400 font-normal">({percent}%)</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Flat */}
                                        <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                            <div
                                                className={`h-full ${meta.color} transition-all duration-500`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">
                                *Acuan standar audit mutu SPMI Permendikbudristek & LAM
                            </span>
                            <Link
                                href="/akreditasi/matriks-ppepp"
                                className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                Lihat Matriks PPEPP <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Kolom Kanan: Status Kesiapan Eviden */}
                    <div className="bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    Status Kegiatan
                                </h2>
                                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700">
                                    Total: {totalAct}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published (Valid)
                                        </span>
                                        <span className="text-slate-700 font-semibold">
                                            {stats.status_published ?? 0} ({pubPercent}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pubPercent}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Draft (Pengumpulan)
                                        </span>
                                        <span className="text-slate-700 font-semibold">
                                            {stats.status_draft ?? 0} ({draftPercent}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${draftPercent}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected (Revisi)
                                        </span>
                                        <span className="text-slate-700 font-semibold">
                                            {stats.status_rejected ?? 0} ({rejPercent}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${rejPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Link
                                href="/kegiatan"
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            >
                                <span>Kelola Seluruh Kegiatan & Eviden</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sesi Akreditasi Aktif Widget (BAN-PT & LAM) */}
                <div className="bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                                <Award className="w-4 h-4 text-indigo-600" />
                                Sesi Akreditasi Aktif (Institusi & Program Studi)
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Periode evaluasi, target peringkat, dan siklus tahun acuan TS yang sedang berjalan.
                            </p>
                        </div>
                        <Link
                            href="/master/sesi"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            Konfigurasi Sesi <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {activeSessions.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 p-4">
                            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-600">Belum ada Sesi Akreditasi yang diaktifkan.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Buat dan aktifkan sesi akreditasi BAN-PT atau LAM melalui menu Master Data Sesi.
                            </p>
                            <Link
                                href="/master/sesi"
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Sesi Akreditasi</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {activeSessions.map((session) => {
                                const isBanPt = session.agency_code === 'BAN-PT' || session.agency_level === 'univs';
                                const targetUrl = isBanPt
                                    ? `/akreditasi/ban-pt?session_id=${session.id}`
                                    : `/akreditasi/lam`;

                                return (
                                    <div
                                        key={session.id}
                                        className="p-4 border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                                        isBanPt
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}
                                                >
                                                    {session.agency_code}
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                                                    {session.year_start}–{session.year_end}
                                                </span>
                                            </div>

                                            <h3 className="text-xs font-bold text-slate-800 line-clamp-2">
                                                {session.name}
                                            </h3>

                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {session.prodi_name}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Acuan TS:</span>
                                                <strong className="text-slate-700 font-bold">{session.ts_year} ({session.ts_count} Thn)</strong>
                                            </div>

                                            <Link
                                                href={targetUrl}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                <span>Buka Borang</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modul Akses Cepat */}
                <div className="bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-indigo-600" />
                            Pintasan Modul & Instrumen Akreditasi
                        </h2>
                        <span className="text-xs text-slate-400">Navigasi Utama</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link
                            href="/akreditasi/ban-pt"
                            className="group p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                                    <Landmark className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        BAN-PT (4 Kriteria)
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Instrumen Perguruan Tinggi</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-semibold mt-3 flex items-center gap-1">
                                Kelola Borang Institusi <ChevronRight className="w-3 h-3" />
                            </span>
                        </Link>

                        <Link
                            href="/akreditasi/lam"
                            className="group p-4 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                        LAM (9 Kriteria)
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Folderisasi TS & PPEPP Prodi</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
                                Kelola Borang Prodi <ChevronRight className="w-3 h-3" />
                            </span>
                        </Link>

                        <Link
                            href="/akreditasi/matriks-ppepp"
                            className="group p-4 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                        Matriks Mutu PPEPP
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Audit Pemenuhan Standar</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-purple-600 font-semibold mt-3 flex items-center gap-1">
                                Tinjau Matriks <ChevronRight className="w-3 h-3" />
                            </span>
                        </Link>

                        <Link
                            href="/master/prodi"
                            className="group p-4 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                                    <Database className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                                        Master Data Sistem
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Prodi, Sesi, User & Periode</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-amber-600 font-semibold mt-3 flex items-center gap-1">
                                Konfigurasi Master <ChevronRight className="w-3 h-3" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Aktivitas & Eviden Terbaru */}
                <div className="bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                            Aktivitas & Eviden Kegiatan Terbaru
                        </h2>
                        <Link href="/kegiatan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="py-10 text-center bg-slate-50 border border-dashed border-slate-200 p-4">
                            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-600">Belum ada kegiatan yang tercatat.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Tambahkan kegiatan pemenuhan mutu melalui instrumen BAN-PT atau LAM.
                            </p>
                            <Link
                                href="/akreditasi/lam"
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Input Kegiatan Baru</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 border border-slate-200">
                                <thead className="bg-slate-50 text-[11px] uppercase text-slate-600 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2.5">Nama Kegiatan</th>
                                        <th className="px-4 py-2.5">Kriteria & Lembaga</th>
                                        <th className="px-4 py-2.5">Sasaran</th>
                                        <th className="px-4 py-2.5">Tahun</th>
                                        <th className="px-4 py-2.5 text-center">Berkas</th>
                                        <th className="px-4 py-2.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentActivities.map((act) => (
                                        <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-2.5 font-bold text-slate-800">
                                                <div>{act.title_activity}</div>
                                                {act.description && (
                                                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                                                        {act.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[10px]">
                                                        {act.criteria_code}
                                                    </span>
                                                    <span className="truncate max-w-[180px] text-slate-700 font-medium" title={act.criteria_name}>
                                                        {act.criteria_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-600 font-medium">
                                                {act.prodi_name}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-slate-700 font-semibold">
                                                {act.academic_year}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                                                    <FileText className="w-2.5 h-2.5" />
                                                    {act.documents_count} Dokumen
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                        act.status === 'published'
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                            : act.status === 'draft'
                                                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                            : 'bg-rose-50 text-rose-800 border-rose-300'
                                                    }`}
                                                >
                                                    {act.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
