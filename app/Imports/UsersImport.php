<?php

namespace App\Imports;

use App\Enums\Role;
use App\Models\Module;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UsersImport implements ToCollection, WithHeadingRow, WithValidation
{
    private int $rowCount = 0;

    public function __construct(private readonly string $role) {}

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $password = (isset($row['password']) && trim($row['password']) !== '')
                ? trim($row['password'])
                : Str::random(10);

            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name'              => $row['name'],
                    'password'          => Hash::make($password),
                    'role'              => Role::from($this->role),
                    'email_verified_at' => now(),
                ]
            );

            if ($this->role === 'student') {
                $code = strtoupper(trim($row['specialization'] ?? ''));

                if ($code !== '') {
                    $spec = Specialization::where('code', $code)->first();

                    if ($spec) {
                        $semester = $spec->semesters()->orderBy('name')->first();

                        $user->update([
                            'specialization_id' => $spec->id,
                            'semester_id'       => $semester?->id,
                        ]);

                        if ($semester) {
                            Module::where('specialization_id', $spec->id)
                                ->where('semester_id', $semester->id)
                                ->get()
                                ->each(fn ($mod) => $mod->students()->syncWithoutDetaching([$user->id]));
                        }
                    }
                }
            }

            $this->rowCount++;
        }
    }

    public function rules(): array
    {
        $rules = [
            '*.name'  => ['required', 'string', 'max:255'],
            '*.email' => ['required', 'email', 'max:255'],
        ];

        if ($this->role === 'student') {
            $rules['*.specialization'] = ['nullable', 'string', 'max:20'];
        }

        return $rules;
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }
}
