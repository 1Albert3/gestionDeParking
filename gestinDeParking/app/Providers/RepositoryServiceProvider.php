<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Interfaces
use App\Repositories\Interfaces\ParkingRepositoryInterface;

// Implémentations concrètes
use App\Repositories\ParkingRepository;

/**
 * SERVICE PROVIDER - REPOSITORIES
 * 
 * Configure l'injection de dépendance pour les repositories
 * Pattern : Dependency Injection Container
 * 
 * Avantages :
 * - Découplage entre interfaces et implémentations
 * - Facilite les tests (mocking des interfaces)
 * - Permet de changer d'implémentation facilement
 * - Respect du principe SOLID (Dependency Inversion)
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * ENREGISTREMENT DES BINDINGS
     * 
     * Lie chaque interface à son implémentation concrète
     * Laravel injectera automatiquement la bonne classe
     */
    public function register(): void
    {
        /*
         * BINDING PARKING REPOSITORY
         * 
         * Quand Laravel voit ParkingRepositoryInterface dans un constructeur,
         * il injectera automatiquement une instance de ParkingRepository
         */
        $this->app->bind(
            ParkingRepositoryInterface::class,
            ParkingRepository::class
        );

        /*
         * EXEMPLE D'AUTRES REPOSITORIES (à ajouter si nécessaire)
         * 
         * $this->app->bind(SpotRepositoryInterface::class, SpotRepository::class);
         * $this->app->bind(VehicleRepositoryInterface::class, VehicleRepository::class);
         * $this->app->bind(SubscriptionRepositoryInterface::class, SubscriptionRepository::class);
         */
    }

    /**
     * BOOTSTRAP DES SERVICES
     * 
     * Exécuté après l'enregistrement de tous les providers
     */
    public function boot(): void
    {
        //
    }
}