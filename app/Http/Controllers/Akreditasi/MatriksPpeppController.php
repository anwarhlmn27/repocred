<?php

namespace App\Http\Controllers\Akreditasi;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Activity;
use App\Models\ActivityDocument;
use App\Models\Agency;
use App\Models\Criteria;
use App\Models\Ppepp;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatriksPpeppController extends Controller
{
    /**
     * Pemetaan kode PPEPP (1-5) ke kunci tahapan untuk antarmuka.
     *
     * @var array<int, string>
     */
    protected array $ppeppKeyMap = [
        1 => 'penetapan',
        2 => 'pelaksanaan',
        3 => 'evaluasi',
        4 => 'pengendalian',
        5 => 'peningkatan',
    ];

    /**
     * Standar 9 Kriteria LAM sebagai fallback cerdas jika master kriteria belum di-generate.
     *
     * @var array<int, array<string, mixed>>
     */
    protected array $defaultLamCriterias = [
        ['sequence' => 1, 'code' => 'C1', 'name' => 'Visi, Misi, Tujuan dan Strategi'],
        ['sequence' => 2, 'code' => 'C2', 'name' => 'Tata Kelola, Tata Pamong, dan Kerjasama'],
        ['sequence' => 3, 'code' => 'C3', 'name' => 'Mahasiswa'],
        ['sequence' => 4, 'code' => 'C4', 'name' => 'Sumber Daya Manusia'],
        ['sequence' => 5, 'code' => 'C5', 'name' => 'Keuangan, Sarana dan Prasarana'],
        ['sequence' => 6, 'code' => 'C6', 'name' => 'Pendidikan'],
        ['sequence' => 7, 'code' => 'C7', 'name' => 'Penelitian'],
        ['sequence' => 8, 'code' => 'C8', 'name' => 'Pengabdian kepada Masyarakat (PkM)'],
        ['sequence' => 9, 'code' => 'C9', 'name' => 'Luaran dan Capaian Tridharma'],
    ];

    /**
     * Standar 4 Kriteria BAN-PT.
     *
     * @var array<int, array<string, mixed>>
     */
    protected array $defaultBanptCriterias = [
        ['sequence' => 1, 'code' => 'C1', 'name' => 'Visi, Misi, Tujuan, dan Strategi Perguruan Tinggi'],
        ['sequence' => 2, 'code' => 'C2', 'name' => 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma'],
        ['sequence' => 3, 'code' => 'C3', 'name' => 'Mahasiswa, Dosen, dan Sumber Daya Penunjang Akademik'],
        ['sequence' => 4, 'code' => 'C4', 'name' => 'Luaran, Capaian Tridharma, dan Dampak Kemanfaatan'],
    ];

    /**
     * Menampilkan dashboard matriks kelengkapan PPEPP.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Ambil daftar lembaga akreditasi, program studi, dan tahun akademik
        $agencies = Agency::orderBy('name', 'asc')->get();
        $prodis = Prodi::where('is_active', true)->with(['faculty', 'agency'])->orderBy('name', 'asc')->get();
        $academicYears = AcademicYear::orderBy('year', 'desc')->get();

        // 2. Filter dari Request
        $selectedAgencyCode = $request->input('agency', '');
        $selectedProdiId = $request->input('prodi_id', '');
        $selectedYear = $request->input('academic_year', '');

        // Tentukan default agency: prioritas LAM-INFOKOM atau BAN-PT
        $currentAgency = null;
        if ($selectedAgencyCode) {
            $currentAgency = $agencies->firstWhere('code', $selectedAgencyCode);
        }
        if (!$currentAgency && $selectedProdiId) {
            $targetProdi = $prodis->firstWhere('id', $selectedProdiId);
            if ($targetProdi && $targetProdi->agency) {
                $currentAgency = $targetProdi->agency;
                $selectedAgencyCode = $currentAgency->code;
            }
        }
        if (!$currentAgency) {
            $currentAgency = $agencies->firstWhere('code', 'LAM-INFOKOM') ?? $agencies->first();
            $selectedAgencyCode = $currentAgency?->code ?? 'LAM-INFOKOM';
        }

        // Tentukan default prodi
        if (!$selectedProdiId && $currentAgency && $currentAgency->level === 'prodi') {
            $matchingProdi = $prodis->firstWhere('agency_id', $currentAgency->id);
            if ($matchingProdi) {
                $selectedProdiId = $matchingProdi->id;
            } elseif ($prodis->isNotEmpty()) {
                $selectedProdiId = $prodis->first()->id;
            }
        }

        // Tentukan default tahun akademik
        if (!$selectedYear && $academicYears->isNotEmpty()) {
            $firstYear = $academicYears->first()->year;
            $selectedYear = (string) $firstYear;
        }

        // 3. Ambil Kriteria sesuai Agency
        $criterias = collect();
        if ($currentAgency) {
            $criterias = Criteria::where('agency_id', $currentAgency->id)
                ->orderBy('sequence', 'asc')
                ->get();
        }

        // Fallback jika belum ada record kriteria di DB
        if ($criterias->isEmpty()) {
            $isBanPt = ($selectedAgencyCode === 'BAN-PT');
            $sourceCriterias = $isBanPt ? $this->defaultBanptCriterias : $this->defaultLamCriterias;

            $criterias = collect($sourceCriterias)->map(function ($item) {
                return (object) [
                    'id' => 'crit-' . $item['sequence'],
                    'sequence' => $item['sequence'],
                    'code' => $item['code'],
                    'name' => $item['name'],
                ];
            });
        }

        // 4. Query Kegiatan & Dokumen Eviden yang sesuai filter
        $activitiesQuery = Activity::with([
            'criteria',
            'prodi',
            'academicYear',
            'documents' => function ($q) {
                $q->with(['ppepp', 'uploader:id,name'])->latest();
            },
        ]);

        if ($selectedProdiId && $selectedProdiId !== 'all') {
            $activitiesQuery->where('prodi_id', $selectedProdiId);
        }

        if ($selectedYear && $selectedYear !== 'all') {
            $cleanYear = (int) substr($selectedYear, 0, 4);
            $activitiesQuery->where(function ($q) use ($cleanYear, $selectedYear) {
                $q->whereHas('academicYear', function ($ayQ) use ($cleanYear, $selectedYear) {
                    $ayQ->where('year', $cleanYear)->orWhere('year', $selectedYear);
                })->orWhere('academic_year', $cleanYear);
            });
        }

        $activities = $activitiesQuery->get();

        // 5. Bangun Data Matriks per Kriteria
        $totalActivitiesCount = 0;
        $totalProgressSum = 0;
        $completedCriteriaCount = 0;
        $matrixRows = [];
        $evidenceFilesMap = [];

        foreach ($criterias as $crit) {
            $critActs = $activities->where('criteria_id', $crit->id)->values();
            $totalActivitiesCount += $critActs->count();

            // Kumpulkan dokumen per tahapan PPEPP untuk kriteria ini
            $stageDocs = [
                'penetapan' => [],
                'pelaksanaan' => [],
                'evaluasi' => [],
                'pengendalian' => [],
                'peningkatan' => [],
            ];

            foreach ($critActs as $act) {
                foreach ($act->documents as $doc) {
                    $code = $doc->ppepp?->code_ppepp ?? 1;
                    $stageKey = $this->ppeppKeyMap[$code] ?? 'penetapan';

                    $stageDocs[$stageKey][] = [
                        'id' => $doc->id,
                        'name' => $doc->filename,
                        'size' => $doc->formatted_size,
                        'date' => $doc->created_at ? $doc->created_at->translatedFormat('d M Y') : '-',
                        'activity' => $act->title_activity,
                        'uploader' => $doc->uploader?->name ?? 'Pengguna',
                        'verified' => true,
                        'url' => $doc->url,
                        'file_type' => $doc->file_type,
                    ];
                }
            }

            // Hitung status dan count per stage
            $stagesSummary = [];
            $filledStagesCount = 0;

            foreach (['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'] as $stKey) {
                $count = count($stageDocs[$stKey]);
                if ($count > 0) {
                    $filledStagesCount++;
                    $status = 'complete';
                } else {
                    $status = ($critActs->count() > 0) ? 'warning' : 'empty';
                }

                $stagesSummary[$stKey] = [
                    'count' => $count,
                    'status' => $status,
                ];

                // Simpan daftar file untuk modal popup
                $evidenceFilesMap["{$crit->id}-{$stKey}"] = $stageDocs[$stKey];
            }

            // Progress kriteria: kelengkapan 5 siklus (0 - 100%)
            $critProgress = (int) round(($filledStagesCount / 5) * 100);
            $totalProgressSum += $critProgress;
            if ($critProgress === 100) {
                $completedCriteriaCount++;
            }

            $matrixRows[] = [
                'criteria_id' => $crit->id,
                'criteria_sequence' => $crit->sequence,
                'criteria_code' => $crit->code ?? ('K' . $crit->sequence),
                'criteria_title' => $crit->name,
                'stages' => $stagesSummary,
                'progress' => $critProgress,
                'filled_stages' => $filledStagesCount,
                'activities_count' => $critActs->count(),
            ];
        }

        $totalCriteriasCount = $criterias->count();
        $overallCompletion = $totalCriteriasCount > 0
            ? (int) round($totalProgressSum / $totalCriteriasCount)
            : 0;

        $summary = [
            'total_activities' => $totalActivitiesCount,
            'overall_completion' => $overallCompletion,
            'completed_criteria' => $completedCriteriaCount,
            'total_criteria' => $totalCriteriasCount,
        ];

        // Format dropdown options
        $formattedAgencies = $agencies->isNotEmpty()
            ? $agencies->map(function ($a) {
                return [
                    'id' => $a->id,
                    'code' => $a->code,
                    'name' => "{$a->code} (" . ($a->name ?? $a->code) . ")",
                ];
            })
            : collect([
                ['id' => '1', 'code' => 'LAM-INFOKOM', 'name' => 'LAM-INFOKOM (Informatika & Komputer)'],
                ['id' => '2', 'code' => 'BAN-PT', 'name' => 'BAN-PT (Nasional)'],
                ['id' => '3', 'code' => 'LAMEMBA', 'name' => 'LAMEMBA (Ekonomi, Manajemen & Akuntansi)'],
            ]);

        $formattedProdis = $prodis->isNotEmpty()
            ? $prodis->map(function ($p) {
                return [
                    'id' => $p->id,
                    'code' => $p->code ?? $p->id,
                    'name' => "S1 {$p->name}",
                    'faculty' => $p->faculty?->name ?? 'Fakultas',
                    'agency_code' => $p->agency?->code ?? '-',
                ];
            })
            : collect([
                ['id' => 'ti', 'code' => '55201', 'name' => 'S1 Teknik Informatika', 'faculty' => 'Fakultas Ilmu Komputer', 'agency_code' => 'LAM-INFOKOM'],
                ['id' => 'si', 'code' => '57201', 'name' => 'S1 Sistem Informasi', 'faculty' => 'Fakultas Ilmu Komputer', 'agency_code' => 'LAM-INFOKOM'],
                ['id' => 'mnj', 'code' => '61201', 'name' => 'S1 Manajemen', 'faculty' => 'Fakultas Ekonomi dan Bisnis', 'agency_code' => 'LAMEMBA'],
            ]);

        $formattedAcademicYears = $academicYears->isNotEmpty()
            ? $academicYears->map(function ($ay) {
                $nextYear = ((int) $ay->year) + 1;
                return [
                    'id' => $ay->id,
                    'year' => (string) $ay->year,
                    'label' => "{$ay->year}/{$nextYear}",
                ];
            })
            : collect([
                ['id' => '1', 'year' => '2025', 'label' => '2025/2026'],
                ['id' => '2', 'year' => '2024', 'label' => '2024/2025'],
                ['id' => '3', 'year' => '2023', 'label' => '2023/2024'],
                ['id' => '4', 'year' => '2022', 'label' => '2022/2023'],
            ]);

        return Inertia::render('Akreditasi/MatriksPpepp/Index', [
            'summary' => $summary,
            'matrix_data' => $matrixRows,
            'evidence_files' => $evidenceFilesMap,
            'agencies' => $formattedAgencies,
            'prodis' => $formattedProdis,
            'academic_years' => $formattedAcademicYears,
            'filters' => [
                'agency' => $selectedAgencyCode,
                'prodi_id' => $selectedProdiId,
                'academic_year' => $selectedYear,
            ],
        ]);
    }
}

