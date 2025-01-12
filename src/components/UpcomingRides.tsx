import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, Zap, Bike, Bus, CreditCard } from 'lucide-react';

interface Ride {
  id: string;
  pickup_location: {
    address: string;
  };
  dropoff_location: {
    address: string;
  };
  scheduled_time: string;
  estimated_fare: number;
  status: string;
  vehicle_type: string;
  payment_method: string;
  payment_status: string;
  cities?: {
    name: string;
    state: string;
  };
}

interface UpcomingRidesProps {
  rides: Ride[];
  limit?: number;
}

const getVehicleIcon = (type: string) => {
  switch (type) {
    case 'e-car':
      return <Zap size={20} className="text-green-600" />;
    case 'e-bike':
      return <Bike size={20} className="text-blue-600" />;
    case 'e-rickshaw':
      return <Bus size={20} className="text-yellow-600" />;
    default:
      return <Zap size={20} className="text-green-600" />;
  }
};

const getVehicleName = (type: string) => {
  switch (type) {
    case 'e-car':
      return 'Electric Car';
    case 'e-bike':
      return 'Electric Bike';
    case 'e-rickshaw':
      return 'Electric Rickshaw';
    default:
      return 'Electric Vehicle';
  }
};

export function UpcomingRides({ rides, limit }: UpcomingRidesProps) {
  const upcomingRides = rides
    .filter(ride => 
      new Date(ride.scheduled_time) > new Date() && 
      ride.status !== 'cancelled' && 
      ride.status !== 'completed'
    )
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  const displayRides = limit ? upcomingRides.slice(0, limit) : upcomingRides;

  if (upcomingRides.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center text-gray-600">
        No upcoming rides
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayRides.map((ride) => (
        <div
          key={ride.id}
          className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-purple-700">
              <Clock size={16} />
              {format(new Date(ride.scheduled_time), 'dd MMM yyyy HH:mm')}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ride.status === 'confirmed' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ride.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ride.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ride.payment_status === 'paid' ? 'Paid' : 'Pay to Driver'}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-green-600 mt-1" />
              <p className="text-sm text-gray-600">{ride.pickup_location.address}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-red-600 mt-1" />
              <p className="text-sm text-gray-600">{ride.dropoff_location.address}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" title={getVehicleName(ride.vehicle_type)}>
                {getVehicleIcon(ride.vehicle_type)}
                <span className="text-sm text-gray-600">{getVehicleName(ride.vehicle_type)}</span>
              </div>
              <div className="flex items-center gap-1" title="Payment Method">
                <CreditCard size={16} className="text-purple-600" />
                <span className="text-sm text-gray-600">{ride.payment_method}</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-purple-700">₹{ride.estimated_fare}</p>
          </div>
        </div>
      ))}
    </div>
  );
}