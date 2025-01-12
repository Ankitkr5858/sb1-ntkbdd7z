import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { session } = useAuth();

  return (
    <div>
      {session && <Navbar />}
      <Outlet />
    </div>
  );
}