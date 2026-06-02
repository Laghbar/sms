<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Result;
use App\Models\Schedule;
use App\Models\Tp;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Teachers
        $t1 = User::firstOrCreate(['email' => 'teacher1@sms.com'], [
            'name' => 'Dr. Ahmed Benali', 'password' => Hash::make('password'),
            'role' => Role::Teacher, 'email_verified_at' => now(),
        ]);
        $t2 = User::firstOrCreate(['email' => 'teacher2@sms.com'], [
            'name' => 'Prof. Sara Meziani', 'password' => Hash::make('password'),
            'role' => Role::Teacher, 'email_verified_at' => now(),
        ]);

        // Students
        $students = [];
        $studentData = [
            ['name' => 'Youssef Amrani',   'email' => 'student1@sms.com'],
            ['name' => 'Fatima Zahra',     'email' => 'student2@sms.com'],
            ['name' => 'Karim Tazi',       'email' => 'student3@sms.com'],
            ['name' => 'Nadia Cherkaoui',  'email' => 'student4@sms.com'],
        ];
        foreach ($studentData as $s) {
            $students[] = User::firstOrCreate(['email' => $s['email']], [
                'name' => $s['name'], 'password' => Hash::make('password'),
                'role' => Role::Student, 'email_verified_at' => now(),
            ]);
        }

        // Modules
        $modules = [
            Module::firstOrCreate(['code' => 'MATH101'], ['name' => 'Mathematics',           'coefficient' => 3, 'semester' => 1, 'description' => 'Linear algebra and calculus.']),
            Module::firstOrCreate(['code' => 'PHY101'],  ['name' => 'Physics',               'coefficient' => 2, 'semester' => 1, 'description' => 'Classical mechanics and optics.']),
            Module::firstOrCreate(['code' => 'INFO201'], ['name' => 'Algorithms',            'coefficient' => 3, 'semester' => 2, 'description' => 'Data structures and complexity.']),
            Module::firstOrCreate(['code' => 'STAT201'], ['name' => 'Statistics',            'coefficient' => 2, 'semester' => 2, 'description' => 'Probability and inference.']),
        ];

        // Assign teachers to modules
        $modules[0]->teachers()->syncWithoutDetaching([$t1->id]);
        $modules[1]->teachers()->syncWithoutDetaching([$t1->id]);
        $modules[2]->teachers()->syncWithoutDetaching([$t2->id]);
        $modules[3]->teachers()->syncWithoutDetaching([$t2->id]);

        // Enroll all students in all modules
        foreach ($students as $student) {
            foreach ($modules as $module) {
                $module->students()->syncWithoutDetaching([$student->id]);
            }
        }

        // Schedules (emploi du temps)
        $scheduleData = [
            ['module_id' => $modules[0]->id, 'day' => 'monday',    'start_time' => '08:00', 'end_time' => '10:00', 'room' => 'A101', 'type' => 'cours', 'week_parity' => 'all'],
            ['module_id' => $modules[0]->id, 'day' => 'wednesday',  'start_time' => '10:00', 'end_time' => '12:00', 'room' => 'B03',  'type' => 'td',    'week_parity' => 'odd'],
            ['module_id' => $modules[0]->id, 'day' => 'thursday',   'start_time' => '14:00', 'end_time' => '16:00', 'room' => 'Lab1', 'type' => 'tp',    'week_parity' => 'even'],
            ['module_id' => $modules[1]->id, 'day' => 'tuesday',    'start_time' => '08:00', 'end_time' => '10:00', 'room' => 'A102', 'type' => 'cours', 'week_parity' => 'all'],
            ['module_id' => $modules[1]->id, 'day' => 'friday',     'start_time' => '10:00', 'end_time' => '12:00', 'room' => 'Lab2', 'type' => 'tp',    'week_parity' => 'all'],
            ['module_id' => $modules[2]->id, 'day' => 'monday',     'start_time' => '10:00', 'end_time' => '12:00', 'room' => 'C201', 'type' => 'cours', 'week_parity' => 'all'],
            ['module_id' => $modules[2]->id, 'day' => 'wednesday',  'start_time' => '14:00', 'end_time' => '16:00', 'room' => 'Lab3', 'type' => 'tp',    'week_parity' => 'all'],
            ['module_id' => $modules[3]->id, 'day' => 'tuesday',    'start_time' => '14:00', 'end_time' => '16:00', 'room' => 'A201', 'type' => 'cours', 'week_parity' => 'all'],
            ['module_id' => $modules[3]->id, 'day' => 'thursday',   'start_time' => '10:00', 'end_time' => '12:00', 'room' => 'B02',  'type' => 'td',    'week_parity' => 'all'],
        ];
        foreach ($scheduleData as $s) {
            Schedule::firstOrCreate(
                ['module_id' => $s['module_id'], 'day' => $s['day'], 'type' => $s['type'], 'week_parity' => $s['week_parity']],
                $s
            );
        }

        // TPs
        $tpData = [
            ['module_id' => $modules[0]->id, 'title' => 'TP 1 – Matrix Operations',     'description' => 'Implement Gaussian elimination and LU decomposition.', 'due_date' => now()->addDays(7),  'max_grade' => 20],
            ['module_id' => $modules[0]->id, 'title' => 'TP 2 – Differential Equations', 'description' => 'Solve ODEs using Euler and Runge-Kutta methods.',       'due_date' => now()->addDays(21), 'max_grade' => 20],
            ['module_id' => $modules[1]->id, 'title' => 'TP 1 – Free Fall Experiment',   'description' => 'Measure acceleration due to gravity.',                  'due_date' => now()->subDays(3),  'max_grade' => 20],
            ['module_id' => $modules[2]->id, 'title' => 'TP 1 – Sorting Algorithms',     'description' => 'Implement and benchmark QuickSort and MergeSort.',      'due_date' => now()->addDays(14), 'max_grade' => 20],
            ['module_id' => $modules[2]->id, 'title' => 'TP 2 – Binary Trees',           'description' => 'Build a BST with insert, delete, and traversal.',       'due_date' => now(),              'max_grade' => 20],
            ['module_id' => $modules[3]->id, 'title' => 'TP 1 – Regression Analysis',    'description' => 'Apply linear and logistic regression on a dataset.',    'due_date' => now()->addDays(10), 'max_grade' => 20],
        ];
        foreach ($tpData as $tp) {
            Tp::firstOrCreate(['module_id' => $tp['module_id'], 'title' => $tp['title']], $tp);
        }

        // Results for first student (Youssef)
        $student = $students[0];
        $resultData = [
            ['module_id' => $modules[0]->id, 'exam_type' => 'exam', 'grade' => 14.5, 'semester' => 1],
            ['module_id' => $modules[0]->id, 'exam_type' => 'cc',   'grade' => 16.0, 'semester' => 1],
            ['module_id' => $modules[0]->id, 'exam_type' => 'tp',   'grade' => 17.5, 'semester' => 1],
            ['module_id' => $modules[1]->id, 'exam_type' => 'exam', 'grade' => 11.0, 'semester' => 1],
            ['module_id' => $modules[1]->id, 'exam_type' => 'cc',   'grade' => 13.0, 'semester' => 1],
            ['module_id' => $modules[2]->id, 'exam_type' => 'exam', 'grade' => 18.0, 'semester' => 2],
            ['module_id' => $modules[2]->id, 'exam_type' => 'tp',   'grade' => 19.0, 'semester' => 2],
            ['module_id' => $modules[3]->id, 'exam_type' => 'exam', 'grade' => 12.0, 'semester' => 2],
            ['module_id' => $modules[3]->id, 'exam_type' => 'td',   'grade' => 14.0, 'semester' => 2],
        ];
        foreach ($resultData as $r) {
            Result::firstOrCreate(
                ['student_id' => $student->id, 'module_id' => $r['module_id'], 'exam_type' => $r['exam_type']],
                array_merge($r, ['student_id' => $student->id, 'academic_year' => '2024-2025'])
            );
        }
    }
}
