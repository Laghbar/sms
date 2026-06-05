<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->string('note')->nullable();
            $table->foreignId('marked_by')->constrained('users');
            $table->timestamps();

            $table->unique(['module_id', 'student_id', 'session_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
