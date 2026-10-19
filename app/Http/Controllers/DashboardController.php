<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Criteria;
use App\Models\Faculty;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_faculties' => Faculty::count(),
            'total_prodis' => Prodi::count(),
            'total_criterias' => Criteria::count(),
            'total_activities' => Activity::count(),
            'total_users' => User::count(),
            'status_draft' => Activity::where('status', 'draft')->count(),
            'status_published' => Activity::where('status', 'published')->count(),
            'status_rejected' => Activity::where('status', 'rejected')->count(),
        ];

        $recentActivities = Activity::with(['criteria.agency', 'prodi'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }
}
