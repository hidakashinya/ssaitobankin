import React from 'react';
import { MainApp } from '../components/MainApp';
import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';

export function InternalChatPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <MainApp />;
}