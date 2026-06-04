<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Module extends Model
{
    protected $fillable = [
        'name', 'code', 'coefficient', 'semester', 'description',
        'specialization_id', 'semester_id', 'teacher_id',
        'is_published', 'published_at', 'published_by',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'coefficient'  => 'float',
        ];
    }

    // Direct teacher assignment (new system: one teacher per module)
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    // Named semesterObj to avoid conflict with the legacy integer `semester` column
    public function semesterObj(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    // Legacy many-to-many pivot (kept for existing views)
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'teacher_module', 'module_id', 'teacher_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_module', 'module_id', 'student_id')
                    ->withPivot('note');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function tps(): HasMany
    {
        return $this->hasMany(Tp::class);
    }

    // Legacy publication record (kept for backward compatibility)
    public function resultPublication(): HasOne
    {
        return $this->hasOne(ResultPublication::class);
    }
}
