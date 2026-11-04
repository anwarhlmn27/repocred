<?php

namespace App\Http\Controllers;

use App\Models\AccreditationSession;
use App\Models\Activity;
use App\Models\ActivityDocument;
use App\Models\Criteria;
use App\Models\Faculty;
use App\Models\Ppepp;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard utama dengan ringkasan data akreditasi, eviden, dan aktivitas terkini.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Statistik Master & Operasional
        $stats = [
            'total_faculties' => Faculty::count(),
            'total_prodis' => Prodi::count(),
            'total_criterias' => Criteria::count(),
            'total_sessions' => AccreditationSession::count(),
            'total_active_sessions' => AccreditationSession::where('is_active', true)->count(),
            'total_activities' => Activity::count(),
            'total_documents' => ActivityDocument::count(),
            'total_users' => User::count(),
            'status_published' => Activity::where('status', 'published')->count(),
            'status_draft' => Activity::where('status', 'draft')->count(),
            'status_rejected' => Activity::where('status', 'rejected')->count(),
        ];

        // 2. Distribusi Dokumen Eviden per Siklus PPEPP (5 Tahapan Mutu SPMI)
        $ppeppList = Ppepp::orderBy('code_ppepp', 'asc')->get();
        $ppeppStats = $ppeppList->map(function ($p) {
            $docCount = ActivityDocument::where('ppepp_id', $p->id)->count();
            return [
                'id' => $p->id,
                'code_ppepp' => $p->code_ppepp,
                'title_ppepp' => $p->title_ppepp,
                'count' => $docCount,
            ];
        });

        // 3. Sesi Akreditasi Aktif (BAN-PT Institusi & LAM Program Studi)
        $activeSessions = AccreditationSession::with(['agency', 'prodi.faculty'])
            ->where('is_active', true)
            ->orderBy('year_start', 'desc')
            ->take(6)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'agency_code' => $session->agency?->code ?? 'Lembaga',
                    'agency_type' => $session->agency?->type ?? 'nasional',
                    'agency_level' => $session->agency?->level ?? 'prodi',
                    'prodi_name' => $session->prodi?->name ?? 'Institusi / Perguruan Tinggi',
                    'faculty_name' => $session->prodi?->faculty?->name ?? '-',
                    'year_start' => $session->year_start,
                    'year_end' => $session->year_end,
                    'ts_year' => $session->ts_year,
                    'ts_count' => $session->ts_count ?? 3,
                    'status' => $session->status,
                    'achieved_rating' => $session->achieved_rating ?? 'Unggul',
                    'activities_count' => Activity::where('session_id', $session->id)->count(),
                ];
            });

        // 4. Aktivitas & Eviden Terbaru (Top 7)
        $recentActivities = Activity::with([
            'criteria.agency',
            'prodi',
            'session.agency',
            'academicYear',
            'creator:id,name',
        ])
            ->withCount('documents')
            ->latest()
            ->take(7)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'title_activity' => $act->title_activity,
                    'description' => $act->description,
                    'status' => $act->status,
                    'academic_year' => $act->academic_year ?? $act->academicYear?->year ?? '-',
                    'criteria_code' => $act->criteria?->code ?? ('C' . ($act->criteria?->sequence ?? '')),
                    'criteria_name' => $act->criteria?->name ?? '-',
                    'agency_code' => $act->criteria?->agency?->code ?? $act->session?->agency?->code ?? '-',
                    'prodi_name' => $act->prodi?->name ?? 'Tingkat Institusi',
                    'documents_count' => $act->documents_count ?? 0,
                    'creator_name' => $act->creator?->name ?? 'Sistem',
                    'created_at' => $act->created_at ? $act->created_at->translatedFormat('d M Y') : '-',
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'ppeppStats' => $ppeppStats,
            'activeSessions' => $activeSessions,
            'recentActivities' => $recentActivities,
        ]);
    }
}
