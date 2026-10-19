<?php

namespace App\Http\Controllers\Akreditasi;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Criteria;
use App\Models\Prodi;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BanPtController extends Controller
{
    public function index(Request $request)
    {
        $agency = Agency::where('name_agency', 'like', '%BAN-PT%')->first();
        
        $criterias = Criteria::when($agency, function ($q) use ($agency) {
            return $q->where('agency_id', $agency->id);
        })
        ->with(['activities' => function ($q) use ($request) {
            if ($request->prodi_id) {
                $q->where('prodi_id', $request->prodi_id);
            }
            if ($request->academic_year) {
                $q->where('academic_year', $request->academic_year);
            }
            $q->with('documents');
        }])
        ->orderBy('code_criteria')
        ->get();

        $prodis = Prodi::with('faculty')->get();

        return Inertia::render('Akreditasi/BanPt/Index', [
            'criterias' => $criterias,
            'prodis' => $prodis,
            'filters' => $request->only(['prodi_id', 'academic_year']),
        ]);
    }
}
