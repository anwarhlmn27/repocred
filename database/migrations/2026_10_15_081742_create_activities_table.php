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
        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->nullable()->constrained('accreditation_sessions')->cascadeOnDelete(); // <-- Tambahkan ini
            $table->foreignUuid('criteria_id')->constrained('criterias')->cascadeOnDelete();
            $table->foreignUuid('prodi_id')->constrained('prodis')->restrictOnDelete();
            $table->string('title_activity');
            $table->text('description')->nullable();

            // Tambahkan kolom ini:
            $table->foreignUuid('academicyear_id')->nullable()->constrained('academicyears')->nullOnDelete();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'rejected'])->default('draft');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
