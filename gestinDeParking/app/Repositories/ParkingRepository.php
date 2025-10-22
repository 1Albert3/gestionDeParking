<?php

namespace App\Repositories;

use App\Models\Parking;
use App\Repositories\Interfaces\ParkingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * REPOSITORY CONCRET - PARKING
 * 
 * Implémentation concrète de l'interface ParkingRepositoryInterface
 * Gère toutes les opérations de base de données pour les parkings
 * 
 * Pattern Repository :
 * - Encapsule la logique d'accès aux données
 * - Fournit une API simple pour les contrôleurs
 * - Facilite les tests et la maintenance
 */
class ParkingRepository implements ParkingRepositoryInterface
{
    /**
     * RÉCUPÈRE TOUS LES PARKINGS AVEC LEURS PLACES
     * 
     * Utilise Eager Loading pour optimiser les requêtes
     * Évite le problème N+1 queries
     * 
     * @return Collection<Parking>
     */
    public function getAllWithSpots(): Collection
    {
        return Parking::with(['spots' => function ($query) {
            // Optimisation : charge seulement les champs nécessaires
            $query->select('id', 'number', 'status', 'parking_id');
        }])->get();
    }

    /**
     * TROUVE UN PARKING PAR SON ID
     * 
     * @param int $id
     * @return Parking|null
     */
    public function findById(int $id): ?Parking
    {
        return Parking::with('spots')->find($id);
    }

    /**
     * CRÉE UN NOUVEAU PARKING
     * 
     * Utilise les $fillable du modèle pour la sécurité
     * 
     * @param array $data
     * @return Parking
     */
    public function create(array $data): Parking
    {
        return Parking::create($data);
    }

    /**
     * MET À JOUR UN PARKING EXISTANT
     * 
     * @param Parking $parking
     * @param array $data
     * @return Parking
     */
    public function update(Parking $parking, array $data): Parking
    {
        $parking->update($data);
        return $parking->fresh(); // Recharge depuis la DB
    }

    /**
     * SUPPRIME UN PARKING
     * 
     * @param Parking $parking
     * @return bool
     */
    public function delete(Parking $parking): bool
    {
        return $parking->delete();
    }

    /**
     * TROUVE LES PARKINGS PAR LOCALISATION
     * 
     * Recherche partielle (LIKE) pour plus de flexibilité
     * 
     * @param string $location
     * @return Collection<Parking>
     */
    public function findByLocation(string $location): Collection
    {
        return Parking::where('location', 'LIKE', "%{$location}%")
                     ->with('spots')
                     ->get();
    }

    /**
     * RÉCUPÈRE LES STATISTIQUES D'UN PARKING
     * 
     * Calcule les métriques importantes pour le business
     * 
     * @param Parking $parking
     * @return array
     */
    public function getStats(Parking $parking): array
    {
        // Chargement des places si pas déjà fait
        $parking->loadMissing('spots');
        
        $totalSpots = $parking->spots->count();
        $occupiedSpots = $parking->spots->where('status', 'occupied')->count();
        $availableSpots = $parking->spots->where('status', 'available')->count();
        $reservedSpots = $parking->spots->where('status', 'reserved')->count();
        
        return [
            'total_spots' => $totalSpots,
            'occupied_spots' => $occupiedSpots,
            'available_spots' => $availableSpots,
            'reserved_spots' => $reservedSpots,
            'occupancy_rate' => $totalSpots > 0 ? round(($occupiedSpots / $totalSpots) * 100, 2) : 0,
            'availability_rate' => $totalSpots > 0 ? round(($availableSpots / $totalSpots) * 100, 2) : 0,
        ];
    }

    /**
     * MÉTHODES MÉTIER SUPPLÉMENTAIRES
     * 
     * Ces méthodes encapsulent la logique métier spécifique
     */

    /**
     * Trouve les parkings avec des places disponibles
     * 
     * @return Collection<Parking>
     */
    public function getAvailableParkings(): Collection
    {
        return Parking::whereHas('spots', function ($query) {
            $query->where('status', 'available');
        })->with('spots')->get();
    }

    /**
     * Trouve les parkings par taux d'occupation
     * 
     * @param float $minRate Taux minimum (0-100)
     * @param float $maxRate Taux maximum (0-100)
     * @return Collection<Parking>
     */
    public function getByOccupancyRate(float $minRate, float $maxRate): Collection
    {
        return Parking::with('spots')
            ->get()
            ->filter(function ($parking) use ($minRate, $maxRate) {
                $stats = $this->getStats($parking);
                return $stats['occupancy_rate'] >= $minRate && 
                       $stats['occupancy_rate'] <= $maxRate;
            });
    }

    /**
     * Compte le nombre total de places dans tous les parkings
     * 
     * @return int
     */
    public function getTotalSpotsCount(): int
    {
        return Parking::withCount('spots')->get()->sum('spots_count');
    }
}