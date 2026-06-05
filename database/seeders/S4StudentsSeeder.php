<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class S4StudentsSeeder extends Seeder
{
    public function run(): void
    {
        // S4 modules per spec — teachers are looked up by their existing email
        // (these teachers were created during SemesterAdvancementSeeder but lost
        //  their modules when empty S4 modules were deleted)
        $s4Data = [
            'GE' => [
                'modules' => [
                    ['code' => 'GE-POWER-S4', 'name' => "Production d'Énergie",   'coeff' => 3, 'teacher_email' => 'teacher.ge.power@sms.com', 'teacher_name' => 'Dr. Karim Hadj'],
                    ['code' => 'GE-RENEW-S4', 'name' => 'Énergies Renouvelables',  'coeff' => 3, 'teacher_email' => 'teacher.ge.renew@sms.com',  'teacher_name' => 'Prof. Leila Rezki'],
                    ['code' => 'GE-TELE-S4',  'name' => 'Télécommunications',      'coeff' => 3, 'teacher_email' => 'teacher.ge.tele@sms.com',   'teacher_name' => 'Dr. Samir Bouzid'],
                    ['code' => 'GE-PROJ-S4',  'name' => 'Projet Intégrateur',      'coeff' => 2, 'teacher_email' => 'teacher.ge.proj@sms.com',   'teacher_name' => 'Ms. Rania Cherif'],
                ],
            ],
            'GM' => [
                'modules' => [
                    ['code' => 'GM-GISMT-S4',  'name' => 'Gisements Minéraux',       'coeff' => 3, 'teacher_email' => 'teacher.gm.gismt@sms.com',  'teacher_name' => 'Dr. Yazid Bouafia'],
                    ['code' => 'GM-METAL2-S4', 'name' => 'Métallurgie Extractive',   'coeff' => 3, 'teacher_email' => 'teacher.gm.metal2@sms.com', 'teacher_name' => 'Prof. Farida Aït'],
                    ['code' => 'GM-TRAITE-S4', 'name' => 'Traitement des Minerais',  'coeff' => 3, 'teacher_email' => 'teacher.gm.traite@sms.com', 'teacher_name' => 'Dr. Kamel Zerrouk'],
                    ['code' => 'GM-PROJM-S4',  'name' => 'Projet de Fin de Cycle',   'coeff' => 2, 'teacher_email' => 'teacher.gm.projm@sms.com',  'teacher_name' => 'Prof. Saida Messaoudi'],
                ],
            ],
            'AGC' => [
                'modules' => [
                    ['code' => 'AGC-SEED-S4',  'name' => 'Semences & Génétique Végétale', 'coeff' => 3, 'teacher_email' => 'teacher.agc.seed@sms.com',  'teacher_name' => 'Dr. Samira Bekkouche'],
                    ['code' => 'AGC-IRRIG-S4', 'name' => 'Irrigation & Drainage',         'coeff' => 3, 'teacher_email' => 'teacher.agc.irrig@sms.com', 'teacher_name' => 'Prof. Mourad Hadj'],
                    ['code' => 'AGC-FOOD-S4',  'name' => 'Technologie Alimentaire',       'coeff' => 3, 'teacher_email' => 'teacher.agc.food@sms.com',  'teacher_name' => 'Dr. Houria Benali'],
                    ['code' => 'AGC-PROJ-S4',  'name' => "Projet de Fin d'Études",        'coeff' => 2, 'teacher_email' => 'teacher.agc.proj@sms.com',  'teacher_name' => 'Prof. Anis Khelil'],
                ],
            ],
            'GB' => [
                'modules' => [
                    ['code' => 'GB-IMMUNO-S4',   'name' => 'Immunologie',         'coeff' => 3, 'teacher_email' => 'teacher.gb.immuno@sms.com',   'teacher_name' => 'Dr. Amina Cherif'],
                    ['code' => 'GB-AGROTECH-S4', 'name' => 'Agro-Biotechnologie', 'coeff' => 3, 'teacher_email' => 'teacher.gb.agrotech@sms.com', 'teacher_name' => 'Prof. Karim Messaoud'],
                    ['code' => 'GB-VIROL-S4',    'name' => 'Virologie',           'coeff' => 3, 'teacher_email' => 'teacher.gb.virol@sms.com',    'teacher_name' => 'Dr. Sonia Belhaj'],
                    ['code' => 'GB-PROJ-S4',     'name' => 'Projet de Recherche', 'coeff' => 2, 'teacher_email' => 'teacher.gb.proj@sms.com',     'teacher_name' => 'Prof. Nabil Rahmani'],
                ],
            ],
        ];

        foreach ($s4Data as $specCode => $data) {
            $spec = Specialization::where('code', $specCode)->firstOrFail();
            $s4   = Semester::where('specialization_id', $spec->id)->where('name', 'S4')->firstOrFail();

            // Skip if spec already has S4 students
            $existing = User::where('role', Role::Student)->where('semester_id', $s4->id)->count();
            if ($existing > 0) {
                $this->command->info("  {$specCode}: already has {$existing} S4 students — skipped.");
                continue;
            }

            // ── Create S4 modules if missing ──────────────────────────────
            $modules = [];
            foreach ($data['modules'] as $mod) {
                $teacher = User::firstOrCreate(
                    ['email' => $mod['teacher_email']],
                    [
                        'name'              => $mod['teacher_name'],
                        'password'          => Hash::make('password'),
                        'role'              => Role::Teacher,
                        'email_verified_at' => now(),
                    ]
                );

                $module = Module::firstOrCreate(
                    ['code' => $mod['code']],
                    [
                        'name'              => $mod['name'],
                        'coefficient'       => $mod['coeff'],
                        'specialization_id' => $spec->id,
                        'semester_id'       => $s4->id,
                        'semester'          => 4,
                        'teacher_id'        => $teacher->id,
                    ]
                );

                $module->teachers()->syncWithoutDetaching([$teacher->id]);
                $modules[] = $module;
            }

            // ── Add 30 students ───────────────────────────────────────────
            $slug = strtolower($specCode);
            for ($i = 1; $i <= 30; $i++) {
                $student = User::firstOrCreate(
                    ['email' => "student.{$slug}.s4.{$i}@sms.com"],
                    [
                        'name'              => "Étudiant {$specCode} S4-{$i}",
                        'password'          => Hash::make('password'),
                        'role'              => Role::Student,
                        'email_verified_at' => now(),
                        'specialization_id' => $spec->id,
                        'semester_id'       => $s4->id,
                    ]
                );

                foreach ($modules as $module) {
                    $module->students()->syncWithoutDetaching([$student->id]);
                }
            }

            $this->command->info("  {$specCode}: 4 S4 modules + 30 students added and enrolled.");
        }
    }
}
