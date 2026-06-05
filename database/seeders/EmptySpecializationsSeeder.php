<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmptySpecializationsSeeder extends Seeder
{
    // ── 30 students per specialization ────────────────────────────────────────

    private array $gmStudents = [
        ['name' => 'Amine Belkacem',   'email' => 'gm.student01@sms.com'],
        ['name' => 'Rania Bouali',      'email' => 'gm.student02@sms.com'],
        ['name' => 'Sofiane Chebli',    'email' => 'gm.student03@sms.com'],
        ['name' => 'Imane Djamel',      'email' => 'gm.student04@sms.com'],
        ['name' => 'Yacine Ferhat',     'email' => 'gm.student05@sms.com'],
        ['name' => 'Nadia Gharbi',      'email' => 'gm.student06@sms.com'],
        ['name' => 'Bilal Hamdi',       'email' => 'gm.student07@sms.com'],
        ['name' => 'Asma Idiri',        'email' => 'gm.student08@sms.com'],
        ['name' => 'Tarek Jebali',      'email' => 'gm.student09@sms.com'],
        ['name' => 'Samira Kerrar',     'email' => 'gm.student10@sms.com'],
        ['name' => 'Hamza Larbi',       'email' => 'gm.student11@sms.com'],
        ['name' => 'Fatima Mansour',    'email' => 'gm.student12@sms.com'],
        ['name' => 'Omar Nacer',        'email' => 'gm.student13@sms.com'],
        ['name' => 'Houda Oukaci',      'email' => 'gm.student14@sms.com'],
        ['name' => 'Rachid Perez',      'email' => 'gm.student15@sms.com'],
        ['name' => 'Lylia Qribi',       'email' => 'gm.student16@sms.com'],
        ['name' => 'Mehdi Rahmani',     'email' => 'gm.student17@sms.com'],
        ['name' => 'Siham Saidi',       'email' => 'gm.student18@sms.com'],
        ['name' => 'Wassim Taleb',      'email' => 'gm.student19@sms.com'],
        ['name' => 'Ouiza Uzari',       'email' => 'gm.student20@sms.com'],
        ['name' => 'Fares Vandi',       'email' => 'gm.student21@sms.com'],
        ['name' => 'Meriem Wali',       'email' => 'gm.student22@sms.com'],
        ['name' => 'Aymen Xenakis',     'email' => 'gm.student23@sms.com'],
        ['name' => 'Djamila Yahia',     'email' => 'gm.student24@sms.com'],
        ['name' => 'Reda Zaidi',        'email' => 'gm.student25@sms.com'],
        ['name' => 'Chaima Achour',     'email' => 'gm.student26@sms.com'],
        ['name' => 'Lotfi Bouras',      'email' => 'gm.student27@sms.com'],
        ['name' => 'Sonia Chetouane',   'email' => 'gm.student28@sms.com'],
        ['name' => 'Mourad Dahmani',    'email' => 'gm.student29@sms.com'],
        ['name' => 'Leila Essebbagh',   'email' => 'gm.student30@sms.com'],
    ];

    private array $agcStudents = [
        ['name' => 'Amel Amrani',       'email' => 'agc.student01@sms.com'],
        ['name' => 'Bilel Benali',      'email' => 'agc.student02@sms.com'],
        ['name' => 'Cylia Cherif',      'email' => 'agc.student03@sms.com'],
        ['name' => 'Djamel Dib',        'email' => 'agc.student04@sms.com'],
        ['name' => 'Elodie Essaid',     'email' => 'agc.student05@sms.com'],
        ['name' => 'Farouk Fergani',    'email' => 'agc.student06@sms.com'],
        ['name' => 'Ghania Guettaf',    'email' => 'agc.student07@sms.com'],
        ['name' => 'Hamid Hadjadj',     'email' => 'agc.student08@sms.com'],
        ['name' => 'Ilhem Ighil',       'email' => 'agc.student09@sms.com'],
        ['name' => 'Jamel Jemaa',       'email' => 'agc.student10@sms.com'],
        ['name' => 'Karima Kaci',       'email' => 'agc.student11@sms.com'],
        ['name' => 'Lamine Lahcene',    'email' => 'agc.student12@sms.com'],
        ['name' => 'Malika Meziane',    'email' => 'agc.student13@sms.com'],
        ['name' => 'Nabil Nessah',      'email' => 'agc.student14@sms.com'],
        ['name' => 'Ouarda Ouali',      'email' => 'agc.student15@sms.com'],
        ['name' => 'Rachida Rais',      'email' => 'agc.student16@sms.com'],
        ['name' => 'Samir Sellami',     'email' => 'agc.student17@sms.com'],
        ['name' => 'Tania Tabet',       'email' => 'agc.student18@sms.com'],
        ['name' => 'Uthman Uzabi',      'email' => 'agc.student19@sms.com'],
        ['name' => 'Viviane Volpi',     'email' => 'agc.student20@sms.com'],
        ['name' => 'Wahiba Wahbi',      'email' => 'agc.student21@sms.com'],
        ['name' => 'Xenia Xerri',       'email' => 'agc.student22@sms.com'],
        ['name' => 'Yassine Yahiaoui',  'email' => 'agc.student23@sms.com'],
        ['name' => 'Zohra Zerrouk',     'email' => 'agc.student24@sms.com'],
        ['name' => 'Abdenour Ait',      'email' => 'agc.student25@sms.com'],
        ['name' => 'Bouchra Belkaid',   'email' => 'agc.student26@sms.com'],
        ['name' => 'Cherif Chamekh',    'email' => 'agc.student27@sms.com'],
        ['name' => 'Djazia Drici',      'email' => 'agc.student28@sms.com'],
        ['name' => 'Essaid Echiguer',   'email' => 'agc.student29@sms.com'],
        ['name' => 'Farida Fekhar',     'email' => 'agc.student30@sms.com'],
    ];

    private array $gbStudents = [
        ['name' => 'Amina Allaoua',     'email' => 'gb.student01@sms.com'],
        ['name' => 'Bachir Belmadi',    'email' => 'gb.student02@sms.com'],
        ['name' => 'Celia Chabou',      'email' => 'gb.student03@sms.com'],
        ['name' => 'Dali Daoud',        'email' => 'gb.student04@sms.com'],
        ['name' => 'Elias Embarek',     'email' => 'gb.student05@sms.com'],
        ['name' => 'Fella Ferdi',       'email' => 'gb.student06@sms.com'],
        ['name' => 'Ghilas Gherbi',     'email' => 'gb.student07@sms.com'],
        ['name' => 'Hafsa Hamitouche',  'email' => 'gb.student08@sms.com'],
        ['name' => 'Idris Ichalalene',  'email' => 'gb.student09@sms.com'],
        ['name' => 'Jihane Jebbouri',   'email' => 'gb.student10@sms.com'],
        ['name' => 'Khalil Khettab',    'email' => 'gb.student11@sms.com'],
        ['name' => 'Lina Lounis',       'email' => 'gb.student12@sms.com'],
        ['name' => 'Mounir Makhlouf',   'email' => 'gb.student13@sms.com'],
        ['name' => 'Nora Nachi',        'email' => 'gb.student14@sms.com'],
        ['name' => 'Oussama Ourak',     'email' => 'gb.student15@sms.com'],
        ['name' => 'Priya Piracha',     'email' => 'gb.student16@sms.com'],
        ['name' => 'Qassim Qacem',      'email' => 'gb.student17@sms.com'],
        ['name' => 'Rokia Reggad',      'email' => 'gb.student18@sms.com'],
        ['name' => 'Salim Slimane',     'email' => 'gb.student19@sms.com'],
        ['name' => 'Tinhinane Touil',   'email' => 'gb.student20@sms.com'],
        ['name' => 'Ugo Umari',         'email' => 'gb.student21@sms.com'],
        ['name' => 'Vanessa Verbeke',   'email' => 'gb.student22@sms.com'],
        ['name' => 'Wissam Waked',      'email' => 'gb.student23@sms.com'],
        ['name' => 'Xaviera Xentara',   'email' => 'gb.student24@sms.com'],
        ['name' => 'Yanis Yacef',       'email' => 'gb.student25@sms.com'],
        ['name' => 'Zineb Ziani',       'email' => 'gb.student26@sms.com'],
        ['name' => 'Adel Azzouz',       'email' => 'gb.student27@sms.com'],
        ['name' => 'Baya Boudaoud',     'email' => 'gb.student28@sms.com'],
        ['name' => 'Chaker Chafaa',     'email' => 'gb.student29@sms.com'],
        ['name' => 'Dalila Draoui',     'email' => 'gb.student30@sms.com'],
    ];

    public function run(): void
    {
        $admin = User::where('role', Role::Admin)->first();

        // ────────────────────────────────────────────────────────────────────
        // 1. GÉNIE MINIER — create modules then students
        // ────────────────────────────────────────────────────────────────────
        $gm = Specialization::where('code', 'GM')->firstOrFail();
        $gmS1 = Semester::where('specialization_id', $gm->id)->where('name', 'S1')->firstOrFail();

        $this->command->info('Setting up Génie Minier…');

        // Reassign orphan modules that belong to mining
        $orphanMapping = [
            'GOLOGIE-MINIRE'  => 'Géologie Minière',
            'MCANIQUE-DES-SOLS' => 'Mécanique des Sols',
        ];
        foreach ($orphanMapping as $code => $name) {
            Module::where('code', $code)->update([
                'specialization_id' => $gm->id,
                'semester_id'       => $gmS1->id,
                'semester'          => 1,
            ]);
        }

        // Create new modules for GM S1
        $gmModulesData = [
            ['code' => 'GM-EXP-S1',  'name' => 'Exploitation Minière',   'coefficient' => 3,
             'teacher_name' => 'Dr. Amar Bensalem',   'teacher_email' => 'teacher.gm.exp@sms.com'],
            ['code' => 'GM-MINER-S1','name' => 'Minéralogie',             'coefficient' => 2,
             'teacher_name' => 'Prof. Nora Khelifi',  'teacher_email' => 'teacher.gm.min@sms.com'],
            ['code' => 'GM-TOPO-S1', 'name' => 'Topographie Minière',     'coefficient' => 2,
             'teacher_name' => 'Dr. Farid Zidane',    'teacher_email' => 'teacher.gm.top@sms.com'],
            ['code' => 'GM-CHIM-S1', 'name' => 'Chimie Minérale',         'coefficient' => 2,
             'teacher_name' => 'Ms. Yasmine Boudiaf', 'teacher_email' => 'teacher.gm.chm@sms.com'],
        ];

        $gmModules = [];
        foreach ($gmModulesData as $data) {
            $teacher = User::firstOrCreate(['email' => $data['teacher_email']], [
                'name'              => $data['teacher_name'],
                'password'          => Hash::make('password'),
                'role'              => Role::Teacher,
                'email_verified_at' => now(),
            ]);

            $module = Module::firstOrCreate(['code' => $data['code']], [
                'name'              => $data['name'],
                'coefficient'       => $data['coefficient'],
                'semester'          => 1,
                'specialization_id' => $gm->id,
                'semester_id'       => $gmS1->id,
                'teacher_id'        => $teacher->id,
            ]);

            $module->update(['teacher_id' => $teacher->id]);
            $module->teachers()->syncWithoutDetaching([$teacher->id]);
            $gmModules[] = $module;
        }

        // Also collect the reassigned orphan modules
        $gmAllModules = Module::where('specialization_id', $gm->id)
            ->where('semester_id', $gmS1->id)
            ->get();

        $this->command->info('  GM modules in S1: ' . $gmAllModules->count());

        // Create & enroll GM students
        $this->createAndEnrollStudents(
            $this->gmStudents, $gm, $gmS1, $gmAllModules, $admin
        );

        // ────────────────────────────────────────────────────────────────────
        // 2. AGROCHIMIQUE — students only (modules exist)
        // ────────────────────────────────────────────────────────────────────
        $this->command->info('Setting up Agrochimique…');
        $agc = Specialization::where('code', 'AGC')->firstOrFail();
        $agcS1 = Semester::where('specialization_id', $agc->id)->where('name', 'S1')->firstOrFail();
        $agcModules = Module::where('specialization_id', $agc->id)
            ->where('semester_id', $agcS1->id)
            ->get();

        $this->command->info('  AGC modules in S1: ' . $agcModules->count());
        $this->createAndEnrollStudents(
            $this->agcStudents, $agc, $agcS1, $agcModules, $admin
        );

        // ────────────────────────────────────────────────────────────────────
        // 3. GÉNIE BIOLOGIQUE — students only (modules exist)
        // ────────────────────────────────────────────────────────────────────
        $this->command->info('Setting up Génie Biologique…');
        $gb = Specialization::where('code', 'GB')->firstOrFail();
        $gbS1 = Semester::where('specialization_id', $gb->id)->where('name', 'S1')->firstOrFail();
        $gbModules = Module::where('specialization_id', $gb->id)
            ->where('semester_id', $gbS1->id)
            ->get();

        $this->command->info('  GB modules in S1: ' . $gbModules->count());
        $this->createAndEnrollStudents(
            $this->gbStudents, $gb, $gbS1, $gbModules, $admin
        );

        $this->command->info('Done! Summary:');
        $this->command->table(
            ['Specialization', 'Students', 'Modules (S1)'],
            [
                ['Génie Minier',    User::where('role', Role::Student)->where('specialization_id', $gm->id)->count(),  $gmAllModules->count()],
                ['Agrochimique',    User::where('role', Role::Student)->where('specialization_id', $agc->id)->count(), $agcModules->count()],
                ['Génie Biologique',User::where('role', Role::Student)->where('specialization_id', $gb->id)->count(),  $gbModules->count()],
            ]
        );
    }

    private function createAndEnrollStudents(
        array $studentList,
        $specialization,
        $semester,
        $modules,
        $admin
    ): void {
        $admin_id = $admin?->id;

        foreach ($studentList as $s) {
            $student = User::firstOrCreate(['email' => $s['email']], [
                'name'              => $s['name'],
                'password'          => Hash::make('password'),
                'role'              => Role::Student,
                'email_verified_at' => now(),
                'specialization_id' => $specialization->id,
                'semester_id'       => $semester->id,
            ]);

            // Ensure specialization/semester are set even if student existed
            $student->update([
                'specialization_id' => $specialization->id,
                'semester_id'       => $semester->id,
            ]);

            // Enrol in all S1 modules
            foreach ($modules as $module) {
                $module->students()->syncWithoutDetaching([$student->id]);

                // Generate grade if none exists
                if (! Grade::where('student_id', $student->id)->where('module_id', $module->id)->exists()) {
                    Grade::create([
                        'student_id' => $student->id,
                        'module_id'  => $module->id,
                        'grade'      => $this->randomGrade(),
                    ]);
                }
            }
        }

        // Publish S1 modules for this specialization (except last one — demo "Pending")
        $published = 0;
        foreach ($modules as $i => $module) {
            if ($i < $modules->count() - 1 && ! $module->is_published) {
                $module->update([
                    'is_published' => true,
                    'published_at' => now(),
                    'published_by' => $admin_id,
                ]);
                $published++;
            }
        }
        $this->command->info("  Created/enrolled 30 students, published {$published} modules.");
    }

    private function randomGrade(): float
    {
        if (rand(1, 10) <= 7) {
            return round(rand(100, 180) / 10, 2);   // 10.0 – 18.0
        }
        return round(rand(50, 95) / 10, 2);          // 5.0 – 9.5
    }
}
