<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnrollmentRepairSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting enrollment repair…');
        $fixed = 0;

        User::where('role', Role::Student)
            ->whereNotNull('specialization_id')
            ->each(function (User $student) use (&$fixed) {
                // Try exact match (spec + semester)
                $modules = Module::where('specialization_id', $student->specialization_id)
                    ->when(
                        $student->semester_id,
                        fn ($q) => $q->where(function ($q2) use ($student) {
                            $q2->where('semester_id', $student->semester_id)
                               ->orWhereNull('semester_id');
                        })
                    )
                    ->get();

                // Fallback: any module for this specialization
                if ($modules->isEmpty()) {
                    $modules = Module::where('specialization_id', $student->specialization_id)->get();
                }

                foreach ($modules as $module) {
                    $module->students()->syncWithoutDetaching([$student->id]);
                }

                $fixed++;
            });

        $this->command->info("  Processed {$fixed} students with specialization.");

        // ── Students with NO specialization → assign to GI / S1 ──────────────
        $gi = Specialization::where('code', 'GI')->first();
        $s1 = $gi ? Semester::where('specialization_id', $gi->id)->where('name', 'S1')->first() : null;

        if ($gi && $s1) {
            $giModules = Module::where('specialization_id', $gi->id)
                ->where('semester_id', $s1->id)
                ->get();

            $unassigned = 0;
            User::where('role', Role::Student)
                ->whereNull('specialization_id')
                ->each(function (User $student) use ($gi, $s1, $giModules, &$unassigned) {
                    $student->update([
                        'specialization_id' => $gi->id,
                        'semester_id'       => $s1->id,
                    ]);
                    foreach ($giModules as $module) {
                        $module->students()->syncWithoutDetaching([$student->id]);
                    }
                    $unassigned++;
                });

            if ($unassigned > 0) {
                $this->command->info("  Assigned {$unassigned} unspecialized students to GI / S1.");
            }
        }

        $total = DB::table('student_module')->count();
        $zero  = User::where('role', Role::Student)->whereDoesntHave('enrolledModules')->count();
        $this->command->info("  Total enrollment pairs : {$total}");
        $this->command->info("  Students still with 0 modules: {$zero}");
    }
}
