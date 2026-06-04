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
        Schema::table('modules', function (Blueprint $table) {
            $table->foreignId('specialization_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('semester_id')->nullable()->after('specialization_id')->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->after('semester_id')->constrained('users')->nullOnDelete();
            $table->boolean('is_published')->default(false)->after('description');
            $table->timestamp('published_at')->nullable()->after('is_published');
            $table->foreignId('published_by')->nullable()->after('published_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['specialization_id']);
            $table->dropForeign(['semester_id']);
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['published_by']);
            $table->dropColumn(['specialization_id', 'semester_id', 'teacher_id', 'is_published', 'published_at', 'published_by']);
        });
    }
};
