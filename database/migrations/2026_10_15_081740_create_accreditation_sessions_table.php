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
        Schema::create('accreditation_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('prodi_id')->constrained('prodis')->onDelete('cascade');
            $table->foreignUuid('agency_id')->constrained('agencies')->onDelete('restrict');
            
            $table->string('name'); // Contoh: "Akreditasi S1 IF 2024–2029", "Reakreditasi S1 IF 2029"
            $table->year('year_start'); // 2024
            $table->year('year_end');   // 2029
            
            $table->enum('status', [
                'draft',            // Sedang pengumpulan eviden PPEPP
                'submitted',        // Sudah submit LED / Borang ke LAM
                'field_assessment', // Tahap Asesmen Lapangan (Asesor login)
                'completed',        // Selesai (sudah terbit SK)
                'archived'          // Diarsipkan (Read-only masa lalu)
            ])->default('draft');
            $table->unsignedTinyInteger('ts_count')->default(3); // Contoh: 3 (TS s/d TS-2) atau 5 (TS s/d TS-4)

            $table->year('ts_year'); // Contoh: 2024 sebagai TS (Tahun Sekarang)

            $table->string('sk_number')->nullable();      // No SK Akreditasi dari LAM/BAN
            $table->string('achieved_rating')->nullable(); // Unggul / Baik Sekali / Terakreditasi
            $table->boolean('is_active')->default(true);  // Sesi yang sedang aktif dikerjakan prodi
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accreditation_sessions');
    }
};
