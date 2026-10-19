<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdiController extends Controller
{
    public function index()
    {
        $prodis = Prodi::with('faculty.univ')->latest()->get();
        $faculties = Faculty::select('id', 'name_faculty')->get();

        return Inertia::render('Master/Prodi/Index', [
            'prodis' => $prodis,
            'faculties' => $faculties,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name_prodi' => 'required|string|max:255',
            'degree' => 'required|string|max:50',
        ]);

        $validated['created_by'] = auth()->id();

        Prodi::create($validated);

        return redirect()->back()->with('success', 'Program Studi berhasil ditambahkan.');
    }

    public function update(Request $request, Prodi $prodi)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name_prodi' => 'required|string|max:255',
            'degree' => 'required|string|max:50',
        ]);

        $validated['updated_by'] = auth()->id();

        $prodi->update($validated);

        return redirect()->back()->with('success', 'Program Studi berhasil diperbarui.');
    }

    public function destroy(Prodi $prodi)
    {
        $prodi->delete();

        return redirect()->back()->with('success', 'Program Studi berhasil dihapus.');
    }
}
