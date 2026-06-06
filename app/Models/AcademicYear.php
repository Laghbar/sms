<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'is_current'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'is_current' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::where('is_current', true)->firstOrFail();
    }

    public static function currentId(): int
    {
        return static::where('is_current', true)->value('id');
    }
}
