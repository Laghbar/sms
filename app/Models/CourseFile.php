<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseFile extends Model
{
    protected $fillable = [
        'module_id',
        'uploaded_by',
        'type',
        'title',
        'description',
        'due_date',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TpSubmission::class);
    }
}
