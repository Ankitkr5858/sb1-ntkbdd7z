import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import UpcomingRidesPage from './pages/UpcomingRidesPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/signin" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return !session ? <>{children}</> : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/signin"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upcoming-rides"
              element={
                <PrivateRoute>
                  <UpcomingRidesPage />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;