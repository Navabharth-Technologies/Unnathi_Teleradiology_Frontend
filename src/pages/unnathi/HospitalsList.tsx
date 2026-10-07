import React, { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Search, HeartPulse, Edit2, Trash2, ExternalLink, Activity, Building2 } from 'lucide-react';
import type { Hospital } from '../../types';
import AddHospitalModal from '../../components/unnathi/AddHospitalModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HospitalsList = () => {
  const { hospitals, sites, deleteHospital } = useMockDb();
  const { user, setSelectedHospitalId } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || 'independent';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Track cursor position for 3D card tilt
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

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
      if (typeFilter === 'independent') {
        return h.organizationType === 'UNNATHI_MANAGED';
      } else if (typeFilter === 'company') {
        return h.organizationType === 'COMPANY_MANAGED';
      }
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

  // Table row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-2 md:p-6 pb-24"
    >
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-5"
        >
          {/* 3D Icon Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#0F8B8D]/20 blur-xl rounded-2xl group-hover:bg-[#19B5C5]/30 transition-colors" />
            <motion.div 
              whileHover={{ rotateZ: 5, scale: 1.05 }}
              className="relative w-14 h-14 bg-gradient-to-br from-[#102A43] to-[#1E293B] rounded-2xl border border-white/10 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)] flex items-center justify-center z-10"
            >
              <HeartPulse className="w-7 h-7 text-[#19B5C5]" />
            </motion.div>
          </div>
          
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] mb-1">Healthcare Network</div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A] flex items-center gap-3">
              {typeFilter === 'company' ? 'Company Hospitals' : 'Independent Hospitals'}
            </h1>
            <p className="text-[#64748B] mt-1 font-medium text-sm">
              {typeFilter === 'company' ? 'Manage hospitals operating under Teleradiology Companies' : 'Manage independent hospitals in the system'}
            </p>
          </div>
        </motion.div>

        {/* 3D Add Button */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.button 
            onClick={() => {
              setEditingHospital(null);
              setIsAddModalOpen(true);
            }}
            whileHover={{ 
              scale: 1.02, 
              translateY: -2, 
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' 
            }}
            whileTap={{ scale: 0.98, translateY: 1 }}
            className="relative group bg-gradient-to-r from-[#102A43] via-[#2563EB] to-[#0F8B8D] text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] transition-all overflow-hidden flex items-center gap-2"
          >
            <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
            <Plus className="w-5 h-5 opacity-90 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Hospital</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Main Data Workspace (3D Container) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg)`,
          transition: 'transform 0.1s ease-out',
          transformStyle: 'preserve-3d'
        }}
        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E2E8F0] overflow-hidden"
      >
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
              <Activity className="w-4 h-4 text-[#10A878]" />
              <span className="text-xs font-bold text-[#334155]">Total: {filteredHospitals.length}</span>
            </div>
          </div>
          
          {/* Premium Search */}
          <div className="relative max-w-md w-full sm:w-80 group">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#2563EB] transition-colors" />
            <input
              type="text"
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm font-medium focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto relative z-10 bg-white">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-[#64748B] uppercase tracking-widest">Hospital</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-[#64748B] uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-[#64748B] uppercase tracking-widest">Parent Organization</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-[#64748B] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              <AnimatePresence>
                {filteredHospitals.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-[#64748B]">
                        <Building2 className="w-12 h-12 text-[#CBD5E1] mb-3" />
                        <p className="text-sm font-medium">No hospitals found</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredHospitals.map((hospital, index) => {
                    const company = sites.find(c => c.id === hospital.parentSiteId);
                    
                    return (
                      <motion.tr 
                        key={hospital.id} 
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="group relative transition-colors duration-200 hover:bg-[#F8FAFC] hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] z-0 hover:z-10"
                      >
                        {/* Hover accent line */}
                        <td className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563EB] to-[#0F8B8D] opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#E2E8F0]/50 border border-[#E2E8F0] flex items-center justify-center shrink-0">
                              <HeartPulse className="w-4 h-4 text-[#64748B]" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{hospital.name}</div>
                              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-0.5">{hospital.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-widest rounded-md bg-[#0F8B8D]/10 text-[#0F8B8D] border border-[#0F8B8D]/20">
                            {hospital.organizationType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {hospital.organizationType === 'COMPANY_MANAGED' ? (
                            <div className="flex items-center gap-2 text-[#475569]">
                              <Building2 className="w-3.5 h-3.5 opacity-60" />
                              <span className="font-semibold">{company?.name || 'Unknown Company'}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                              Independent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button 
                              onClick={() => handleOpenDashboard(hospital.id)}
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[#2563EB] hover:text-white bg-[#2563EB]/10 hover:bg-[#2563EB] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all text-xs font-bold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open
                            </motion.button>
                            
                            <motion.button 
                              onClick={() => handleEdit(hospital)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-[#64748B] hover:text-[#0F8B8D] hover:bg-[#0F8B8D]/10 p-2 rounded-lg transition-colors"
                              title="Edit Hospital"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button 
                              onClick={() => handleDelete(hospital.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-[#64748B] hover:text-[#DC2626] hover:bg-[#DC2626]/10 p-2 rounded-lg transition-colors"
                              title="Delete Hospital"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

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
    </motion.div>
  );
};

export default HospitalsList;
