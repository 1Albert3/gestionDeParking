import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        type: 'monthly',
        start_date: '',
        end_date: '',
        price: ''
    });
    const [editingId, setEditingId] = useState(null);

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
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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
            console.error('Error saving subscription:', error);
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
        if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
            try {
                await axios.delete(`/api/subscriptions/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting subscription:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle_id: '',
            type: 'monthly',
            start_date: '',
            end_date: '',
            price: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getTypeText = (type) => {
        return type === 'monthly' ? 'Mensuel' : 'Journalier';
    };

    const isActive = (subscription) => {
        const now = new Date();
        const endDate = new Date(subscription.end_date);
        return endDate >= now;
    };

    if (loading) return <div className="text-center py-8">Chargement...</div>;

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                    Nouvel Abonnement
                </button>
            </div>

            {showForm && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">
                        {editingId ? 'Modifier l\'Abonnement' : 'Nouvel Abonnement'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Véhicule</label>
                            <select
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.vehicle_id}
                                onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
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
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="monthly">Mensuel</option>
                                <option value="daily">Journalier</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                    {subscriptions.map((subscription) => (
                        <li key={subscription.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {subscription.vehicle?.plate_number}
                                        </h3>
                                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                            isActive(subscription) 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {isActive(subscription) ? 'Actif' : 'Expiré'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {subscription.vehicle?.owner_name} - {getTypeText(subscription.type)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Du {new Date(subscription.start_date).toLocaleDateString()} 
                                        au {new Date(subscription.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        Prix: {subscription.price}€
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(subscription)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subscription.id)}
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