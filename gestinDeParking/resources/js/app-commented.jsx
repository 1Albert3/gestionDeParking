/**
 * APPLICATION REACT - SYSTÈME DE GESTION DE PARKING
 * 
 * Architecture : Single Page Application (SPA)
 * Pattern : Context API + Hooks + Functional Components
 * 
 * Structure :
 * - AuthProvider : Gestion globale de l'authentification
 * - Router : Navigation entre les pages
 * - Composants : Login, Dashboard, CRUD pages
 * 
 * Communication : Axios → Laravel API → MySQL
 */

// Import de la configuration Axios (communication avec Laravel)
import './bootstrap';

// Imports React essentiels
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Imports React Router pour la navigation SPA
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation, Outlet } from 'react-router-dom';

// Import Axios pour les requêtes HTTP
import axios from 'axios';

/*
|--------------------------------------------------------------------------
| SYSTÈME D'AUTHENTIFICATION GLOBAL (Context API)
|--------------------------------------------------------------------------
| Pattern : Context + Provider pour partager l'état d'authentification
| dans toute l'application sans prop drilling
*/

/**
 * CONTEXTE D'AUTHENTIFICATION
 * 
 * Crée un "conteneur" global pour stocker :
 * - L'utilisateur connecté
 * - Les fonctions de connexion/déconnexion
 * - L'état de chargement
 */
const AuthContext = createContext();

/**
 * HOOK PERSONNALISÉ POUR ACCÉDER AU CONTEXTE
 * 
 * Simplifie l'utilisation du contexte dans les composants
 * Usage : const { user, login, logout } = useAuth();
 */
const useAuth = () => useContext(AuthContext);

/**
 * PROVIDER D'AUTHENTIFICATION
 * 
 * Composant qui englobe toute l'application et fournit
 * les fonctionnalités d'authentification à tous les enfants
 * 
 * Responsabilités :
 * - Gérer l'état de l'utilisateur connecté
 * - Persister la session (localStorage + token)
 * - Fournir les méthodes login/logout
 * - Vérifier automatiquement la session au démarrage
 */
function AuthProvider({ children }) {
    
    /*
     * ÉTATS LOCAUX DU PROVIDER
     */
    
    // Utilisateur connecté (null si non connecté)
    const [user, setUser] = useState(null);
    
    // État de chargement (true pendant la vérification initiale)
    const [loading, setLoading] = useState(true);

    /**
     * VÉRIFICATION AUTOMATIQUE AU DÉMARRAGE
     * 
     * useEffect avec tableau vide [] = exécuté une seule fois au montage
     * Vérifie si un token existe dans localStorage
     */
    useEffect(() => {
        // Récupération du token stocké localement
        const token = localStorage.getItem('token');
        
        if (token) {
            // Si token existe : configuration d'Axios et vérification utilisateur
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser(); // Récupère les infos utilisateur depuis l'API
        } else {
            // Si pas de token : arrêt du chargement
            setLoading(false);
        }
    }, []); // Tableau vide = exécution unique

    /**
     * RÉCUPÉRATION DES INFORMATIONS UTILISATEUR
     * 
     * Fonction asynchrone qui vérifie la validité du token
     * en récupérant les infos utilisateur depuis l'API
     */
    const fetchUser = async () => {
        try {
            // Requête GET vers Laravel pour récupérer l'utilisateur connecté
            const response = await axios.get('/api/user');
            
            // Si succès : stockage de l'utilisateur
            setUser(response.data);
            
        } catch (error) {
            // Si erreur (token invalide/expiré) : nettoyage
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            
        } finally {
            // Dans tous les cas : arrêt du chargement
            setLoading(false);
        }
    };
    
    /**
     * FONCTION DE CONNEXION
     * 
     * Processus complet d'authentification :
     * 1. Envoi des identifiants à Laravel
     * 2. Réception user + token
     * 3. Stockage local et configuration Axios
     * 4. Mise à jour de l'état global
     */
    const login = async (email, password) => {
        // ÉTAPE 1 : Requête de connexion vers Laravel
        const response = await axios.post('/api/login', { email, password });
        
        // ÉTAPE 2 : Extraction des données de réponse
        const { user: userData, token } = response.data;
        
        // ÉTAPE 3 : Stockage de l'utilisateur dans l'état React
        setUser(userData);
        
        // ÉTAPE 4 : Persistance du token dans le navigateur
        localStorage.setItem('token', token);
        
        // ÉTAPE 5 : Configuration d'Axios pour les futures requêtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // ÉTAPE 6 : Retour de l'utilisateur (optionnel)
        return userData;
    };

    /**
     * FONCTION DE DÉCONNEXION
     * 
     * Nettoyage complet de la session :
     * 1. Suppression de l'état utilisateur
     * 2. Suppression du token local
     * 3. Suppression des headers Axios
     */
    const logout = () => {
        // Réinitialisation de l'état utilisateur
        setUser(null);
        
        // Suppression du token du navigateur
        localStorage.removeItem('token');
        
        // Suppression des headers d'authentification
        delete axios.defaults.headers.common['Authorization'];
    };

    /**
     * RENDU DU PROVIDER
     * 
     * Fournit les valeurs du contexte à tous les composants enfants
     * Condition : n'affiche les enfants que quand le chargement est terminé
     */
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

/**
 * COMPOSANT DE CONNEXION
 * 
 * Interface de login avec :
 * - Formulaire email/password
 * - Gestion des états (chargement, erreurs)
 * - Redirection après connexion réussie
 * - Design moderne avec Tailwind CSS
 */
function Login() {
    
    /*
     * ÉTATS LOCAUX DU COMPOSANT
     */
    
    // Champs du formulaire (controlled components)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // État de chargement pour le bouton de soumission
    const [loading, setLoading] = useState(false);
    
    /*
     * HOOKS POUR LES FONCTIONNALITÉS
     */
    
    // Accès aux fonctions d'authentification
    const { login } = useAuth();
    
    // Hook de navigation pour rediriger après connexion
    const navigate = useNavigate();

    /**
     * GESTIONNAIRE DE SOUMISSION DU FORMULAIRE
     * 
     * Processus :
     * 1. Prévention du rechargement de page
     * 2. Activation du loading
     * 3. Tentative de connexion
     * 4. Redirection si succès, erreur si échec
     * 5. Désactivation du loading
     */
    const handleSubmit = async (e) => {
        // ÉTAPE 1 : Empêcher le comportement par défaut du formulaire
        e.preventDefault();
        
        // ÉTAPE 2 : Activation de l'état de chargement
        setLoading(true);
        
        try {
            // ÉTAPE 3 : Tentative de connexion
            await login(email, password);
            
            // ÉTAPE 4 : Redirection vers le dashboard si succès
            navigate('/');
            
        } catch (error) {
            // ÉTAPE 5 : Affichage d'erreur si échec
            alert('Erreur de connexion');
            
        } finally {
            // ÉTAPE 6 : Désactivation du loading dans tous les cas
            setLoading(false);
        }
    };

    /**
     * RENDU DU COMPOSANT LOGIN
     * 
     * Interface avec :
     * - Design glassmorphism
     * - Formulaire contrôlé
     * - États de chargement
     * - Comptes de démonstration
     */
    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8 shadow-2xl fade-in">
                    
                    {/* EN-TÊTE AVEC LOGO ET TITRE */}
                    <div className="text-center mb-8">
                        <div className="text-7xl mb-6 animate-bounce">🅿️</div>
                        <h1 className="text-4xl font-bold text-white mb-3">Parking Pro</h1>
                        <p className="text-blue-100 text-lg">Gestion intelligente de parking</p>
                    </div>
                    
                    {/* FORMULAIRE DE CONNEXION */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* CHAMP EMAIL */}
                        <div>
                            <input
                                type="email"
                                placeholder="Adresse email"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-white/90 text-gray-800 placeholder-gray-500 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Controlled component
                                required
                            />
                        </div>
                        
                        {/* CHAMP MOT DE PASSE */}
                        <div>
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-white/90 text-gray-800 placeholder-gray-500 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Controlled component
                                required
                            />
                        </div>
                        
                        {/* BOUTON DE SOUMISSION */}
                        <button 
                            type="submit" 
                            disabled={loading} // Désactivé pendant le chargement
                            className="btn-primary w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                // Affichage pendant le chargement
                                <div className="flex items-center justify-center">
                                    <div className="loading-spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                    Connexion...
                                </div>
                            ) : (
                                // Affichage normal
                                'Se connecter'
                            )}
                        </button>
                    </form>
                    
                    {/* COMPTES DE DÉMONSTRATION */}
                    <div className="mt-8 glass rounded-2xl p-4">
                        <p className="text-white font-semibold mb-3 text-center">🔑 Comptes de démonstration</p>
                        <div className="text-blue-100 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>👨💼 Admin:</span>
                                <span>admin@parking.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span>👤 Agent:</span>
                                <span>agent@parking.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🔐 Mot de passe:</span>
                                <span>password</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
 * FLUX COMPLET D'AUTHENTIFICATION :
 * 
 * 1. DÉMARRAGE APPLICATION :
 *    - AuthProvider vérifie localStorage
 *    - Si token → fetchUser() → setUser()
 *    - Si pas token → affichage Login
 * 
 * 2. PROCESSUS DE CONNEXION :
 *    - User saisit email/password
 *    - handleSubmit() → login() → axios.post('/api/login')
 *    - Laravel vérifie → retourne user + token
 *    - Stockage localStorage + état React
 *    - Redirection vers dashboard
 * 
 * 3. REQUÊTES AUTHENTIFIÉES :
 *    - Axios configuré avec Bearer token
 *    - Toutes les requêtes incluent automatiquement l'authentification
 *    - Middleware Laravel vérifie le token
 * 
 * 4. DÉCONNEXION :
 *    - logout() nettoie tout
 *    - Redirection automatique vers login
 * 
 * AVANTAGES DE CETTE ARCHITECTURE :
 * - État global partagé (pas de prop drilling)
 * - Persistance de session
 * - Sécurité par tokens
 * - UX fluide (SPA)
 * - Code réutilisable et maintenable
 */