
import React from 'react';
import { Page } from '../types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="relative h-[calc(100vh-68px)] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 z-0"></div>
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://picsum.photos/seed/hero/1920/1080')"}}></div>
      <div className="relative z-10 text-center p-8 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
          Your Space, Secured.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl mb-8 font-light" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
          Find flexible, affordable, and secure storage solutions near you. From a single box to an entire garage, we have you covered.
        </p>
        <button
          onClick={() => onNavigate('spaces')}
          className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Find Your Space
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
