<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Subscription::with('vehicle')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type' => 'required|in:monthly,daily',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'required|numeric|min:0',
        ]);

        $subscription = Subscription::create($request->all());
        return response()->json($subscription, 201);
    }

    public function show(Subscription $subscription)
    {
        return $subscription->load('vehicle');
    }

    public function update(Request $request, Subscription $subscription)
    {
        $request->validate([
            'vehicle_id' => 'exists:vehicles,id',
            'type' => 'in:monthly,daily',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'price' => 'numeric|min:0',
        ]);

        $subscription->update($request->all());
        return response()->json($subscription);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();
        return response()->json(null, 204);
    }
}