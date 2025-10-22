<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParkingController;
use App\Http\Controllers\Api\SpotController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\DashboardController;

// Auth routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Resources
    Route::apiResource('parkings', ParkingController::class);
    Route::apiResource('spots', SpotController::class);
    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('subscriptions', SubscriptionController::class);
});