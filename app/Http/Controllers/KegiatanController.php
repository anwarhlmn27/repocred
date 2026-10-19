<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityDocument;
use App\Models\Criteria;
use App\Models\Ppepp;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    public function index(Request $request)
    {
        $activities = Activity::with(['criteria.agency', 'prodi.faculty', 'creator', 'documents.ppepp'])
            ->when($request->prodi_id, fn($q) => $q->where('prodi_id', $request->prodi_id))
            ->when($request->criteria_id, fn($q) => $q->where('criteria_id', $request->criteria_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->academic_year, fn($q) => $q->where('academic_year', $request->academic_year))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $criterias = Criteria::with('agency')->orderBy('agency_id')->orderBy('code_criteria')->get();
        $prodis = Prodi::with('faculty')->get();
        $ppepps = Ppepp::orderBy('code_ppepp')->get();

        return Inertia::render('Kegiatan/Index', [
            'activities' => $activities,
            'criterias' => $criterias,
            'prodis' => $prodis,
            'ppepps' => $ppepps,
            'filters' => $request->only(['prodi_id', 'criteria_id', 'status', 'academic_year']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'criteria_id' => 'required|exists:criterias,id',
            'prodi_id' => 'required|exists:prodis,id',
            'title_activity' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_year' => 'required|digits:4|integer|min:2000|max:'.(date('Y') + 5),
            'status' => 'required|in:draft,published,rejected',
        ]);

        $validated['created_by'] = auth()->id();

        $activity = Activity::create($validated);

        return redirect()->back()->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function update(Request $request, Activity $kegiatan)
    {
        $validated = $request->validate([
            'criteria_id' => 'required|exists:criterias,id',
            'prodi_id' => 'required|exists:prodis,id',
            'title_activity' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_year' => 'required|digits:4|integer|min:2000|max:'.(date('Y') + 5),
            'status' => 'required|in:draft,published,rejected',
        ]);

        $validated['updated_by'] = auth()->id();

        $kegiatan->update($validated);

        return redirect()->back()->with('success', 'Kegiatan berhasil diperbarui.');
    }

    public function destroy(Activity $kegiatan)
    {
        $kegiatan->delete();

        return redirect()->back()->with('success', 'Kegiatan berhasil dihapus.');
    }
}
