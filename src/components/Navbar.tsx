import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-purple-800">WomenDrive</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={20} />
              <span>{session?.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}