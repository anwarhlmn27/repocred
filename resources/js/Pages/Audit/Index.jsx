import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    ClipboardCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
} from 'lucide-react';

const defaultProdis = [
    { id: 'p-1', name_prodi: 'Teknik Informatika', degree: 'S1' },
    { id: 'p-2', name_prodi: 'Sistem Informasi', degree: 'S1' },
    { id: 'p-3', name_prodi: 'Teknologi Informasi', degree: 'D3' },
];

const defaultAuditCriterias = [
    {
        id: 'crit-a-1',
        code_criteria: 1,
        title_criteria: 'Visi, Misi, Tujuan, dan Strategi (VMTS)',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'SK Penetapan VMTS, Notulen Raker, dan Hasil Survei Pemahaman (92% Paham)',
        auditor_note: 'Dokumen lengkap dan telah disosialisasikan secara berkala.',
    },
    {
        id: 'crit-a-2',
        code_criteria: 2,
        title_criteria: 'Tata Pamong, Tata Kelola, dan Kerjasama',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'MoU 15 Mitra Industri, SOP Penjaminan Mutu, dan Laporan Kaji Ulang Manajemen',
        auditor_note: 'Kerjasama aktif dan memiliki luaran implementasi nyata.',
    },
    {
        id: 'crit-a-3',
        code_criteria: 3,
        title_criteria: 'Mahasiswa dan Layanan Kemahasiswaan',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'Rekap Prestasi Nasional Mahasiswa (Juara Gemastik & PKM), Data Rasio Pendaftar 1:7',
        auditor_note: 'Prestasi mahasiswa melampaui target indikator kinerja utama.',
    },
    {
        id: 'crit-a-4',
        code_criteria: 4,
        title_criteria: 'Sumber Daya Manusia (Dosen & Tendik)',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'in_progress',
        evidence: 'Sertifikasi Internasional Dosen (AWS/CISCO), Rasio Dosen-Mahasiswa 1:28',
        auditor_note: 'Perlu percepatan studi lanjut S3 bagi 4 dosen tetap yang masih berpendidikan S2.',
    },
    {
        id: 'crit-a-5',
        code_criteria: 5,
        title_criteria: 'Keuangan, Sarana dan Prasarana',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'in_progress',
        evidence: 'Pengadaan Lab Server GPU AI dan Lisensi Perangkat Lunak Kampus',
        auditor_note: 'Dokumen kalibrasi peralatan lab jaringan belum diunggah.',
    },
    {
        id: 'crit-a-6',
        code_criteria: 6,
        title_criteria: 'Pendidikan & Kurikulum OBE',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'RPS Lengkap Berbasis OBE, Rubrik Penilaian Portofolio CPL Mahasiswa',
        auditor_note: 'Penerapan kurikulum OBE sangat baik dan terstruktur.',
    },
    {
        id: 'crit-a-7',
        code_criteria: 7,
        title_criteria: 'Penelitian Dosen & Mahasiswa',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'Laporan Hibah Terapan Kemendikbudristek & Publikasi Jurnal Terindeks Scopus',
        auditor_note: 'Jumlah publikasi per dosen per tahun mencapai 1.8 artikel.',
    },
    {
        id: 'crit-a-8',
        code_criteria: 8,
        title_criteria: 'Pengabdian kepada Masyarakat (PkM)',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'missing',
        evidence: 'Belum ada dokumen PkM terpadu dengan mitra desa binaan',
        auditor_note: 'Temuan Mayor: Laporan PkM tahun berjalan belum diserahkan ke LPM.',
    },
    {
        id: 'crit-a-9',
        code_criteria: 9,
        title_criteria: 'Luaran dan Capaian Tridharma',
        agency: { name_agency: 'LAM-INFOKOM' },
        status: 'fulfilled',
        evidence: 'Tracer Study Waktu Tunggu 2.8 Bulan, 12 Sertifikat HKI Hak Cipta Kemenkumham',
        auditor_note: 'Capaian luaran lulusan dan HKI sangat memuaskan.',
    },
];

export default function AuditIndex() {
    const [prodiList] = useState(defaultProdis);
    const [selectedProdiId, setSelectedProdiId] = useState(defaultProdis[0].id);
    const [criteriaList] = useState(defaultAuditCriterias);
    const [searchTerm, setSearchTerm] = useState('');

    const currentProdi = prodiList.find((p) => p.id === selectedProdiId) || prodiList[0];

    const totalCriteria = criteriaList.length;
    const fulfilledCount = criteriaList.filter((c) => c.status === 'fulfilled').length;
    const inProgressCount = criteriaList.filter((c) => c.status === 'in_progress').length;
    const missingCount = criteriaList.filter((c) => c.status === 'missing').length;

    const complianceRate = Math.round((fulfilledCount / totalCriteria) * 100);

    const filteredList = criteriaList.filter((crit) =>
        crit.title_criteria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(crit.code_criteria).includes(searchTerm) ||
        crit.auditor_note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Audit Mutu Internal (AMI)" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
                            <ClipboardCheck className="w-4 h-4" />
                            <span>Audit & Pengawasan Mutu</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Audit Mutu Internal (AMI)</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pemeriksaan kesiapan butir kriteria, validitas dokumen eviden, dan tingkat kepatuhan akreditasi prodi.
                        </p>
                    </div>

                    {/* Pilih Prodi yang diaudit */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                            Prodi Teraudit:
                        </label>
                        <select
                            value={selectedProdiId}
                            onChange={(e) => setSelectedProdiId(e.target.value)}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-indigo-50/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {prodiList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name_prodi} ({p.degree})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Scorecard Audit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-5 text-white shadow-sm border border-indigo-900/40">
                        <span className="text-xs font-semibold uppercase text-indigo-300">Skor Kepatuhan Mutu</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black">{complianceRate}%</span>
                            <span className="text-xs text-indigo-200">Kesiapan Dokumen</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: `${complianceRate}%` }} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase text-slate-500">Terpenuhi (Lengkap)</span>
                            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-black text-slate-800 mt-2">{fulfilledCount} Kriteria</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">Eviden valid & terverifikasi</p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase text-slate-500">Dalam Proses / Draft</span>
                            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                <Clock className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-black text-slate-800 mt-2">{inProgressCount} Kriteria</p>
                        <p className="text-xs text-amber-600 mt-1 font-medium">Memerlukan revisi dokumen</p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase text-slate-500">Temuan Belum Lengkap</span>
                            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-black text-slate-800 mt-2">{missingCount} Kriteria</p>
                        <p className="text-xs text-rose-600 mt-1 font-medium">Tindakan perbaikan segera</p>
                    </div>
                </div>

                {/* Audit Checklist Table */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-800">
                                Matriks Checklist Audit Mutu
                            </h2>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {currentProdi.name_prodi}
                            </span>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari kriteria atau catatan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 w-16">Kode</th>
                                    <th className="px-5 py-3.5">Kriteria & Lembaga</th>
                                    <th className="px-5 py-3.5">Eviden Kegiatan Ditemukan</th>
                                    <th className="px-5 py-3.5 text-center">Status Audit</th>
                                    <th className="px-5 py-3.5">Catatan / Rekomendasi Auditor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.map((crit) => (
                                    <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-mono font-bold text-slate-800">
                                            C{crit.code_criteria}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800">{crit.title_criteria}</div>
                                            <div className="text-xs text-indigo-600 font-medium mt-0.5">
                                                {crit.agency?.name_agency || 'LAM-INFOKOM'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {crit.evidence}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {crit.status === 'fulfilled' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Terpenuhi
                                                </span>
                                            )}
                                            {crit.status === 'in_progress' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock className="w-3 h-3" />
                                                    Revisi / Proses
                                                </span>
                                            )}
                                            {crit.status === 'missing' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Temuan Mayor
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600 italic max-w-sm">
                                            "{crit.auditor_note}"
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
