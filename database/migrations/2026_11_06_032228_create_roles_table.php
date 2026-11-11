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
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique(); // admin_lpm, kaprodi, baak, finance, hrd, it, perpustakaan, kemahasiswaan, umum, auditor
            $table->string('name');            // Nama tampilan: Administrator LPM, Ketua Program Studi, Biro Keuangan, dll.
            $table->enum('scope_type', ['institusi', 'prodi'])->default('institusi'); 
            // 'institusi' = lintas prodi & perguruan tinggi
            // 'prodi'     = terkunci pada prodi yang diampu
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
