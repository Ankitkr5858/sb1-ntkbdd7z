import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Navigation, CreditCard, Bot, Clock4 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your_publishable_key');

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

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingType, setBookingType] = useState<'now' | 'later'>('now');
  const [aiCommand, setAiCommand] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching cities:', error);
      return;
    }

    setCities(data);
  };

  const processAiCommand = async (command: string) => {
    try {
      // This is a simple command parser - in production, use a proper NLP service
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('book') && lowerCommand.includes('later')) {
        setBookingType('later');
        
        // Extract location if mentioned
        const fromMatch = lowerCommand.match(/from\s+([^to]+)\s+to/);
        const toMatch = lowerCommand.match(/to\s+([^from]+)$/);
        
        if (fromMatch) {
          setPickup({ address: fromMatch[1].trim(), latitude: 0, longitude: 0 });
        }
        if (toMatch) {
          setDropoff({ address: toMatch[1].trim(), latitude: 0, longitude: 0 });
        }

        // Extract time if mentioned
        const timeMatch = lowerCommand.match(/at\s+(\d{1,2}(?::\d{2})?(?:\s*[ap]m)?)/i);
        if (timeMatch) {
          const timeStr = timeMatch[1];
          const newDate = new Date();
          const [hours, minutes] = timeStr.split(':');
          newDate.setHours(parseInt(hours), minutes ? parseInt(minutes) : 0);
          setScheduledTime(newDate);
        }
      }
    } catch (error) {
      console.error('Error processing AI command:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Create a payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: estimatedFare * 100, // Convert to cents
          payment_method: selectedPaymentMethod,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedPaymentMethod,
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        // Payment successful, proceed with booking
        handleBooking();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleBooking = async () => {
    if (!pickup || !dropoff || !selectedCity) {
      alert('Please select pickup, dropoff locations and city');
      return;
    }

    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please sign in to book a ride');
      setIsLoading(false);
      return;
    }

    const bookingTime = bookingType === 'later' ? scheduledTime : new Date();

    const { error } = await supabase.from('rides').insert({
      user_id: user.id,
      pickup_location: pickup,
      dropoff_location: dropoff,
      scheduled_time: bookingTime.toISOString(),
      estimated_fare: estimatedFare,
      city_id: selectedCity.id,
      booking_type: bookingType,
    });

    if (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    } else {
      alert('Ride booked successfully!');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            WomenDrive
          </h1>
          <p className="text-gray-600">Safe and reliable rides for women</p>
        </header>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="space-y-6">
            {/* AI Command Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Bot size={20} />
                AI Booking Assistant
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Try: Book a cab from Central Park to Airport at 3pm"
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                />
                <button
                  onClick={() => processAiCommand(aiCommand)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Process
                </button>
              </div>
            </div>

            {/* Booking Type Toggle */}
            <div className="flex gap-4 border-b pb-4">
              <button
                onClick={() => setBookingType('now')}
                className={`flex-1 py-2 rounded-lg ${
                  bookingType === 'now'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Book Now
              </button>
              <button
                onClick={() => setBookingType('later')}
                className={`flex-1 py-2 rounded-lg ${
                  bookingType === 'later'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Clock4 className="inline-block mr-2" size={16} />
                Book Later
              </button>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select City
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = cities.find(c => c.id === e.target.value);
                  setSelectedCity(city || null);
                }}
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pickup Location
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter destination"
                  value={dropoff?.address || ''}
                  onChange={(e) => setDropoff({ ...dropoff, address: e.target.value } as Location)}
                />
              </div>
            </div>

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
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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

            {estimatedFare > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800">
                  Estimated Fare: ₹{estimatedFare}
                </h3>
                <p className="text-sm text-gray-600">
                  Final fare may vary based on actual distance and time
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Methods
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {['Credit Card', 'Debit Card', 'UPI'].map((method) => (
                  <button
                    key={method}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      selectedPaymentMethod === method
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'hover:border-purple-500 hover:text-purple-700'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (pickup && dropoff) {
                    const baseFare = 50;
                    const perKmRate = 12;
                    const distance = Math.random() * 10;
                    const fare = baseFare + (distance * perKmRate);
                    setEstimatedFare(Math.round(fare));
                  }
                }}
                className="flex-1 bg-purple-100 text-purple-700 py-3 rounded-lg hover:bg-purple-200"
              >
                Calculate Fare
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading || !estimatedFare}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Pay & Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;