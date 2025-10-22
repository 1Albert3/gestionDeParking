<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parking;
use App\Models\Spot;
use App\Models\Vehicle;
use App\Models\Subscription;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalParkings = Parking::count();
        $totalSpots = Spot::count();
        $occupiedSpots = Spot::where('status', 'occupied')->count();
        $availableSpots = Spot::where('status', 'available')->count();
        $totalVehicles = Vehicle::count();
        $activeSubscriptions = Subscription::where('end_date', '>=', now())->count();

        return response()->json([
            'total_parkings' => $totalParkings,
            'total_spots' => $totalSpots,
            'occupied_spots' => $occupiedSpots,
            'available_spots' => $availableSpots,
            'occupancy_rate' => $totalSpots > 0 ? round(($occupiedSpots / $totalSpots) * 100, 2) : 0,
            'total_vehicles' => $totalVehicles,
            'active_subscriptions' => $activeSubscriptions,
        ]);
    }
}