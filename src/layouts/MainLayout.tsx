import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { Header } from '../components/ui/Header';
import { useToastStore } from '../app/store/useToastStore';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

const MainLayout = () => {
  const { message, type } = useToastStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Global Toast Notification */}
      {message && (
        <div className={`absolute top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg border ${
          type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' :
          type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {type === 'success' && <CheckCircle2 className="w-5 h-5 mr-2 text-teal-600" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 mr-2 text-red-600" />}
          {type === 'info' && <Info className="w-5 h-5 mr-2 text-blue-600" />}
          {message}
        </div>
      )}

      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
