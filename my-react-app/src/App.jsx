import React, { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// ============================================================================
// LAZY LOADING - Code splitting for better performance
// ============================================================================
const Login = lazy(() => import('./components/pages/auth.jsx'));
const Dashboard = lazy(() => import('./components/pages/Dashboard.jsx'));

// Loading component for Suspense fallback
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        fontSize: '40px', 
        marginBottom: '20px',
        animation: 'spin 1s linear infinite'
      }}>
        ⏳
      </div>
      Loading...
    </div>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isAuthenticated ? <Dashboard /> : <Login />}
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
