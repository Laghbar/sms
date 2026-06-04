<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    protected $fillable = ['specialization_id', 'name'];

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
