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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('role_id')->nullable()->after('password')->constrained('roles')->nullOnDelete();
            $table->foreignUuid('prodi_id')->nullable()->after('role_id')->constrained('prodis')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['prodi_id']);
            $table->dropColumn(['role_id', 'prodi_id']);
        });
    }
};
