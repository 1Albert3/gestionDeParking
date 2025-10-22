<?php

namespace Tests\Unit;

use Tests\TestCase;
use Mockery;
use App\Http\Controllers\Api\ParkingController;
use App\Repositories\Interfaces\ParkingRepositoryInterface;
use App\Models\Parking;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Collection;

/**
 * TEST UNITAIRE - PARKING CONTROLLER (avec Pattern Repository)
 * 
 * Démontre les avantages du pattern Repository pour les tests :
 * - Isolation complète des tests (pas de base de données)
 * - Mocking des dépendances
 * - Tests rapides et fiables
 * - Couverture de la logique métier uniquement
 */
class ParkingControllerTest extends TestCase
{
    private ParkingRepositoryInterface $mockRepository;
    private ParkingController $controller;

    /**
     * CONFIGURATION AVANT CHAQUE TEST
     * 
     * Crée un mock du repository pour isoler les tests
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Création d'un mock du repository
        $this->mockRepository = Mockery::mock(ParkingRepositoryInterface::class);
        
        // Injection du mock dans le contrôleur
        $this->controller = new ParkingController($this->mockRepository);
    }

    /**
     * TEST : INDEX - RÉCUPÉRATION DE TOUS LES PARKINGS
     * 
     * Vérifie que le contrôleur appelle bien le repository
     * et retourne la réponse attendue
     */
    public function test_index_returns_all_parkings(): void
    {
        // ARRANGE : Préparation des données de test
        $expectedParkings = new Collection([
            new Parking(['id' => 1, 'name' => 'Centre Ville', 'location' => 'Paris']),
            new Parking(['id' => 2, 'name' => 'Gare', 'location' => 'Lyon']),
        ]);

        // Configuration du mock : quand getAllWithSpots() est appelé,
        // retourner les données de test
        $this->mockRepository
            ->shouldReceive('getAllWithSpots')
            ->once()
            ->andReturn($expectedParkings);

        // ACT : Exécution de la méthode à tester
        $response = $this->controller->index();

        // ASSERT : Vérification des résultats
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedParkings->toJson(), $response->getContent());
    }

    /**
     * TEST : STORE - CRÉATION D'UN NOUVEAU PARKING
     * 
     * Vérifie la validation et la création via le repository
     */
    public function test_store_creates_new_parking(): void
    {
        // ARRANGE : Données d'entrée
        $inputData = [
            'name' => 'Nouveau Parking',
            'location' => 'Marseille',
            'total_spots' => 100
        ];

        $expectedParking = new Parking(array_merge($inputData, ['id' => 1]));

        // Mock de la requête HTTP
        $request = Request::create('/api/parkings', 'POST', $inputData);

        // Configuration du mock repository
        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($inputData)
            ->andReturn($expectedParking);

        // ACT : Exécution
        $response = $this->controller->store($request);

        // ASSERT : Vérifications
        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Nouveau Parking', $responseData['name']);
    }

    /**
     * TEST : SHOW - AFFICHAGE D'UN PARKING EXISTANT
     */
    public function test_show_returns_existing_parking(): void
    {
        // ARRANGE
        $parkingId = 1;
        $expectedParking = new Parking([
            'id' => $parkingId,
            'name' => 'Test Parking',
            'location' => 'Test Location'
        ]);

        $this->mockRepository
            ->shouldReceive('findById')
            ->once()
            ->with($parkingId)
            ->andReturn($expectedParking);

        // ACT
        $response = $this->controller->show($parkingId);

        // ASSERT
        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * TEST : SHOW - PARKING NON TROUVÉ
     */
    public function test_show_returns_404_when_parking_not_found(): void
    {
        // ARRANGE
        $parkingId = 999;

        $this->mockRepository
            ->shouldReceive('findById')
            ->once()
            ->with($parkingId)
            ->andReturn(null);

        // ACT
        $response = $this->controller->show($parkingId);

        // ASSERT
        $this->assertEquals(404, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Parking non trouvé', $responseData['message']);
    }

    /**
     * TEST : STATS - STATISTIQUES D'UN PARKING
     * 
     * Teste une méthode métier spécialisée du repository
     */
    public function test_stats_returns_parking_statistics(): void
    {
        // ARRANGE
        $parkingId = 1;
        $parking = new Parking(['id' => $parkingId, 'name' => 'Test Parking']);
        
        $expectedStats = [
            'total_spots' => 100,
            'occupied_spots' => 75,
            'available_spots' => 25,
            'occupancy_rate' => 75.0
        ];

        // Configuration des mocks
        $this->mockRepository
            ->shouldReceive('findById')
            ->once()
            ->with($parkingId)
            ->andReturn($parking);

        $this->mockRepository
            ->shouldReceive('getStats')
            ->once()
            ->with($parking)
            ->andReturn($expectedStats);

        // ACT
        $response = $this->controller->stats($parkingId);

        // ASSERT
        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals(75.0, $responseData['occupancy_rate']);
        $this->assertEquals(100, $responseData['total_spots']);
    }

    /**
     * NETTOYAGE APRÈS CHAQUE TEST
     */
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

/*
 * AVANTAGES DES TESTS AVEC PATTERN REPOSITORY :
 * 
 * 1. ISOLATION COMPLÈTE :
 *    - Pas de dépendance à la base de données
 *    - Tests rapides et fiables
 *    - Pas d'effets de bord entre tests
 * 
 * 2. MOCKING FACILE :
 *    - Mock de l'interface repository
 *    - Contrôle total des données de test
 *    - Simulation de tous les scénarios
 * 
 * 3. FOCUS SUR LA LOGIQUE :
 *    - Test de la logique du contrôleur uniquement
 *    - Validation des interactions avec le repository
 *    - Vérification des réponses HTTP
 * 
 * 4. MAINTENABILITÉ :
 *    - Tests indépendants de l'implémentation du repository
 *    - Changement de repository sans impact sur les tests
 *    - Documentation vivante du comportement attendu
 * 
 * COMMANDES POUR EXÉCUTER LES TESTS :
 * 
 * php artisan test --filter=ParkingControllerTest
 * php artisan test tests/Unit/ParkingControllerTest.php
 * 
 * EXEMPLE DE SORTIE :
 * 
 * PASS  Tests\Unit\ParkingControllerTest
 * ✓ index returns all parkings
 * ✓ store creates new parking  
 * ✓ show returns existing parking
 * ✓ show returns 404 when parking not found
 * ✓ stats returns parking statistics
 * 
 * Tests:  5 passed
 * Time:   0.15s
 */