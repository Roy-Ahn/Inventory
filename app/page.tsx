'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="relative h-[calc(100vh-68px)] flex items-center justify-center text-white overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{backgroundImage: "url('https://picsum.photos/seed/hero/1920/1080')"}}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="relative z-10 text-center p-8">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4"
          style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Space, Secured.
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto text-lg md:text-xl mb-8 font-light"
          style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Find flexible, affordable, and secure storage solutions near you. From a single box to an entire garage, we have you covered.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg" className="bg-white text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-lg">
            <Link href="/spaces">
              Find Your Space
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

