import './bootstrap';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/user');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };
    
    const login = async (email, password) => {
        const response = await axios.post('/api/login', { email, password });
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response.data.user;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            alert('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8 shadow-2xl fade-in">
                    <div className="text-center mb-8">
                        <div className="text-7xl mb-6 animate-bounce">🅿️</div>
                        <h1 className="text-4xl font-bold text-white mb-3">Parking Pro</h1>
                        <p className="text-blue-100 text-lg">Gestion intelligente de parking</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                placeholder="Adresse email"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-white/90 text-gray-800 placeholder-gray-500 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-white/90 text-gray-800 placeholder-gray-500 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="loading-spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                    Connexion...
                                </div>
                            ) : 'Se connecter'}
                        </button>
                    </form>
                    
                    <div className="mt-8 glass rounded-2xl p-4">
                        <p className="text-white font-semibold mb-3 text-center">🔑 Comptes de démonstration</p>
                        <div className="text-blue-100 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>👨‍💼 Admin:</span>
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

function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
        { name: 'Parkings', href: '/parkings', icon: '🏢', gradient: 'from-green-500 to-green-600' },
        { name: 'Places', href: '/spots', icon: '🅿️', gradient: 'from-yellow-500 to-orange-500' },
        { name: 'Véhicules', href: '/vehicles', icon: '🚗', gradient: 'from-red-500 to-pink-500' },
        { name: 'Abonnements', href: '/subscriptions', icon: '📋', gradient: 'from-purple-500 to-indigo-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="sidebar w-64 min-h-screen shadow-2xl">
                    <div className="p-6">
                        <div className="flex items-center mb-8">
                            <span className="text-4xl mr-3">🅿️</span>
                            <div>
                                <h1 className="text-xl font-bold text-white">Parking Pro</h1>
                                <p className="text-blue-200 text-sm">Gestion avancée</p>
                            </div>
                        </div>
                        
                        <nav className="space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`nav-item flex items-center px-4 py-3 rounded-xl text-white font-medium ${
                                        location.pathname === item.href
                                            ? 'bg-white/20 shadow-lg'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <span className="text-2xl mr-4">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="absolute bottom-0 w-64 p-6">
                        <div className="glass rounded-xl p-4 mb-4">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user?.name}</p>
                                    <p className="text-blue-200 text-sm capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                        >
                            🚪 Déconnexion
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const statCards = [
        { title: 'Parkings', value: stats?.total_parkings || 0, icon: '🏢', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-500' },
        { title: 'Places Totales', value: stats?.total_spots || 0, icon: '🅿️', gradient: 'from-green-500 to-green-600', border: 'border-green-500' },
        { title: 'Places Occupées', value: stats?.occupied_spots || 0, icon: '🔴', gradient: 'from-red-500 to-red-600', border: 'border-red-500' },
        { title: 'Taux d\'Occupation', value: `${stats?.occupancy_rate || 0}%`, icon: '📊', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-500' },
        { title: 'Véhicules', value: stats?.total_vehicles || 0, icon: '🚗', gradient: 'from-yellow-500 to-orange-500', border: 'border-yellow-500' },
        { title: 'Abonnements', value: stats?.active_subscriptions || 0, icon: '📋', gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-500' },
    ];

    return (
        <div className="fade-in">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">📊 Tableau de bord</h1>
                <p className="text-gray-600 text-lg">Vue d'ensemble de votre système de parking</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {statCards.map((card, index) => (
                    <div key={index} className={`stat-card card-hover rounded-2xl p-6 shadow-lg ${card.border}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium mb-2">{card.title}</p>
                                <p className="text-4xl font-bold text-gray-800">{card.value}</p>
                            </div>
                            <div className={`text-5xl p-4 rounded-2xl bg-gradient-to-r ${card.gradient} text-white shadow-xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Parkings() {
    const [parkings, setParkings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '', total_spots: '' });

    useEffect(() => {
        fetchParkings();
    }, []);

    const fetchParkings = async () => {
        try {
            const response = await axios.get('/api/parkings');
            setParkings(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/parkings/${editingId}`, formData);
            } else {
                await axios.post('/api/parkings', formData);
            }
            fetchParkings();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEdit = (parking) => {
        setFormData({ name: parking.name, location: parking.location, total_spots: parking.total_spots });
        setEditingId(parking.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Supprimer ce parking ?')) {
            try {
                await axios.delete(`/api/parkings/${id}`);
                fetchParkings();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', location: '', total_spots: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">🏢 Gestion des Parkings</h1>
                    <p className="text-gray-600 text-lg">Gérez vos espaces de stationnement</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl flex items-center"
                >
                    <span className="text-2xl mr-3">➕</span>
                    Nouveau Parking
                </button>
            </div>

            {showForm && (
                <div className="slide-in bg-white rounded-3xl shadow-2xl p-8 mb-10 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="text-3xl mr-3">🏗️</span>
                        {editingId ? 'Modifier' : 'Créer'} un parking
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">📝 Nom du parking</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">📍 Localisation</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🔢 Nombre de places</label>
                            <input
                                type="number"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.total_spots}
                                onChange={(e) => setFormData({...formData, total_spots: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300">
                                ✅ {editingId ? 'Modifier' : 'Créer'}
                            </button>
                            <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-4 rounded-2xl font-bold transition-all duration-300">
                                ❌ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {parkings.map((parking) => (
                    <div key={parking.id} className="parking-card card-hover rounded-3xl p-8 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl mr-4 text-3xl">
                                    🏢
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{parking.name}</h3>
                                    <p className="text-gray-600 flex items-center mt-1">
                                        <span className="mr-2">📍</span>
                                        {parking.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium flex items-center">
                                    <span className="mr-2">🅿️</span>
                                    Places totales
                                </span>
                                <span className="text-3xl font-bold text-gray-800">{parking.total_spots}</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => handleEdit(parking)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                ✏️ Modifier
                            </button>
                            <button onClick={() => handleDelete(parking.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Spots() {
    const [spots, setSpots] = useState([]);
    const [parkings, setParkings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ number: '', parking_id: '', status: 'available' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [spotsRes, parkingsRes] = await Promise.all([
                axios.get('/api/spots'),
                axios.get('/api/parkings')
            ]);
            setSpots(spotsRes.data);
            setParkings(parkingsRes.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/spots', formData);
            fetchData();
            setFormData({ number: '', parking_id: '', status: 'available' });
            setShowForm(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateSpotStatus = async (spotId, newStatus) => {
        try {
            await axios.put(`/api/spots/${spotId}`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">🅿️ Gestion des Places</h1>
                    <p className="text-gray-600 text-lg">Visualisez et gérez l'état des places</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center hover:shadow-2xl transition-all duration-300"
                >
                    <span className="text-2xl mr-3">➕</span>
                    Nouvelle Place
                </button>
            </div>

            {showForm && (
                <div className="slide-in bg-white rounded-3xl shadow-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="text-3xl mr-3">🆕</span>
                        Créer une nouvelle place
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🔢 Numéro de place</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.number}
                                onChange={(e) => setFormData({...formData, number: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🏢 Parking</label>
                            <select
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.parking_id}
                                onChange={(e) => setFormData({...formData, parking_id: e.target.value})}
                                required
                            >
                                <option value="">Sélectionner un parking</option>
                                {parkings.map(parking => (
                                    <option key={parking.id} value={parking.id}>{parking.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300">
                                ✅ Créer
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-4 rounded-2xl font-bold transition-all duration-300">
                                ❌ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {parkings.map((parking) => (
                <div key={parking.id} className="mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <span className="text-3xl mr-3">🏢</span>
                            {parking.name}
                            <span className="ml-3 text-lg text-gray-600">📍 {parking.location}</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                        {spots.filter(spot => spot.parking_id === parking.id).map((spot) => (
                            <div
                                key={spot.id}
                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                                    spot.status === 'available' ? 'spot-available' :
                                    spot.status === 'occupied' ? 'spot-occupied' : 'spot-reserved'
                                }`}
                                onClick={() => {
                                    const newStatus = spot.status === 'available' ? 'occupied' : 'available';
                                    updateSpotStatus(spot.id, newStatus);
                                }}
                            >
                                <div className="text-center">
                                    <div className="font-bold text-xl mb-1">{spot.number}</div>
                                    <div className="text-xs font-medium capitalize">
                                        {spot.status === 'available' ? '✅ Libre' :
                                         spot.status === 'occupied' ? '🚗 Occupée' : '⏳ Réservée'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <span className="text-2xl mr-3">ℹ️</span>
                    Guide d'utilisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                        <div className="spot-available w-12 h-12 rounded-xl mr-4 flex items-center justify-center font-bold">✅</div>
                        <span className="text-blue-800 font-medium">Place disponible</span>
                    </div>
                    <div className="flex items-center">
                        <div className="spot-occupied w-12 h-12 rounded-xl mr-4 flex items-center justify-center font-bold">🚗</div>
                        <span className="text-blue-800 font-medium">Place occupée</span>
                    </div>
                    <div className="flex items-center">
                        <div className="spot-reserved w-12 h-12 rounded-xl mr-4 flex items-center justify-center font-bold">⏳</div>
                        <span className="text-blue-800 font-medium">Place réservée</span>
                    </div>
                </div>
                <p className="text-blue-700 mt-4 font-medium">
                    💡 Cliquez sur une place pour changer son statut entre disponible et occupée.
                </p>
            </div>
        </div>
    );
}

function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [spots, setSpots] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        plate_number: '', brand: '', owner_name: '', spot_id: '', entry_time: '', exit_time: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vehiclesRes, spotsRes] = await Promise.all([
                axios.get('/api/vehicles'),
                axios.get('/api/spots')
            ]);
            setVehicles(vehiclesRes.data);
            setSpots(spotsRes.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData };
            if (!data.spot_id) data.spot_id = null;
            if (!data.entry_time) data.entry_time = null;
            if (!data.exit_time) data.exit_time = null;

            if (editingId) {
                await axios.put(`/api/vehicles/${editingId}`, data);
            } else {
                await axios.post('/api/vehicles', data);
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEdit = (vehicle) => {
        setFormData({
            plate_number: vehicle.plate_number,
            brand: vehicle.brand,
            owner_name: vehicle.owner_name,
            spot_id: vehicle.spot_id || '',
            entry_time: vehicle.entry_time ? vehicle.entry_time.slice(0, 16) : '',
            exit_time: vehicle.exit_time ? vehicle.exit_time.slice(0, 16) : ''
        });
        setEditingId(vehicle.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Supprimer ce véhicule ?')) {
            try {
                await axios.delete(`/api/vehicles/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ plate_number: '', brand: '', owner_name: '', spot_id: '', entry_time: '', exit_time: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">🚗 Gestion des Véhicules</h1>
                    <p className="text-gray-600 text-lg">Gérez les véhicules et leurs informations</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center hover:shadow-2xl transition-all duration-300"
                >
                    <span className="text-2xl mr-3">➕</span>
                    Nouveau Véhicule
                </button>
            </div>

            {showForm && (
                <div className="slide-in bg-white rounded-3xl shadow-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="text-3xl mr-3">🚙</span>
                        {editingId ? 'Modifier' : 'Enregistrer'} un véhicule
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🔤 Plaque d'immatriculation</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.plate_number}
                                onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🏭 Marque</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">👤 Propriétaire</label>
                            <input
                                type="text"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.owner_name}
                                onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🅿️ Place assignée</label>
                            <select
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.spot_id}
                                onChange={(e) => setFormData({...formData, spot_id: e.target.value})}
                            >
                                <option value="">Aucune place assignée</option>
                                {spots.filter(spot => spot.status === 'available' || spot.id == formData.spot_id).map(spot => (
                                    <option key={spot.id} value={spot.id}>
                                        {spot.parking?.name} - Place {spot.number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🕐 Heure d'entrée</label>
                            <input
                                type="datetime-local"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.entry_time}
                                onChange={(e) => setFormData({...formData, entry_time: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🕐 Heure de sortie</label>
                            <input
                                type="datetime-local"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.exit_time}
                                onChange={(e) => setFormData({...formData, exit_time: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2 flex space-x-4 pt-4">
                            <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300">
                                ✅ {editingId ? 'Modifier' : 'Enregistrer'}
                            </button>
                            <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-4 rounded-2xl font-bold transition-all duration-300">
                                ❌ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="parking-card card-hover rounded-3xl p-8 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-2xl mr-4 text-3xl">
                                    🚗
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{vehicle.plate_number}</h3>
                                    <p className="text-gray-600 flex items-center mt-1">
                                        <span className="mr-2">🏭</span>
                                        {vehicle.brand}
                                    </p>
                                    <p className="text-gray-600 flex items-center mt-1">
                                        <span className="mr-2">👤</span>
                                        {vehicle.owner_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {vehicle.spot && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-200">
                                <p className="text-blue-800 font-medium flex items-center">
                                    <span className="mr-2">🅿️</span>
                                    {vehicle.spot.parking?.name} - Place {vehicle.spot.number}
                                </p>
                            </div>
                        )}
                        {vehicle.entry_time && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
                                <p className="text-green-800 font-medium flex items-center">
                                    <span className="mr-2">🕐</span>
                                    Entrée: {new Date(vehicle.entry_time).toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div className="flex space-x-3">
                            <button onClick={() => handleEdit(vehicle)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                ✏️ Modifier
                            </button>
                            <button onClick={() => handleDelete(vehicle.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        vehicle_id: '', type: 'monthly', start_date: '', end_date: '', price: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subscriptionsRes, vehiclesRes] = await Promise.all([
                axios.get('/api/subscriptions'),
                axios.get('/api/vehicles')
            ]);
            setSubscriptions(subscriptionsRes.data);
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/subscriptions/${editingId}`, formData);
            } else {
                await axios.post('/api/subscriptions', formData);
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEdit = (subscription) => {
        setFormData({
            vehicle_id: subscription.vehicle_id,
            type: subscription.type,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            price: subscription.price
        });
        setEditingId(subscription.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Supprimer cet abonnement ?')) {
            try {
                await axios.delete(`/api/subscriptions/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ vehicle_id: '', type: 'monthly', start_date: '', end_date: '', price: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const isActive = (subscription) => {
        return new Date(subscription.end_date) >= new Date();
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">📋 Gestion des Abonnements</h1>
                    <p className="text-gray-600 text-lg">Gérez les abonnements mensuels et journaliers</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center hover:shadow-2xl transition-all duration-300"
                >
                    <span className="text-2xl mr-3">➕</span>
                    Nouvel Abonnement
                </button>
            </div>

            {showForm && (
                <div className="slide-in bg-white rounded-3xl shadow-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="text-3xl mr-3">📝</span>
                        {editingId ? 'Modifier' : 'Créer'} un abonnement
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">🚗 Véhicule</label>
                            <select
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.vehicle_id}
                                onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                                required
                            >
                                <option value="">Sélectionner un véhicule</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.plate_number} - {vehicle.owner_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">📅 Type d'abonnement</label>
                            <select
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="monthly">📅 Mensuel</option>
                                <option value="daily">📆 Journalier</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">📅 Date de début</label>
                            <input
                                type="date"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-3">📅 Date de fin</label>
                            <input
                                type="date"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-3">💰 Prix (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input w-full px-6 py-4 rounded-2xl bg-gray-50"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex space-x-4 pt-4">
                            <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300">
                                ✅ {editingId ? 'Modifier' : 'Créer'}
                            </button>
                            <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-4 rounded-2xl font-bold transition-all duration-300">
                                ❌ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="parking-card card-hover rounded-3xl p-8 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-2xl mr-4 text-3xl">
                                    📋
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{subscription.vehicle?.plate_number}</h3>
                                    <p className="text-gray-600 flex items-center mt-1">
                                        <span className="mr-2">👤</span>
                                        {subscription.vehicle?.owner_name}
                                    </p>
                                    <span className={`inline-block px-4 py-2 text-sm font-bold rounded-full mt-2 ${
                                        isActive(subscription) 
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' 
                                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-300'
                                    }`}>
                                        {isActive(subscription) ? '✅ Actif' : '❌ Expiré'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium flex items-center">
                                    <span className="mr-2">📅</span>
                                    Type
                                </span>
                                <span className="font-bold text-gray-800">
                                    {subscription.type === 'monthly' ? '📅 Mensuel' : '📆 Journalier'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium flex items-center">
                                    <span className="mr-2">💰</span>
                                    Prix
                                </span>
                                <span className="font-bold text-gray-800">{subscription.price}€</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium flex items-center">
                                    <span className="mr-2">📅</span>
                                    Période
                                </span>
                                <span className="font-bold text-gray-800 text-sm">
                                    {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => handleEdit(subscription)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                ✏️ Modifier
                            </button>
                            <button onClick={() => handleDelete(subscription.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

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

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}