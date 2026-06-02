<?php

namespace App\Imports;

use App\Enums\Role;
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
            User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name'               => $row['name'],
                    'email'              => $row['email'],
                    'password'           => Hash::make($row['password'] ?? Str::random(12)),
                    'role'               => Role::from($this->role),
                    'email_verified_at'  => now(),
                ]
            );

            $this->rowCount++;
        }
    }

    public function rules(): array
    {
        return [
            '*.name'  => ['required', 'string', 'max:255'],
            '*.email' => ['required', 'email', 'max:255'],
        ];
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }
}
