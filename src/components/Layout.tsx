import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './navigation/Sidebar';
import { TopBar } from './navigation/TopBar';
import { Menu } from 'lucide-react';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0 bg-gray-600 opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 flex flex-col z-40 w-64 bg-indigo-900 transform
        transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-end p-2">
          <button
            className="text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Sidebar mobile onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};