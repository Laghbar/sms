<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = ['module_id', 'day', 'start_time', 'end_time', 'room', 'type', 'week_parity'];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
