import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Inventory. All rights reserved.</p>
        <p className="text-sm mt-2">Your secure storage solution, simplified.</p>
      </div>
    </footer>
  );
};

export default Footer;