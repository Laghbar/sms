<?php

use App\Models\Specialization;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Specialization::all()->each(function ($spec) {
            foreach (['S3', 'S4'] as $name) {
                $spec->semesters()->firstOrCreate(['name' => $name]);
            }
        });
    }

    public function down(): void
    {
        Specialization::all()->each(function ($spec) {
            $spec->semesters()->whereIn('name', ['S3', 'S4'])->delete();
        });
    }
};
