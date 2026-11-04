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

        // 2. Academic Years
        $academicYear2025 = AcademicYear::firstOrCreate(['year' => 2025]);
        $academicYear2024 = AcademicYear::firstOrCreate(['year' => 2024]);
        $academicYear2023 = AcademicYear::firstOrCreate(['year' => 2023]);
        $academicYear2022 = AcademicYear::firstOrCreate(['year' => 2022]);

        // 3. Univ
        $univ = Univ::firstOrCreate(
            ['code' => '21127'],
            [
                'name' => 'Universitas Teknologi Digital',
                'acronym' => 'UTD',
                'address' => 'Jl. Pendidikan No. 123, Kampus Terpadu',
                'is_active' => true,
            ]
        );

        // 4. Fakultas
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

        // 5. Agencies (Lembaga Akreditasi Nasional & Internasional)
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

        // 6. Prodi (Terhubung ke Fakultas dan Agency)
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

        // 7. BAN-PT 4 Criterias
        $banptCriteria = [
            [1, 'C1', 'Visi, Misi, Tujuan, dan Strategi (VMTS) Perguruan Tinggi'],
            [2, 'C2', 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Perguruan Tinggi'],
            [3, 'C3', 'Mahasiswa, Dosen, dan Sumber Daya Penunjang Akademik'],
            [4, 'C4', 'Luaran, Capaian Tridharma, dan Dampak Kemanfaatan Masyarakat'],
        ];
        foreach ($banptCriteria as [$seq, $code, $name]) {
            Criteria::firstOrCreate(
                ['agency_id' => $banPt->id, 'code' => $code],
                ['name' => $name, 'sequence' => $seq]
            );
        }

        // 8. LAM 9 Criterias (Untuk LAM-INFOKOM)
        $lamCriteria = [
            [1, 'C1', 'Visi, Misi, Tujuan, dan Strategi (VMTS) Keilmuan Program Studi'],
            [2, 'C2', 'Tata Pamong, Tata Kelola, dan Kerjasama Tridharma Program Studi'],
            [3, 'C3', 'Mahasiswa (Rekrutmen, Layanan & Prestasi Kemahasiswaan)'],
            [4, 'C4', 'Sumber Daya Manusia (Kualifikasi Dosen & Tenaga Kependidikan)'],
            [5, 'C5', 'Keuangan, Sarana dan Prasarana Penunjang Pembelajaran'],
            [6, 'C6', 'Pendidikan (Kurikulum OBE, Proses Pembelajaran & Asesmen CPL)'],
            [7, 'C7', 'Penelitian Dosen dan Keterlibatan Mahasiswa'],
            [8, 'C8', 'Pengabdian kepada Masyarakat (PkM) Penerapan IPTEK'],
            [9, 'C9', 'Luaran dan Capaian Tridharma (Tracer Study & Waktu Tunggu)'],
        ];
        foreach ($lamCriteria as [$seq, $code, $name]) {
            Criteria::firstOrCreate(
                ['agency_id' => $lamInfo->id, 'code' => $code],
                ['name' => $name, 'sequence' => $seq]
            );
        }

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

        // 10. Sesi Akreditasi BAN-PT Institusi
        $sessionBanPt = AccreditationSession::firstOrCreate(
            [
                'agency_id' => $banPt->id,
                'name' => 'Akreditasi Perguruan Tinggi (AIPT) 2025–2030',
            ],
            [
                'prodi_id' => $prodiTi->id,
                'year_start' => 2025,
                'year_end' => 2030,
                'ts_count' => 5,
                'ts_year' => 2025,
                'status' => 'draft',
                'is_active' => true,
                'sk_number' => 'Dalam Proses Penyusunan LKPT & LED Institusi 2025',
                'achieved_rating' => 'Unggul',
            ]
        );

        // 11. Sesi Akreditasi LAM-INFOKOM S1 Teknik Informatika
        $sessionTi = AccreditationSession::firstOrCreate(
            [
                'prodi_id' => $prodiTi->id,
                'agency_id' => $lamInfo->id,
                'name' => 'Akreditasi S1 Teknik Informatika 2024–2029',
            ],
            [
                'year_start' => 2024,
                'year_end' => 2029,
                'ts_count' => 3,
                'ts_year' => 2024,
                'status' => 'draft',
                'is_active' => true,
                'achieved_rating' => 'Unggul',
            ]
        );

        // 12. Sesi Akreditasi LAM-INFOKOM S1 Sistem Informasi
        $sessionSi = AccreditationSession::firstOrCreate(
            [
                'prodi_id' => $prodiSi->id,
                'agency_id' => $lamInfo->id,
                'name' => 'Akreditasi S1 Sistem Informasi 2024–2029',
            ],
            [
                'year_start' => 2024,
                'year_end' => 2029,
                'ts_count' => 3,
                'ts_year' => 2024,
                'status' => 'draft',
                'is_active' => true,
                'achieved_rating' => 'Baik Sekali',
            ]
        );

        // 13. Sample Activities LAM TI
        $crit1 = Criteria::where('agency_id', $lamInfo->id)->where('code', 'C1')->first();
        if ($crit1) {
            Activity::firstOrCreate(
                [
                    'session_id' => $sessionTi->id,
                    'criteria_id' => $crit1->id,
                    'title_activity' => 'Penyusunan & Sosialisasi VMTS Prodi Berbasis AI & Software Engineering',
                ],
                [
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Kegiatan workshop peninjauan dan sosialisasi visi keilmuan program studi (Berlaku Siklus 5 Tahun).',
                    'academicyear_id' => null, // Semua TS
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }

        $crit2 = Criteria::where('agency_id', $lamInfo->id)->where('code', 'C2')->first();
        if ($crit2) {
            Activity::firstOrCreate(
                [
                    'session_id' => $sessionTi->id,
                    'criteria_id' => $crit2->id,
                    'title_activity' => 'MoU Kerjasama Industri Teknologi & Program Magang Kampus Merdeka',
                ],
                [
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Kerjasama resmi dengan mitra industri dalam program magang bersertifikat dan riset.',
                    'academicyear_id' => $academicYear2024->id, // TS 2024
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }

        $crit6 = Criteria::where('agency_id', $lamInfo->id)->where('code', 'C6')->first();
        if ($crit6) {
            Activity::firstOrCreate(
                [
                    'session_id' => $sessionTi->id,
                    'criteria_id' => $crit6->id,
                    'title_activity' => 'Review Kurikulum OBE Berbasis Standar ACM/IEEE (TS 2024)',
                ],
                [
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Penyelarasan kurikulum OBE dengan stakeholder industri tahun akademik berjalan.',
                    'academicyear_id' => $academicYear2024->id, // TS 2024
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }

        // 14. Sample Activities BAN-PT Institusi
        $banptCrit1 = Criteria::where('agency_id', $banPt->id)->where('code', 'C1')->first();
        if ($banptCrit1) {
            Activity::firstOrCreate(
                [
                    'session_id' => $sessionBanPt->id,
                    'criteria_id' => $banptCrit1->id,
                    'title_activity' => 'Penyusunan & Sosialisasi VMTS Perguruan Tinggi',
                ],
                [
                    'prodi_id' => $prodiTi->id,
                    'description' => 'Kegiatan sosialisasi visi, misi, tujuan, dan sasaran strategis universitas.',
                    'academicyear_id' => $academicYear2025->id,
                    'created_by' => $admin->id,
                    'status' => 'published',
                ]
            );
        }
    }
}
