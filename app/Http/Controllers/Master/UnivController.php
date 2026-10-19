<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Univ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnivController extends Controller
{
    public function index()
    {
        $univs = Univ::withCount('faculties')->latest()->get();

        return Inertia::render('Master/Univ/Index', [
            'univs' => $univs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_univ' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = auth()->id();

        Univ::create($validated);

        return redirect()->back()->with('success', 'Universitas berhasil ditambahkan.');
    }

    public function update(Request $request, Univ $univ)
    {
        $validated = $request->validate([
            'name_univ' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $validated['updated_by'] = auth()->id();

        $univ->update($validated);

        return redirect()->back()->with('success', 'Universitas berhasil diperbarui.');
    }

    public function destroy(Univ $univ)
    {
        $univ->delete();

        return redirect()->back()->with('success', 'Universitas berhasil dihapus.');
    }
}
