'use client';

import React, { useState, useMemo } from 'react';
import SpaceCard from '@/components/SpaceCard';
import Spinner from '@/components/Spinner';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SpacesPage() {
  const { spaces, isLoading: loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState([10000]);
  const [minSize, setMinSize] = useState([0]);

  const filteredSpaces = useMemo(() => {
    return spaces.filter(space => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (space.name.toLowerCase().includes(searchTermLower) || space.location.toLowerCase().includes(searchTermLower)) &&
        (maxPrice[0] === 10000 ? true : space.pricePerMonth <= maxPrice[0]) &&
        space.size >= minSize[0]
      );
    });
  }, [spaces, searchTerm, maxPrice, minSize]);

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Find the Perfect Space</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Use the filters to narrow down your search for the ideal storage unit.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="mb-8 sticky top-[80px] z-40 backdrop-blur-sm bg-white/90">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name or Location</Label>
              <Input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., 'Downtown' or 'Garage'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Max Price: <span className="font-bold text-blue-600">${maxPrice[0] === 10000 ? '10k+' : maxPrice[0]}</span></Label>
              <Slider
                id="price"
                min={50}
                max={10000}
                step={50}
                value={maxPrice}
                onValueChange={setMaxPrice}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Min Size: <span className="font-bold text-blue-600">{minSize[0]} sq ft</span></Label>
              <Slider
                id="size"
                min={0}
                max={2000}
                step={25}
                value={minSize}
                onValueChange={setMinSize}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <motion.p
            className="text-center text-gray-500 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} found.
          </motion.p>
          {filteredSpaces.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {filteredSpaces.map((space, index) => (
                <SpaceCard key={space.id} space={space} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center py-16 px-6">
                <CardContent>
                  <h3 className="text-2xl font-semibold text-gray-800">No Spaces Found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters to find available storage units.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

