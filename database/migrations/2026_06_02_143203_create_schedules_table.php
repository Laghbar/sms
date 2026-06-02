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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->enum('day', ['monday','tuesday','wednesday','thursday','friday','saturday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room');
            $table->enum('type', ['cours', 'td', 'tp']);
            $table->enum('week_parity', ['all', 'odd', 'even'])->default('all');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
