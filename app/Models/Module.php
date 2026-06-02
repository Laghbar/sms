<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = ['name', 'code', 'coefficient', 'semester', 'description'];

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'teacher_module', 'module_id', 'teacher_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_module', 'module_id', 'student_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public function tps(): HasMany
    {
        return $this->hasMany(Tp::class);
    }
}
