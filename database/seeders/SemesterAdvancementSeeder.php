<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SemesterAdvancementSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Create GM S2 modules (GM has no S2 modules or teachers) ─────
        $this->createGmS2Modules();

        // ── 2. Create S4 modules for all specs, reusing S1 teachers ─────────
        $this->createS4Modules();

        // ── 3. Remove teacher assignments from all S1 modules ────────────────
        $s1ModuleIds = Module::whereHas('semesterObj', fn ($q) => $q->where('name', 'S1'))
            ->pluck('id');

        Module::whereIn('id', $s1ModuleIds)->update(['teacher_id' => null]);
        DB::table('teacher_module')->whereIn('module_id', $s1ModuleIds)->delete();

        // ── 4. Advance students odd→even and re-enroll in new modules ────────
        $this->advanceStudents();

        // ── 5. Enroll students already in S4 (GI/GC had orphan S4 students) ─
        $this->enrollExistingS4Students();

        $this->command->info('Done: all students are now in S2 or S4, teachers teach S2/S4 only.');
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function createGmS2Modules(): void
    {
        $gm  = Specialization::where('code', 'GM')->firstOrFail();
        $s2  = Semester::where('specialization_id', $gm->id)->where('name', 'S2')->firstOrFail();

        $rows = [
            ['code' => 'GM-MINERAL-S2', 'name' => 'Minéralogie Appliquée',     'coeff' => 3, 'teacher' => 'Dr. Yacine Moulai',   'email' => 'teacher.gm.mineral@sms.com'],
            ['code' => 'GM-EXPLOR-S2',  'name' => "Méthodes d'Exploration",     'coeff' => 3, 'teacher' => 'Prof. Amina Kadri',    'email' => 'teacher.gm.explor@sms.com'],
            ['code' => 'GM-MINE-S2',    'name' => "Techniques d'Exploitation",  'coeff' => 3, 'teacher' => 'Dr. Sofiane Berber',   'email' => 'teacher.gm.mine@sms.com'],
            ['code' => 'GM-ENV-S2',     'name' => 'Environnement Minier',       'coeff' => 2, 'teacher' => 'Prof. Djamila Khelil', 'email' => 'teacher.gm.env@sms.com'],
        ];

        foreach ($rows as $r) {
            $teacher = User::firstOrCreate(['email' => $r['email']], [
                'name'              => $r['teacher'],
                'password'          => Hash::make('password'),
                'role'              => Role::Teacher,
                'email_verified_at' => now(),
            ]);

            $module = Module::firstOrCreate(['code' => $r['code']], [
                'name'              => $r['name'],
                'coefficient'       => $r['coeff'],
                'specialization_id' => $gm->id,
                'semester_id'       => $s2->id,
                'semester'          => 2,
                'teacher_id'        => $teacher->id,
            ]);

            $module->teachers()->syncWithoutDetaching([$teacher->id]);
        }

        $this->command->info('  GM S2: 4 modules + teachers created.');
    }

    private function createS4Modules(): void
    {
        // Maps spec code → [s4_module_def with s1_code of the teacher to inherit]
        $specs = [
            'GI' => [
                ['code' => 'GI-IA-S4',   'name' => 'Intelligence Artificielle', 'coeff' => 3, 's1' => 'GI-ALG-S1'],
                ['code' => 'GI-SECU-S4', 'name' => 'Sécurité Informatique',     'coeff' => 3, 's1' => 'GI-MATH-S1'],
                ['code' => 'GI-SYS-S4',  'name' => 'Systèmes Distribués',       'coeff' => 3, 's1' => 'GI-ARCH-S1'],
                ['code' => 'GI-PROJ-S4', 'name' => "Projet de Fin d'Études",    'coeff' => 3, 's1' => 'GI-ENG-S1'],
            ],
            'GC' => [
                ['code' => 'GC-SEIS-S4',  'name' => 'Génie Parasismique',    'coeff' => 3, 's1' => 'GC-MECA-S1'],
                ['code' => 'GC-ROUTE-S4', 'name' => 'Génie Routier',          'coeff' => 3, 's1' => 'GC-BETON-S1'],
                ['code' => 'GC-BARR-S4',  'name' => 'Ouvrages Hydrauliques',  'coeff' => 3, 's1' => 'GC-TOPO-S1'],
                ['code' => 'GC-ENV-S4',   'name' => 'Génie Environnemental',  'coeff' => 2, 's1' => 'GC-DESSIN-S1'],
            ],
            'GE' => [
                ['code' => 'GE-POWER-S4', 'name' => "Production d'Énergie",  'coeff' => 3, 's1' => 'GE-CIR-S1'],
                ['code' => 'GE-RENEW-S4', 'name' => 'Énergies Renouvelables', 'coeff' => 3, 's1' => 'GE-ELEC-S1'],
                ['code' => 'GE-TELE-S4',  'name' => 'Télécommunications',     'coeff' => 3, 's1' => 'GE-MATH-S1'],
                ['code' => 'GE-PROJ-S4',  'name' => 'Projet Intégrateur',     'coeff' => 2, 's1' => 'GE-ANG-S1'],
            ],
            'AGC' => [
                ['code' => 'AGC-SEED-S4',  'name' => 'Semences & Génétique Végétale', 'coeff' => 3, 's1' => 'AGC-CHIM-S1'],
                ['code' => 'AGC-IRRIG-S4', 'name' => 'Irrigation & Drainage',         'coeff' => 3, 's1' => 'AGC-AGRO-S1'],
                ['code' => 'AGC-FOOD-S4',  'name' => 'Technologie Alimentaire',       'coeff' => 3, 's1' => 'AGC-SOIL-S1'],
                ['code' => 'AGC-PROJ-S4',  'name' => "Projet de Fin d'Études",        'coeff' => 2, 's1' => 'AGC-FERT-S1'],
            ],
            'GB' => [
                ['code' => 'GB-IMMUNO-S4',   'name' => 'Immunologie',         'coeff' => 3, 's1' => 'GB-BIO-S1'],
                ['code' => 'GB-AGROTECH-S4', 'name' => 'Agro-Biotechnologie', 'coeff' => 3, 's1' => 'GB-BIOCH-S1'],
                ['code' => 'GB-VIROL-S4',    'name' => 'Virologie',           'coeff' => 3, 's1' => 'GB-MICRO-S1'],
                ['code' => 'GB-PROJ-S4',     'name' => 'Projet de Recherche', 'coeff' => 2, 's1' => 'GB-MATH-S1'],
            ],
        ];

        foreach ($specs as $specCode => $modules) {
            $spec = Specialization::where('code', $specCode)->firstOrFail();
            $s4   = Semester::where('specialization_id', $spec->id)->where('name', 'S4')->firstOrFail();

            foreach ($modules as $m) {
                // Inherit the teacher from the corresponding S1 module
                $teacherId = Module::where('code', $m['s1'])->value('teacher_id');

                $module = Module::firstOrCreate(['code' => $m['code']], [
                    'name'              => $m['name'],
                    'coefficient'       => $m['coeff'],
                    'specialization_id' => $spec->id,
                    'semester_id'       => $s4->id,
                    'semester'          => 4,
                    'teacher_id'        => $teacherId,
                ]);

                if ($teacherId) {
                    $module->teachers()->syncWithoutDetaching([$teacherId]);
                }
            }

            $this->command->info("  {$specCode} S4: 4 modules created, S1 teachers reassigned.");
        }
    }

    private function advanceStudents(): void
    {
        foreach (Specialization::all() as $spec) {
            $sems = $spec->semesters()->orderBy('name')->get()->keyBy('name');

            $pairs = [];
            if (isset($sems['S1'], $sems['S2'])) {
                $pairs[] = [$sems['S1'], $sems['S2']];
            }
            if (isset($sems['S3'], $sems['S4'])) {
                $pairs[] = [$sems['S3'], $sems['S4']];
            }

            foreach ($pairs as [$from, $to]) {
                $students = User::where('role', Role::Student)
                    ->where('semester_id', $from->id)
                    ->get();

                if ($students->isEmpty()) {
                    continue;
                }

                $fromModules = Module::where('semester_id', $from->id)->get();
                $toModules   = Module::where('semester_id', $to->id)->get();

                foreach ($students as $student) {
                    $student->update(['semester_id' => $to->id]);

                    // Unenroll from old semester modules
                    $student->enrolledModules()->detach($fromModules->pluck('id')->all());

                    // Enroll in new semester modules
                    foreach ($toModules as $module) {
                        $module->students()->syncWithoutDetaching([$student->id]);
                    }
                }

                $this->command->info("  {$spec->code}: {$students->count()} students {$from->name}→{$to->name}, enrolled in {$toModules->count()} modules.");
            }
        }
    }

    private function enrollExistingS4Students(): void
    {
        // Students who were already in S4 before this seeder ran (GI: 4, GC: 8)
        // They had no S4 modules to enroll in — now we have them.
        foreach (Specialization::all() as $spec) {
            $s4 = Semester::where('specialization_id', $spec->id)->where('name', 'S4')->first();
            if (! $s4) {
                continue;
            }

            $s4Modules = Module::where('semester_id', $s4->id)->get();
            if ($s4Modules->isEmpty()) {
                continue;
            }

            $students = User::where('role', Role::Student)
                ->where('semester_id', $s4->id)
                ->get();

            foreach ($students as $student) {
                foreach ($s4Modules as $module) {
                    $module->students()->syncWithoutDetaching([$student->id]);
                }
            }

            if ($students->isNotEmpty()) {
                $this->command->info("  {$spec->code}: {$students->count()} existing S4 students enrolled in {$s4Modules->count()} S4 modules.");
            }
        }
    }
}
