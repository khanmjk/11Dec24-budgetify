import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative h-16 flex justify-between">
          <div className="flex px-2 lg:px-0">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={onMenuClick}
              >
                <span className="sr-only">Open menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div className="flex-1 flex">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="search"
                    className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-4 relative flex-shrink-0">
              <div>
                <button className="bg-indigo-600 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="h-8 w-8 rounded-full flex items-center justify-center">
                    AD
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};