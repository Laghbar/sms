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
            $table->foreignId('specialization_id')->nullable()->after('role')->constrained()->nullOnDelete();
            $table->foreignId('semester_id')->nullable()->after('specialization_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['specialization_id']);
            $table->dropForeign(['semester_id']);
            $table->dropColumn(['specialization_id', 'semester_id']);
        });
    }
};
