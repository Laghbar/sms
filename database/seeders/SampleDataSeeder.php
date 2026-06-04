<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Students only — teachers and modules are created by AcademicStructureSeeder
        $studentData = [
            ['name' => 'Youssef Amrani',  'email' => 'student1@sms.com'],
            ['name' => 'Fatima Zahra',    'email' => 'student2@sms.com'],
            ['name' => 'Karim Tazi',      'email' => 'student3@sms.com'],
            ['name' => 'Nadia Cherkaoui', 'email' => 'student4@sms.com'],
        ];

        foreach ($studentData as $s) {
            User::firstOrCreate(['email' => $s['email']], [
                'name'              => $s['name'],
                'password'          => Hash::make('password'),
                'role'              => Role::Student,
                'email_verified_at' => now(),
            ]);
        }
    }
}
