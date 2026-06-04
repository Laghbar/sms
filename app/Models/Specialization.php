<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialization extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
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
