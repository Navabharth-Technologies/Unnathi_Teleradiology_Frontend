import React, { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Search, Building2, Edit2, Trash2 } from 'lucide-react';
import type { Site } from '../../types';
import AddSiteModal from '../../components/unnathi/AddSiteModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

const SitesList = () => {
  const { sites, deleteCompany } = useMockDb();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Site | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (company: Site) => {
    setEditingCompany(company);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteCompany(deletingId);
      setDeletingId(null);
    }
  };

  // Strict scoping based on role
  const scopedSites = sites.filter(c => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') return c.id === user.siteId;
    return false;
  });

  const filteredSites = scopedSites.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent" />
            Teleradiology Companies
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage partner teleradiology companies</p>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => {
              setEditingCompany(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover shadow-sm hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up">
        <div className="p-4 border-b border-border bg-slate-50/30">
          <div className="relative max-w-md group">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-primary font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Company Code</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Contact Person</th>
                
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border stagger-children">
              {filteredSites.map((company) => (
                <tr key={company.id} className="animate-unnathi-fade-in hover:bg-accent/5 hover:-translate-y-[2px] hover:shadow-md hover:z-10 relative bg-card transition-all duration-300 ease-out group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-primary uppercase tracking-widest">{company.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-primary">{company.contactPerson}</div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">{company.email}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(company)} className="text-slate-500 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-colors mr-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(company.id)} className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddSiteModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCompany(null);
        }}
        initialData={editingCompany}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Site"
        message="Are you sure you want to delete this site? This action cannot be undone."
        itemName={sites.find(s => s.id === deletingId)?.name}
      />
    </div>
  );
};

export default SitesList;
