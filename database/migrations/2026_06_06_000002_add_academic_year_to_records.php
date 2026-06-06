<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $yearId = DB::table('academic_years')->where('is_current', true)->value('id');

        // ── student_module ────────────────────────────────────────────────
        if (! Schema::hasColumn('student_module', 'academic_year_id')) {
            Schema::table('student_module', function (Blueprint $table) {
                $table->unsignedBigInteger('academic_year_id')->nullable()->after('module_id');
                $table->foreign('academic_year_id')->references('id')->on('academic_years')->nullOnDelete();
            });
        }
        DB::table('student_module')->whereNull('academic_year_id')->update(['academic_year_id' => $yearId]);

        // ── grades ────────────────────────────────────────────────────────
        if (! Schema::hasColumn('grades', 'academic_year_id')) {
            Schema::table('grades', function (Blueprint $table) {
                $table->dropForeign(['student_id']);
                $table->dropForeign(['module_id']);
                $table->dropUnique(['student_id', 'module_id']);
                $table->unsignedBigInteger('academic_year_id')->nullable()->after('grade');
                $table->foreign('academic_year_id')->references('id')->on('academic_years')->nullOnDelete();
                $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('module_id')->references('id')->on('modules')->cascadeOnDelete();
            });
            DB::table('grades')->whereNull('academic_year_id')->update(['academic_year_id' => $yearId]);
            Schema::table('grades', function (Blueprint $table) {
                $table->unique(['student_id', 'module_id', 'academic_year_id']);
            });
        }

        // ── attendances ───────────────────────────────────────────────────
        if (! Schema::hasColumn('attendances', 'academic_year_id')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->unsignedBigInteger('academic_year_id')->nullable()->after('marked_by');
                $table->foreign('academic_year_id')->references('id')->on('academic_years')->nullOnDelete();
            });
        }
        DB::table('attendances')->whereNull('academic_year_id')->update(['academic_year_id' => $yearId]);
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });
        Schema::table('grades', function (Blueprint $table) {
            $table->dropUnique(['student_id', 'module_id', 'academic_year_id']);
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
            $table->unique(['student_id', 'module_id']);
        });
        Schema::table('student_module', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });
    }
};
