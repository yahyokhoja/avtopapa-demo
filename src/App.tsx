import React, { Suspense, lazy, useEffect } from 'react';
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
  useEffect(() => {
    const storageKey = 'avtopapa_engine_sound_played_v1';
    const hasPlayed = localStorage.getItem(storageKey) === '1';

    if (hasPlayed) {
      return;
    }

    const markAsPlayed = () => {
      localStorage.setItem(storageKey, '1');
    };

    const playPognaliVoice = async () => {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        throw new Error('Speech synthesis is not supported');
      }

      await new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance('Погнали!');
        utterance.lang = 'ru-RU';
        utterance.rate = 1;
        utterance.pitch = 1;

        const ruVoice = window.speechSynthesis
          .getVoices()
          .find((voice) => voice.lang.toLowerCase().startsWith('ru'));
        if (ruVoice) {
          utterance.voice = ruVoice;
        }

        let settled = false;
        const timeoutId = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error('Speech playback timed out'));
          }
        }, 3000);

        utterance.onend = () => {
          if (!settled) {
            settled = true;
            window.clearTimeout(timeoutId);
            resolve();
          }
        };

        utterance.onerror = () => {
          if (!settled) {
            settled = true;
            window.clearTimeout(timeoutId);
            reject(new Error('Speech playback failed'));
          }
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
    };

    const playIntroSound = async () => {
      try {
        await playPognaliVoice();
        markAsPlayed();
        window.removeEventListener('pointerdown', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
      } catch {
        // Browser blocked autoplay with sound; wait for first interaction.
      }
    };

    const onFirstInteraction = () => {
      void playIntroSound();
    };

    void playIntroSound();

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });
    window.addEventListener('touchstart', onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
