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
                $code    = strtoupper(trim($row['specialization'] ?? ''));
                $semName = strtoupper(trim($row['semester'] ?? ''));

                if ($code !== '') {
                    $spec = Specialization::where('code', $code)->first();

                    if ($spec) {
                        // Use the exact semester name if provided (e.g. S2, S4),
                        // otherwise fall back to the first semester (S1).
                        $semester = $semName !== ''
                            ? $spec->semesters()->where('name', $semName)->first()
                            : $spec->semesters()->orderBy('name')->first();

                        if ($semester) {
                            $user->update([
                                'specialization_id' => $spec->id,
                                'semester_id'       => $semester->id,
                            ]);

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
            $rules['*.semester']       = ['nullable', 'string', 'max:10'];
        }

        return $rules;
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }
}
