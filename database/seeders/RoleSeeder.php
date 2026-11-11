<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'code' => 'admin_lpm',
                'name' => 'Administrator LPM / Penjamin Mutu',
                'scope_type' => 'institusi',
                'description' => 'Super Admin: Akses penuh master data, sesi akreditasi, dan verifikasi eviden di semua prodi & institusi.',
                'criterias' => [0], // 0 = Semua kriteria (K1 - K9)
            ],
            [
                'code' => 'kaprodi',
                'name' => 'Ketua Program Studi / Tim Akreditasi Prodi',
                'scope_type' => 'prodi',
                'description' => 'Pengelola akreditasi prodi: Bertanggung jawab atas dokumen dan kegiatan prodi yang diampunya.',
                'criterias' => [1, 2, 6, 7, 8, 9],
            ],
            [
                'code' => 'baak',
                'name' => 'Biro Administrasi Akademik & Kemahasiswaan (BAAK)',
                'scope_type' => 'institusi',
                'description' => 'Mendukung penyediaan data akademik, kurikulum, dan kemahasiswaan lintas prodi.',
                'criterias' => [3, 6], // Kriteria 3 (Mahasiswa) & Kriteria 6 (Pendidikan/Kurikulum)
            ],
            [
                'code' => 'finance',
                'name' => 'Biro Keuangan (Finance)',
                'scope_type' => 'institusi',
                'description' => 'Mendukung laporan anggaran, pembiayaan, dan realisasi dana operasional tridharma.',
                'criterias' => [5], // Kriteria 5 (Keuangan & Sarpras)
            ],
            [
                'code' => 'hrd',
                'name' => 'Bagian Kepegawaian / HRD',
                'scope_type' => 'institusi',
                'description' => 'Mendukung data kualifikasi dosen, tenaga kependidikan, BKD, dan pengembangan SDM.',
                'criterias' => [4], // Kriteria 4 (SDM)
            ],
            [
                'code' => 'it',
                'name' => 'Pusat Komputer & IT',
                'scope_type' => 'institusi',
                'description' => 'Mendukung infrastruktur jaringan, server, sistem informasi, dan fasilitas lab komputer.',
                'criterias' => [5, 6], // Kriteria 5 (Sarpras IT) & Kriteria 6 (E-Learning)
            ],
            [
                'code' => 'perpustakaan',
                'name' => 'Unit Pelaksana Teknis Perpustakaan',
                'scope_type' => 'institusi',
                'description' => 'Mendukung bukti fisik e-journal, koleksi buku, dan fasilitas perpustakaan kampus.',
                'criterias' => [5], // Kriteria 5 (Sarana Prasarana)
            ],
            [
                'code' => 'kemahasiswaan',
                'name' => 'Bagian Kemahasiswaan & Alumni',
                'scope_type' => 'institusi',
                'description' => 'Mendukung bukti prestasi mahasiswa, beasiswa, organisasi, serta tracer study alumni.',
                'criterias' => [3, 9], // Kriteria 3 (Kemahasiswaan) & Kriteria 9 (Tracer Study/Luaran)
            ],
            [
                'code' => 'umum',
                'name' => 'Bagian Umum & Sarana Prasarana',
                'scope_type' => 'institusi',
                'description' => 'Mendukung dokumen tata pamong, pemeliharaan sarpras, keselamatan gedung, dan aset.',
                'criterias' => [2, 5], // Kriteria 2 (Tata Pamong) & Kriteria 5 (Sarpras Fisik)
            ],
            [
                'code' => 'auditor',
                'name' => 'Auditor Mutu Internal (AMI)',
                'scope_type' => 'institusi',
                'description' => 'Asesor / Tim Audit Internal untuk mereview dan memvalidasi keterisian berkas eviden mutu.',
                'criterias' => [0],
            ],
        ];
        foreach ($roles as $r) {
            $roleId = Str::uuid()->toString();
            DB::table('roles')->insertOrIgnore([
                'id' => $roleId,
                'code' => $r['code'],
                'name' => $r['name'],
                'scope_type' => $r['scope_type'],
                'description' => $r['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            // Ambil ID role yang baru atau yang sudah ada
            $existingRole = DB::table('roles')->where('code', $r['code'])->first();
            $targetId = $existingRole ? $existingRole->id : $roleId;
            // Masukkan mapping kriteria
            foreach ($r['criterias'] as $critNum) {
                DB::table('role_criteria_access')->insertOrIgnore([
                    'id' => Str::uuid()->toString(),
                    'role_id' => $targetId,
                    'agency_level' => 'all',
                    'criteria_number' => $critNum,
                    'is_primary' => true,
                    'can_upload' => true,
                    'can_verify' => ($r['code'] === 'admin_lpm' || $r['code'] === 'auditor'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
