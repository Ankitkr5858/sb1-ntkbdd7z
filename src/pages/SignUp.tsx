import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User2, FileCheck } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!idProof) {
      setError('Please upload a valid ID proof');
      return;
    }

    try {
      setLoading(true);
      
      // First, upload the ID proof to Supabase storage
      const { data: { user } } = await signUp(email, password);
      
      if (user) {
        // Upload ID proof to Supabase storage
        const fileExt = idProof.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('id-proofs')
          .upload(fileName, idProof);

        if (uploadError) {
          throw new Error('Failed to upload ID proof');
        }

        // Create user profile with additional details
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: fullName,
            id_proof_path: fileName,
            verification_status: 'pending'
          });

        if (profileError) {
          throw new Error('Failed to create user profile');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-800">Create Account</h2>
          <p className="mt-2 text-gray-600">Join WomenDrive today</p>
          <div className="mt-2 p-2 bg-pink-50 rounded-lg">
            <p className="text-sm text-pink-600">
              Note: This service is exclusively for women. You'll need to verify your identity with a government-issued ID.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <User2 className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Full Name (as per ID)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="idProof" className="block text-sm font-medium text-gray-700 mb-1">
                Government ID Proof
              </label>
              <div className="relative">
                <FileCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="idProof"
                  name="idProof"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={handleIdProofChange}
                  className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Please upload a valid government ID (Aadhar Card, PAN Card, Driving License, etc.)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus size={20} />
                Sign up
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}