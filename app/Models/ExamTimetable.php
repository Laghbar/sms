<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamTimetable extends Model
{
    protected $fillable = [
        'uploaded_by',
        'specialization_id',
        'title',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }
}
