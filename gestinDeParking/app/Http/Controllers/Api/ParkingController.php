<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parking;
use App\Repositories\Interfaces\ParkingRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTRÔLEUR API - GESTION DES PARKINGS (avec Pattern Repository)
 * 
 * Architecture : Controller → Repository → Model → Database
 * 
 * Avantages du pattern Repository :
 * - Séparation des responsabilités
 * - Code plus testable et maintenable
 * - Abstraction de la couche de données
 * - Respect des principes SOLID
 */
class ParkingController extends Controller
{
    /**
     * INJECTION DU REPOSITORY
     * 
     * Laravel injecte automatiquement l'implémentation concrète
     * grâce au Service Provider configuré
     */
    public function __construct(
        private readonly ParkingRepositoryInterface $parkingRepository
    ) {}

    /**
     * LISTER TOUS LES PARKINGS
     * 
     * Route : GET /api/parkings
     * 
     * Délègue la logique d'accès aux données au repository
     * Le contrôleur se contente de coordonner et formater la réponse
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Délégation au repository pour récupérer les données
        $parkings = $this->parkingRepository->getAllWithSpots();
        
        // Le contrôleur se contente de retourner la réponse formatée
        return response()->json($parkings);
    }

    /**
     * CRÉER UN NOUVEAU PARKING
     * 
     * Route : POST /api/parkings
     * Body : { name, location, total_spots }
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // ÉTAPE 1 : Validation des données (responsabilité du contrôleur)
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'total_spots' => 'required|integer|min:1',
        ]);

        // ÉTAPE 2 : Délégation de la création au repository
        $parking = $this->parkingRepository->create($validatedData);
        
        // ÉTAPE 3 : Retour de la réponse avec code 201 (Created)
        return response()->json($parking, 201);
    }

    /**
     * AFFICHER UN PARKING SPÉCIFIQUE
     * 
     * Route : GET /api/parkings/{id}
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        // Utilisation du repository pour trouver le parking
        $parking = $this->parkingRepository->findById($id);
        
        // Gestion du cas où le parking n'existe pas
        if (!$parking) {
            return response()->json([
                'message' => 'Parking non trouvé'
            ], 404);
        }
        
        return response()->json($parking);
    }

    /**
     * MODIFIER UN PARKING EXISTANT
     * 
     * Route : PUT /api/parkings/{id}
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // ÉTAPE 1 : Recherche du parking
        $parking = $this->parkingRepository->findById($id);
        
        if (!$parking) {
            return response()->json([
                'message' => 'Parking non trouvé'
            ], 404);
        }

        // ÉTAPE 2 : Validation des données
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'total_spots' => 'sometimes|integer|min:1',
        ]);

        // ÉTAPE 3 : Mise à jour via le repository
        $updatedParking = $this->parkingRepository->update($parking, $validatedData);
        
        return response()->json($updatedParking);
    }

    /**
     * SUPPRIMER UN PARKING
     * 
     * Route : DELETE /api/parkings/{id}
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        // ÉTAPE 1 : Recherche du parking
        $parking = $this->parkingRepository->findById($id);
        
        if (!$parking) {
            return response()->json([
                'message' => 'Parking non trouvé'
            ], 404);
        }

        // ÉTAPE 2 : Suppression via le repository
        $this->parkingRepository->delete($parking);
        
        // ÉTAPE 3 : Réponse vide avec code 204 (No Content)
        return response()->json(null, 204);
    }

    /**
     * MÉTHODES MÉTIER SUPPLÉMENTAIRES
     * 
     * Ces endpoints utilisent les méthodes spécialisées du repository
     */

    /**
     * RÉCUPÈRE LES STATISTIQUES D'UN PARKING
     * 
     * Route : GET /api/parkings/{id}/stats
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function stats(int $id): JsonResponse
    {
        $parking = $this->parkingRepository->findById($id);
        
        if (!$parking) {
            return response()->json([
                'message' => 'Parking non trouvé'
            ], 404);
        }

        // Utilisation de la méthode métier du repository
        $stats = $this->parkingRepository->getStats($parking);
        
        return response()->json($stats);
    }

    /**
     * RECHERCHE PAR LOCALISATION
     * 
     * Route : GET /api/parkings/search?location=paris
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function searchByLocation(Request $request): JsonResponse
    {
        $location = $request->query('location');
        
        if (!$location) {
            return response()->json([
                'message' => 'Paramètre location requis'
            ], 400);
        }

        $parkings = $this->parkingRepository->findByLocation($location);
        
        return response()->json($parkings);
    }

    /**
     * PARKINGS AVEC PLACES DISPONIBLES
     * 
     * Route : GET /api/parkings/available
     * 
     * @return JsonResponse
     */
    public function available(): JsonResponse
    {
        $availableParkings = $this->parkingRepository->getAvailableParkings();
        
        return response()->json($availableParkings);
    }
}

/*
 * AVANTAGES DE CETTE ARCHITECTURE :
 * 
 * 1. SÉPARATION DES RESPONSABILITÉS :
 *    - Contrôleur : Validation, coordination, réponses HTTP
 *    - Repository : Accès aux données, requêtes complexes
 *    - Model : Définition des relations et règles métier
 * 
 * 2. TESTABILITÉ :
 *    - Mock du repository pour les tests unitaires
 *    - Tests isolés sans base de données
 * 
 * 3. MAINTENABILITÉ :
 *    - Changement de logique de données sans impact sur le contrôleur
 *    - Code plus lisible et organisé
 * 
 * 4. FLEXIBILITÉ :
 *    - Possibilité de changer de source de données (API, cache, etc.)
 *    - Implémentations multiples selon l'environnement
 * 
 * EXEMPLE D'UTILISATION :
 * 
 * Frontend (React) → HTTP Request → Controller → Repository → Model → Database
 *                                      ↓
 *                                 Validation, Business Logic
 *                                      ↓
 *                                 JSON Response ← Controller ← Repository ← Model ← Database
 */