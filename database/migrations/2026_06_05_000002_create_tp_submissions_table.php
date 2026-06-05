<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tp_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_file_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->timestamps();

            // One submission per student per TP
            $table->unique(['course_file_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tp_submissions');
    }
};
