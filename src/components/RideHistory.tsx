import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin } from 'lucide-react';

interface RideHistoryProps {
  rides: any[];
  onClose: () => void;
}

export function RideHistory({ rides, onClose }: RideHistoryProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-800">Your Rides</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {rides.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No rides found</p>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="border rounded-lg p-4 hover:bg-purple-50 transition-colors"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock size={16} />
                      {format(new Date(ride.scheduled_time), 'dd MMM yyyy HH:mm')}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-green-600 mt-1" />
                        <p className="text-sm">{ride.pickup_location.address}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-red-600 mt-1" />
                        <p className="text-sm">{ride.dropoff_location.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">₹{ride.estimated_fare}</p>
                    <p className="text-sm text-gray-600 capitalize">{ride.status}</p>
                    <p className="text-sm text-purple-600 capitalize">{ride.booking_type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}