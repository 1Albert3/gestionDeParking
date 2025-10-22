import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Spots() {
    const [spots, setSpots] = useState([]);
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSpotStatus = async (spotId, newStatus) => {
        try {
            await axios.put(`/api/spots/${spotId}`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating spot:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'occupied': return 'bg-red-100 text-red-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Disponible';
            case 'occupied': return 'Occupée';
            case 'reserved': return 'Réservée';
            default: return status;
        }
    };

    if (loading) return <div className="text-center py-8">Chargement...</div>;

    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Places</h1>

            {parkings.map((parking) => (
                <div key={parking.id} className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {parking.name} - {parking.location}
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {spots
                            .filter(spot => spot.parking_id === parking.id)
                            .map((spot) => (
                                <div
                                    key={spot.id}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${getStatusColor(spot.status)}`}
                                    onClick={() => {
                                        const newStatus = spot.status === 'available' ? 'occupied' : 'available';
                                        updateSpotStatus(spot.id, newStatus);
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="font-bold text-lg">{spot.number}</div>
                                        <div className="text-xs mt-1">
                                            {getStatusText(spot.status)}
                                        </div>
                                        {spot.vehicle && (
                                            <div className="text-xs mt-1 font-medium">
                                                {spot.vehicle.plate_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                    
                    {spots.filter(spot => spot.parking_id === parking.id).length === 0 && (
                        <p className="text-gray-500 italic">Aucune place créée pour ce parking</p>
                    )}
                </div>
            ))}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Légende</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                        <span className="text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                        <span className="text-sm">Occupée</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                        <span className="text-sm">Réservée</span>
                    </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                    Cliquez sur une place pour changer son statut entre disponible et occupée.
                </p>
            </div>
        </div>
    );
}