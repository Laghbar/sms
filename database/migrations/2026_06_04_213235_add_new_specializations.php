<?php

use App\Models\Specialization;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private array $specs = [
        ['code' => 'GM',  'name' => 'Génie Minier',    'description' => 'Mining Engineering'],
        ['code' => 'AGC', 'name' => 'Agrochimique',     'description' => 'Agrochemistry'],
        ['code' => 'GB',  'name' => 'Génie Biologique', 'description' => 'Biological Engineering'],
    ];

    public function up(): void
    {
        foreach ($this->specs as $data) {
            $spec = Specialization::firstOrCreate(
                ['code' => $data['code']],
                ['name' => $data['name'], 'description' => $data['description']]
            );

            foreach (['S1', 'S2', 'S3', 'S4'] as $sem) {
                $spec->semesters()->firstOrCreate(['name' => $sem]);
            }
        }
    }

    public function down(): void
    {
        Specialization::whereIn('code', array_column($this->specs, 'code'))->delete();
    }
};
