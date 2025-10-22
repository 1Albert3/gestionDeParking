<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parking;
use Illuminate\Http\Request;

class ParkingController extends Controller
{
    public function index()
    {
        return Parking::with('spots')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'total_spots' => 'required|integer|min:1',
        ]);

        $parking = Parking::create($request->all());
        return response()->json($parking, 201);
    }

    public function show(Parking $parking)
    {
        return $parking->load('spots');
    }

    public function update(Request $request, Parking $parking)
    {
        $request->validate([
            'name' => 'string|max:255',
            'location' => 'string|max:255',
            'total_spots' => 'integer|min:1',
        ]);

        $parking->update($request->all());
        return response()->json($parking);
    }

    public function destroy(Parking $parking)
    {
        $parking->delete();
        return response()->json(null, 204);
    }
}