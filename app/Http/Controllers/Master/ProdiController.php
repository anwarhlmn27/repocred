<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Faculty;
use App\Models\Prodi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProdiController extends Controller
{
    /**
     * Menampilkan daftar program studi.
     */
    public function index(): Response
    {
        $prodis = Prodi::with(['faculty.univ', 'agency'])
            ->withCount(['sessions', 'activities'])
            ->orderBy('name', 'asc')
            ->get();

        $faculties = Faculty::with('univ')
            ->orderBy('name', 'asc')
            ->get(['id', 'univ_id', 'code', 'name', 'acronym', 'is_active']);

        $agencies = Agency::orderBy('name', 'asc')
            ->get(['id', 'code', 'name', 'type', 'level']);

        return Inertia::render('Master/Prodi/Index', [
            'prodis' => $prodis,
            'faculties' => $faculties,
            'agencies' => $agencies,
        ]);
    }

    /**
     * Menyimpan data program studi baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => 'required|uuid|exists:faculties,id',
            'agency_id' => 'nullable|uuid|exists:agencies,id',
            'code' => 'required|string|max:50|unique:prodis,code',
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:prodis,acronym',
            'is_active' => 'boolean',
        ], [
            'faculty_id.required' => 'Fakultas / UPPS wajib dipilih.',
            'faculty_id.exists' => 'Fakultas yang dipilih tidak valid.',
            'agency_id.exists' => 'Lembaga akreditasi yang dipilih tidak valid.',
            'code.required' => 'Kode program studi wajib diisi.',
            'code.unique' => 'Kode program studi sudah terdaftar.',
            'name.required' => 'Nama program studi wajib diisi.',
            'acronym.required' => 'Singkatan / akronim program studi wajib diisi.',
            'acronym.unique' => 'Singkatan / akronim program studi sudah terdaftar.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['acronym'] = strtoupper(trim($validated['acronym']));

        Prodi::create($validated);

        return redirect()->route('master.prodi.index')->with('success', 'Program Studi berhasil ditambahkan.');
    }

    /**
     * Memperbarui data program studi.
     */
    public function update(Request $request, Prodi $prodi): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => 'required|uuid|exists:faculties,id',
            'agency_id' => 'nullable|uuid|exists:agencies,id',
            'code' => 'required|string|max:50|unique:prodis,code,' . $prodi->id,
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:50|unique:prodis,acronym,' . $prodi->id,
            'is_active' => 'boolean',
        ], [
            'faculty_id.required' => 'Fakultas / UPPS wajib dipilih.',
            'faculty_id.exists' => 'Fakultas yang dipilih tidak valid.',
            'agency_id.exists' => 'Lembaga akreditasi yang dipilih tidak valid.',
            'code.required' => 'Kode program studi wajib diisi.',
            'code.unique' => 'Kode program studi sudah terdaftar.',
            'name.required' => 'Nama program studi wajib diisi.',
            'acronym.required' => 'Singkatan / akronim program studi wajib diisi.',
            'acronym.unique' => 'Singkatan / akronim program studi sudah terdaftar.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['acronym'] = strtoupper(trim($validated['acronym']));

        $prodi->update($validated);

        return redirect()->route('master.prodi.index')->with('success', 'Program Studi berhasil diperbarui.');
    }

    /**
     * Menghapus data program studi.
     */
    public function destroy(Prodi $prodi): RedirectResponse
    {
        if ($prodi->activities()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Program Studi yang masih memiliki riwayat kegiatan atau eviden.');
        }

        if ($prodi->sessions()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Program Studi yang masih memiliki sesi akreditasi.');
        }

        $prodi->delete();

        return redirect()->route('master.prodi.index')->with('success', 'Program Studi berhasil dihapus.');
    }
}
