import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Navigation, CreditCard, Bot, Clock4, User, Phone, Star, History, Car, Bike, Truck, Wallet, CreditCard as CreditCardIcon, Smartphone, AlertCircle, AlertTriangle } from 'lucide-react';
import { supabase, fetchCities } from '../lib/supabase';
import { format } from 'date-fns';
import { processPayment } from '../lib/api';
import { processAICommand } from '../lib/openai';

interface City {
  id: string;
  name: string;
  state: string;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

const VEHICLE_TYPES = [
  { 
    id: 'e-car', 
    name: 'Electric Car', 
    baseRate: 15,
    icon: Car,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'e-bike', 
    name: 'Electric Bike', 
    baseRate: 10,
    icon: Bike,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'e-rickshaw', 
    name: 'Electric Rickshaw', 
    baseRate: 8,
    icon: Truck,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    image: 'https://images.unsplash.com/photo-1599553784773-a5086c7e7ee7?auto=format&fit=crop&q=80&w=300'
  }
];

const PAYMENT_METHODS = [
  { 
    id: 'credit_card', 
    name: 'Credit Card',
    icon: CreditCardIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'upi', 
    name: 'UPI',
    icon: Smartphone,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    id: 'cash', 
    name: 'Cash',
    icon: Wallet,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  }
];

export default function Dashboard() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingType, setBookingType] = useState<'now' | 'later'>('now');
  const [aiCommand, setAiCommand] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('e-car');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [driverDetails, setDriverDetails] = useState({
    name: 'Sarah Johnson',
    rating: 4.8,
    phone: '+91 98765 43210',
    carDetails: 'White Toyota Camry - DL 01 AB 1234'
  });

  useEffect(() => {
    loadCities();
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (pickup?.address && dropoff?.address) {
      calculateFare();
    }
  }, [pickup, dropoff, selectedVehicleType]);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setVerificationStatus(data.verification_status);
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const loadCities = async () => {
    try {
      setCitiesLoading(true);
      setCitiesError(null);
      const data = await fetchCities();
      setCities(data);
      if (data.length > 0) {
        setSelectedCity(data[0]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCitiesError('Failed to load cities. Please try again.');
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleAICommand = async () => {
    try {
      setError(null);
      const result = await processAICommand(aiCommand);
      if (result.pickup) {
        setPickup({ address: result.pickup, latitude: 0, longitude: 0 });
      }
      if (result.dropoff) {
        setDropoff({ address: result.dropoff, latitude: 0, longitude: 0 });
      }
      if (result.time) {
        setBookingType('later');
        setScheduledTime(result.time);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process command');
    }
  };

  const calculateFare = () => {
    if (pickup && dropoff) {
      const selectedVehicle = VEHICLE_TYPES.find(v => v.id === selectedVehicleType);
      const baseRate = selectedVehicle?.baseRate || 10;
      const distance = Math.random() * 10; // Simulated distance
      const fare = (baseRate * distance) + 50; // Base fare + distance fare
      setEstimatedFare(Math.round(fare));
    }
  };

  const handleSOS = () => {
    // In a real app, this would trigger emergency protocols
    alert('Emergency services have been notified. Stay calm, help is on the way.');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!selectedCity || !pickup || !dropoff) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await processPayment(estimatedFare, selectedPaymentMethod);
      if (result.success) {
        await handleBooking();
        setBookingConfirmed(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Please sign in to book a ride');
    }

    const { error } = await supabase.from('rides').insert({
      user_id: user.id,
      pickup_location: pickup,
      dropoff_location: dropoff,
      scheduled_time: scheduledTime.toISOString(),
      estimated_fare: estimatedFare,
      city_id: selectedCity?.id,
      booking_type: bookingType,
      vehicle_type: selectedVehicleType,
      payment_method: selectedPaymentMethod,
      payment_status: selectedPaymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'confirmed'
    });

    if (error) throw error;
  };

  const resetBooking = () => {
    setBookingConfirmed(false);
    setPickup(null);
    setDropoff(null);
    setScheduledTime(new Date());
    setEstimatedFare(0);
    setSelectedPaymentMethod('');
    setSelectedVehicleType('e-car');
    setAiCommand('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Verification Status Banner */}
        {verificationStatus === 'pending' && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">Account Verification Pending</h3>
              <p className="text-purple-600">Your account is under verification. For demo purposes, you can still book rides.</p>
            </div>
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={handleSOS}
          className="w-full mb-6 p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <AlertCircle size={24} />
          <span className="text-lg font-semibold">SOS Emergency</span>
        </button>
        <p className="text-center text-red-600 text-sm mb-8">
          Tap in case of emergency - This will alert nearby police and our support team
        </p>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800">Book Your Ride</h1>
          <Link
            to="/upcoming-rides"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-purple-600 hover:text-purple-700"
          >
            <History size={20} />
            View Upcoming Rides
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {bookingConfirmed ? (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <div className="w-8 h-8 border-4 border-green-500 rounded-full animate-[ping_1s_ease-in-out_infinite]" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600">Your ride has been successfully booked</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Driver Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{driverDetails.name}</p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={16} className="fill-current" />
                          <span className="text-sm">{driverDetails.rating}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`tel:${driverDetails.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Phone size={16} />
                      Call Driver
                    </a>
                  </div>
                  <p className="text-sm text-gray-600">{driverDetails.carDetails}</p>
                </div>
              </div>

              <div className="border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Ride Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <MapPin size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pickup</p>
                      <p className="text-gray-600">{pickup?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <MapPin size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dropoff</p>
                      <p className="text-gray-600">{dropoff?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <Clock size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Scheduled Time</p>
                      <p className="text-gray-600">
                        {format(scheduledTime, 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={resetBooking}
                className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors"
              >
                Book Another Ride
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* AI Command Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bot size={20} className="text-purple-600" />
                  AI Booking Assistant
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Try: Book a cab from Central Park to Airport at 15:30"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                  />
                  <button
                    onClick={handleAICommand}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Process
                  </button>
                </div>
              </div>

              {/* Booking Type Toggle */}
              <div className="flex gap-4">
                <button
                  onClick={() => setBookingType('now')}
                  className={`flex-1 py-3 rounded-xl transition-all ${
                    bookingType === 'now'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Book Now
                </button>
                <button
                  onClick={() => setBookingType('later')}
                  className={`flex-1 py-3 rounded-xl transition-all ${
                    bookingType === 'later'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock4 className="inline-block mr-2" size={16} />
                  Schedule
                </button>
              </div>

              {/* Vehicle Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {VEHICLE_TYPES.map((vehicle) => {
                    const VehicleIcon = vehicle.icon;
                    return (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleType(vehicle.id)}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          selectedVehicleType === vehicle.id
                            ? 'ring-2 ring-purple-500 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent ${
                            selectedVehicleType === vehicle.id ? 'opacity-90' : 'opacity-70'
                          }`} />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <div className="flex items-center gap-2">
                              <VehicleIcon size={20} className={vehicle.color} />
                              <span className="font-medium">{vehicle.name}</span>
                            </div>
                            <div className="text-sm opacity-90">
                              ₹{vehicle.baseRate}/km
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select City
                </label>
                {citiesError ? (
                  <div className="text-red-600 bg-red-50 p-3 rounded-xl">
                    {citiesError}
                  </div>
                ) : (
                  <select
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    value={selectedCity?.id || ''}
                    onChange={(e) => {
                      const city = cities.find(c => c.id === e.target.value);
                      setSelectedCity(city || null);
                    }}
                    disabled={citiesLoading}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.state}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Location Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pickup Location
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Enter pickup location"
                        value={pickup?.address || ''}
                        onChange={(e) => setPickup({ ...pickup, address: e.target.value } as Location)}
                      />
                    </div>
                    <button
                      onClick={() => {
                        if ('geolocation' in navigator) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            const { latitude, longitude } = position.coords;
                            setPickup({
                              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                              latitude,
                              longitude
                            });
                          });
                        }
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                    >
                      <Navigation size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dropoff Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Enter destination"
                      value={dropoff?.address || ''}
                      onChange={(e) => setDropoff({ ...dropoff, address: e.target.value } as Location)}
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Time */}
              {bookingType === 'later' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Schedule Time
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                        value={format(scheduledTime, 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          newDate.setHours(scheduledTime.getHours(), scheduledTime.getMinutes());
                          setScheduledTime(newDate);
                        }}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="time"
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                        value={format(scheduledTime, 'HH:mm')}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(scheduledTime);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setScheduledTime(newDate);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Fare */}
              {estimatedFare > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-purple-800 mb-1">
                    Estimated Fare: ₹{estimatedFare}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Final fare may vary based on actual distance and time
                  </p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard size={20} />
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map((method) => {
                    const PaymentIcon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          selectedPaymentMethod === method.id
                            ? `${method.bgColor} border-2 border-purple-500 shadow-md`
                            : 'border hover:border-purple-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <PaymentIcon size={24} className={method.color} />
                          <span className={selectedPaymentMethod === method.id ? 'text-purple-700' : 'text-gray-700'}>
                            {method.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading || !estimatedFare}
                className="w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Pay & Book - ₹${estimatedFare || 0}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}