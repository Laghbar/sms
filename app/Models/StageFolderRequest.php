<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StageFolderRequest extends Model
{
    protected $fillable = [
        'student_id', 'phone', 'company_name', 'company_address',
        'internship_start', 'duration_weeks', 'notes',
        'status', 'file_path', 'file_name', 'admin_note',
    ];

    protected function casts(): array
    {
        return ['internship_start' => 'date'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isProcessing(): bool { return $this->status === 'processing'; }
    public function isReady(): bool      { return $this->status === 'ready'; }
}
