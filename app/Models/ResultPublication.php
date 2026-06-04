<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultPublication extends Model
{
    protected $fillable = ['module_id', 'published_by'];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
