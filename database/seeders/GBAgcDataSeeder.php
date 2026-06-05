<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GBAgcDataSeeder extends Seeder
{
    public function run(): void
    {
        $gb  = Specialization::where('code', 'GB')->firstOrFail();
        $agc = Specialization::where('code', 'AGC')->firstOrFail();

        $gbS1  = Semester::firstOrCreate(['specialization_id' => $gb->id,  'name' => 'S1']);
        $gbS2  = Semester::firstOrCreate(['specialization_id' => $gb->id,  'name' => 'S2']);
        $agcS1 = Semester::firstOrCreate(['specialization_id' => $agc->id, 'name' => 'S1']);
        $agcS2 = Semester::firstOrCreate(['specialization_id' => $agc->id, 'name' => 'S2']);

        $modulesData = [
            // ── Génie Biologique – S1 ────────────────────────────────────
            ['spec' => $gb, 'sem' => $gbS1, 'si' => 1, 'code' => 'GB-BIO-S1',
             'name' => 'Biologie Cellulaire', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Amina Cherif',     'email' => 'teacher.biocell@sms.com']],

            ['spec' => $gb, 'sem' => $gbS1, 'si' => 1, 'code' => 'GB-BIOCH-S1',
             'name' => 'Biochimie Générale', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Karim Messaoud', 'email' => 'teacher.biochem@sms.com']],

            ['spec' => $gb, 'sem' => $gbS1, 'si' => 1, 'code' => 'GB-MICRO-S1',
             'name' => 'Microbiologie', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Sonia Belhaj',     'email' => 'teacher.micro@sms.com']],

            ['spec' => $gb, 'sem' => $gbS1, 'si' => 1, 'code' => 'GB-MATH-S1',
             'name' => 'Mathématiques Biologiques', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Nabil Rahmani',  'email' => 'teacher.mathbio@sms.com']],

            // ── Génie Biologique – S2 ────────────────────────────────────
            ['spec' => $gb, 'sem' => $gbS2, 'si' => 2, 'code' => 'GB-GENET-S2',
             'name' => 'Génétique Moléculaire', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Leila Hamdi',      'email' => 'teacher.genet@sms.com']],

            ['spec' => $gb, 'sem' => $gbS2, 'si' => 2, 'code' => 'GB-PHYSIO-S2',
             'name' => 'Physiologie Végétale', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Youcef Benamar', 'email' => 'teacher.physio@sms.com']],

            ['spec' => $gb, 'sem' => $gbS2, 'si' => 2, 'code' => 'GB-ECOL-S2',
             'name' => 'Écologie Microbienne', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Fatima Ouali',     'email' => 'teacher.ecol@sms.com']],

            ['spec' => $gb, 'sem' => $gbS2, 'si' => 2, 'code' => 'GB-BIOTECH-S2',
             'name' => 'Biotechnologies', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Tarek Ziani',    'email' => 'teacher.biotech@sms.com']],

            // ── Agrochimique – S1 ─────────────────────────────────────────
            ['spec' => $agc, 'sem' => $agcS1, 'si' => 1, 'code' => 'AGC-CHIM-S1',
             'name' => 'Chimie Organique', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Samira Bekkouche', 'email' => 'teacher.chimorga@sms.com']],

            ['spec' => $agc, 'sem' => $agcS1, 'si' => 1, 'code' => 'AGC-AGRO-S1',
             'name' => 'Agronomie Générale', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Mourad Hadj',    'email' => 'teacher.agro@sms.com']],

            ['spec' => $agc, 'sem' => $agcS1, 'si' => 1, 'code' => 'AGC-SOIL-S1',
             'name' => 'Science du Sol', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Houria Benali',    'email' => 'teacher.soil@sms.com']],

            ['spec' => $agc, 'sem' => $agcS1, 'si' => 1, 'code' => 'AGC-FERT-S1',
             'name' => 'Fertilisation', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Anis Khelil',    'email' => 'teacher.fert@sms.com']],

            // ── Agrochimique – S2 ─────────────────────────────────────────
            ['spec' => $agc, 'sem' => $agcS2, 'si' => 2, 'code' => 'AGC-PEST-S2',
             'name' => 'Pesticides & Phytochimie', 'coef' => 3,
             'teacher' => ['name' => 'Dr. Rania Benkhaled',  'email' => 'teacher.pest@sms.com']],

            ['spec' => $agc, 'sem' => $agcS2, 'si' => 2, 'code' => 'AGC-ENV-S2',
             'name' => 'Chimie Environnementale', 'coef' => 3,
             'teacher' => ['name' => 'Prof. Djamel Bouras',  'email' => 'teacher.env@sms.com']],

            ['spec' => $agc, 'sem' => $agcS2, 'si' => 2, 'code' => 'AGC-NUTRI-S2',
             'name' => 'Nutrition des Plantes', 'coef' => 2,
             'teacher' => ['name' => 'Dr. Widad Slimani',    'email' => 'teacher.nutri@sms.com']],

            ['spec' => $agc, 'sem' => $agcS2, 'si' => 2, 'code' => 'AGC-BIOTECH-S2',
             'name' => 'Biotechnologie Agricole', 'coef' => 2,
             'teacher' => ['name' => 'Prof. Salim Merad',    'email' => 'teacher.agrobio@sms.com']],
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
                'semester'          => $md['si'],
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

        $this->command->info('GB & AGC data seeded:');
        $this->command->info('  Génie Biologique  : 8 modules (S1 + S2), 8 teachers');
        $this->command->info('  Agrochimique      : 8 modules (S1 + S2), 8 teachers');
    }
}
