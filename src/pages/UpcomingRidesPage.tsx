import React, { useEffect, useState } from 'react';
import { fetchUserRides } from '../lib/supabase';
import { UpcomingRides } from '../components/UpcomingRides';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpcomingRidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await fetchUserRides();
      setRides(data);
    } catch (error: any) {
      console.error('Error loading rides:', error);
      setError(error.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-purple-800">Upcoming Rides</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading rides...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">No upcoming rides found</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Book a Ride
            </Link>
          </div>
        ) : (
          <UpcomingRides rides={rides} />
        )}
      </div>
    </div>
  );
}