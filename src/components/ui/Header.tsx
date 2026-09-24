import React from 'react';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../app/store/useAuthStore';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
      <div className="flex items-center flex-1">
        <button className="p-2 mr-4 text-gray-500 rounded-md md:hidden hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Global Search */}
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Search patients, studies, IDs..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold" title={user?.name}>
          {initial}
        </div>
        <button onClick={logout} className="p-2 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors" title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
