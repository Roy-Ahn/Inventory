'use client';

import React from 'react';
import Link from 'next/link';
import { Space } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SpaceCardProps {
  space: Space;
  index?: number;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="relative overflow-hidden h-64">
        <motion.img
          className="h-full w-full object-cover"
          src={space.images[0]}
          alt={space.name}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {!space.isAvailable && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            BOOKED
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <p className="font-medium text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {space.location}
          </p>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{space.name}</h3>
        <div className="flex justify-between items-center text-gray-600 mb-6">
          <span className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
              <path d="M12.5 7.5a.5.5 0 00-.5-.5h-4a.5.5 0 000 1h4a.5.5 0 00.5-.5z" />
            </svg>
            <span className="font-medium">{space.size} sq ft</span>
          </span>
          <span className="text-2xl font-bold text-primary-600">${space.pricePerMonth}<span className="text-sm font-normal text-gray-500">/mo</span></span>
        </div>
        <div className="mt-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="w-full">
              <Link href={`/spaces/${space.id}`}>
                View Details
              </Link>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default SpaceCard;
