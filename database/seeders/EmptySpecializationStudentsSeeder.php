<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmptySpecializationStudentsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Ensure GM has S1 modules (it was missing them) ─────────────────
        $gm = Specialization::where('code', 'GM')->firstOrFail();
        $gmS1 = Semester::where('specialization_id', $gm->id)->where('name', 'S1')->firstOrFail();

        $gmModulesData = [
            ['code' => 'GM-MATH-S1', 'name' => 'Mathématiques',          'coefficient' => 3, 'description' => 'Algèbre linéaire, calcul et mathématiques discrètes.'],
            ['code' => 'GM-GEOL-S1', 'name' => 'Géologie',               'coefficient' => 3, 'description' => 'Minéralogie, pétrographie et géologie structurale.'],
            ['code' => 'GM-PHYS-S1', 'name' => 'Physique',               'coefficient' => 3, 'description' => 'Mécanique, thermodynamique et électromagnétisme.'],
            ['code' => 'GM-CHIM-S1', 'name' => 'Chimie',                 'coefficient' => 2, 'description' => 'Chimie générale et chimie des matériaux miniers.'],
        ];

        foreach ($gmModulesData as $data) {
            Module::firstOrCreate(
                ['code' => $data['code']],
                array_merge($data, [
                    'specialization_id' => $gm->id,
                    'semester_id'       => $gmS1->id,
                    'semester'          => 1,
                ])
            );
        }

        // ── Seed 30 students for every specialization that still has none ──
        $empty = Specialization::whereDoesntHave('students')->get();

        foreach ($empty as $spec) {
            $s1 = Semester::where('specialization_id', $spec->id)->where('name', 'S1')->firstOrFail();
            $s1Modules = Module::where('specialization_id', $spec->id)
                ->where('semester_id', $s1->id)
                ->get();

            $slug = strtolower($spec->code);

            for ($i = 1; $i <= 30; $i++) {
                $email = "student.{$slug}.{$i}@sms.com";

                $student = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name'              => "Étudiant {$spec->code} {$i}",
                        'password'          => Hash::make('password'),
                        'role'              => Role::Student,
                        'email_verified_at' => now(),
                        'specialization_id' => $spec->id,
                        'semester_id'       => $s1->id,
                    ]
                );

                // If student already existed without specialization assigned, update it
                if (! $student->wasRecentlyCreated) {
                    $student->update([
                        'specialization_id' => $spec->id,
                        'semester_id'       => $s1->id,
                    ]);
                }

                foreach ($s1Modules as $module) {
                    $module->students()->syncWithoutDetaching([$student->id]);
                }
            }

            $this->command->info("  {$spec->code} ({$spec->name}): 30 students added, enrolled in {$s1Modules->count()} S1 modules.");
        }
    }
}
