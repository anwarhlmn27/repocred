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
        Schema::create('criterias', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agency_id')->constrained('agencies')->onDelete('restrict'); // <-- Tambahkan ini kembali
            $table->string('code');
            $table->string('name');
            $table->integer('sequence')->default(1);
            $table->timestamps();

            $table->unique(['agency_id', 'code']); // <-- Mencegah bentrok kode kriteria antar agency
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criterias');
    }
};
