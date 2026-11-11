<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('role_criteria_access', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('role_id')->constrained('roles')->onDelete('cascade');
            
            // Scope kriteria: 'all' (semua instrumen), 'institusi' (BAN-PT), atau 'prodi' (LAM)
            $table->enum('agency_level', ['all', 'institusi', 'prodi'])->default('all');
            
            // Nomor kriteria (1 s/d 9 untuk LAM, atau 1 s/d 4 untuk BAN-PT, 0 = Semua Kriteria)
            $table->unsignedTinyInteger('criteria_number')->default(0); 
            
            // Hak akses
            $table->boolean('is_primary')->default(true); // Penanda kriteria tanggung jawab utama bagian terkait
            $table->boolean('can_upload')->default(true); // Hak mengunggah dokumen eviden
            $table->boolean('can_verify')->default(false); // Hak memverifikasi (khusus LPM/Auditor)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_criteria_access');
    }
};
