<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parking extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'total_spots',
    ];

    public function spots()
    {
        return $this->hasMany(Spot::class);
    }
}