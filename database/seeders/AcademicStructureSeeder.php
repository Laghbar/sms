<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AcademicStructureSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Specialization ──────────────────────────────────────────────
        $gi = Specialization::firstOrCreate(
            ['code' => 'GI'],
            [
                'name'        => 'Génie Informatique',
                'description' => 'Computer Engineering — 1st year, Semester 1',
            ]
        );

        // ── 2. Semester S1 ─────────────────────────────────────────────────
        $s1 = Semester::firstOrCreate(
            ['specialization_id' => $gi->id, 'name' => 'S1']
        );

        // ── 3. Four modules ────────────────────────────────────────────────
        // Codes are distinct from legacy SampleDataSeeder codes (MATH101 etc.)
        $modulesData = [
            [
                'code'        => 'GI-ALG-S1',
                'name'        => 'Algorithm',
                'coefficient' => 3,
                'description' => 'Introduction to algorithms, data structures, and complexity analysis.',
            ],
            [
                'code'        => 'GI-MATH-S1',
                'name'        => 'Mathematics',
                'coefficient' => 3,
                'description' => 'Linear algebra, calculus, and discrete mathematics.',
            ],
            [
                'code'        => 'GI-ARCH-S1',
                'name'        => 'Computer Architecture',
                'coefficient' => 2,
                'description' => 'Computer hardware organisation, processor design, and memory systems.',
            ],
            [
                'code'        => 'GI-ENG-S1',
                'name'        => 'English',
                'coefficient' => 1,
                'description' => 'Technical English communication for computer science students.',
            ],
        ];

        $modules = [];
        foreach ($modulesData as $data) {
            $modules[] = Module::firstOrCreate(
                ['code' => $data['code']],
                array_merge($data, [
                    'specialization_id' => $gi->id,
                    'semester_id'       => $s1->id,
                    'semester'          => 1,
                ])
            );
        }

        // ── 4. One dedicated teacher per module ───────────────────────────
        $teachersData = [
            [
                'name'  => 'Dr. Kamel Bouzidi',
                'email' => 'teacher.algo@sms.com',
                'index' => 0,
            ],
            [
                'name'  => 'Prof. Leila Hadjou',
                'email' => 'teacher.math@sms.com',
                'index' => 1,
            ],
            [
                'name'  => 'Dr. Omar Mansouri',
                'email' => 'teacher.arch@sms.com',
                'index' => 2,
            ],
            [
                'name'  => 'Ms. Sarah Benchikh',
                'email' => 'teacher.engl@sms.com',
                'index' => 3,
            ],
        ];

        foreach ($teachersData as $t) {
            $teacher = User::firstOrCreate(
                ['email' => $t['email']],
                [
                    'name'              => $t['name'],
                    'password'          => Hash::make('password'),
                    'role'              => Role::Teacher,
                    'email_verified_at' => now(),
                ]
            );

            $module = $modules[$t['index']];

            // Set direct teacher_id on module (new system)
            $module->update(['teacher_id' => $teacher->id]);

            // Also sync legacy pivot so TeacherController::modules() still works
            $module->teachers()->syncWithoutDetaching([$teacher->id]);
        }

        // ── 5. Assign every existing student to GI / S1 ───────────────────
        User::where('role', Role::Student)->each(function (User $student) use ($gi, $s1, $modules) {
            $student->update([
                'specialization_id' => $gi->id,
                'semester_id'       => $s1->id,
            ]);

            // Enrol in all four GI-S1 modules
            foreach ($modules as $module) {
                $module->students()->syncWithoutDetaching([$student->id]);
            }
        });

        $this->command->info('Academic structure seeded:');
        $this->command->info('  Specialization : ' . $gi->name);
        $this->command->info('  Semester       : ' . $s1->name);
        $this->command->info('  Modules        : ' . count($modules));
        $this->command->info('  Teachers       : ' . count($teachersData));
        $this->command->info('  Students linked: ' . User::where('role', Role::Student)->count());
    }
}
