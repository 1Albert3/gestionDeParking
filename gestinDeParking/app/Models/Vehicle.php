<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'brand',
        'owner_name',
        'spot_id',
        'entry_time',
        'exit_time',
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
    ];

    public function spot()
    {
        return $this->belongsTo(Spot::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}