<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    /**
     * Menampilkan daftar lembaga akreditasi (Agencies).
     */
    public function index(): Response
    {
        $agencies = Agency::withCount(['criterias', 'prodis', 'sessions'])
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Master/Agency/Index', [
            'agencies' => $agencies,
        ]);
    }

    /**
     * Menyimpan data lembaga akreditasi baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:agencies,code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:nasional,internasional',
            'level' => 'required|in:univs,prodi',
        ], [
            'code.required' => 'Kode / Singkatan lembaga wajib diisi.',
            'code.unique' => 'Kode / Singkatan lembaga sudah terdaftar.',
            'name.required' => 'Nama lengkap lembaga akreditasi wajib diisi.',
            'type.required' => 'Tipe akreditasi (Nasional / Internasional) wajib dipilih.',
            'type.in' => 'Pilihan tipe akreditasi tidak valid.',
            'level.required' => 'Tingkat sasaran akreditasi wajib dipilih.',
            'level.in' => 'Pilihan tingkat sasaran tidak valid.',
        ]);

        Agency::create($validated);

        return redirect()->route('master.agency.index')->with('success', 'Data lembaga akreditasi berhasil ditambahkan.');
    }

    /**
     * Memperbarui data lembaga akreditasi.
     */
    public function update(Request $request, Agency $agency): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:agencies,code,' . $agency->id,
            'name' => 'required|string|max:255',
            'type' => 'required|in:nasional,internasional',
            'level' => 'required|in:univs,prodi',
        ], [
            'code.required' => 'Kode / Singkatan lembaga wajib diisi.',
            'code.unique' => 'Kode / Singkatan lembaga sudah terdaftar.',
            'name.required' => 'Nama lengkap lembaga akreditasi wajib diisi.',
            'type.required' => 'Tipe akreditasi (Nasional / Internasional) wajib dipilih.',
            'type.in' => 'Pilihan tipe akreditasi tidak valid.',
            'level.required' => 'Tingkat sasaran akreditasi wajib dipilih.',
            'level.in' => 'Pilihan tingkat sasaran tidak valid.',
        ]);

        $agency->update($validated);

        return redirect()->route('master.agency.index')->with('success', 'Data lembaga akreditasi berhasil diperbarui.');
    }

    /**
     * Menghapus data lembaga akreditasi.
     */
    public function destroy(Agency $agency): RedirectResponse
    {
        if ($agency->criterias()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus lembaga akreditasi yang masih memiliki relasi kriteria akreditasi.');
        }

        if ($agency->prodis()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus lembaga akreditasi yang masih terhubung dengan program studi.');
        }

        if ($agency->sessions()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus lembaga akreditasi yang masih memiliki sesi akreditasi.');
        }

        $agency->delete();

        return redirect()->route('master.agency.index')->with('success', 'Data lembaga akreditasi berhasil dihapus.');
    }
}

