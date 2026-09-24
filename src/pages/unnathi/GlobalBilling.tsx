import React, { useState, useMemo } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { IndianRupee, Download, Building2, HeartPulse, ChevronDown, ChevronRight, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import type { Invoice, Hospital, Center, Site } from '../../types';

export default function GlobalBilling() {
  const { invoices, hospitals, sites, studies, templates } = useMockDb();
  const { user } = useAuthStore();
  

  // Scope data based on role
  const scopedSites = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN') return sites;
    if (user?.role === 'SITE_ADMIN') return sites.filter(c => c.id === user.siteId);
    return [];
    return [];
  }, [sites, user]);

  // Hierarchical Data Processing
  const hierarchy = useMemo(() => {
    const data: any[] = [];
    
    // Group by Company -> Hospital
    scopedSites.forEach(company => {
      const companyHospitals = hospitals.filter(h => h.parentSiteId === company.id);
      let companyTotal = 0;
      let companyUnpaid = 0;
      
      const hospitalNodes = companyHospitals.map(hospital => {
        const hospInvoices = invoices.filter(inv => inv.hospitalId === hospital.id);
        let hospTotal = 0;
        let hospUnpaid = 0;
        
        if (user?.role === 'SUPER_ADMIN') {
          // Super Admin sees Unnathi Commission
          const allCompletedStudies = studies.filter(s => s.hospitalId === hospital.id && ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus));
          
          allCompletedStudies.forEach(s => {
             const comm = hospital.modalityCommissions?.[s.modality] || (s.modality === 'MRI' ? 150 : (s.modality === 'CT' ? 100 : (['X-Ray', 'CR', 'DR'].includes(s.modality) ? 30 : 50)));
             hospTotal += comm;
             const inv = invoices.find(i => i.studyId === s.id);
             if (!inv || inv.status !== 'Paid') hospUnpaid += comm;
          });
        } else {
          // Site Admin sees total hospital revenue
          hospTotal = hospInvoices.reduce((acc, inv) => acc + inv.amount, 0);
          hospUnpaid = hospInvoices.filter(i => i.status !== 'Paid').reduce((acc, inv) => acc + inv.amount, 0);
          
          const unbilledStudies = studies.filter(s => 
            s.hospitalId === hospital.id && 
            ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) && 
            !hospInvoices.some(i => i.studyId === s.id)
          );

          unbilledStudies.forEach(s => {
            const template = templates.find(t => t.hospitalId === hospital.id && t.modality === s.modality && (t.studyName === s.bodyPart || t.studyName === s.studyDescription));
            const price = template?.price || 500;
            hospTotal += price;
            hospUnpaid += price;
          });
        }

        companyTotal += hospTotal;
        companyUnpaid += hospUnpaid;
        
        return { type: 'hospital', data: hospital, total: hospTotal, unpaid: hospUnpaid, invoices: hospInvoices };
      });
      
      data.push({ type: 'company', data: company, total: companyTotal, unpaid: companyUnpaid, children: hospitalNodes });
    });
    
    // Group Independent Hospitals (Unnathi Managed) - ONLY for Super Admin
    if (user?.role === 'SUPER_ADMIN') {
      const independentHospitals = hospitals.filter(h => h.organizationType === 'UNNATHI_MANAGED');
      if (independentHospitals.length > 0) {
        let indTotal = 0;
        let indUnpaid = 0;
        
        const hospitalNodes = independentHospitals.map(hospital => {
          const hospInvoices = invoices.filter(inv => inv.hospitalId === hospital.id);
          let hospTotal = 0;
          let hospUnpaid = 0;
          
          if (user?.role === 'SUPER_ADMIN') {
            // Super Admin sees Unnathi Commission
            const allCompletedStudies = studies.filter(s => s.hospitalId === hospital.id && ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus));
            
            allCompletedStudies.forEach(s => {
               const comm = hospital.modalityCommissions?.[s.modality] || (s.modality === 'MRI' ? 150 : (s.modality === 'CT' ? 100 : (['X-Ray', 'CR', 'DR'].includes(s.modality) ? 30 : 50)));
               hospTotal += comm;
               const inv = invoices.find(i => i.studyId === s.id);
               if (!inv || inv.status !== 'Paid') hospUnpaid += comm;
            });
          } else {
            hospTotal = hospInvoices.reduce((acc, inv) => acc + inv.amount, 0);
            hospUnpaid = hospInvoices.filter(i => i.status !== 'Paid').reduce((acc, inv) => acc + inv.amount, 0);
            
            const unbilledStudies = studies.filter(s => 
              s.hospitalId === hospital.id && 
              ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) && 
              !hospInvoices.some(i => i.studyId === s.id)
            );

            unbilledStudies.forEach(s => {
              const template = templates.find(t => t.hospitalId === hospital.id && t.modality === s.modality && (t.studyName === s.bodyPart || t.studyName === s.studyDescription));
              const price = template?.price || 500;
              hospTotal += price;
              hospUnpaid += price;
            });
          }

          indTotal += hospTotal;
          indUnpaid += hospUnpaid;
          return { type: 'hospital', data: hospital, total: hospTotal, unpaid: hospUnpaid, invoices: hospInvoices };
        });
        
        data.push({ type: 'unnathi_managed', name: 'Independent Hospitals (Unnathi Managed)', total: indTotal, unpaid: indUnpaid, children: hospitalNodes });
      }
    }
    
    return data;
  }, [invoices, hospitals, scopedSites, user, studies, templates]);

  // KPI Calculations (Based on the scoped hierarchy to avoid double-counting or out-of-scope invoices)
  const { totalRevenue, totalPaid, totalUnpaid } = useMemo(() => {
    let rev = 0;
    let unpaid = 0;
    
    hierarchy?.forEach(node => {
      rev += node.total;
      unpaid += node.unpaid;
    });
    
    return { 
      totalRevenue: rev, 
      totalPaid: rev - unpaid, 
      totalUnpaid: unpaid 
    };
  }, [hierarchy]);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderHierarchy = (nodes: any[], depth = 0) => {
    return nodes.map((node, index) => {
      const isExpanded = !!expandedNodes[`${node.type}-${node.data?.id || 'unnathi'}`];
      const hasChildren = node.children && node.children.length > 0;
      const id = `${node.type}-${node.data?.id || 'unnathi'}`;
      
      return (
        <React.Fragment key={id}>
          <tr className={`border-b border-gray-100 hover:bg-[#F8FAFC] transition-colors ${depth === 0 ? 'bg-white' : depth === 1 ? 'bg-slate-50/70' : 'bg-slate-50/30'}`}>
            <td className="px-6 py-5">
              <div className="flex items-center" style={{ paddingLeft: `${depth * 2}rem` }}>
                {hasChildren ? (
                  <button onClick={() => toggleNode(id)} className="mr-2 text-gray-500 hover:text-gray-900 transition-colors">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <span className="w-6" /> // spacer
                )}
                
                {node.type === 'company' && <Building2 className="w-4 h-4 text-indigo-600 mr-2" />}
                {(node.type === 'hospital' || node.type === 'unnathi_managed') && <HeartPulse className="w-4 h-4 text-rose-600 mr-2" />}
                
                <span className="font-bold text-[#0D2461]">
                  {node.data?.name || node.name}
                </span>
                {node.data?.code && (
                  <span className="ml-3 text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-wider uppercase border border-slate-200">
                    {node.data.code}
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              <span className="text-sm font-bold text-slate-800">
                ₹{node.total.toLocaleString('en-IN')}
              </span>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${node.unpaid > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                ₹{node.unpaid.toLocaleString('en-IN')}
              </span>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              {node.type === 'hospital' && (
                <button className="text-[#00A8CC] hover:text-[#0D2461] hover:bg-[#00A8CC]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-end ml-auto gap-1.5">
                  <FileText className="w-4 h-4" />
                  View Invoices
                </button>
              )}
            </td>
          </tr>
          {isExpanded && hasChildren && renderHierarchy(node.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-unnathi-fade-in">
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">
            {user?.role === 'SUPER_ADMIN' ? 'Global Financial Overview' : 
             'Company Financial Overview'}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
            {user?.role === 'SUPER_ADMIN' ? 'Platform-wide financial accounts across all networks' : 
             'Financial overview for your organization'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0D2461] hover:bg-[#081840] text-white rounded-xl transition-all shadow-md font-bold text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#0D2461] to-[#1a367a] rounded-2xl shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <IndianRupee className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#00A8CC]" />
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Total Network Revenue</p>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[11px] font-medium text-[#00A8CC] mt-2 bg-[#00A8CC]/10 inline-block px-2 py-0.5 rounded-full border border-[#00A8CC]/20">
              +12.5% from last month
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden hover:shadow-md transition-shadow group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <IndianRupee className="w-32 h-32 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Payments Received</p>
            <p className="text-4xl font-black text-emerald-600 tracking-tight">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-2">Verified and settled across network</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden hover:shadow-md transition-shadow group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <AlertCircle className="w-32 h-32 text-rose-600" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Total Outstanding</p>
            <p className="text-4xl font-black text-rose-600 tracking-tight">₹{totalUnpaid.toLocaleString('en-IN')}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-2">Pending collection and processing</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-black text-[#0D2461]">Organizational Ledger</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expand rows to view Centers and Hospitals</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Organization / Entity</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Revenue</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Outstanding Amount</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderHierarchy(hierarchy)}
              {hierarchy.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No financial data available across the network.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
