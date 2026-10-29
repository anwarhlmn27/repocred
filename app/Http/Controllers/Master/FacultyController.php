<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Univ;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacultyController extends Controller
{
    /**
     * Menampilkan daftar fakultas/UPPS.
     */
    public function index(): Response
    {
        $faculties = Faculty::with('univ:id,name,acronym,code')
            ->withCount('prodis')
            ->orderBy('created_at', 'desc')
            ->get();

        $univs = Univ::where('is_active', true)
            ->select('id', 'name', 'acronym', 'code')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Master/Fakultas/Index', [
            'faculties' => $faculties,
            'univs' => $univs,
        ]);
    }

    /**
     * Menyimpan data fakultas baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'univ_id' => 'required|uuid|exists:univs,id',
            'code' => 'required|string|max:50|unique:faculties,code',
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:faculties,acronym',
            'is_active' => 'boolean',
        ], [
            'univ_id.required' => 'Perguruan tinggi induk wajib dipilih.',
            'univ_id.exists' => 'Perguruan tinggi yang dipilih tidak valid.',
            'code.required' => 'Kode fakultas wajib diisi.',
            'code.unique' => 'Kode fakultas sudah digunakan.',
            'name.required' => 'Nama resmi fakultas wajib diisi.',
            'acronym.required' => 'Singkatan/Akronim fakultas wajib diisi.',
            'acronym.unique' => 'Singkatan/Akronim fakultas sudah digunakan.',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        Faculty::create($validated);

        return redirect()->route('master.fakultas.index')->with('success', 'Data fakultas berhasil ditambahkan.');
    }

    /**
     * Memperbarui data fakultas.
     */
    public function update(Request $request, Faculty $faculty): RedirectResponse
    {
        $validated = $request->validate([
            'univ_id' => 'required|uuid|exists:univs,id',
            'code' => 'required|string|max:50|unique:faculties,code,' . $faculty->id,
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:faculties,acronym,' . $faculty->id,
            'is_active' => 'boolean',
        ], [
            'univ_id.required' => 'Perguruan tinggi induk wajib dipilih.',
            'univ_id.exists' => 'Perguruan tinggi yang dipilih tidak valid.',
            'code.required' => 'Kode fakultas wajib diisi.',
            'code.unique' => 'Kode fakultas sudah digunakan.',
            'name.required' => 'Nama resmi fakultas wajib diisi.',
            'acronym.required' => 'Singkatan/Akronim fakultas wajib diisi.',
            'acronym.unique' => 'Singkatan/Akronim fakultas sudah digunakan.',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $faculty->update($validated);

        return redirect()->route('master.fakultas.index')->with('success', 'Data fakultas berhasil diperbarui.');
    }

    /**
     * Menghapus data fakultas.
     */
    public function destroy(Faculty $faculty): RedirectResponse
    {
        if ($faculty->prodis()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus fakultas yang masih memiliki program studi terhubung.');
        }

        $faculty->delete();

        return redirect()->route('master.fakultas.index')->with('success', 'Data fakultas berhasil dihapus.');
    }
}
