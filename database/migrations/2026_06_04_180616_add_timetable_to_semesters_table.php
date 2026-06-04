<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->string('timetable_path')->nullable()->after('name');
            $table->string('timetable_name')->nullable()->after('timetable_path');
        });
    }

    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn(['timetable_path', 'timetable_name']);
        });
    }
};
