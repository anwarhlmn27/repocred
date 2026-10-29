<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AccreditationSession;
use App\Models\Agency;
use App\Models\Prodi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AccreditationSessionController extends Controller
{
    /**
     * Menampilkan daftar sesi akreditasi.
     */
    public function index(): Response
    {
        $sessions = AccreditationSession::with(['prodi.faculty', 'agency'])
            ->withCount('activities')
            ->orderBy('created_at', 'desc')
            ->get();

        $prodis = Prodi::with('faculty')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'acronym', 'code', 'faculty_id', 'agency_id']);

        $agencies = Agency::orderBy('name', 'asc')
            ->get(['id', 'code', 'name', 'type', 'level']);

        return Inertia::render('Master/SesiAkreditasi/Index', [
            'sessions' => $sessions,
            'prodis' => $prodis,
            'agencies' => $agencies,
        ]);
    }

    /**
     * Menyimpan data sesi akreditasi baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'prodi_id' => 'required|uuid|exists:prodis,id',
            'agency_id' => 'required|uuid|exists:agencies,id',
            'name' => 'required|string|max:255',
            'year_start' => 'required|integer|between:2000,2100',
            'year_end' => 'required|integer|between:2000,2100|gte:year_start',
            'status' => 'required|in:draft,submitted,field_assessment,completed,archived',
            'ts_count' => 'required|integer|in:3,5',
            'ts_year' => 'required|integer|between:2000,2100',
            'sk_number' => 'nullable|string|max:255',
            'achieved_rating' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'prodi_id.required' => 'Program Studi wajib dipilih.',
            'prodi_id.exists' => 'Program Studi tidak valid.',
            'agency_id.required' => 'Lembaga akreditasi wajib dipilih.',
            'agency_id.exists' => 'Lembaga akreditasi tidak valid.',
            'name.required' => 'Nama sesi akreditasi wajib diisi.',
            'year_start.required' => 'Tahun mulai periode wajib diisi.',
            'year_end.required' => 'Tahun selesai periode wajib diisi.',
            'year_end.gte' => 'Tahun selesai harus lebih besar atau sama dengan tahun mulai.',
            'status.required' => 'Status siklus akreditasi wajib dipilih.',
            'ts_count.required' => 'Rentang tahun TS wajib dipilih.',
            'ts_year.required' => 'Tahun acuan TS wajib diisi.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        try {
            DB::transaction(function () use ($validated) {
                // Jika sesi ini aktif, nonaktifkan sesi aktif lain pada prodi yang sama
                if ($validated['is_active']) {
                    AccreditationSession::where('prodi_id', $validated['prodi_id'])
                        ->where('is_active', true)
                        ->update(['is_active' => false]);
                }

                AccreditationSession::create($validated);
            });

            return redirect()->route('master.sesi-akreditasi.index')->with('success', 'Sesi Akreditasi berhasil ditambahkan.');
        } catch (\Throwable $e) {
            Log::error('Gagal menambahkan sesi akreditasi: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan sesi akreditasi.');
        }
    }

    /**
     * Memperbarui data sesi akreditasi.
     */
    public function update(Request $request, AccreditationSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'prodi_id' => 'required|uuid|exists:prodis,id',
            'agency_id' => 'required|uuid|exists:agencies,id',
            'name' => 'required|string|max:255',
            'year_start' => 'required|integer|between:2000,2100',
            'year_end' => 'required|integer|between:2000,2100|gte:year_start',
            'status' => 'required|in:draft,submitted,field_assessment,completed,archived',
            'ts_count' => 'required|integer|in:3,5',
            'ts_year' => 'required|integer|between:2000,2100',
            'sk_number' => 'nullable|string|max:255',
            'achieved_rating' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'prodi_id.required' => 'Program Studi wajib dipilih.',
            'prodi_id.exists' => 'Program Studi tidak valid.',
            'agency_id.required' => 'Lembaga akreditasi wajib dipilih.',
            'agency_id.exists' => 'Lembaga akreditasi tidak valid.',
            'name.required' => 'Nama sesi akreditasi wajib diisi.',
            'year_start.required' => 'Tahun mulai periode wajib diisi.',
            'year_end.required' => 'Tahun selesai periode wajib diisi.',
            'year_end.gte' => 'Tahun selesai harus lebih besar atau sama dengan tahun mulai.',
            'status.required' => 'Status siklus akreditasi wajib dipilih.',
            'ts_count.required' => 'Rentang tahun TS wajib dipilih.',
            'ts_year.required' => 'Tahun acuan TS wajib diisi.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        try {
            DB::transaction(function () use ($session, $validated) {
                // Jika sesi ini diaktifkan, nonaktifkan sesi aktif lain pada prodi yang sama
                if ($validated['is_active']) {
                    AccreditationSession::where('prodi_id', $validated['prodi_id'])
                        ->where('id', '!=', $session->id)
                        ->where('is_active', true)
                        ->update(['is_active' => false]);
                }

                $session->update($validated);
            });

            return redirect()->route('master.sesi-akreditasi.index')->with('success', 'Sesi Akreditasi berhasil diperbarui.');
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui sesi akreditasi: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat memperbarui sesi akreditasi.');
        }
    }

    /**
     * Menghapus data sesi akreditasi.
     */
    public function destroy(AccreditationSession $session): RedirectResponse
    {
        if ($session->activities()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Sesi Akreditasi yang masih memiliki riwayat kegiatan atau eviden borang terhubung.');
        }

        try {
            DB::transaction(function () use ($session) {
                $session->delete();
            });

            return redirect()->route('master.sesi-akreditasi.index')->with('success', 'Sesi Akreditasi berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Gagal menghapus sesi akreditasi: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus sesi akreditasi.');
        }
    }
}
