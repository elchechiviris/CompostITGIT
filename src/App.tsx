import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AppRoutes from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AuthGuard>
            <Layout>
              <AppRoutes />
            </Layout>
          </AuthGuard>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;