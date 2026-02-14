import React from 'react';
import Hero from './components/Hero';
import Services from './components/Services';
import BookingCalendar from './components/BookingCalendar';
import Contacts from './components/Contacts';
import VKWidget from './components/VKWidget';
import RequestForm from './components/RequestForm';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Services />
        <BookingCalendar />
        <RequestForm />
        <VKWidget />
        <Contacts />
      </main>
      <Footer />
    </div>
  );
}

export default App;
