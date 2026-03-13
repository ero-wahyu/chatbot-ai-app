<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'session_token',
    ];

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }
}
