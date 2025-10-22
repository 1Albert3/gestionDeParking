<?php

namespace App\Repositories\Interfaces;

use App\Models\Parking;
use Illuminate\Database\Eloquent\Collection;

/**
 * INTERFACE REPOSITORY - PARKING
 * 
 * Pattern Repository : Sépare la logique d'accès aux données
 * de la logique métier dans les contrôleurs
 * 
 * Avantages :
 * - Abstraction de la couche de données
 * - Facilite les tests unitaires (mocking)
 * - Permet de changer de source de données facilement
 * - Code plus maintenable et découplé
 */
interface ParkingRepositoryInterface
{
    /**
     * Récupère tous les parkings avec leurs relations
     * 
     * @return Collection<Parking>
     */
    public function getAllWithSpots(): Collection;

    /**
     * Trouve un parking par son ID
     * 
     * @param int $id
     * @return Parking|null
     */
    public function findById(int $id): ?Parking;

    /**
     * Crée un nouveau parking
     * 
     * @param array $data
     * @return Parking
     */
    public function create(array $data): Parking;

    /**
     * Met à jour un parking existant
     * 
     * @param Parking $parking
     * @param array $data
     * @return Parking
     */
    public function update(Parking $parking, array $data): Parking;

    /**
     * Supprime un parking
     * 
     * @param Parking $parking
     * @return bool
     */
    public function delete(Parking $parking): bool;

    /**
     * Trouve les parkings par localisation
     * 
     * @param string $location
     * @return Collection<Parking>
     */
    public function findByLocation(string $location): Collection;

    /**
     * Récupère les statistiques d'un parking
     * 
     * @param Parking $parking
     * @return array
     */
    public function getStats(Parking $parking): array;
}