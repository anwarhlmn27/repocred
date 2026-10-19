<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Criteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CriteriaController extends Controller
{
    public function index()
    {
        $criterias = Criteria::with('agency')->orderBy('agency_id')->orderBy('code_criteria')->get();
        $agencies = Agency::all();

        return Inertia::render('Master/Kriteria/Index', [
            'criterias' => $criterias,
            'agencies' => $agencies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agency_id' => 'required|exists:agencies,id',
            'code_criteria' => 'required|integer',
            'title_criteria' => 'required|string|max:255',
            'type' => 'required|string|max:100',
        ]);

        Criteria::create($validated);

        return redirect()->back()->with('success', 'Kriteria akreditasi berhasil ditambahkan.');
    }

    public function update(Request $request, Criteria $criteria)
    {
        $validated = $request->validate([
            'agency_id' => 'required|exists:agencies,id',
            'code_criteria' => 'required|integer',
            'title_criteria' => 'required|string|max:255',
            'type' => 'required|string|max:100',
        ]);

        $criteria->update($validated);

        return redirect()->back()->with('success', 'Kriteria akreditasi berhasil diperbarui.');
    }

    public function destroy(Criteria $criteria)
    {
        $criteria->delete();

        return redirect()->back()->with('success', 'Kriteria akreditasi berhasil dihapus.');
    }
}
