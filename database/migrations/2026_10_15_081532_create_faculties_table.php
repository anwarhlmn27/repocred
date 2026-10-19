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
        Schema::create('faculties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('univ_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('acronym')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('univ_id')->references('id')->on('univs')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculties');
    }
};
