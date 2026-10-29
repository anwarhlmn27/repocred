<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    /**
     * Menampilkan daftar tahun akademik.
     */
    public function index(): Response
    {
        $academicYears = AcademicYear::withCount('activities')
            ->orderBy('year', 'desc')
            ->get();

        return Inertia::render('Master/TahunAkademik/Index', [
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Menyimpan data tahun akademik baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|between:2000,2100|unique:academicyears,year',
        ], [
            'year.required' => 'Tahun akademik wajib diisi.',
            'year.integer' => 'Tahun akademik harus berupa 4 digit angka yang valid.',
            'year.between' => 'Tahun akademik harus berada di antara tahun 2000 dan 2100.',
            'year.unique' => 'Tahun akademik tersebut sudah terdaftar.',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                AcademicYear::create($validated);
            });

            return redirect()->route('master.tahun-akademik.index')->with('success', 'Tahun Akademik ' . $validated['year'] . '/' . ($validated['year'] + 1) . ' berhasil ditambahkan.');
        } catch (\Throwable $e) {
            Log::error('Gagal menambahkan tahun akademik: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan tahun akademik.');
        }
    }

    /**
     * Memperbarui data tahun akademik.
     */
    public function update(Request $request, AcademicYear $academicYear): RedirectResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|between:2000,2100|unique:academicyears,year,' . $academicYear->id,
        ], [
            'year.required' => 'Tahun akademik wajib diisi.',
            'year.integer' => 'Tahun akademik harus berupa 4 digit angka yang valid.',
            'year.between' => 'Tahun akademik harus berada di antara tahun 2000 dan 2100.',
            'year.unique' => 'Tahun akademik tersebut sudah terdaftar.',
        ]);

        try {
            DB::transaction(function () use ($academicYear, $validated) {
                $academicYear->update($validated);
            });

            return redirect()->route('master.tahun-akademik.index')->with('success', 'Tahun Akademik berhasil diperbarui menjadi ' . $validated['year'] . '/' . ($validated['year'] + 1) . '.');
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui tahun akademik: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat memperbarui tahun akademik.');
        }
    }

    /**
     * Menghapus data tahun akademik.
     */
    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        if ($academicYear->activities()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Tahun Akademik yang masih memiliki data kegiatan atau eviden terhubung.');
        }

        $label = $academicYear->year . '/' . ($academicYear->year + 1);

        try {
            DB::transaction(function () use ($academicYear) {
                $academicYear->delete();
            });

            return redirect()->route('master.tahun-akademik.index')->with('success', 'Tahun Akademik ' . $label . ' berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Gagal menghapus tahun akademik: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus tahun akademik.');
        }
    }
}
