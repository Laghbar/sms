<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;

class GradesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding grades…');

        $admin = User::where('role', Role::Admin)->first();

        // GI / S1 modules: publish 3, leave Computer Architecture unpublished (demo of "Pending")
        $gi = Specialization::where('code', 'GI')->first();

        $publishedCodes = ['GI-ALG-S1', 'GI-MATH-S1', 'GI-ENG-S1'];
        $pendingCodes   = ['GI-ARCH-S1'];

        $created = 0;
        $skipped = 0;

        // Process ALL modules that have enrolled students
        $modules = Module::whereHas('students')->with('students')->get();

        foreach ($modules as $module) {
            foreach ($module->students as $student) {
                $exists = Grade::where('student_id', $student->id)
                    ->where('module_id', $module->id)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                // Generate realistic grade (8.0 – 18.5, weighted toward passing range)
                $grade = $this->randomGrade();

                Grade::create([
                    'student_id' => $student->id,
                    'module_id'  => $module->id,
                    'grade'      => $grade,
                ]);
                $created++;
            }

            // Publish / unpublish GI modules deliberately
            if (in_array($module->code, $publishedCodes) && ! $module->is_published) {
                $module->update([
                    'is_published' => true,
                    'published_at' => now(),
                    'published_by' => $admin?->id,
                ]);
            }
            // $pendingCodes stay unpublished intentionally
        }

        $this->command->info("  Grades created : {$created}");
        $this->command->info("  Already existed: {$skipped}");

        // Summary of published state for GI modules
        if ($gi) {
            $giModules = Module::where('specialization_id', $gi->id)->get(['name', 'code', 'is_published']);
            $this->command->info('  GI modules:');
            foreach ($giModules as $m) {
                $status = $m->is_published ? 'PUBLISHED' : 'pending';
                $this->command->info("    {$m->name} ({$m->code}) → {$status}");
            }
        }
    }

    private function randomGrade(): float
    {
        // 70 % chance of passing (10–18), 30 % chance of low/fail (5–9.5)
        if (rand(1, 10) <= 7) {
            return round(rand(100, 180) / 10, 2);   // 10.0 – 18.0
        }
        return round(rand(50, 95) / 10, 2);          // 5.0 – 9.5
    }
}
