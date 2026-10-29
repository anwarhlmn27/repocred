<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Univ;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UnivController extends Controller
{
    /**
     * Menampilkan daftar perguruan tinggi.
     */
    public function index(): Response
    {
        $univs = Univ::withCount('faculties')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Master/Univ/Index', [
            'univs' => $univs,
        ]);
    }

    /**
     * Menyimpan data perguruan tinggi baru.
     */
    public function store(Request $request): RedirectResponse
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

        $validated['is_active'] = $request->boolean('is_active', true);

        try {
            DB::transaction(function () use ($validated) {
                Univ::create($validated);
            });

            return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil ditambahkan.');
        } catch (\Throwable $e) {
            Log::error('Gagal menambahkan data universitas: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan data perguruan tinggi.');
        }
    }

    /**
     * Memperbarui data perguruan tinggi.
     */
    public function update(Request $request, Univ $univ): RedirectResponse
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

        $validated['is_active'] = $request->boolean('is_active', true);

        try {
            DB::transaction(function () use ($univ, $validated) {
                $univ->update($validated);
            });

            return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil diperbarui.');
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui data universitas: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat memperbarui data perguruan tinggi.');
        }
    }

    /**
     * Menghapus data perguruan tinggi.
     */
    public function destroy(Univ $univ): RedirectResponse
    {
        if ($univ->faculties()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus universitas yang masih memiliki relasi data fakultas.');
        }

        try {
            DB::transaction(function () use ($univ) {
                $univ->delete();
            });

            return redirect()->route('master.univ.index')->with('success', 'Data perguruan tinggi berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Gagal menghapus data universitas: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus data perguruan tinggi.');
        }
    }
}
