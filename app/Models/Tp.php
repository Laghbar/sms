<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tp extends Model
{
    protected $fillable = ['module_id', 'title', 'description', 'due_date', 'max_grade'];

    protected function casts(): array
    {
        return [
            'due_date'  => 'date',
            'max_grade' => 'float',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
