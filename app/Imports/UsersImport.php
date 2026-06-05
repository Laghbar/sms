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

            if ($this->role === 'teacher') {
                // Accept: "modules", "module_taught", "module" column headers
                $rawModules = trim(
                    $row['modules']       ??
                    $row['module_taught'] ??
                    $row['module']        ??
                    ''
                );

                if ($rawModules !== '') {
                    $names = array_filter(array_map('trim', explode(',', $rawModules)));

                    foreach ($names as $name) {
                        // Try to find by code first, then by name (case-insensitive)
                        $module = Module::where('code', strtoupper($name))
                            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                            ->first();

                        // Auto-create if not found so no assignment is lost
                        if (! $module) {
                            $module = Module::create([
                                'name'        => $name,
                                'code'        => strtoupper(str_replace(' ', '-', preg_replace('/[^A-Za-z0-9\s]/', '', $name))),
                                'coefficient' => 1,
                                'semester'    => 1,
                            ]);
                        }

                        $module->update(['teacher_id' => $user->id]);
                        $module->teachers()->syncWithoutDetaching([$user->id]);
                    }
                }
            }

            if ($this->role === 'student') {
                $code    = strtoupper(trim($row['specialization'] ?? ''));
                $semName = strtoupper(trim($row['semester'] ?? ''));

                if ($code !== '') {
                    $spec = Specialization::where('code', $code)->first();

                    if ($spec) {
                        // Use the exact semester name if provided (e.g. S2, S4),
                        // otherwise fall back to the last semester (S2 or S4) — end of academic year.
                        $semester = $semName !== ''
                            ? $spec->semesters()->where('name', $semName)->first()
                            : $spec->semesters()->orderBy('name')->get()->last();

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

        if ($this->role === 'teacher') {
            $rules['*.modules']       = ['nullable', 'string', 'max:1000'];
            $rules['*.module_taught'] = ['nullable', 'string', 'max:1000'];
            $rules['*.module']        = ['nullable', 'string', 'max:1000'];
        }

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
