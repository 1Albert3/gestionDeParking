<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use Illuminate\Http\Request;

class SpotController extends Controller
{
    public function index()
    {
        return Spot::with(['parking', 'vehicle'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'number' => 'required|string|max:255',
            'status' => 'in:available,occupied,reserved',
            'parking_id' => 'required|exists:parkings,id',
        ]);

        $spot = Spot::create($request->all());
        return response()->json($spot, 201);
    }

    public function show(Spot $spot)
    {
        return $spot->load(['parking', 'vehicle']);
    }

    public function update(Request $request, Spot $spot)
    {
        $request->validate([
            'number' => 'string|max:255',
            'status' => 'in:available,occupied,reserved',
            'parking_id' => 'exists:parkings,id',
        ]);

        $spot->update($request->all());
        return response()->json($spot);
    }

    public function destroy(Spot $spot)
    {
        $spot->delete();
        return response()->json(null, 204);
    }
}