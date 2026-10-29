<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Criteria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CriteriaController extends Controller
{
    /**
     * Menampilkan daftar kriteria akreditasi.
     */
    public function index(): Response
    {
        $criterias = Criteria::with('agency')
            ->withCount('activities')
            ->orderBy('agency_id')
            ->orderBy('sequence')
            ->get();

        $agencies = Agency::orderBy('name', 'asc')
            ->get(['id', 'code', 'name', 'type', 'level']);

        return Inertia::render('Master/Kriteria/Index', [
            'criterias' => $criterias,
            'agencies' => $agencies,
        ]);
    }

    /**
     * Menyimpan data kriteria akreditasi baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'agency_id' => 'required|uuid|exists:agencies,id',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('criterias', 'code')->where(function ($query) use ($request) {
                    return $query->where('agency_id', $request->agency_id);
                }),
            ],
            'name' => 'required|string|max:255',
            'sequence' => 'required|integer|min:1|max:99',
        ], [
            'agency_id.required' => 'Lembaga akreditasi wajib dipilih.',
            'agency_id.exists' => 'Lembaga akreditasi tidak valid.',
            'code.required' => 'Kode kriteria wajib diisi.',
            'code.unique' => 'Kode kriteria sudah terdaftar untuk lembaga akreditasi ini.',
            'name.required' => 'Nama kriteria akreditasi wajib diisi.',
            'sequence.required' => 'Nomor urutan kriteria wajib diisi.',
            'sequence.integer' => 'Nomor urutan kriteria harus berupa angka.',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));

        try {
            DB::transaction(function () use ($validated) {
                Criteria::create($validated);
            });

            return redirect()->route('master.kriteria.index')->with('success', 'Kriteria akreditasi berhasil ditambahkan.');
        } catch (\Throwable $e) {
            Log::error('Gagal menambahkan kriteria: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan kriteria akreditasi.');
        }
    }

    /**
     * Memperbarui data kriteria akreditasi.
     */
    public function update(Request $request, Criteria $criteria): RedirectResponse
    {
        $validated = $request->validate([
            'agency_id' => 'required|uuid|exists:agencies,id',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('criterias', 'code')
                    ->where(function ($query) use ($request) {
                        return $query->where('agency_id', $request->agency_id);
                    })
                    ->ignore($criteria->id),
            ],
            'name' => 'required|string|max:255',
            'sequence' => 'required|integer|min:1|max:99',
        ], [
            'agency_id.required' => 'Lembaga akreditasi wajib dipilih.',
            'agency_id.exists' => 'Lembaga akreditasi tidak valid.',
            'code.required' => 'Kode kriteria wajib diisi.',
            'code.unique' => 'Kode kriteria sudah terdaftar untuk lembaga akreditasi ini.',
            'name.required' => 'Nama kriteria akreditasi wajib diisi.',
            'sequence.required' => 'Nomor urutan kriteria wajib diisi.',
            'sequence.integer' => 'Nomor urutan kriteria harus berupa angka.',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));

        try {
            DB::transaction(function () use ($criteria, $validated) {
                $criteria->update($validated);
            });

            return redirect()->route('master.kriteria.index')->with('success', 'Kriteria akreditasi berhasil diperbarui.');
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui kriteria: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan sistem saat memperbarui kriteria akreditasi.');
        }
    }

    /**
     * Menghapus data kriteria akreditasi.
     */
    public function destroy(Criteria $criteria): RedirectResponse
    {
        if ($criteria->activities()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Kriteria yang masih memiliki data kegiatan atau eviden borang terhubung.');
        }

        try {
            DB::transaction(function () use ($criteria) {
                $criteria->delete();
            });

            return redirect()->route('master.kriteria.index')->with('success', 'Kriteria akreditasi berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Gagal menghapus kriteria: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus kriteria akreditasi.');
        }
    }
}
