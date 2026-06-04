<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExtendedDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Specializations ──────────────────────────────────────────
        $gi = Specialization::firstOrCreate(['code' => 'GI'], [
            'name' => 'Génie Informatique', 'description' => 'Computer Engineering',
        ]);

        $gc = Specialization::firstOrCreate(['code' => 'GC'], [
            'name' => 'Génie Civil', 'description' => 'Civil Engineering',
        ]);

        $ge = Specialization::firstOrCreate(['code' => 'GE'], [
            'name' => 'Génie Électrique', 'description' => 'Electrical Engineering',
        ]);

        // ── 2. Semesters ────────────────────────────────────────────────
        $giS1 = Semester::firstOrCreate(['specialization_id' => $gi->id, 'name' => 'S1']);
        $giS2 = Semester::firstOrCreate(['specialization_id' => $gi->id, 'name' => 'S2']);
        $gcS1 = Semester::firstOrCreate(['specialization_id' => $gc->id, 'name' => 'S1']);
        $gcS2 = Semester::firstOrCreate(['specialization_id' => $gc->id, 'name' => 'S2']);
        $geS1 = Semester::firstOrCreate(['specialization_id' => $ge->id, 'name' => 'S1']);
        $geS2 = Semester::firstOrCreate(['specialization_id' => $ge->id, 'name' => 'S2']);

        // ── 3. Modules + Teachers ────────────────────────────────────────
        $modulesData = [

            // GI – S2
            ['spec' => $gi, 'sem' => $giS2, 'semester_int' => 2, 'code' => 'GI-DB-S2',
             'name' => 'Bases de Données', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Hamza Belkadi',    'email' => 'teacher.db@sms.com']],

            ['spec' => $gi, 'sem' => $giS2, 'semester_int' => 2, 'code' => 'GI-POO-S2',
             'name' => 'Programmation Orientée Objet', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Nadia Ferhat',   'email' => 'teacher.poo@sms.com']],

            ['spec' => $gi, 'sem' => $giS2, 'semester_int' => 2, 'code' => 'GI-NET-S2',
             'name' => 'Réseaux Informatiques', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Tarek Mebarki',    'email' => 'teacher.net@sms.com']],

            ['spec' => $gi, 'sem' => $giS2, 'semester_int' => 2, 'code' => 'GI-STAT-S2',
             'name' => 'Statistiques & Probabilités', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Asma Benali',    'email' => 'teacher.stat@sms.com']],

            // GC – S1
            ['spec' => $gc, 'sem' => $gcS1, 'semester_int' => 1, 'code' => 'GC-MECA-S1',
             'name' => 'Mécanique des Structures', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Rachid Boudiaf',   'email' => 'teacher.meca@sms.com']],

            ['spec' => $gc, 'sem' => $gcS1, 'semester_int' => 1, 'code' => 'GC-BETON-S1',
             'name' => 'Béton Armé', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Souad Amrani',   'email' => 'teacher.beton@sms.com']],

            ['spec' => $gc, 'sem' => $gcS1, 'semester_int' => 1, 'code' => 'GC-TOPO-S1',
             'name' => 'Topographie', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Yacine Khaled',    'email' => 'teacher.topo@sms.com']],

            ['spec' => $gc, 'sem' => $gcS1, 'semester_int' => 1, 'code' => 'GC-DESSIN-S1',
             'name' => 'Dessin Technique', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Meriem Aissani', 'email' => 'teacher.dessin@sms.com']],

            // GC – S2
            ['spec' => $gc, 'sem' => $gcS2, 'semester_int' => 2, 'code' => 'GC-HYDRO-S2',
             'name' => 'Hydraulique', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Fares Zidane',     'email' => 'teacher.hydro@sms.com']],

            ['spec' => $gc, 'sem' => $gcS2, 'semester_int' => 2, 'code' => 'GC-GEO-S2',
             'name' => 'Géotechnique', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Houria Kaci',    'email' => 'teacher.geo@sms.com']],

            ['spec' => $gc, 'sem' => $gcS2, 'semester_int' => 2, 'code' => 'GC-RDM-S2',
             'name' => 'Résistance des Matériaux', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Lotfi Mansouri',   'email' => 'teacher.rdm@sms.com']],

            ['spec' => $gc, 'sem' => $gcS2, 'semester_int' => 2, 'code' => 'GC-MAT-S2',
             'name' => 'Matériaux de Construction', 'coef' => 1,
             'teacher' => ['name' => 'Prof. Sabrina Dali',   'email' => 'teacher.mat@sms.com']],

            // GE – S1
            ['spec' => $ge, 'sem' => $geS1, 'semester_int' => 1, 'code' => 'GE-CIR-S1',
             'name' => 'Circuits Électriques', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Karim Hadj',       'email' => 'teacher.cir@sms.com']],

            ['spec' => $ge, 'sem' => $geS1, 'semester_int' => 1, 'code' => 'GE-ELEC-S1',
             'name' => 'Électronique Analogique', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Leila Rezki',    'email' => 'teacher.elec@sms.com']],

            ['spec' => $ge, 'sem' => $geS1, 'semester_int' => 1, 'code' => 'GE-MATH-S1',
             'name' => 'Mathématiques pour l\'Ingénieur', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Samir Bouzid',     'email' => 'teacher.mathge@sms.com']],

            ['spec' => $ge, 'sem' => $geS1, 'semester_int' => 1, 'code' => 'GE-ANG-S1',
             'name' => 'Anglais Scientifique', 'coef' => 1,
             'teacher' => ['name' => 'Ms. Rania Cherif',     'email' => 'teacher.angge@sms.com']],

            // GE – S2
            ['spec' => $ge, 'sem' => $geS2, 'semester_int' => 2, 'code' => 'GE-MACH-S2',
             'name' => 'Machines Électriques', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Amir Bouabid',     'email' => 'teacher.mach@sms.com']],

            ['spec' => $ge, 'sem' => $geS2, 'semester_int' => 2, 'code' => 'GE-NUM-S2',
             'name' => 'Électronique Numérique', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Wafa Bacha',     'email' => 'teacher.num@sms.com']],

            ['spec' => $ge, 'sem' => $geS2, 'semester_int' => 2, 'code' => 'GE-SIGNAL-S2',
             'name' => 'Traitement du Signal', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Mourad Ghoul',     'email' => 'teacher.signal@sms.com']],

            ['spec' => $ge, 'sem' => $geS2, 'semester_int' => 2, 'code' => 'GE-AUTO-S2',
             'name' => 'Automatique', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Zineb Slimani',  'email' => 'teacher.auto@sms.com']],
        ];

        foreach ($modulesData as $md) {
            $teacher = User::firstOrCreate(['email' => $md['teacher']['email']], [
                'name'              => $md['teacher']['name'],
                'password'          => Hash::make('password'),
                'role'              => Role::Teacher,
                'email_verified_at' => now(),
            ]);

            $module = Module::firstOrCreate(['code' => $md['code']], [
                'name'              => $md['name'],
                'coefficient'       => $md['coef'],
                'semester'          => $md['semester_int'],
                'specialization_id' => $md['spec']->id,
                'semester_id'       => $md['sem']->id,
                'teacher_id'        => $teacher->id,
                'description'       => '',
            ]);

            if ($module->teacher_id !== $teacher->id) {
                $module->update(['teacher_id' => $teacher->id]);
            }
            $module->teachers()->syncWithoutDetaching([$teacher->id]);
        }

        // ── 4. Students ─────────────────────────────────────────────────
        $studentsData = [

            // GI – S2
            ['name' => 'Amine Zerrouki',    'email' => 'amine.zerrouki@sms.com',    'spec' => $gi, 'sem' => $giS2],
            ['name' => 'Dounia Hamidi',     'email' => 'dounia.hamidi@sms.com',     'spec' => $gi, 'sem' => $giS2],
            ['name' => 'Rayan Belhadi',     'email' => 'rayan.belhadi@sms.com',     'spec' => $gi, 'sem' => $giS2],
            ['name' => 'Imane Belarbi',     'email' => 'imane.belarbi@sms.com',     'spec' => $gi, 'sem' => $giS2],
            ['name' => 'Sofiane Meziane',   'email' => 'sofiane.meziane@sms.com',   'spec' => $gi, 'sem' => $giS2],
            ['name' => 'Lina Boufares',     'email' => 'lina.boufares@sms.com',     'spec' => $gi, 'sem' => $giS2],

            // GC – S1
            ['name' => 'Bilal Chouiref',    'email' => 'bilal.chouiref@sms.com',    'spec' => $gc, 'sem' => $gcS1],
            ['name' => 'Yasmine Khelifa',   'email' => 'yasmine.khelifa@sms.com',   'spec' => $gc, 'sem' => $gcS1],
            ['name' => 'Walid Benchikh',    'email' => 'walid.benchikh@sms.com',    'spec' => $gc, 'sem' => $gcS1],
            ['name' => 'Rania Mabrouk',     'email' => 'rania.mabrouk@sms.com',     'spec' => $gc, 'sem' => $gcS1],
            ['name' => 'Oussama Taleb',     'email' => 'oussama.taleb@sms.com',     'spec' => $gc, 'sem' => $gcS1],

            // GC – S2
            ['name' => 'Hana Bensalem',     'email' => 'hana.bensalem@sms.com',     'spec' => $gc, 'sem' => $gcS2],
            ['name' => 'Nassim Djafer',     'email' => 'nassim.djafer@sms.com',     'spec' => $gc, 'sem' => $gcS2],
            ['name' => 'Chaima Hadj',       'email' => 'chaima.hadj@sms.com',       'spec' => $gc, 'sem' => $gcS2],
            ['name' => 'Mehdi Boukhalfa',   'email' => 'mehdi.boukhalfa@sms.com',   'spec' => $gc, 'sem' => $gcS2],
            ['name' => 'Sirine Kerboua',    'email' => 'sirine.kerboua@sms.com',    'spec' => $gc, 'sem' => $gcS2],

            // GE – S1
            ['name' => 'Ishak Belghoul',    'email' => 'ishak.belghoul@sms.com',    'spec' => $ge, 'sem' => $geS1],
            ['name' => 'Meriem Bouras',     'email' => 'meriem.bouras@sms.com',     'spec' => $ge, 'sem' => $geS1],
            ['name' => 'Adel Laribi',       'email' => 'adel.laribi@sms.com',       'spec' => $ge, 'sem' => $geS1],
            ['name' => 'Sonia Guenifi',     'email' => 'sonia.guenifi@sms.com',     'spec' => $ge, 'sem' => $geS1],
            ['name' => 'Ryad Benkhaled',    'email' => 'ryad.benkhaled@sms.com',    'spec' => $ge, 'sem' => $geS1],

            // GE – S2
            ['name' => 'Assia Ladjal',      'email' => 'assia.ladjal@sms.com',      'spec' => $ge, 'sem' => $geS2],
            ['name' => 'Hicham Brahimi',    'email' => 'hicham.brahimi@sms.com',    'spec' => $ge, 'sem' => $geS2],
            ['name' => 'Nawel Bouchama',    'email' => 'nawel.bouchama@sms.com',    'spec' => $ge, 'sem' => $geS2],
            ['name' => 'Zakaria Meziane',   'email' => 'zakaria.meziane@sms.com',   'spec' => $ge, 'sem' => $geS2],
            ['name' => 'Lynda Boussaha',    'email' => 'lynda.boussaha@sms.com',    'spec' => $ge, 'sem' => $geS2],
        ];

        foreach ($studentsData as $sd) {
            $student = User::firstOrCreate(['email' => $sd['email']], [
                'name'              => $sd['name'],
                'password'          => Hash::make('password'),
                'role'              => Role::Student,
                'email_verified_at' => now(),
            ]);

            $student->update([
                'specialization_id' => $sd['spec']->id,
                'semester_id'       => $sd['sem']->id,
            ]);

            // Enrol in all modules for this specialization + semester
            Module::where('specialization_id', $sd['spec']->id)
                ->where('semester_id', $sd['sem']->id)
                ->get()
                ->each(fn ($m) => $m->students()->syncWithoutDetaching([$student->id]));
        }

        $this->command->info('Extended data seeded:');
        $this->command->info('  Specializations : GI (S2 added), GC (S1+S2), GE (S1+S2)');
        $this->command->info('  New modules     : ' . count($modulesData));
        $this->command->info('  New students    : ' . count($studentsData));
    }
}
