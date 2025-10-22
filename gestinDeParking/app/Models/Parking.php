<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * MODÈLE ELOQUENT - PARKING
 * 
 * Représente un espace de stationnement dans le système
 * Pattern : Active Record (Eloquent ORM)
 * 
 * Responsabilités :
 * - Définir la structure des données
 * - Gérer les relations avec d'autres modèles
 * - Protéger contre les mass assignments
 * - Fournir une interface pour les opérations CRUD
 * 
 * Table associée : parkings
 * Relations : Un parking a plusieurs places (spots)
 */
class Parking extends Model
{
    use HasFactory; // Trait pour les factories (génération de données de test)

    /**
     * CHAMPS AUTORISÉS POUR L'ASSIGNATION EN MASSE
     * 
     * Sécurité : Seuls ces champs peuvent être remplis via create() ou update()
     * Protection contre les attaques de mass assignment
     * 
     * @var array<string>
     */
    protected $fillable = [
        'name',         // Nom du parking (ex: "Centre Ville")
        'location',     // Adresse/localisation (ex: "Rue de la Paix, Paris")
        'total_spots',  // Nombre total de places disponibles
    ];

    /**
     * RELATION : UN PARKING A PLUSIEURS PLACES
     * 
     * Type : One-to-Many (1:N)
     * Clé étrangère : parking_id dans la table spots
     * 
     * Utilisation :
     * - $parking->spots : Récupère toutes les places du parking
     * - $parking->spots()->where('status', 'available')->get() : Places disponibles
     * - $parking->spots()->count() : Nombre de places créées
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function spots()
    {
        return $this->hasMany(Spot::class);
    }

    /**
     * MÉTHODES UTILITAIRES (optionnelles)
     * 
     * Ces méthodes peuvent être ajoutées pour la logique métier
     */

    /**
     * Calcule le nombre de places disponibles
     * 
     * @return int
     */
    public function getAvailableSpotsCountAttribute()
    {
        return $this->spots()->where('status', 'available')->count();
    }

    /**
     * Calcule le taux d'occupation du parking
     * 
     * @return float
     */
    public function getOccupancyRateAttribute()
    {
        $totalSpots = $this->spots()->count();
        if ($totalSpots === 0) return 0;
        
        $occupiedSpots = $this->spots()->where('status', 'occupied')->count();
        return round(($occupiedSpots / $totalSpots) * 100, 2);
    }

    /**
     * Vérifie si le parking a encore des places disponibles
     * 
     * @return bool
     */
    public function hasAvailableSpots()
    {
        return $this->spots()->where('status', 'available')->exists();
    }
}

/*
 * UTILISATION DANS LES CONTRÔLEURS :
 * 
 * 1. CRÉATION :
 *    $parking = Parking::create([
 *        'name' => 'Centre Ville',
 *        'location' => 'Rue de la Paix',
 *        'total_spots' => 50
 *    ]);
 * 
 * 2. LECTURE :
 *    $parkings = Parking::all();                    // Tous les parkings
 *    $parking = Parking::find(1);                   // Parking par ID
 *    $parking = Parking::with('spots')->find(1);   // Avec les places
 * 
 * 3. MODIFICATION :
 *    $parking->update(['name' => 'Nouveau nom']);
 * 
 * 4. SUPPRESSION :
 *    $parking->delete();
 * 
 * 5. RELATIONS :
 *    $parking->spots;                    // Places du parking
 *    $parking->spots()->count();         // Nombre de places
 *    $parking->available_spots_count;    // Utilise l'accessor
 * 
 * AVANTAGES D'ELOQUENT :
 * - Syntaxe intuitive et expressive
 * - Relations automatiques
 * - Protection contre les injections SQL
 * - Gestion automatique des timestamps
 * - Accessors et mutators pour la logique métier
 */