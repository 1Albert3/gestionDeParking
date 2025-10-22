# 🅿️ Système de Gestion de Parking - Parking Pro

## 📋 Vue d'ensemble du projet

**Parking Pro** est une application web moderne de gestion de parking développée avec une architecture N-tiers utilisant Laravel (backend) et React (frontend). Le système permet de gérer efficacement les parkings, places de stationnement, véhicules et abonnements.

## 🏗️ Architecture du projet

### Architecture N-tiers
- **Couche Présentation** : Interface utilisateur React avec Tailwind CSS
- **Couche Logique Métier** : API REST Laravel avec contrôleurs
- **Couche Accès aux Données** : Modèles Eloquent ORM
- **Couche Base de Données** : SQLite/MySQL avec migrations

## 🛠️ Technologies utilisées

### Backend (Laravel 12)
- **Framework** : Laravel 12.0
- **Authentification** : Laravel Sanctum (API tokens)
- **Base de données** : SQLite (par défaut) / MySQL
- **ORM** : Eloquent
- **Validation** : Laravel Validation
- **API** : RESTful API

### Frontend (React 19)
- **Framework** : React 19.2.0
- **Routage** : React Router DOM 7.9.4
- **Styles** : Tailwind CSS 4.0.0
- **Build** : Vite 7.0.7
- **HTTP Client** : Axios

### Outils de développement
- **PHP** : ^8.2
- **Node.js** : Pour la compilation des assets
- **Composer** : Gestionnaire de dépendances PHP
- **NPM** : Gestionnaire de dépendances JavaScript

## 📊 Modèle de données

### Entités principales

#### 1. Users (Utilisateurs)
```php
// app/Models/User.php
class User extends Authenticatable
{
    protected $fillable = ['name', 'email', 'password', 'role'];
    
    // Relations : Authentification avec Sanctum
}
```

#### 2. Parkings
```php
// app/Models/Parking.php
class Parking extends Model
{
    protected $fillable = ['name', 'location', 'total_spots'];
    
    // Relations
    public function spots() {
        return $this->hasMany(Spot::class);
    }
}
```

#### 3. Spots (Places de parking)
```php
// app/Models/Spot.php
class Spot extends Model
{
    protected $fillable = ['number', 'status', 'parking_id'];
    
    // Relations
    public function parking() {
        return $this->belongsTo(Parking::class);
    }
    
    public function vehicle() {
        return $this->hasOne(Vehicle::class);
    }
}
```

#### 4. Vehicles (Véhicules)
```php
// app/Models/Vehicle.php
class Vehicle extends Model
{
    protected $fillable = [
        'plate_number', 'brand', 'owner_name', 
        'spot_id', 'entry_time', 'exit_time'
    ];
    
    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
    ];
    
    // Relations
    public function spot() {
        return $this->belongsTo(Spot::class);
    }
    
    public function subscriptions() {
        return $this->hasMany(Subscription::class);
    }
}
```

#### 5. Subscriptions (Abonnements)
```php
// app/Models/Subscription.php
class Subscription extends Model
{
    protected $fillable = [
        'vehicle_id', 'type', 'start_date', 
        'end_date', 'price'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
    ];
    
    // Relations
    public function vehicle() {
        return $this->belongsTo(Vehicle::class);
    }
}
```

### Structure de la base de données

#### Table `users`
```sql
- id (bigint, primary key)
- name (varchar)
- email (varchar, unique)
- password (varchar, hashed)
- role (varchar)
- email_verified_at (timestamp)
- remember_token (varchar)
- created_at, updated_at (timestamps)
```

#### Table `parkings`
```sql
- id (bigint, primary key)
- name (varchar)
- location (varchar)
- total_spots (integer)
- created_at, updated_at (timestamps)
```

#### Table `spots`
```sql
- id (bigint, primary key)
- number (varchar)
- status (enum: 'available', 'occupied', 'reserved')
- parking_id (foreign key -> parkings.id)
- created_at, updated_at (timestamps)
```

#### Table `vehicles`
```sql
- id (bigint, primary key)
- plate_number (varchar, unique)
- brand (varchar)
- owner_name (varchar)
- spot_id (foreign key -> spots.id, nullable)
- entry_time (timestamp, nullable)
- exit_time (timestamp, nullable)
- created_at, updated_at (timestamps)
```

#### Table `subscriptions`
```sql
- id (bigint, primary key)
- vehicle_id (foreign key -> vehicles.id)
- type (enum: 'monthly', 'daily')
- start_date (date)
- end_date (date)
- price (decimal 8,2)
- created_at, updated_at (timestamps)
```

## 🔧 Backend - API Laravel

### Structure des contrôleurs

#### AuthController
```php
// app/Http/Controllers/Api/AuthController.php
class AuthController extends Controller
{
    // POST /api/login - Authentification utilisateur
    public function login(Request $request)
    
    // POST /api/logout - Déconnexion
    public function logout(Request $request)
    
    // GET /api/user - Informations utilisateur connecté
    public function user(Request $request)
}
```

#### ParkingController
```php
// app/Http/Controllers/Api/ParkingController.php
class ParkingController extends Controller
{
    // GET /api/parkings - Liste des parkings
    public function index()
    
    // POST /api/parkings - Créer un parking
    public function store(Request $request)
    
    // GET /api/parkings/{id} - Détails d'un parking
    public function show(Parking $parking)
    
    // PUT /api/parkings/{id} - Modifier un parking
    public function update(Request $request, Parking $parking)
    
    // DELETE /api/parkings/{id} - Supprimer un parking
    public function destroy(Parking $parking)
}
```

#### SpotController
```php
// app/Http/Controllers/Api/SpotController.php
class SpotController extends Controller
{
    // CRUD complet pour les places de parking
    // Gestion des statuts : available, occupied, reserved
}
```

#### VehicleController
```php
// app/Http/Controllers/Api/VehicleController.php
class VehicleController extends Controller
{
    // CRUD complet pour les véhicules
    // Gestion des heures d'entrée/sortie
    // Association avec les places
}
```

#### SubscriptionController
```php
// app/Http/Controllers/Api/SubscriptionController.php
class SubscriptionController extends Controller
{
    // CRUD complet pour les abonnements
    // Types : monthly, daily
    // Validation des dates et prix
}
```

#### DashboardController
```php
// app/Http/Controllers/Api/DashboardController.php
class DashboardController extends Controller
{
    // GET /api/dashboard/stats - Statistiques du tableau de bord
    public function stats()
    {
        return [
            'total_parkings' => Parking::count(),
            'total_spots' => Spot::count(),
            'occupied_spots' => Spot::where('status', 'occupied')->count(),
            'available_spots' => Spot::where('status', 'available')->count(),
            'occupancy_rate' => // Calcul du taux d'occupation
            'total_vehicles' => Vehicle::count(),
            'active_subscriptions' => // Abonnements actifs
        ];
    }
}
```

### Routes API
```php
// routes/api.php
// Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (middleware auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Resources CRUD
    Route::apiResource('parkings', ParkingController::class);
    Route::apiResource('spots', SpotController::class);
    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('subscriptions', SubscriptionController::class);
});
```

### Validation des données
Chaque contrôleur implémente une validation stricte :
- **Parkings** : nom, localisation, nombre de places
- **Places** : numéro, statut, parking associé
- **Véhicules** : plaque unique, marque, propriétaire
- **Abonnements** : véhicule, type, dates, prix

## 🎨 Frontend - Interface React

### Architecture des composants

#### Structure principale
```jsx
// resources/js/app.jsx
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="parkings" element={<Parkings />} />
                        <Route path="spots" element={<Spots />} />
                        <Route path="vehicles" element={<Vehicles />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}
```

#### Gestion de l'authentification
```jsx
// AuthContext intégré dans app.jsx
const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Fonctions : login, logout, fetchUser
    // Gestion du token JWT dans localStorage
    // Configuration automatique des headers Axios
}
```

#### Composants principaux

##### 1. Login
```jsx
function Login() {
    // Interface de connexion avec design moderne
    // Validation des champs email/password
    // Comptes de démonstration intégrés
    // Design : gradient background, glass effect
}
```

##### 2. Layout
```jsx
function Layout() {
    // Sidebar de navigation avec icônes
    // Profil utilisateur
    // Menu responsive
    // Design : gradient sidebar, animations
}
```

##### 3. Dashboard
```jsx
function Dashboard() {
    // Cartes statistiques animées
    // Métriques en temps réel :
    //   - Nombre de parkings
    //   - Places totales/occupées
    //   - Taux d'occupation
    //   - Véhicules enregistrés
    //   - Abonnements actifs
}
```

##### 4. Parkings
```jsx
function Parkings() {
    // Liste des parkings en cartes
    // Formulaire de création/modification
    // Actions : créer, modifier, supprimer
    // Affichage : nom, localisation, nombre de places
}
```

##### 5. Spots
```jsx
function Spots() {
    // Vue en grille des places par parking
    // Statuts visuels : vert (libre), rouge (occupé), orange (réservé)
    // Interaction : clic pour changer le statut
    // Légende explicative
}
```

##### 6. Vehicles
```jsx
function Vehicles() {
    // Gestion complète des véhicules
    // Formulaire : plaque, marque, propriétaire, place, heures
    // Affichage des informations de stationnement
    // Actions CRUD complètes
}
```

##### 7. Subscriptions
```jsx
function Subscriptions() {
    // Gestion des abonnements
    // Types : mensuel/journalier
    // Statut : actif/expiré
    // Calcul automatique des périodes
}
```

### Design et UX

#### Système de design
- **Couleurs** : Palette moderne avec gradients
- **Typographie** : Polices système optimisées
- **Icônes** : Emojis pour une interface ludique
- **Animations** : Transitions fluides, hover effects
- **Responsive** : Adaptation mobile/tablette/desktop

#### Effets visuels
```css
/* resources/css/app.css */
.glass {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

.gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

#### Animations
- **fade-in** : Apparition progressive des éléments
- **slide-in** : Glissement des formulaires
- **card-hover** : Élévation des cartes au survol
- **loading-spinner** : Indicateur de chargement

## 🚀 Installation et configuration

### Prérequis
- PHP >= 8.2
- Composer
- Node.js >= 16
- SQLite ou MySQL

### Installation

1. **Cloner le projet**
```bash
git clone [url-du-projet]
cd gestionDeParking/gestinDeParking
```

2. **Installation des dépendances PHP**
```bash
composer install
```

3. **Installation des dépendances JavaScript**
```bash
npm install
```

4. **Configuration de l'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configuration de la base de données**
```bash
# Créer la base SQLite
touch database/database.sqlite

# Ou configurer MySQL dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parking_db
DB_USERNAME=root
DB_PASSWORD=
```

6. **Migrations et données de test**
```bash
php artisan migrate
php artisan db:seed  # Si des seeders sont disponibles
```

7. **Compilation des assets**
```bash
npm run build  # Production
npm run dev    # Développement
```

8. **Lancement du serveur**
```bash
php artisan serve
```

### Scripts disponibles

#### Composer
```json
{
    "setup": "Installation complète automatique",
    "dev": "Serveur de développement avec hot reload",
    "test": "Exécution des tests"
}
```

#### NPM
```json
{
    "dev": "vite",
    "build": "vite build"
}
```

## 🔐 Authentification et sécurité

### Système d'authentification
- **Laravel Sanctum** : Tokens API sécurisés
- **Middleware** : Protection des routes sensibles
- **Validation** : Contrôle strict des entrées
- **Hachage** : Mots de passe sécurisés (bcrypt)

### Comptes de démonstration
```
Admin : admin@parking.com / password
Agent : agent@parking.com / password
```

### Sécurité
- Protection CSRF
- Validation des données
- Sanitisation des entrées
- Tokens d'authentification sécurisés

## 📱 Fonctionnalités

### Gestion des parkings
- ✅ Créer, modifier, supprimer des parkings
- ✅ Définir la localisation et le nombre de places
- ✅ Vue d'ensemble des parkings

### Gestion des places
- ✅ Visualisation en temps réel des places
- ✅ Statuts : libre, occupé, réservé
- ✅ Changement de statut par clic
- ✅ Organisation par parking

### Gestion des véhicules
- ✅ Enregistrement des véhicules
- ✅ Association aux places
- ✅ Suivi des heures d'entrée/sortie
- ✅ Informations propriétaire

### Gestion des abonnements
- ✅ Abonnements mensuels/journaliers
- ✅ Calcul automatique des périodes
- ✅ Suivi des statuts actif/expiré
- ✅ Gestion des prix

### Tableau de bord
- ✅ Statistiques en temps réel
- ✅ Taux d'occupation
- ✅ Métriques visuelles
- ✅ Vue d'ensemble du système

## 🎯 Points forts du projet

### Architecture
- **Séparation claire** : Backend API / Frontend SPA
- **Modularité** : Composants réutilisables
- **Scalabilité** : Architecture extensible
- **Maintenabilité** : Code structuré et documenté

### Technologies modernes
- **Laravel 12** : Framework PHP de pointe
- **React 19** : Interface utilisateur moderne
- **Tailwind CSS** : Design system cohérent
- **Vite** : Build tool performant

### Expérience utilisateur
- **Interface intuitive** : Navigation simple
- **Design moderne** : Effets visuels attractifs
- **Responsive** : Adaptation multi-écrans
- **Performance** : Chargement rapide

### Fonctionnalités métier
- **Gestion complète** : Tous les aspects du parking
- **Temps réel** : Statuts mis à jour instantanément
- **Flexibilité** : Différents types d'abonnements
- **Reporting** : Statistiques détaillées

## 🔄 Flux de données

### Authentification
1. Utilisateur saisit email/password
2. Frontend envoie POST /api/login
3. Backend valide et retourne token + user
4. Frontend stocke token et configure Axios
5. Toutes les requêtes incluent le token

### Gestion des entités
1. Frontend affiche les données (GET /api/resource)
2. Utilisateur interagit (formulaires, clics)
3. Frontend envoie requête API (POST/PUT/DELETE)
4. Backend valide et traite
5. Frontend met à jour l'interface

### Temps réel
- Actualisation automatique des statistiques
- Mise à jour des statuts de places
- Synchronisation des données

## 📈 Évolutions possibles

### Fonctionnalités avancées
- 🔄 Réservations en ligne
- 📧 Notifications email/SMS
- 💳 Paiement en ligne
- 📊 Rapports avancés
- 🔍 Recherche et filtres
- 📱 Application mobile

### Améliorations techniques
- 🔄 WebSockets pour le temps réel
- 🗄️ Cache Redis
- 📊 Monitoring et logs
- 🧪 Tests automatisés
- 🚀 Déploiement CI/CD
- 🔒 Authentification 2FA

## 👥 Rôles et permissions

### Administrateur
- Gestion complète des parkings
- Gestion des utilisateurs
- Accès aux statistiques
- Configuration système

### Agent
- Gestion des véhicules
- Gestion des places
- Gestion des abonnements
- Consultation des données

## 📞 Support et maintenance

### Structure du code
- **Backend** : `app/` (Models, Controllers)
- **Frontend** : `resources/js/` (Components)
- **Styles** : `resources/css/`
- **Routes** : `routes/api.php`, `routes/web.php`
- **Database** : `database/migrations/`

### Logs et debugging
- Laravel logs : `storage/logs/`
- Erreurs frontend : Console navigateur
- API testing : Postman/Insomnia

---

**Parking Pro** - Système de gestion de parking moderne et efficace
Développé avec ❤️ en Laravel & React