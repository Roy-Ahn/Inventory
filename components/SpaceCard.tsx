
import React from 'react';
import { Space, Page } from '../types';

interface SpaceCardProps {
  space: Space;
  onNavigate: (page: Page, spaceId: string) => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, onNavigate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      <div className="relative">
        <img className="h-56 w-full object-cover" src={space.images[0]} alt={space.name} />
        {!space.isAvailable && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
            BOOKED
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{space.location}</p>
        <div className="flex justify-between items-center text-gray-700 mb-4">
          <span className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
              <path d="M12.5 7.5a.5.5 0 00-.5-.5h-4a.5.5 0 000 1h4a.5.5 0 00.5-.5z" />
            </svg>
            <span>{space.size} sq ft</span>
          </span>
          <span className="text-2xl font-bold text-blue-600">${space.pricePerMonth}<span className="text-base font-normal">/mo</span></span>
        </div>
        <div className="mt-auto">
          <button
            onClick={() => onNavigate('spaceDetail', space.id)}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
