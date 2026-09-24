import React, { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Search, HeartPulse, Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { Hospital } from '../../types';
import AddHospitalModal from '../../components/unnathi/AddHospitalModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { useNavigate } from 'react-router-dom';

const HospitalsList = () => {
  const { hospitals, sites, deleteHospital } = useMockDb();
  const { user, setSelectedHospitalId } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INDEPENDENT' | 'TELERADIOLOGY'>('INDEPENDENT');

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteHospital(deletingId);
      setDeletingId(null);
    }
  };

  // Strict scoping based on role
  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') {
      if (activeTab === 'INDEPENDENT') return h.organizationType !== 'COMPANY_MANAGED';
      if (activeTab === 'TELERADIOLOGY') return h.organizationType === 'COMPANY_MANAGED';
      return true;
    }
    
    if (user?.role === 'SITE_ADMIN') {
      return h.parentSiteId === user.siteId;
    }
    
    return false;
  });

  const filteredHospitals = scopedHospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDashboard = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    if (user?.role === 'SUPER_ADMIN') {
      useAuthStore.getState().setRole('HOSPITAL_ADMIN');
    }
    navigate('/admin/dashboard');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-600" />
            Hospitals
          </h1>
          <p className="text-gray-500 mt-1">Manage all hospitals in the system</p>
        </div>
        <button 
          onClick={() => {
            setEditingHospital(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Hospital
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {user?.role === 'SUPER_ADMIN' ? (
            <div className="flex bg-slate-100 p-1 rounded-lg self-start">
              <button
                onClick={() => setActiveTab('INDEPENDENT')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'INDEPENDENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Independent Hospitals
              </button>
              <button
                onClick={() => setActiveTab('TELERADIOLOGY')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'TELERADIOLOGY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Teleradiology Hospitals
              </button>
            </div>
          ) : (
            <div></div> /* Spacer */
          )}
          
          <div className="relative max-w-md w-full sm:w-auto flex-1 sm:flex-none">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospitals..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHospitals.map((hospital) => {
                const company = sites.find(c => c.id === hospital.parentSiteId);
                
                return (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                      <div className="text-xs text-gray-500">{hospital.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {hospital.organizationType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.organizationType === 'COMPANY_MANAGED' ? (
                        <div className="font-medium">{company?.name || 'Unknown Company'}</div>
                      ) : (
                        <span className="italic text-gray-400">Independent</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        hospital.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hospital.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenDashboard(hospital.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" /> Open
                      </button>
                      <button onClick={() => handleEdit(hospital)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(hospital.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddHospitalModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHospital(null);
        }}
        initialData={editingHospital}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Hospital"
        message="Are you sure you want to delete this hospital? This action cannot be undone."
        itemName={hospitals.find(h => h.id === deletingId)?.name}
      />
    </div>
  );
};

export default HospitalsList;
