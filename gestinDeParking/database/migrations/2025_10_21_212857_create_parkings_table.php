<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MIGRATION - CRÉATION DE LA TABLE PARKINGS
 * 
 * Les migrations Laravel permettent de :
 * - Versionner la structure de la base de données
 * - Créer/modifier/supprimer des tables et colonnes
 * - Partager la structure entre développeurs
 * - Déployer facilement en production
 * 
 * Commandes :
 * - php artisan migrate : Exécute les migrations
 * - php artisan migrate:rollback : Annule la dernière migration
 * - php artisan migrate:fresh : Recrée toute la base
 */
return new class extends Migration
{
    /**
     * MÉTHODE UP - CRÉATION DE LA TABLE
     * 
     * Exécutée lors de php artisan migrate
     * Définit la structure de la table parkings
     */
    public function up(): void
    {
        // Création de la table 'parkings'
        Schema::create('parkings', function (Blueprint $table) {
            
            /*
             * COLONNE ID - CLÉ PRIMAIRE
             * 
             * $table->id() crée :
             * - Une colonne 'id' de type BIGINT UNSIGNED
             * - AUTO_INCREMENT
             * - PRIMARY KEY
             * - NOT NULL
             */
            $table->id();
            
            /*
             * COLONNE NAME - NOM DU PARKING
             * 
             * $table->string('name') crée :
             * - Une colonne 'name' de type VARCHAR(255)
             * - NOT NULL par défaut
             * - Stocke le nom du parking (ex: "Centre Ville")
             */
            $table->string('name');
            
            /*
             * COLONNE LOCATION - LOCALISATION
             * 
             * $table->string('location') crée :
             * - Une colonne 'location' de type VARCHAR(255)
             * - NOT NULL par défaut
             * - Stocke l'adresse (ex: "Rue de la Paix, Paris")
             */
            $table->string('location');
            
            /*
             * COLONNE TOTAL_SPOTS - NOMBRE DE PLACES
             * 
             * $table->integer('total_spots') crée :
             * - Une colonne 'total_spots' de type INT
             * - NOT NULL par défaut
             * - Stocke le nombre total de places du parking
             */
            $table->integer('total_spots');
            
            /*
             * COLONNES TIMESTAMPS - HORODATAGE
             * 
             * $table->timestamps() crée automatiquement :
             * - created_at : TIMESTAMP de création
             * - updated_at : TIMESTAMP de dernière modification
             * - Gérées automatiquement par Eloquent
             */
            $table->timestamps();
        });
    }

    /**
     * MÉTHODE DOWN - SUPPRESSION DE LA TABLE
     * 
     * Exécutée lors de php artisan migrate:rollback
     * Annule les changements de la méthode up()
     */
    public function down(): void
    {
        // Suppression de la table 'parkings' si elle existe
        Schema::dropIfExists('parkings');
    }
};

/*
 * STRUCTURE SQL GÉNÉRÉE :
 * 
 * CREATE TABLE `parkings` (
 *   `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 *   `name` varchar(255) NOT NULL,
 *   `location` varchar(255) NOT NULL,
 *   `total_spots` int(11) NOT NULL,
 *   `created_at` timestamp NULL DEFAULT NULL,
 *   `updated_at` timestamp NULL DEFAULT NULL,
 *   PRIMARY KEY (`id`)
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 * 
 * EXEMPLE DE DONNÉES :
 * 
 * | id | name         | location              | total_spots | created_at          | updated_at          |
 * |----|-------------|-----------------------|-------------|---------------------|---------------------|
 * | 1  | Centre Ville | Rue de la Paix, Paris| 50          | 2024-01-15 10:30:00 | 2024-01-15 10:30:00 |
 * | 2  | Gare du Nord | Place Napoléon III    | 100         | 2024-01-15 11:00:00 | 2024-01-15 11:00:00 |
 * 
 * RELATIONS AVEC D'AUTRES TABLES :
 * 
 * parkings (1) ←→ (N) spots
 * - Un parking peut avoir plusieurs places
 * - Clé étrangère : parking_id dans la table spots
 * - Relation définie dans le modèle Eloquent
 * 
 * BONNES PRATIQUES :
 * - Noms de tables au pluriel (parkings, spots, vehicles)
 * - Noms de colonnes en snake_case (total_spots, created_at)
 * - Toujours inclure timestamps() pour l'audit
 * - Méthode down() pour pouvoir annuler la migration
 */