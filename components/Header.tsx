'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  index?: number;
}> = ({ href, children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
  >
    <Link
      href={href}
      className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium px-3 py-2 rounded-md"
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.span>
    </Link>
  </motion.div>
);

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 glass z-50 w-full transition-all duration-300"
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="text-2xl font-bold text-gradient tracking-tight">
            Inventory
          </Link>
        </motion.div>
        <div className="hidden md:flex items-center space-x-2">
          <NavLink href="/" index={0}>Home</NavLink>
          <NavLink href="/spaces" index={1}>Find a Space</NavLink>
          {currentUser && (
            <>
              <NavLink href="/dashboard" index={2}>My Dashboard</NavLink>
              <NavLink href="/admin" index={3}>Admin</NavLink>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {currentUser ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>Hi, {currentUser.name.split(' ')[0]}</motion.span>
                </Link>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
        <div className="md:hidden">
          {/* Mobile menu button can be added here */}
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;