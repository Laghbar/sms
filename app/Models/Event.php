<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Event extends Model
{
    protected $fillable = [
        'title', 'description', 'location',
        'starts_at', 'ends_at', 'image',
        'max_participants', 'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    protected $appends = ['image_url', 'status'];

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registeredUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_registrations')->withTimestamps();
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => $this->image ? Storage::url($this->image) : null);
    }

    protected function status(): Attribute
    {
        return Attribute::get(function () {
            $now = now();
            if ($now->lt($this->starts_at)) return 'upcoming';
            if ($this->ends_at && $now->gt($this->ends_at)) return 'past';
            return 'ongoing';
        });
    }

    public function isFull(): bool
    {
        if (! $this->max_participants) return false;
        return $this->registeredUsers()->count() >= $this->max_participants;
    }
}
