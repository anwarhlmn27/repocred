<?php

namespace Database\Seeders;

use App\Models\Ppepp;
use App\Models\Role;
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
        // 1. Seed Roles & Hak Akses Kriteria RBAC
        $this->call(RoleSeeder::class);

        // 2. Admin LPM User
        $adminRole = Role::where('code', 'admin_lpm')->first();

        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin_lpm',
                'role_id' => $adminRole?->id,
            ]
        );

        if ($admin->role_id === null && $adminRole) {
            $admin->update([
                'role_id' => $adminRole->id,
                'role' => 'admin_lpm',
            ]);
        }

        // 3. PPEPP 5 Siklus Penjaminan Mutu
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
