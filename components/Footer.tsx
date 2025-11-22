import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gradient mb-4">Inventory</h3>
            <p className="text-gray-400 max-w-xs">Secure, accessible, and affordable storage solutions for everyone. Find your perfect space today.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button className="hover:text-primary-400 transition-colors">Home</button></li>
              <li><button className="hover:text-primary-400 transition-colors">Find a Space</button></li>
              <li><button className="hover:text-primary-400 transition-colors">About Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@inventory.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Inventory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;