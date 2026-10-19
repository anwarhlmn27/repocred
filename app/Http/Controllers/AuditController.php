<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Criteria;
use App\Models\Prodi;
use App\Models\Ppepp;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $prodis = Prodi::with('faculty')->get();
        $selectedProdiId = $request->prodi_id ?? ($prodis->first()?->id);

        $criterias = Criteria::with(['agency', 'activities' => function ($q) use ($selectedProdiId) {
            if ($selectedProdiId) {
                $q->where('prodi_id', $selectedProdiId);
            }
            $q->with('documents.ppepp');
        }])
        ->orderBy('agency_id')
        ->orderBy('code_criteria')
        ->get();

        $ppepps = Ppepp::orderBy('code_ppepp')->get();

        return Inertia::render('Audit/Index', [
            'prodis' => $prodis,
            'selectedProdiId' => $selectedProdiId,
            'criterias' => $criterias,
            'ppepps' => $ppepps,
        ]);
    }
}
