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
        // Admin LPM User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin_lpm',
            ]
        );

        // Academic Years (Tahun Referensi Kegiatan untuk TS, TS-1, TS-2)
        $academicYear2024 = AcademicYear::firstOrCreate(['year' => 2024]);
        $academicYear2023 = AcademicYear::firstOrCreate(['year' => 2023]);
        $academicYear2022 = AcademicYear::firstOrCreate(['year' => 2022]);

        // Univ
        $univ = Univ::firstOrCreate(
            ['code' => '21127'],
            [
                'name' => 'Universitas Teknologi Digital',
                'acronym' => 'UTD',
                'address' => 'Jl. Pendidikan No. 123, Kampus Terpadu',
                'is_active' => true,
            ]
        );

        // Fakultas
        $fik = Faculty::firstOrCreate(
            ['code' => 'FIK'],
            [
                'univ_id' => $univ->id,
                'name' => 'Fakultas Ilmu Komputer',
                'acronym' => 'FIK',
                'is_active' => true,
            ]
        );

        $feb = Faculty::firstOrCreate(
            ['code' => 'FEB'],
            [
                'univ_id' => $univ->id,
                'name' => 'Fakultas Ekonomi dan Bisnis',
                'acronym' => 'FEB',
                'is_active' => true,
            ]
        );

        // Agencies (Lembaga Akreditasi Nasional & Internasional)
        $banPt = Agency::firstOrCreate(
            ['code' => 'BAN-PT'],
            [
                'name' => 'Badan Akreditasi Nasional Perguruan Tinggi',
                'type' => 'nasional',
                'level' => 'univs',
            ]
        );

        $lamInfo = Agency::firstOrCreate(
            ['code' => 'LAM-INFOKOM'],
            [
                'name' => 'Lembaga Akreditasi Mandiri Informatika dan Komputer',
                'type' => 'nasional',
                'level' => 'prodi',
            ]
        );

        $lamEmba = Agency::firstOrCreate(
            ['code' => 'LAMEMBA'],
            [
                'name' => 'Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi',
                'type' => 'nasional',
                'level' => 'prodi',
            ]
        );

        // Prodi (Terhubung ke Fakultas dan Agency)
        $prodiTi = Prodi::firstOrCreate(
            ['code' => '55201'],
            [
                'faculty_id' => $fik->id,
                'agency_id' => $lamInfo->id,
                'name' => 'Teknik Informatika',
                'acronym' => 'TI',
                'is_active' => true,
            ]
        );

        $prodiSi = Prodi::firstOrCreate(
            ['code' => '57201'],
            [
                'faculty_id' => $fik->id,
                'agency_id' => $lamInfo->id,
                'name' => 'Sistem Informasi',
                'acronym' => 'SI',
                'is_active' => true,
            ]
        );

        $prodiMgt = Prodi::firstOrCreate(
            ['code' => '61201'],
            [
                'faculty_id' => $feb->id,
                'agency_id' => $lamEmba->id,
                'name' => 'Manajemen',
                'acronym' => 'MNJ',
                'is_active' => true,
            ]
        );

        // BAN-PT 4 Criterias
        $banptCriteria = [
            [1, 'BANPT-1', 'Visi, Misi, Tujuan, dan Strategi'],
            [2, 'BANPT-2', 'Tata Pamong, Tata Kelola, dan Kerjasama'],
            [3, 'BANPT-3', 'Mahasiswa & Sumber Daya'],
            [4, 'BANPT-4', 'Luaran, Capaian & Dampak'],
        ];
        foreach ($banptCriteria as [$seq, $code, $name]) {
            Criteria::firstOrCreate(
                ['agency_id' => $banPt->id, 'code' => $code],
                ['name' => $name, 'sequence' => $seq]
            );
        }

        // LAM 9 Criterias
        $lamCriteria = [
            [1, 'LAM-1', 'Visi, Misi, Tujuan, dan Strategi'],
            [2, 'LAM-2', 'Tata Pamong, Tata Kelola, dan Kerjasama'],
            [3, 'LAM-3', 'Mahasiswa'],
            [4, 'LAM-4', 'Sumber Daya Manusia'],
            [5, 'LAM-5', 'Keuangan, Sarana dan Prasarana'],
            [6, 'LAM-6', 'Pendidikan'],
            [7, 'LAM-7', 'Penelitian'],
            [8, 'LAM-8', 'Pengabdian kepada Masyarakat (PkM)'],
            [9, 'LAM-9', 'Luaran dan Capaian Tridharma'],
        ];
        foreach ($lamCriteria as [$seq, $code, $name]) {
            Criteria::firstOrCreate(
                ['agency_id' => $lamInfo->id, 'code' => $code],
                ['name' => $name, 'sequence' => $seq]
            );
        }

        // PPEPP 5 Siklus Penjaminan Mutu
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

        // Sesi Akreditasi (Periode 5 Tahunan S1 Teknik Informatika)
        $sessionTi = AccreditationSession::firstOrCreate(
            [
                'prodi_id' => $prodiTi->id,
                'name' => 'Akreditasi S1 Teknik Informatika 2024–2029',
            ],
            [
                'agency_id' => $lamInfo->id,
                'year_start' => 2024,
                'year_end' => 2029,
                'ts_count' => 3,
                'ts_year' => 2024,
                'status' => 'draft',
                'is_active' => true,
            ]
        );

        // Sample Activities:
        // 1. Kriteria 1 VMTS (Berlaku untuk Semua TS / null academicyear)
        $crit1 = Criteria::where('agency_id', $lamInfo->id)->where('code', 'LAM-1')->first();
        if ($crit1) {
            Activity::firstOrCreate(
                ['title_activity' => 'Penyusunan & Sosialisasi VMTS Prodi S1 Teknik Informatika'],
                [
                    'session_id' => $sessionTi->id,
                    'criteria_id' => $crit1->id,
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Kegiatan workshop peninjauan dan sosialisasi visi keilmuan program studi (Berlaku Siklus 5 Tahun).',
                    'academicyear_id' => null, // Semua TS
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }

        // 2. Kriteria 6 Kurikulum OBE (Spesifik Tahun TS 2024)
        $crit6 = Criteria::where('agency_id', $lamInfo->id)->where('code', 'LAM-6')->first();
        if ($crit6) {
            Activity::firstOrCreate(
                ['title_activity' => 'Review Kurikulum OBE Berbasis Standar ACM/IEEE (TS 2024)'],
                [
                    'session_id' => $sessionTi->id,
                    'criteria_id' => $crit6->id,
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Penyelarasan kurikulum OBE dengan stakeholder industri tahun akademik berjalan.',
                    'academicyear_id' => $academicYear2024->id, // TS
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }
    }
}
