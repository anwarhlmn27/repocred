<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Akreditasi\BanPtController;
use App\Http\Controllers\Akreditasi\LamController;
use App\Http\Controllers\Akreditasi\MatriksPpeppController;
use App\Http\Controllers\Master\UnivController;
use App\Http\Controllers\Master\FacultyController;
use App\Http\Controllers\Master\AgencyController;
use App\Http\Controllers\Master\ProdiController;
use App\Http\Controllers\Master\AcademicYearController;
use App\Http\Controllers\Master\AccreditationSessionController;
use App\Http\Controllers\Master\CriteriaController;
use App\Http\Controllers\Master\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dokumen Akreditasi
    Route::prefix('akreditasi')->name('akreditasi.')->group(function () {
        Route::get('/ban-pt', [BanPtController::class, 'index'])->name('ban-pt');
        Route::post('/ban-pt/kegiatan', [BanPtController::class, 'storeActivity'])->name('ban-pt.kegiatan.store');
        Route::put('/ban-pt/kegiatan/{activity}', [BanPtController::class, 'updateActivity'])->name('ban-pt.kegiatan.update');
        Route::delete('/ban-pt/kegiatan/{activity}', [BanPtController::class, 'destroyActivity'])->name('ban-pt.kegiatan.destroy');
        Route::post('/ban-pt/dokumen', [BanPtController::class, 'uploadDocument'])->name('ban-pt.dokumen.upload');
        Route::delete('/ban-pt/dokumen/{document}', [BanPtController::class, 'destroyDocument'])->name('ban-pt.dokumen.destroy');
        Route::get('/ban-pt/dokumen/{document}/preview', [BanPtController::class, 'previewDocument'])->name('ban-pt.dokumen.preview');
        Route::get('/ban-pt/dokumen/{document}/download', [BanPtController::class, 'downloadDocument'])->name('ban-pt.dokumen.download');

        Route::get('/lam', [LamController::class, 'index'])->name('lam');
        Route::post('/lam/kegiatan', [LamController::class, 'storeActivity'])->name('lam.kegiatan.store');
        Route::put('/lam/kegiatan/{activity}', [LamController::class, 'updateActivity'])->name('lam.kegiatan.update');
        Route::delete('/lam/kegiatan/{activity}', [LamController::class, 'destroyActivity'])->name('lam.kegiatan.destroy');
        Route::post('/lam/dokumen', [LamController::class, 'uploadDocument'])->name('lam.dokumen.upload');
        Route::delete('/lam/dokumen/{document}', [LamController::class, 'destroyDocument'])->name('lam.dokumen.destroy');
        Route::get('/lam/dokumen/{document}/preview', [LamController::class, 'previewDocument'])->name('lam.dokumen.preview');
        Route::get('/lam/dokumen/{document}/download', [LamController::class, 'downloadDocument'])->name('lam.dokumen.download');
        Route::put('/lam/sesi/{session}', [LamController::class, 'updateSession'])->name('lam.sesi.update');

        Route::get('/matriks-ppepp', [MatriksPpeppController::class, 'index'])->name('matriks-ppepp');
    });

    // Kegiatan & Eviden
    Route::get('/kegiatan', function () {
        return Inertia::render('Kegiatan/Index');
    })->name('kegiatan.index');

    // Audit Internal
    Route::get('/audit', function () {
        return Inertia::render('Audit/Index');
    })->name('audit.index');

    // Master Data
    Route::prefix('master')->name('master.')->group(function () {
        Route::get('/univ', [UnivController::class, 'index'])->name('univ.index');
        Route::post('/univ', [UnivController::class, 'store'])->name('univ.store');
        Route::put('/univ/{univ}', [UnivController::class, 'update'])->name('univ.update');
        Route::delete('/univ/{univ}', [UnivController::class, 'destroy'])->name('univ.destroy');

        Route::get('/fakultas', [FacultyController::class, 'index'])->name('fakultas.index');
        Route::post('/fakultas', [FacultyController::class, 'store'])->name('fakultas.store');
        Route::put('/fakultas/{faculty}', [FacultyController::class, 'update'])->name('fakultas.update');
        Route::delete('/fakultas/{faculty}', [FacultyController::class, 'destroy'])->name('fakultas.destroy');

        Route::get('/agency', [AgencyController::class, 'index'])->name('agency.index');
        Route::post('/agency', [AgencyController::class, 'store'])->name('agency.store');
        Route::put('/agency/{agency}', [AgencyController::class, 'update'])->name('agency.update');
        Route::delete('/agency/{agency}', [AgencyController::class, 'destroy'])->name('agency.destroy');

        Route::get('/prodi', [ProdiController::class, 'index'])->name('prodi.index');
        Route::post('/prodi', [ProdiController::class, 'store'])->name('prodi.store');
        Route::put('/prodi/{prodi}', [ProdiController::class, 'update'])->name('prodi.update');
        Route::delete('/prodi/{prodi}', [ProdiController::class, 'destroy'])->name('prodi.destroy');

        Route::get('/tahun-akademik', [AcademicYearController::class, 'index'])->name('tahun-akademik.index');
        Route::post('/tahun-akademik', [AcademicYearController::class, 'store'])->name('tahun-akademik.store');
        Route::put('/tahun-akademik/{academicYear}', [AcademicYearController::class, 'update'])->name('tahun-akademik.update');
        Route::delete('/tahun-akademik/{academicYear}', [AcademicYearController::class, 'destroy'])->name('tahun-akademik.destroy');

        Route::get('/sesi-akreditasi', [AccreditationSessionController::class, 'index'])->name('sesi-akreditasi.index');
        Route::post('/sesi-akreditasi', [AccreditationSessionController::class, 'store'])->name('sesi-akreditasi.store');
        Route::put('/sesi-akreditasi/{session}', [AccreditationSessionController::class, 'update'])->name('sesi-akreditasi.update');
        Route::delete('/sesi-akreditasi/{session}', [AccreditationSessionController::class, 'destroy'])->name('sesi-akreditasi.destroy');

        Route::get('/kriteria', [CriteriaController::class, 'index'])->name('kriteria.index');
        Route::post('/kriteria', [CriteriaController::class, 'store'])->name('kriteria.store');
        Route::put('/kriteria/{criteria}', [CriteriaController::class, 'update'])->name('kriteria.update');
        Route::delete('/kriteria/{criteria}', [CriteriaController::class, 'destroy'])->name('kriteria.destroy');

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
