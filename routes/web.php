<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Dokumen Akreditasi
    Route::prefix('akreditasi')->name('akreditasi.')->group(function () {
        Route::get('/ban-pt', function () {
            return Inertia::render('Akreditasi/BanPt/Index');
        })->name('ban-pt');

        Route::get('/lam', function () {
            return Inertia::render('Akreditasi/Lam/Index');
        })->name('lam');

        Route::get('/matriks-ppepp', function () {
            return Inertia::render('Akreditasi/MatriksPpepp/Index');
        })->name('matriks-ppepp');
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
        Route::get('/univ', function () {
            return Inertia::render('Master/Univ/Index');
        })->name('univ.index');

        Route::get('/fakultas', function () {
            return Inertia::render('Master/Fakultas/Index');
        })->name('fakultas.index');

        Route::get('/prodi', function () {
            return Inertia::render('Master/Prodi/Index');
        })->name('prodi.index');

        Route::get('/tahun-akademik', function () {
            return Inertia::render('Master/TahunAkademik/Index');
        })->name('tahun-akademik.index');

        Route::get('/kriteria', function () {
            return Inertia::render('Master/Kriteria/Index');
        })->name('kriteria.index');

        Route::get('/users', function () {
            return Inertia::render('Master/Users/Index');
        })->name('users.index');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
