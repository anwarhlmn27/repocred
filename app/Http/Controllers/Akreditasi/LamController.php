<?php

namespace App\Http\Controllers\Akreditasi;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AccreditationSession;
use App\Models\Activity;
use App\Models\ActivityDocument;
use App\Models\Agency;
use App\Models\Criteria;
use App\Models\Ppepp;
use App\Models\Prodi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class LamController extends Controller
{
    /**
     * Pemetaan kode PPEPP (1-5) ke kunci tahapan untuk antarmuka.
     *
     * @var array<int, string>
     */
    protected array $ppeppKeyMap = [
        1 => 'penetapan',
        2 => 'pelaksanaan',
        3 => 'evaluasi',
        4 => 'pengendalian',
        5 => 'peningkatan',
    ];

    /**
     * Menampilkan halaman instrumen akreditasi LAM (9 Kriteria) beserta pemetaan folder TS & PPEPP.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Ambil daftar program studi yang aktif beserta fakultas dan lembaga akreditasinya
        $prodis = Prodi::where('is_active', true)
            ->with(['faculty.univ', 'agency'])
            ->orderBy('name', 'asc')
            ->get();

        // 2. Tentukan program studi yang dipilih
        $requestedProdiId = $request->input('prodi_id');
        $selectedProdi = null;

        if ($requestedProdiId) {
            $selectedProdi = $prodis->firstWhere('id', $requestedProdiId);
        }

        // 3. Sesi akreditasi, kriteria, dan kegiatan untuk prodi terpilih
        $activeSession = null;
        $criteriasWithActivities = [];

        if ($selectedProdi) {
            $targetAgencyId = $selectedProdi->agency_id ?? Agency::where('level', 'prodi')->first()?->id;

            // Cari sesi akreditasi aktif untuk prodi ini sesuai lembaga akreditasi (LAM)
            $activeSession = AccreditationSession::where('prodi_id', $selectedProdi->id)
                ->where(function ($query) use ($targetAgencyId) {
                    if ($targetAgencyId) {
                        $query->where('agency_id', $targetAgencyId);
                    } else {
                        $query->whereHas('agency', function ($q) {
                            $q->where('level', 'prodi')->orWhere('code', 'like', 'LAM%');
                        });
                    }
                })
                ->where('is_active', true)
                ->with('agency')
                ->first();

            // Jika belum ada sesi aktif, cari sesi terbaru atau buat sesi inisial otomatis
            if (!$activeSession) {
                $activeSession = AccreditationSession::where('prodi_id', $selectedProdi->id)
                    ->where(function ($query) use ($targetAgencyId) {
                        if ($targetAgencyId) {
                            $query->where('agency_id', $targetAgencyId);
                        } else {
                            $query->whereHas('agency', function ($q) {
                                $q->where('level', 'prodi')->orWhere('code', 'like', 'LAM%');
                            });
                        }
                    })
                    ->latest()
                    ->first();

                if (!$activeSession) {
                    $activeSession = AccreditationSession::create([
                        'prodi_id' => $selectedProdi->id,
                        'agency_id' => $targetAgencyId,
                        'name' => 'Akreditasi ' . $selectedProdi->name . ' ' . date('Y') . '–' . (date('Y') + 5),
                        'year_start' => date('Y'),
                        'year_end' => date('Y') + 5,
                        'ts_year' => date('Y'),
                        'ts_count' => 3,
                        'status' => 'draft',
                        'is_active' => true,
                        'achieved_rating' => 'Unggul',
                    ]);
                }
            }

            // Ambil 9 Kriteria LAM
            $agencyId = $selectedProdi->agency_id ?? $activeSession->agency_id;
            $criterias = Criteria::where('agency_id', $agencyId)
                ->orderBy('sequence', 'asc')
                ->get();

            // Jika kriteria belum ada di agency prodi, gunakan master kriteria LAM-INFOKOM sebagai standar 9 kriteria
            if ($criterias->isEmpty()) {
                $fallbackAgency = Agency::where('code', 'LAM-INFOKOM')->first();
                if ($fallbackAgency) {
                    $criterias = Criteria::where('agency_id', $fallbackAgency->id)
                        ->orderBy('sequence', 'asc')
                        ->get();
                }
            }

            // Ambil seluruh kegiatan dan dokumen eviden PPEPP untuk sesi ini
            $activities = Activity::where('session_id', $activeSession->id)
                ->with([
                    'academicYear',
                    'creator:id,name',
                    'documents' => function ($q) {
                        $q->with(['ppepp', 'uploader:id,name'])->latest();
                    },
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            $tsYear = (int) $activeSession->ts_year;
            $tsCount = (int) ($activeSession->ts_count ?? 3);

            // Format kriteria beserta kegiatan & struktur folder TS + PPEPP
            $criteriasWithActivities = $criterias->map(function ($crit) use ($activities, $tsYear, $tsCount) {
                $critActivities = $activities->where('criteria_id', $crit->id)->values();

                $formattedActivities = $critActivities->map(function ($act) use ($tsYear) {
                    $ppeppDocs = [
                        'penetapan' => [],
                        'pelaksanaan' => [],
                        'evaluasi' => [],
                        'pengendalian' => [],
                        'peningkatan' => [],
                    ];

                    foreach ($act->documents as $doc) {
                        $code = $doc->ppepp?->code_ppepp ?? 1;
                        $stageKey = $this->ppeppKeyMap[$code] ?? 'penetapan';

                        $ppeppDocs[$stageKey][] = [
                            'id' => $doc->id,
                            'name' => $doc->filename,
                            'size' => $doc->formatted_size,
                            'file_type' => $doc->file_type,
                            'file_size' => $doc->file_size,
                            'date' => $doc->created_at ? $doc->created_at->translatedFormat('d M Y') : '-',
                            'url' => $doc->url,
                            'uploader' => $doc->uploader?->name ?? 'Pengguna',
                        ];
                    }

                    $actYear = $act->academic_year ?? $act->academicYear?->year ?? null;
                    $tsKey = 'all';
                    $tsLabel = 'Semua TS';

                    if ($actYear !== null) {
                        $diff = $tsYear - (int) $actYear;
                        if ($diff === 0) {
                            $tsKey = 'ts-0';
                            $tsLabel = 'TS (' . $actYear . ')';
                        } elseif ($diff > 0) {
                            $tsKey = 'ts-' . $diff;
                            $tsLabel = 'TS-' . $diff . ' (' . $actYear . ')';
                        } else {
                            $tsKey = 'year-' . $actYear;
                            $tsLabel = 'Th. ' . $actYear;
                        }
                    }

                    return [
                        'id' => $act->id,
                        'title_activity' => $act->title_activity,
                        'description' => $act->description ?? '',
                        'academic_year' => $actYear,
                        'academicyear_id' => $act->academicyear_id,
                        'ts_key' => $tsKey,
                        'ts_label' => $tsLabel,
                        'year' => $actYear,
                        'status' => $act->status,
                        'creator' => $act->creator?->name,
                        'ppepp_docs' => $ppeppDocs,
                    ];
                });

                // Default enabled TS keys: selalu sertakan 'all' dan tahun-tahun dalam rentang TS
                $defaultEnabled = ['all'];
                for ($i = 0; $i < $tsCount; $i++) {
                    $defaultEnabled[] = 'ts-' . $i;
                }

                // Tambahkan TS key yang memiliki kegiatan aktif
                foreach ($formattedActivities as $fa) {
                    if (!in_array($fa['ts_key'], $defaultEnabled, true)) {
                        $defaultEnabled[] = $fa['ts_key'];
                    }
                }

                return [
                    'id' => $crit->id,
                    'code_criteria' => $crit->sequence,
                    'code' => $crit->code,
                    'title_criteria' => $crit->name,
                    'default_ts_enabled' => array_unique($defaultEnabled),
                    'activities' => $formattedActivities,
                ];
            });
        }

        // 4. Data master pendukung (Tahun Akademik & Tahapan PPEPP)
        $academicYears = AcademicYear::orderBy('year', 'desc')->get(['id', 'year']);
        $ppepps = Ppepp::orderBy('code_ppepp', 'asc')->get();

        // 5. Format daftar prodi untuk antarmuka
        $formattedProdis = $prodis->map(function ($p) {
            $agencyCode = $p->agency?->code ?? 'LAM';
            return [
                'id' => $p->id,
                'name_prodi' => $p->name,
                'degree' => 'S1',
                'faculty' => $p->faculty?->name ?? 'Fakultas',
                'acronym' => $p->acronym,
                'agency_code' => $agencyCode,
                'default_ts_count' => $agencyCode === 'LAMEMBA' ? 3 : 3,
                'description' => 'Program Studi ' . $p->name . ' pada ' . ($p->faculty?->name ?? 'Fakultas') . '.',
            ];
        });

        // 6. Format sesi aktif jika ada
        $formattedSession = null;
        if ($activeSession) {
            $formattedSession = [
                'id' => $activeSession->id,
                'name' => $activeSession->name,
                'ts_year' => (int) $activeSession->ts_year,
                'ts_count' => (int) ($activeSession->ts_count ?? 3),
                'year_start' => (int) $activeSession->year_start,
                'year_end' => (int) $activeSession->year_end,
                'status' => $activeSession->status,
                'target_rating' => $activeSession->achieved_rating ?? 'Unggul',
            ];
        }

        return Inertia::render('Akreditasi/Lam/Index', [
            'prodis' => $formattedProdis,
            'selectedProdiId' => $selectedProdi?->id ?? '',
            'activeSession' => $formattedSession,
            'criterias' => $criteriasWithActivities,
            'academicYears' => $academicYears,
            'ppepps' => $ppepps,
        ]);
    }

    /**
     * Menyimpan kegiatan (activity) baru di bawah Kriteria & TS tertentu.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function storeActivity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|uuid|exists:accreditation_sessions,id',
            'criteria_id' => 'required|uuid|exists:criterias,id',
            'title_activity' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'year' => 'nullable|integer',
            'academic_year' => 'nullable|integer',
            'academicyear_id' => 'nullable|uuid|exists:academicyears,id',
            'ts_key' => 'nullable|string',
        ], [
            'session_id.required' => 'Sesi akreditasi wajib disertakan.',
            'criteria_id.required' => 'Kriteria akreditasi wajib dipilih.',
            'title_activity.required' => 'Nama kegiatan wajib diisi.',
            'title_activity.max' => 'Nama kegiatan maksimal 255 karakter.',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $session = AccreditationSession::findOrFail($validated['session_id']);

                $targetYear = $validated['year'] ?? $validated['academic_year'] ?? null;
                $academicYearId = $validated['academicyear_id'] ?? null;

                // Jika tahun dikirimkan dan bukan 'all', hubungkan ke master academicyears
                if (!$academicYearId && $targetYear !== null && ($validated['ts_key'] ?? '') !== 'all') {
                    $ay = AcademicYear::firstOrCreate(['year' => (int) $targetYear]);
                    $academicYearId = $ay->id;
                }

                Activity::create([
                    'session_id' => $session->id,
                    'criteria_id' => $validated['criteria_id'],
                    'prodi_id' => $session->prodi_id,
                    'title_activity' => trim($validated['title_activity']),
                    'description' => $validated['description'] ?? null,
                    'academicyear_id' => $academicYearId,
                    'created_by' => auth()->id(),
                    'status' => 'published',
                ]);
            });

            return redirect()->back()->with('success', 'Kegiatan pemenuhan kriteria LAM berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan kegiatan LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat menyimpan kegiatan. Silakan coba lagi.');
        }
    }

    /**
     * Memperbarui data kegiatan (activity).
     *
     * @param Request $request
     * @param Activity $activity
     * @return RedirectResponse
     */
    public function updateActivity(Request $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validate([
            'title_activity' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'year' => 'nullable|integer',
            'academic_year' => 'nullable|integer',
            'academicyear_id' => 'nullable|uuid|exists:academicyears,id',
            'ts_key' => 'nullable|string',
        ], [
            'title_activity.required' => 'Nama kegiatan wajib diisi.',
        ]);

        try {
            DB::transaction(function () use ($validated, $activity) {
                $targetYear = $validated['year'] ?? $validated['academic_year'] ?? null;
                $academicYearId = $validated['academicyear_id'] ?? null;

                if (($validated['ts_key'] ?? '') === 'all') {
                    $academicYearId = null;
                } elseif (!$academicYearId && $targetYear !== null) {
                    $ay = AcademicYear::firstOrCreate(['year' => (int) $targetYear]);
                    $academicYearId = $ay->id;
                }

                $activity->update([
                    'title_activity' => trim($validated['title_activity']),
                    'description' => $validated['description'] ?? null,
                    'academicyear_id' => $academicYearId,
                    'updated_by' => auth()->id(),
                ]);
            });

            return redirect()->back()->with('success', 'Data kegiatan berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui kegiatan LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat memperbarui kegiatan.');
        }
    }

    /**
     * Menghapus kegiatan (activity) beserta file eviden di dalamnya.
     *
     * @param Activity $activity
     * @return RedirectResponse
     */
    public function destroyActivity(Activity $activity): RedirectResponse
    {
        try {
            DB::transaction(function () use ($activity) {
                // Hapus fisik berkas dari penyimpanan
                foreach ($activity->documents as $doc) {
                    if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
                        Storage::disk('public')->delete($doc->file_path);
                    }
                }

                $activity->delete();
            });

            return redirect()->back()->with('success', 'Kegiatan beserta seluruh dokumen di dalamnya berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus kegiatan LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus kegiatan.');
        }
    }

    /**
     * Mengunggah dokumen eviden PPEPP baru untuk kegiatan LAM.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function uploadDocument(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|uuid|exists:activities,id',
            'stage_key' => 'required|string|in:penetapan,pelaksanaan,evaluasi,pengendalian,peningkatan',
            'file' => 'required|file|max:25600|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,png,jpg,jpeg',
            'custom_name' => 'nullable|string|max:255',
        ], [
            'activity_id.required' => 'Kegiatan tujuan dokumen wajib disertakan.',
            'stage_key.required' => 'Tahapan siklus PPEPP wajib ditentukan.',
            'stage_key.in' => 'Tahapan PPEPP tidak valid.',
            'file.required' => 'File dokumen wajib dipilih.',
            'file.max' => 'Ukuran file maksimal adalah 25 MB.',
            'file.mimes' => 'Format file harus berupa PDF, Word, Excel, PowerPoint, ZIP, RAR, atau Gambar.',
        ]);

        $reverseMap = array_flip($this->ppeppKeyMap);
        $code = $reverseMap[$validated['stage_key']] ?? 1;

        $ppepp = Ppepp::where('code_ppepp', $code)->first();
        if (!$ppepp) {
            $ppepp = Ppepp::create([
                'code_ppepp' => $code,
                'title_ppepp' => ucfirst($validated['stage_key']),
            ]);
        }

        try {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $rawCustomName = trim($validated['custom_name'] ?? '');

            if (!empty($rawCustomName)) {
                $filename = str_ends_with(strtolower($rawCustomName), '.' . $extension)
                    ? $rawCustomName
                    : $rawCustomName . '.' . $extension;
            } else {
                $filename = $file->getClientOriginalName();
            }

            $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
            $subPath = 'documents/lam/' . $validated['activity_id'] . '/' . $validated['stage_key'];
            $storedPath = $file->storeAs($subPath, $safeName, 'public');

            DB::transaction(function () use ($validated, $ppepp, $filename, $storedPath, $extension, $file) {
                ActivityDocument::create([
                    'activity_id' => $validated['activity_id'],
                    'ppepp_id' => $ppepp->id,
                    'filename' => $filename,
                    'file_path' => $storedPath,
                    'file_type' => $extension ?: 'bin',
                    'file_size' => $file->getSize(),
                    'uploaded_by' => auth()->id(),
                ]);
            });

            return redirect()->back()->with('success', 'Dokumen eviden "' . $filename . '" berhasil diunggah.');
        } catch (Throwable $e) {
            Log::error('Gagal mengunggah dokumen eviden LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan sistem saat mengunggah dokumen. Pastikan ukuran file tidak melebihi batas.');
        }
    }

    /**
     * Menghapus dokumen eviden PPEPP dari sistem dan penyimpanan fisik.
     *
     * @param ActivityDocument $document
     * @return RedirectResponse
     */
    public function destroyDocument(ActivityDocument $document): RedirectResponse
    {
        try {
            $filename = $document->filename;

            DB::transaction(function () use ($document) {
                if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                }
                $document->delete();
            });

            return redirect()->back()->with('success', 'Dokumen eviden "' . $filename . '" berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus dokumen eviden LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus dokumen.');
        }
    }

    /**
     * Mengunduh file dokumen eviden.
     *
     * @param ActivityDocument $document
     * @return StreamedResponse|BinaryFileResponse|RedirectResponse
     */
    public function downloadDocument(ActivityDocument $document)
    {
        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            return redirect()->back()->with('error', 'Berkas dokumen tidak ditemukan di penyimpanan server.');
        }

        return Storage::disk('public')->download($document->file_path, $document->filename);
    }

    /**
     * Memperbarui konfigurasi TS (Tahun Sekarang & Rentang Tahun) untuk Sesi Akreditasi Prodi.
     *
     * @param Request $request
     * @param AccreditationSession $session
     * @return RedirectResponse
     */
    public function updateSession(Request $request, AccreditationSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'ts_year' => 'required|integer|between:2000,2100',
            'ts_count' => 'required|integer|in:3,5',
        ], [
            'ts_year.required' => 'Tahun acuan TS wajib diisi.',
            'ts_count.required' => 'Rentang tahun TS wajib dipilih.',
        ]);

        try {
            DB::transaction(function () use ($validated, $session) {
                $session->update($validated);
            });

            return redirect()->back()->with('success', 'Konfigurasi siklus TS akreditasi berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui konfigurasi sesi LAM: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat memperbarui konfigurasi sesi.');
        }
    }
}
