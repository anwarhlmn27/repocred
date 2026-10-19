<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Univ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    public function index()
    {
        $faculties = Faculty::with('univ')->withCount('prodis')->latest()->get();
        $univs = Univ::select('id', 'name_univ')->get();

        return Inertia::render('Master/Fakultas/Index', [
            'faculties' => $faculties,
            'univs' => $univs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'univ_id' => 'required|exists:univs,id',
            'name_faculty' => 'required|string|max:255',
        ]);

        $validated['created_by'] = auth()->id();

        Faculty::create($validated);

        return redirect()->back()->with('success', 'Fakultas berhasil ditambahkan.');
    }

    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'univ_id' => 'required|exists:univs,id',
            'name_faculty' => 'required|string|max:255',
        ]);

        $validated['updated_by'] = auth()->id();

        $faculty->update($validated);

        return redirect()->back()->with('success', 'Fakultas berhasil diperbarui.');
    }

    public function destroy(Faculty $faculty)
    {
        $faculty->delete();

        return redirect()->back()->with('success', 'Fakultas berhasil dihapus.');
    }
}
