<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        // Each row: [module_id, day, start, end, room, type, week_parity]
        $data = [

            // ── GI S1 ────────────────────────────────────────────────────
            // Algorithm (5)
            [5, 'monday',    '08:00', '10:00', 'A101', 'cours', 'all'],
            [5, 'wednesday', '10:00', '12:00', 'B02',  'td',    'odd'],
            [5, 'wednesday', '10:00', '12:00', 'B02',  'td',    'even'],
            [5, 'friday',    '14:00', '16:00', 'Lab1', 'tp',    'odd'],

            // Mathematics (6)
            [6, 'tuesday',   '08:00', '10:00', 'A102', 'cours', 'all'],
            [6, 'thursday',  '10:00', '12:00', 'B03',  'td',    'all'],
            [6, 'saturday',  '08:00', '10:00', 'Lab2', 'tp',    'even'],

            // Computer Architecture (7)
            [7, 'monday',    '10:00', '12:00', 'C201', 'cours', 'all'],
            [7, 'wednesday', '14:00', '16:00', 'Lab3', 'td',    'all'],
            [7, 'friday',    '08:00', '10:00', 'Lab3', 'tp',    'even'],

            // English (8)
            [8, 'tuesday',   '14:00', '16:00', 'A103', 'cours', 'all'],
            [8, 'thursday',  '14:00', '15:30', 'B04',  'td',    'all'],

            // ── GI S2 ────────────────────────────────────────────────────
            // Bases de Données (9)
            [9, 'monday',    '08:00', '10:00', 'A201', 'cours', 'all'],
            [9, 'wednesday', '08:00', '10:00', 'B05',  'td',    'all'],
            [9, 'thursday',  '14:00', '16:00', 'Lab4', 'tp',    'odd'],

            // POO (10)
            [10, 'tuesday',  '08:00', '10:00', 'A202', 'cours', 'all'],
            [10, 'thursday', '08:00', '10:00', 'Lab4', 'tp',    'even'],
            [10, 'friday',   '10:00', '12:00', 'B06',  'td',    'all'],

            // Réseaux (11)
            [11, 'monday',   '14:00', '16:00', 'C101', 'cours', 'all'],
            [11, 'wednesday','14:00', '16:00', 'Lab5', 'tp',    'all'],

            // Statistiques (12)
            [12, 'tuesday',  '14:00', '16:00', 'A203', 'cours', 'all'],
            [12, 'saturday', '08:00', '10:00', 'B07',  'td',    'all'],

            // ── GC S1 ────────────────────────────────────────────────────
            // Mécanique des Structures (13)
            [13, 'monday',   '08:00', '10:00', 'D101', 'cours', 'all'],
            [13, 'wednesday','10:00', '12:00', 'D102', 'td',    'all'],
            [13, 'friday',   '08:00', '10:00', 'Lab6', 'tp',    'odd'],

            // Béton Armé (14)
            [14, 'tuesday',  '08:00', '10:00', 'D103', 'cours', 'all'],
            [14, 'thursday', '10:00', '12:00', 'D104', 'td',    'all'],

            // Topographie (15)
            [15, 'monday',   '10:00', '12:00', 'D105', 'cours', 'all'],
            [15, 'saturday', '08:00', '10:00', 'Ext1', 'tp',    'all'],

            // Dessin Technique (16)
            [16, 'wednesday','08:00', '10:00', 'D106', 'cours', 'all'],
            [16, 'thursday', '14:00', '16:00', 'D106', 'td',    'all'],

            // ── GC S2 ────────────────────────────────────────────────────
            // Hydraulique (17)
            [17, 'monday',   '08:00', '10:00', 'D201', 'cours', 'all'],
            [17, 'wednesday','10:00', '12:00', 'Lab7', 'tp',    'odd'],

            // Géotechnique (18)
            [18, 'tuesday',  '10:00', '12:00', 'D202', 'cours', 'all'],
            [18, 'friday',   '08:00', '10:00', 'D203', 'td',    'all'],

            // RDM (19)
            [19, 'monday',   '14:00', '16:00', 'D204', 'cours', 'all'],
            [19, 'thursday', '08:00', '10:00', 'D205', 'td',    'all'],

            // Matériaux (20)
            [20, 'wednesday','14:00', '16:00', 'D206', 'cours', 'all'],
            [20, 'saturday', '10:00', '12:00', 'Lab8', 'tp',    'even'],

            // ── GE S1 ────────────────────────────────────────────────────
            // Circuits Électriques (21)
            [21, 'monday',   '08:00', '10:00', 'E101', 'cours', 'all'],
            [21, 'wednesday','08:00', '10:00', 'Lab9', 'tp',    'odd'],
            [21, 'thursday', '10:00', '12:00', 'E102', 'td',    'all'],

            // Électronique Analogique (22)
            [22, 'tuesday',  '08:00', '10:00', 'E103', 'cours', 'all'],
            [22, 'friday',   '10:00', '12:00', 'Lab10','tp',    'even'],
            [22, 'thursday', '14:00', '16:00', 'E104', 'td',    'all'],

            // Mathématiques GE (23)
            [23, 'monday',   '10:00', '12:00', 'E105', 'cours', 'all'],
            [23, 'wednesday','14:00', '16:00', 'E106', 'td',    'all'],

            // Anglais Scientifique (24)
            [24, 'tuesday',  '14:00', '16:00', 'E107', 'cours', 'all'],
            [24, 'saturday', '08:00', '10:00', 'E107', 'td',    'all'],

            // ── GE S2 ────────────────────────────────────────────────────
            // Machines Électriques (25)
            [25, 'monday',   '08:00', '10:00', 'E201', 'cours', 'all'],
            [25, 'wednesday','10:00', '12:00', 'Lab11','tp',    'odd'],

            // Électronique Numérique (26)
            [26, 'tuesday',  '08:00', '10:00', 'E202', 'cours', 'all'],
            [26, 'thursday', '10:00', '12:00', 'Lab11','tp',    'even'],
            [26, 'friday',   '14:00', '16:00', 'E203', 'td',    'all'],

            // Traitement du Signal (27)
            [27, 'monday',   '14:00', '16:00', 'E204', 'cours', 'all'],
            [27, 'wednesday','14:00', '16:00', 'E205', 'td',    'all'],

            // Automatique (28)
            [28, 'tuesday',  '14:00', '16:00', 'E206', 'cours', 'all'],
            [28, 'saturday', '08:00', '10:00', 'Lab12','tp',    'all'],
        ];

        foreach ($data as [$moduleId, $day, $start, $end, $room, $type, $parity]) {
            Schedule::firstOrCreate(
                ['module_id' => $moduleId, 'day' => $day, 'type' => $type, 'week_parity' => $parity, 'start_time' => $start],
                ['end_time' => $end, 'room' => $room]
            );
        }

        $this->command->info('Schedules seeded: ' . count($data) . ' entries across all specializations.');
    }
}
