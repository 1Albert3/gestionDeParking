import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        plate_number: '',
        brand: '',
        owner_name: '',
        spot_id: '',
        entry_time: '',
        exit_time: ''
    });
    const [editingId, setEditingId] = useState(null);

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
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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
            console.error('Error saving vehicle:', error);
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
        if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
            try {
                await axios.delete(`/api/vehicles/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting vehicle:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            plate_number: '',
            brand: '',
            owner_name: '',
            spot_id: '',
            entry_time: '',
            exit_time: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="text-center py-8">Chargement...</div>;

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Véhicules</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                    Ajouter un Véhicule
                </button>
            </div>

            {showForm && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">
                        {editingId ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plaque d'immatriculation</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.plate_number}
                                onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marque</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du propriétaire</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.owner_name}
                                onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Place de parking</label>
                            <select
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                            <label className="block text-sm font-medium text-gray-700">Heure d'entrée</label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.entry_time}
                                onChange={(e) => setFormData({...formData, entry_time: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Heure de sortie</label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.exit_time}
                                onChange={(e) => setFormData({...formData, exit_time: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2 flex space-x-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                            >
                                {editingId ? 'Modifier' : 'Ajouter'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                        <li key={vehicle.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{vehicle.plate_number}</h3>
                                    <p className="text-sm text-gray-500">{vehicle.brand} - {vehicle.owner_name}</p>
                                    {vehicle.spot && (
                                        <p className="text-sm text-gray-500">
                                            Place: {vehicle.spot.parking?.name} - {vehicle.spot.number}
                                        </p>
                                    )}
                                    {vehicle.entry_time && (
                                        <p className="text-sm text-gray-500">
                                            Entrée: {new Date(vehicle.entry_time).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(vehicle)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vehicle.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}