<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\AccreditationSession;
use App\Models\Activity;
use App\Models\Agency;
use App\Models\Criteria;
use App\Models\Faculty;
use App\Models\Ppepp;
use App\Models\Prodi;
use App\Models\Univ;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin LPM User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin_lpm',
            ]
        );

        // 9. PPEPP 5 Siklus Penjaminan Mutu
        $ppeppList = [
            [1, 'Penetapan (P)'],
            [2, 'Pelaksanaan (P)'],
            [3, 'Evaluasi (E)'],
            [4, 'Pengendalian (P)'],
            [5, 'Peningkatan (P)'],
        ];
        foreach ($ppeppList as [$code, $title]) {
            Ppepp::firstOrCreate(
                ['code_ppepp' => $code],
                ['title_ppepp' => $title]
            );
        }

    }
}
