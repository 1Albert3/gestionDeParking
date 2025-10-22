<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Parking;
use App\Models\Spot;
use App\Models\Vehicle;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@parking.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create agent user
        User::create([
            'name' => 'Agent',
            'email' => 'agent@parking.com',
            'password' => Hash::make('password'),
            'role' => 'agent',
        ]);

        // Create parkings
        $parking1 = Parking::create([
            'name' => 'Centre Ville',
            'location' => 'Rue de la Paix, Paris',
            'total_spots' => 50,
        ]);

        $parking2 = Parking::create([
            'name' => 'Gare du Nord',
            'location' => 'Place Napoléon III, Paris',
            'total_spots' => 100,
        ]);

        // Create spots for parking 1
        for ($i = 1; $i <= 50; $i++) {
            Spot::create([
                'number' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status' => $i <= 30 ? 'available' : 'occupied',
                'parking_id' => $parking1->id,
            ]);
        }

        // Create spots for parking 2
        for ($i = 1; $i <= 100; $i++) {
            Spot::create([
                'number' => 'B' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status' => $i <= 60 ? 'available' : 'occupied',
                'parking_id' => $parking2->id,
            ]);
        }

        // Create some vehicles
        $occupiedSpots = Spot::where('status', 'occupied')->get();
        foreach ($occupiedSpots->take(10) as $spot) {
            Vehicle::create([
                'plate_number' => 'ABC' . rand(100, 999),
                'brand' => ['Toyota', 'Renault', 'Peugeot', 'BMW'][rand(0, 3)],
                'owner_name' => 'Propriétaire ' . rand(1, 100),
                'spot_id' => $spot->id,
                'entry_time' => now()->subHours(rand(1, 8)),
            ]);
        }

        // Create subscriptions
        $vehicles = Vehicle::all();
        foreach ($vehicles->take(5) as $vehicle) {
            Subscription::create([
                'vehicle_id' => $vehicle->id,
                'type' => ['monthly', 'daily'][rand(0, 1)],
                'start_date' => now()->subDays(rand(1, 30)),
                'end_date' => now()->addDays(rand(30, 90)),
                'price' => rand(50, 200),
            ]);
        }
    }
}