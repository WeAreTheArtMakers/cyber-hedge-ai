import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import MarketTicker from './components/MarketTicker';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <Header />
      <MarketTicker />
      <div className="flex-grow">
        <Outlet /> {/* Sayfa içeriği burada render edilecek */}
      </div>
      <Footer />
    </div>
  );
}

export default App;
