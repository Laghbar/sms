<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TpSubmission extends Model
{
    protected $fillable = [
        'course_file_id',
        'student_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    public function courseFile(): BelongsTo
    {
        return $this->belongsTo(CourseFile::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
