
import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import SpaceCard from '../components/SpaceCard';
import Spinner from '../components/Spinner';
import { useData } from '../contexts/DataContext';

interface SpacesPageProps {
  onNavigate: (page: Page, spaceId: string) => void;
}

const SpacesPage: React.FC<SpacesPageProps> = ({ onNavigate }) => {
  const { spaces, isLoading: loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minSize, setMinSize] = useState(0);

  const filteredSpaces = useMemo(() => {
    return spaces.filter(space => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (space.name.toLowerCase().includes(searchTermLower) || space.location.toLowerCase().includes(searchTermLower)) &&
        (maxPrice === 10000 ? true : space.pricePerMonth <= maxPrice) &&
        space.size >= minSize
      );
    });
  }, [spaces, searchTerm, maxPrice, minSize]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Find the Perfect Space</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Use the filters to narrow down your search for the ideal storage unit.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8 sticky top-[80px] z-40 backdrop-blur-sm bg-white/90">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search by Name or Location</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., 'Downtown' or 'Garage'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Max Price: <span className="font-bold text-blue-600">${maxPrice === 10000 ? '10k+' : maxPrice}</span></label>
            <input
              type="range"
              id="price"
              min="50"
              max="10000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Min Size: <span className="font-bold text-blue-600">{minSize} sq ft</span></label>
            <input
              type="range"
              id="size"
              min="0"
              max="2000"
              step="25"
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <p className="text-center text-gray-500 mb-8">{filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} found.</p>
          {filteredSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map(space => (
                <SpaceCard key={space.id} space={space} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800">No Spaces Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters to find available storage units.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpacesPage;
