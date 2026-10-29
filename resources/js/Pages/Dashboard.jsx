import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    GraduationCap,
    Award,
    FileSpreadsheet,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    FolderKanban
} from 'lucide-react';

export default function Dashboard({ auth, stats = {}, recentActivities = [] }) {
    const statCards = [
        {
            title: 'Fakultas',
            value: stats.total_faculties ?? 0,
            icon: Building2,
            color: 'from-blue-600 to-indigo-600',
            bgColor: 'bg-blue-50 text-blue-600',
            href: '/master/fakultas',
        },
        {
            title: 'Program Studi',
            value: stats.total_prodis ?? 0,
            icon: GraduationCap,
            color: 'from-emerald-600 to-teal-600',
            bgColor: 'bg-emerald-50 text-emerald-600',
            href: '/master/prodi',
        },
        {
            title: 'Kriteria Akreditasi',
            value: stats.total_criterias ?? 0,
            icon: Award,
            color: 'from-amber-600 to-orange-600',
            bgColor: 'bg-amber-50 text-amber-600',
            href: '/master/kriteria',
        },
        {
            title: 'Kegiatan & Eviden',
            value: stats.total_activities ?? 0,
            icon: FileSpreadsheet,
            color: 'from-purple-600 to-pink-600',
            bgColor: 'bg-purple-50 text-purple-600',
            href: '/kegiatan',
        },
    ];

    const totalAct = (stats.status_published ?? 0) + (stats.status_draft ?? 0) + (stats.status_rejected ?? 0);
    const pubPercent = totalAct > 0 ? Math.round(((stats.status_published ?? 0) / totalAct) * 100) : 0;
    const draftPercent = totalAct > 0 ? Math.round(((stats.status_draft ?? 0) / totalAct) * 100) : 0;
    const rejPercent = totalAct > 0 ? Math.round(((stats.status_rejected ?? 0) / totalAct) * 100) : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Hero / Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl border border-indigo-900/40">
                    <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-indigo-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute top-0 right-1/4 h-32 w-32 bg-blue-500/10 blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium mb-3 backdrop-blur-sm border border-indigo-500/30">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Sistem Manajemen Dokumen & Akreditasi</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                Selamat Datang, <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{auth?.user?.name || 'Pengguna'}</span>
                            </h1>
                            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                                Kelola instrumen akreditasi BAN-PT, LAM, matriks mutu PPEPP, serta bukti kegiatan tridharma perguruan tinggi dengan terstruktur dan terstandar.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <Link
                                href="/kegiatan"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Input Kegiatan</span>
                            </Link>
                            <Link
                                href="/akreditasi/lam"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700/60 backdrop-blur-sm transition-all"
                            >
                                <Award className="w-4 h-4" />
                                <span>Lihat Instrumen LAM</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                href={card.href}
                                className="group relative overflow-hidden bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 ${card.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                                    <p className="text-2xl font-black text-slate-800 mt-1">{card.value}</p>
                                </div>
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Terkoneksi sistem akreditasi</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Two Column Layout: Status Chart & Quick Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Ringkasan Eviden */}
                    <div className="bg-white p-6 shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                Status Kesiapan Eviden
                            </h2>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600">
                                Total: {totalAct}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Published (Siap Audit)
                                    </span>
                                    <span className="text-slate-600 font-semibold">{stats.status_published ?? 0} ({pubPercent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pubPercent}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-amber-700">
                                        <Clock className="w-3.5 h-3.5" /> Draft (Dalam Proses)
                                    </span>
                                    <span className="text-slate-600 font-semibold">{stats.status_draft ?? 0} ({draftPercent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${draftPercent}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-rose-700">
                                        <AlertCircle className="w-3.5 h-3.5" /> Rejected (Perlu Revisi)
                                    </span>
                                    <span className="text-slate-600 font-semibold">{stats.status_rejected ?? 0} ({rejPercent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${rejPercent}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <Link
                                href="/kegiatan"
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            >
                                Kelola Semua Dokumen Eviden
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Modul Akses Cepat */}
                    <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-indigo-600" />
                                Modul Instrumen & Akses Menu
                            </h2>
                            <span className="text-xs text-slate-400">Pintasan Tercepat</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <Link
                                href="/akreditasi/ban-pt"
                                className="group p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 text-blue-700 font-bold text-xs">
                                        BAN-PT
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            BAN-PT (4 Kriteria)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Instrumen akreditasi perguruan tinggi</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/akreditasi/lam"
                                className="group p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 text-emerald-700 font-bold text-xs">
                                        LAM
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            LAM (9 Kriteria)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Instrumen akreditasi program studi</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/kegiatan"
                                className="group p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-100 text-purple-700 font-bold text-xs">
                                        EVIDEN
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            Kegiatan & Dokumen
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Upload & verifikasi bukti tridharma</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/audit"
                                className="group p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-100 text-amber-700 font-bold text-xs">
                                        AUDIT
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            Audit Mutu Internal (AMI)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Evaluasi pemenuhan standar mutu</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Kegiatan Terbaru */}
                <div className="bg-white p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                            Aktivitas & Eviden Terbaru
                        </h2>
                        <Link href="/kegiatan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="py-10 text-center">
                            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Belum ada kegiatan yang diunggah.</p>
                            <Link href="/kegiatan" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                                Tambah Kegiatan Pertama
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Nama Kegiatan</th>
                                        <th className="px-4 py-3">Kriteria</th>
                                        <th className="px-4 py-3">Program Studi</th>
                                        <th className="px-4 py-3">Tahun</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentActivities.map((act) => (
                                        <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">{act.title_activity}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium">
                                                    K-{act.criteria?.code_criteria}: {act.criteria?.title_criteria?.substring(0, 25)}...
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{act.prodi?.name_prodi || '-'}</td>
                                            <td className="px-4 py-3 text-xs font-mono">{act.academic_year}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold ${act.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                                                        act.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-rose-100 text-rose-800'
                                                    }`}>
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
