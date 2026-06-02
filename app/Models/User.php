<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'events_last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'password'             => 'hashed',
            'role'                 => Role::class,
            'events_last_seen_at'  => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isTeacher(): bool
    {
        return $this->role === Role::Teacher;
    }

    public function isStudent(): bool
    {
        return $this->role === Role::Student;
    }

    // Teacher relationships
    public function taughtModules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'teacher_module', 'teacher_id', 'module_id');
    }

    // Student relationships
    public function enrolledModules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'student_module', 'student_id', 'module_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'student_id');
    }
}
