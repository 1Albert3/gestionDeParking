<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        return Vehicle::with(['spot.parking', 'subscriptions'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string|unique:vehicles',
            'brand' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'spot_id' => 'nullable|exists:spots,id',
            'entry_time' => 'nullable|date',
            'exit_time' => 'nullable|date',
        ]);

        $vehicle = Vehicle::create($request->all());
        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle)
    {
        return $vehicle->load(['spot.parking', 'subscriptions']);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'plate_number' => 'string|unique:vehicles,plate_number,' . $vehicle->id,
            'brand' => 'string|max:255',
            'owner_name' => 'string|max:255',
            'spot_id' => 'nullable|exists:spots,id',
            'entry_time' => 'nullable|date',
            'exit_time' => 'nullable|date',
        ]);

        $vehicle->update($request->all());
        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return response()->json(null, 204);
    }
}