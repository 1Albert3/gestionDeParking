<?php

/**
 * ROUTES API - SYSTÈME DE GESTION DE PARKING (avec Pattern Repository)
 * 
 * Ce fichier définit toutes les routes de l'API REST
 * Architecture : API REST avec authentification Sanctum + Pattern Repository
 * 
 * Structure :
 * - Routes publiques (login)
 * - Routes protégées (nécessitent un token d'authentification)
 * - Routes métier spécialisées (utilisant les repositories)
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import des contrôleurs API
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParkingController;
use App\Http\Controllers\Api\SpotController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| ROUTES PUBLIQUES (sans authentification)
|--------------------------------------------------------------------------
| Ces routes sont accessibles sans token d'authentification
*/

// POST /api/login - Connexion utilisateur
// Reçoit : email, password
// Retourne : user + token d'authentification
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| ROUTES PROTÉGÉES (avec authentification Sanctum)
|--------------------------------------------------------------------------
| Toutes ces routes nécessitent un token Bearer dans les headers
| Middleware 'auth:sanctum' vérifie automatiquement le token
*/

Route::middleware('auth:sanctum')->group(function () {
    
    /*
     * GESTION DE L'AUTHENTIFICATION
     */
    
    // POST /api/logout - Déconnexion (révoque le token)
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // GET /api/user - Récupère les infos de l'utilisateur connecté
    Route::get('/user', [AuthController::class, 'user']);
    
    /*
     * DASHBOARD - STATISTIQUES
     */
    
    // GET /api/dashboard/stats - Statistiques globales du système
    // Retourne : nombre de parkings, places, taux d'occupation, etc.
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    /*
     * PARKINGS - GESTION AVEC PATTERN REPOSITORY
     * 
     * Routes CRUD standard + routes métier spécialisées
     */
    
    // Routes métier spécialisées (avant les routes resource pour éviter les conflits)
    Route::prefix('parkings')->group(function () {
        // GET /api/parkings/available - Parkings avec places disponibles
        Route::get('/available', [ParkingController::class, 'available']);
        
        // GET /api/parkings/search?location=paris - Recherche par localisation
        Route::get('/search', [ParkingController::class, 'searchByLocation']);
        
        // GET /api/parkings/{id}/stats - Statistiques d'un parking spécifique
        Route::get('/{id}/stats', [ParkingController::class, 'stats']);
    });
    
    // Routes CRUD standard pour les parkings
    Route::apiResource('parkings', ParkingController::class);
    
    /*
     * AUTRES RESOURCES CRUD
     * 
     * apiResource() génère automatiquement les routes REST :
     * GET    /api/{resource}        - index()   - Liste tous
     * POST   /api/{resource}        - store()   - Créer nouveau
     * GET    /api/{resource}/{id}   - show()    - Afficher un
     * PUT    /api/{resource}/{id}   - update()  - Modifier
     * DELETE /api/{resource}/{id}   - destroy() - Supprimer
     */
    
    // SPOTS - Gestion des places de parking individuelles
    Route::apiResource('spots', SpotController::class);
    
    // VEHICLES - Gestion des véhicules
    Route::apiResource('vehicles', VehicleController::class);
    
    // SUBSCRIPTIONS - Gestion des abonnements (mensuel/journalier)
    Route::apiResource('subscriptions', SubscriptionController::class);
});

/*
 * EXEMPLE D'UTILISATION DES NOUVELLES ROUTES MÉTIER :
 * 
 * Frontend (React) → Backend (Laravel avec Repository)
 * 
 * 1. Recherche de parkings :
 *    GET /api/parkings/search?location=paris
 *    → ParkingController@searchByLocation
 *    → ParkingRepository@findByLocation
 *    → Retourne parkings filtrés
 * 
 * 2. Parkings disponibles :
 *    GET /api/parkings/available
 *    → ParkingController@available
 *    → ParkingRepository@getAvailableParkings
 *    → Retourne parkings avec places libres
 * 
 * 3. Statistiques d'un parking :
 *    GET /api/parkings/1/stats
 *    → ParkingController@stats
 *    → ParkingRepository@getStats
 *    → Retourne métriques détaillées
 * 
 * ARCHITECTURE AVEC REPOSITORY :
 * 
 * Request → Controller → Repository → Model → Database
 *    ↓         ↓           ↓          ↓        ↓
 * Validation Business   Data Access Relations Queries
 * Response   Logic      Abstraction Mapping   Storage
 * 
 * AVANTAGES :
 * - Code plus maintenable et testable
 * - Séparation claire des responsabilités
 * - Facilite les changements de source de données
 * - Respect des principes SOLID
 */