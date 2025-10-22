import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Parkings() {
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', total_spots: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchParkings();
    }, []);

    const fetchParkings = async () => {
        try {
            const response = await axios.get('/api/parkings');
            setParkings(response.data);
        } catch (error) {
            console.error('Error fetching parkings:', error);
        } finally {
            setLoading(false);
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
            console.error('Error saving parking:', error);
        }
    };

    const handleEdit = (parking) => {
        setFormData({
            name: parking.name,
            location: parking.location,
            total_spots: parking.total_spots
        });
        setEditingId(parking.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce parking ?')) {
            try {
                await axios.delete(`/api/parkings/${id}`);
                fetchParkings();
            } catch (error) {
                console.error('Error deleting parking:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', location: '', total_spots: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="text-center py-8">Chargement...</div>;

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Parkings</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                    Ajouter un Parking
                </button>
            </div>

            {showForm && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">
                        {editingId ? 'Modifier le Parking' : 'Nouveau Parking'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Localisation</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de places</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.total_spots}
                                onChange={(e) => setFormData({...formData, total_spots: e.target.value})}
                            />
                        </div>
                        <div className="flex space-x-3">
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
                    {parkings.map((parking) => (
                        <li key={parking.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{parking.name}</h3>
                                    <p className="text-sm text-gray-500">{parking.location}</p>
                                    <p className="text-sm text-gray-500">
                                        {parking.total_spots} places - {parking.spots?.length || 0} créées
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(parking)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parking.id)}
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