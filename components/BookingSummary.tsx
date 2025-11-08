import React, { useMemo } from 'react';
import { Space } from '../types';

interface BookingSummaryProps {
  space: Space;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ space, startDate, endDate, totalPrice }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const duration = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>
        
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Space Details</h3>
          <div className="flex items-start space-x-4">
            <img 
              src={space.images[0]} 
              alt={space.name} 
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{space.name}</h4>
              <p className="text-gray-600 text-sm">{space.location}</p>
              <p className="text-gray-600 text-sm">{space.size} sq ft</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Start Date:</span>
            <span className="font-semibold text-gray-900">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">End Date:</span>
            <span className="font-semibold text-gray-900">{formatDate(endDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-900">{duration} day{duration !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-600">Price per Month:</span>
            <span className="font-semibold text-gray-900">${space.pricePerMonth}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
        <ul className="space-y-2">
          {space.features.map((feature, i) => (
            <li key={i} className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingSummary;

