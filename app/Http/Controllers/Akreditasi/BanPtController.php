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

class BanPtController extends Controller
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
     * Menampilkan halaman instrumen akreditasi BAN-PT beserta sesi, kriteria, dan eviden PPEPP.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Ambil semua sesi akreditasi yang terhubung ke BAN-PT
        $sessions = AccreditationSession::whereHas('agency', function ($q) {
            $q->where('code', 'BAN-PT');
        })
            ->with(['agency', 'prodi.faculty.univ'])
            ->orderBy('year_start', 'desc')
            ->get();

        // 2. Tentukan sesi aktif yang dipilih
        $requestedSessionId = $request->input('session_id');
        $selectedSession = null;

        if ($requestedSessionId) {
            $selectedSession = $sessions->firstWhere('id', $requestedSessionId);
        }

        // Jika tidak ada parameter session_id, ambil sesi yang aktif (is_active = true) atau sesi pertama
        if (!$selectedSession && $sessions->isNotEmpty()) {
            $selectedSession = $sessions->firstWhere('is_active', true) ?? $sessions->first();
        }

        // 3. Ambil data agency BAN-PT dan 4 kriteria resminya
        $banPtAgency = Agency::where('code', 'BAN-PT')->first();
        $criterias = collect();

        if ($banPtAgency) {
            $criterias = Criteria::where('agency_id', $banPtAgency->id)
                ->orderBy('sequence', 'asc')
                ->get();
        }

        // 4. Jika ada sesi terpilih, muat seluruh kegiatan dan dokumen eviden PPEPP
        $criteriasWithActivities = [];

        if ($selectedSession) {
            $activities = Activity::where('session_id', $selectedSession->id)
                ->with([
                    'academicYear',
                    'creator:id,name',
                    'documents' => function ($q) {
                        $q->with(['ppepp', 'uploader:id,name'])->latest();
                    },
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format kriteria beserta kegiatan & struktur folder 5 PPEPP
            $criteriasWithActivities = $criterias->map(function ($crit) use ($activities) {
                $critActivities = $activities->where('criteria_id', $crit->id)->values();

                $formattedActivities = $critActivities->map(function ($act) {
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

                    return [
                        'id' => $act->id,
                        'title_activity' => $act->title_activity,
                        'description' => $act->description ?? '',
                        'academic_year' => $act->academic_year ?? $act->academicYear?->year ?? null,
                        'academicyear_id' => $act->academicyear_id,
                        'status' => $act->status,
                        'creator' => $act->creator?->name,
                        'ppepp_docs' => $ppeppDocs,
                    ];
                });

                return [
                    'id' => $crit->id,
                    'code_criteria' => $crit->sequence,
                    'code' => $crit->code,
                    'title_criteria' => $crit->name,
                    'activities' => $formattedActivities,
                ];
            });
        }

        // 5. Data master pendukung (Tahun Akademik & Tahapan PPEPP)
        $academicYears = AcademicYear::orderBy('year', 'desc')->get(['id', 'year']);
        $ppepps = Ppepp::orderBy('code_ppepp', 'asc')->get();

        // 6. Format sesi untuk antarmuka
        $formattedSessions = $sessions->map(function ($s) {
            $univName = $s->prodi?->faculty?->univ?->name ?? 'Perguruan Tinggi';
            return [
                'id' => $s->id,
                'name' => $s->name,
                'agency_code' => $s->agency?->code ?? 'BAN-PT',
                'agency_name' => $s->agency?->name ?? 'Badan Akreditasi Nasional Perguruan Tinggi',
                'level' => 'Institusi / Perguruan Tinggi',
                'univ_name' => $univName,
                'year_start' => $s->year_start,
                'year_end' => $s->year_end,
                'ts_year' => $s->ts_year,
                'ts_count' => $s->ts_count ?? 5,
                'status' => $s->status,
                'is_active' => (bool) $s->is_active,
                'status_label' => $s->is_active ? 'Sesi Aktif Sedang Berjalan' : ($s->status === 'completed' ? 'Terakreditasi (Arsip)' : 'Persiapan / Draft'),
                'status_badge' => $s->is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200',
                'target_rating' => $s->achieved_rating ?? 'Unggul',
                'sk_number' => $s->sk_number ?? 'Dalam Proses Penyusunan Dokumen',
                'description' => 'Siklus akreditasi institusi BAN-PT periode ' . $s->year_start . '–' . $s->year_end . ' berbasis 4 Kriteria Penjaminan Mutu.',
            ];
        });

        return Inertia::render('Akreditasi/BanPt/Index', [
            'sessions' => $formattedSessions,
            'selectedSessionId' => $selectedSession?->id ?? '',
            'criterias' => $criteriasWithActivities,
            'academicYears' => $academicYears,
            'ppepps' => $ppepps,
        ]);
    }

    /**
     * Menyimpan kegiatan (activity) baru di bawah kriteria BAN-PT terpilih.
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
            'academicyear_id' => 'nullable|uuid|exists:academicyears,id',
            'academic_year' => 'nullable|integer',
        ], [
            'session_id.required' => 'Sesi akreditasi wajib dipilih.',
            'criteria_id.required' => 'Kriteria akreditasi wajib dipilih.',
            'title_activity.required' => 'Nama kegiatan / folder wajib diisi.',
            'title_activity.max' => 'Nama kegiatan maksimal 255 karakter.',
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                $session = AccreditationSession::findOrFail($validated['session_id']);

                // Hubungkan ke academicyear_id jika dikirim tahun angka
                $academicYearId = $validated['academicyear_id'] ?? null;
                if (!$academicYearId && !empty($validated['academic_year'])) {
                    $ay = AcademicYear::firstOrCreate(['year' => (int) $validated['academic_year']]);
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

            return redirect()->back()->with('success', 'Kegiatan pemenuhan kriteria berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan kegiatan BAN-PT: ' . $e->getMessage(), ['exception' => $e]);

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
            'academicyear_id' => 'nullable|uuid|exists:academicyears,id',
            'academic_year' => 'nullable|integer',
        ], [
            'title_activity.required' => 'Nama kegiatan wajib diisi.',
        ]);

        try {
            DB::transaction(function () use ($validated, $activity) {
                $academicYearId = $validated['academicyear_id'] ?? $activity->academicyear_id;
                if (!empty($validated['academic_year'])) {
                    $ay = AcademicYear::firstOrCreate(['year' => (int) $validated['academic_year']]);
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
            Log::error('Gagal memperbarui kegiatan BAN-PT: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat memperbarui kegiatan.');
        }
    }

    /**
     * Menghapus kegiatan (activity) beserta file eviden dokumen di dalamnya.
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
            Log::error('Gagal menghapus kegiatan BAN-PT: ' . $e->getMessage(), ['exception' => $e]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus kegiatan.');
        }
    }

    /**
     * Mengunggah dokumen eviden PPEPP baru untuk kegiatan terkait.
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

            // Susun nama file
            if (!empty($rawCustomName)) {
                $filename = str_ends_with(strtolower($rawCustomName), '.' . $extension)
                    ? $rawCustomName
                    : $rawCustomName . '.' . $extension;
            } else {
                $filename = $file->getClientOriginalName();
            }

            // Bersihkan nama file yang disimpan di filesystem
            $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
            $subPath = 'documents/ban-pt/' . $validated['activity_id'] . '/' . $validated['stage_key'];
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
            Log::error('Gagal mengunggah dokumen eviden BAN-PT: ' . $e->getMessage(), ['exception' => $e]);

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
            Log::error('Gagal menghapus dokumen eviden BAN-PT: ' . $e->getMessage(), ['exception' => $e]);

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
}
