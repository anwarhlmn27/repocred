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
        $univs = Univ::withCount('faculties')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Master/Univ/Index', [
            'univs' => $univs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:univs,code',
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:univs,acronym',
            'address' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ], [
            'code.required' => 'Kode perguruan tinggi wajib diisi.',
            'code.unique' => 'Kode perguruan tinggi sudah digunakan.',
            'name.required' => 'Nama perguruan tinggi wajib diisi.',
            'acronym.required' => 'Singkatan/Akronim perguruan tinggi wajib diisi.',
            'acronym.unique' => 'Singkatan/Akronim perguruan tinggi sudah digunakan.',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        Univ::create($validated);

        return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil ditambahkan.');
    }

    public function update(Request $request, Univ $univ)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:univs,code,' . $univ->id,
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:univs,acronym,' . $univ->id,
            'address' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ], [
            'code.required' => 'Kode perguruan tinggi wajib diisi.',
            'code.unique' => 'Kode perguruan tinggi sudah digunakan.',
            'name.required' => 'Nama perguruan tinggi wajib diisi.',
            'acronym.required' => 'Singkatan/Akronim perguruan tinggi wajib diisi.',
            'acronym.unique' => 'Singkatan/Akronim perguruan tinggi sudah digunakan.',
        ]);

        $univ->update($validated);

        return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil diperbarui.');
    }

    public function destroy(Univ $univ)
    {
        if ($univ->faculties()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus universitas yang masih memiliki relasi data fakultas.');
        }

        $univ->delete();

        return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil dihapus.');
    }
}
