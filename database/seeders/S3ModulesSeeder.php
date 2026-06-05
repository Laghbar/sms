<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class S3ModulesSeeder extends Seeder
{
    public function run(): void
    {
        $specs = [

            'GI' => [
                'modules' => [
                    ['code' => 'GI-ALGO2-S3', 'name' => 'Algorithmique Avancée',           'coefficient' => 3, 'description' => 'Structures de données avancées, graphes et complexité.'],
                    ['code' => 'GI-OS-S3',     'name' => "Systèmes d'Exploitation",          'coefficient' => 3, 'description' => 'Processus, mémoire virtuelle, systèmes de fichiers.'],
                    ['code' => 'GI-SOFT-S3',   'name' => 'Génie Logiciel',                  'coefficient' => 3, 'description' => 'UML, design patterns, tests et méthodes agiles.'],
                    ['code' => 'GI-LANG-S3',   'name' => 'Langages & Compilation',          'coefficient' => 2, 'description' => 'Automates, grammaires, analyseurs lexicaux et syntaxiques.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Bilal Messaoud',   'email' => 'teacher.gi.algo2@sms.com'],
                    ['name' => 'Prof. Lila Benabid',   'email' => 'teacher.gi.os@sms.com'],
                    ['name' => 'Dr. Anis Berkane',     'email' => 'teacher.gi.soft@sms.com'],
                    ['name' => 'Prof. Celia Hamdane',  'email' => 'teacher.gi.lang@sms.com'],
                ],
            ],

            'GC' => [
                'modules' => [
                    ['code' => 'GC-METAL-S3',  'name' => 'Structures Métalliques',          'coefficient' => 3, 'description' => 'Conception et calcul des structures en acier.'],
                    ['code' => 'GC-FOND2-S3',  'name' => 'Fondations Profondes',            'coefficient' => 3, 'description' => 'Pieux, micropieux et fondations spéciales.'],
                    ['code' => 'GC-TRAV-S3',   'name' => 'Travaux Publics',                 'coefficient' => 3, 'description' => "Routes, autoroutes, ponts et ouvrages d'art."],
                    ['code' => 'GC-VRD-S3',    'name' => 'Voirie & Réseaux Divers',         'coefficient' => 2, 'description' => 'Réseaux AEP, assainissement et voirie urbaine.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Nour Benmansour',  'email' => 'teacher.gc.metal@sms.com'],
                    ['name' => 'Prof. Tarek Seddiki',  'email' => 'teacher.gc.fond2@sms.com'],
                    ['name' => 'Dr. Fatiha Aouad',     'email' => 'teacher.gc.trav@sms.com'],
                    ['name' => 'Prof. Hichem Gaid',    'email' => 'teacher.gc.vrd@sms.com'],
                ],
            ],

            'GE' => [
                'modules' => [
                    ['code' => 'GE-POWER-S3',  'name' => 'Électronique de Puissance',       'coefficient' => 3, 'description' => 'Convertisseurs AC/DC, DC/DC, variateurs de vitesse.'],
                    ['code' => 'GE-CONV-S3',   'name' => 'Convertisseurs Statiques',        'coefficient' => 3, 'description' => 'Onduleurs, redresseurs et hacheurs.'],
                    ['code' => 'GE-MESURE-S3', 'name' => 'Mesure & Instrumentation',        'coefficient' => 3, 'description' => 'Capteurs, chaînes de mesure et acquisition de données.'],
                    ['code' => 'GE-CEM-S3',    'name' => 'Compatibilité Électromagnétique', 'coefficient' => 2, 'description' => 'Perturbations EM, blindage et normes CEM.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Walid Ferhat',     'email' => 'teacher.ge.power@sms.com'],
                    ['name' => 'Prof. Amira Bouzid',   'email' => 'teacher.ge.conv@sms.com'],
                    ['name' => 'Dr. Nabil Lakehal',    'email' => 'teacher.ge.mesure@sms.com'],
                    ['name' => 'Prof. Imane Derkaoui', 'email' => 'teacher.ge.cem@sms.com'],
                ],
            ],

            'GM' => [
                'modules' => [
                    ['code' => 'GM-FORAGE-S3',  'name' => 'Techniques de Forage',           'coefficient' => 3, 'description' => 'Forages mécaniques, rotary et percussion.'],
                    ['code' => 'GM-EXPLOS-S3',  'name' => 'Explosifs & Tirs de Mine',        'coefficient' => 3, 'description' => 'Explosifs industriels, conception des tirs et sécurité.'],
                    ['code' => 'GM-VENT-S3',    'name' => 'Ventilation des Mines',           'coefficient' => 3, 'description' => "Aérage naturel et forcé, qualité de l'air souterrain."],
                    ['code' => 'GM-SECU-S3',    'name' => 'Sécurité Minière',               'coefficient' => 2, 'description' => 'Réglementation, risques miniers et plans de secours.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Rachid Otmane',    'email' => 'teacher.gm.forage@sms.com'],
                    ['name' => 'Prof. Samia Bensaid',  'email' => 'teacher.gm.explos@sms.com'],
                    ['name' => 'Dr. Mourad Achouri',   'email' => 'teacher.gm.vent@sms.com'],
                    ['name' => 'Prof. Naima Guendouz', 'email' => 'teacher.gm.secu@sms.com'],
                ],
            ],

            'AGC' => [
                'modules' => [
                    ['code' => 'AGC-ANALYT-S3', 'name' => 'Chimie Analytique Agricole',     'coefficient' => 3, 'description' => 'Techniques chromatographiques et spectroscopiques en agrochimie.'],
                    ['code' => 'AGC-BIOPEST-S3','name' => 'Biopesticides & Lutte Intégrée', 'coefficient' => 3, 'description' => 'Agents de lutte biologique, phéromones et IPM.'],
                    ['code' => 'AGC-QUALITE-S3','name' => 'Qualité & Certification',         'coefficient' => 3, 'description' => 'Normes ISO, HACCP et traçabilité des produits agricoles.'],
                    ['code' => 'AGC-PHYTO-S3',  'name' => 'Phytopathologie',                'coefficient' => 2, 'description' => 'Maladies des plantes, agents pathogènes et épidémiologie.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Zineb Tahri',      'email' => 'teacher.agc.analyt@sms.com'],
                    ['name' => 'Prof. Kamal Idrissi',  'email' => 'teacher.agc.biopest@sms.com'],
                    ['name' => 'Dr. Soumia Filali',    'email' => 'teacher.agc.qualite@sms.com'],
                    ['name' => 'Prof. Hind Berrada',   'email' => 'teacher.agc.phyto@sms.com'],
                ],
            ],

            'GB' => [
                'modules' => [
                    ['code' => 'GB-PROTEO-S3',    'name' => 'Protéomique',                  'coefficient' => 3, 'description' => 'Analyse des protéines, électrophorèse 2D et spectrométrie de masse.'],
                    ['code' => 'GB-ENZYM-S3',     'name' => 'Enzymologie',                  'coefficient' => 3, 'description' => 'Cinétique enzymatique, inhibition et applications industrielles.'],
                    ['code' => 'GB-BIOINFO-S3',   'name' => 'Bioinformatique',               'coefficient' => 3, 'description' => 'Alignement de séquences, banques de données et phylogénie moléculaire.'],
                    ['code' => 'GB-FERMENT-S3',   'name' => 'Génie Fermentaire',             'coefficient' => 2, 'description' => 'Bioréacteurs, fermentations industrielles et optimisation.'],
                ],
                'teachers' => [
                    ['name' => 'Dr. Assia Benali',     'email' => 'teacher.gb.proteo@sms.com'],
                    ['name' => 'Prof. Omar Chekroun',  'email' => 'teacher.gb.enzym@sms.com'],
                    ['name' => 'Dr. Rima Boussouf',    'email' => 'teacher.gb.bioinfo@sms.com'],
                    ['name' => 'Prof. Salah Guerfi',   'email' => 'teacher.gb.ferment@sms.com'],
                ],
            ],

        ];

        foreach ($specs as $specCode => $data) {
            $spec = Specialization::where('code', $specCode)->firstOrFail();
            $s3   = Semester::where('specialization_id', $spec->id)->where('name', 'S3')->firstOrFail();

            foreach ($data['modules'] as $i => $mod) {
                $teacher = User::firstOrCreate(
                    ['email' => $data['teachers'][$i]['email']],
                    [
                        'name'              => $data['teachers'][$i]['name'],
                        'password'          => Hash::make('password'),
                        'role'              => Role::Teacher,
                        'email_verified_at' => now(),
                    ]
                );

                $module = Module::firstOrCreate(
                    ['code' => $mod['code']],
                    [
                        'name'              => $mod['name'],
                        'coefficient'       => $mod['coefficient'],
                        'description'       => $mod['description'],
                        'specialization_id' => $spec->id,
                        'semester_id'       => $s3->id,
                        'semester'          => 3,
                        'teacher_id'        => $teacher->id,
                    ]
                );

                $module->teachers()->syncWithoutDetaching([$teacher->id]);
            }

            $this->command->info("  {$specCode}: 4 S3 modules created with teachers.");
        }
    }
}
