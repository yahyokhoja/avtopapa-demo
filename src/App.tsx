import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CabinetPage from './pages/CabinetPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const Services = lazy(() => import('./components/Services'));
const BookingCalendar = lazy(() => import('./components/BookingCalendar'));
const VKWidget = lazy(() => import('./components/VKWidget'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const TrustSection = lazy(() => import('./components/TrustSection'));
const Contacts = lazy(() => import('./components/Contacts'));

const HomePage: React.FC = () => (
  <main>
    <Hero />
    <Suspense fallback={<div className="section-loader">Загружаем...</div>}>
      <TrustSection />
      <Services />
      <Testimonials />
      <BookingCalendar />
      <VKWidget />
      <Contacts />
    </Suspense>
  </main>
);

const AdminRoute: React.FC = () => {
  const { user, isAdmin, isReady } = useAuth();
  if (!isReady) {
    return <div className="section-loader">Загружаем...</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/cabinet" replace />;
  }
  return <AdminPage />;
};

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cabinet" element={<CabinetPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
