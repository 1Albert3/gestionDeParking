<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Spot extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'status',
        'parking_id',
    ];

    public function parking()
    {
        return $this->belongsTo(Parking::class);
    }

    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }
}