import React, { useState, useMemo } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { Search, ChevronDown, RefreshCw, FileText, Download, Info, CheckCircle2, ChevronUp, Clock, Paperclip, Activity, FileIcon, MessageSquare, Copy, Settings, X, Upload, Pencil, Share2, Eye, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AddHistoryModal } from '../../components/modals/AddHistoryModal';
import { MoreInfoModal } from '../../components/modals/MoreInfoModal';
import { EditPatientModal } from '../../components/modals/EditPatientModal';
import { ShareModal } from '../../components/modals/ShareModal';
import { useNavigate } from 'react-router-dom';

export default function AdvancedReporting() {
  const navigate = useNavigate();
  const { user, selectedHospitalId } = useAuthStore();
  const { studies, patients, hospitals, radiologists, users, updateStudy } = useMockDb();

  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});
  
  // Filter States
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'Month' | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [siteFilter, setSiteFilter] = useState<string>('');
  const [modalityFilter, setModalityFilter] = useState<string>('');
  const [studyNameFilter, setStudyNameFilter] = useState<string>('');
  const [radiologistFilter, setRadiologistFilter] = useState<string>('');
  const [emergencyFilter, setEmergencyFilter] = useState(false);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Modals
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudyForHistory, setSelectedStudyForHistory] = useState<any>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedStudyForInfo, setSelectedStudyForInfo] = useState<any>(null);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedStudyForShare, setSelectedStudyForShare] = useState<any>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Derive access list
  const accessibleStudies = useMemo(() => {
    return studies.filter(s => {
      // Super Admin sees all EXCEPT independent hospitals
      if (user?.role === 'SUPER_ADMIN') {
        const hospital = hospitals.find(h => h.id === s.hospitalId);
        return hospital?.organizationType !== 'UNNATHI_MANAGED';
      }
      
      // Site Admin sees all studies from hospitals that belong to their site
      if (user?.role === 'SITE_ADMIN') {
        const hospital = hospitals.find(h => h.id === s.hospitalId);
        return hospital?.parentSiteId === user.siteId;
      }
      
      // Radiologist sees only assigned.
      if (user?.role === 'RADIOLOGIST') {
        const radProfile = radiologists.find(r => r.userId === user.id || r.name === user.name);
        return s.assignedRadiologistId === radProfile?.id;
      }
      
      // Hospital Admin/Staff sees only their hospital. 
      return selectedHospitalId ? s.hospitalId === selectedHospitalId : false;
    });
  }, [studies, user, radiologists, hospitals, selectedHospitalId]);

  // Filtering
  const filteredStudies = useMemo(() => {
    return accessibleStudies.filter(s => {
      // Emergency Filter
      if (emergencyFilter && s.priority !== 'Emergency') return false;

      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Active' && s.status !== 'Active') return false;
        if (statusFilter === 'New' && s.status !== 'New') return false;
        if (['Unread', 'Pending', 'Draft', 'Final', 'Review', 'Action Needed'].includes(statusFilter)) {
          if (s.reportingStatus !== statusFilter) return false;
        }
        if (statusFilter === 'Cancel' && s.status !== 'Cancelled') return false;
      }

      // Dropdown Filters
      if (siteFilter && s.hospitalId !== siteFilter) return false;
      if (modalityFilter && s.modality !== modalityFilter) return false;
      if (studyNameFilter && s.bodyPart !== studyNameFilter) return false;
      if (radiologistFilter && s.assignedRadiologistId !== radiologistFilter) return false;

      // Search Term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const p = patients.find(pat => pat.id === s.patientId);
        const matchesSearch = s.caseNumber.toLowerCase().includes(q) || 
                              s.accessionNumber.toLowerCase().includes(q) ||
                              (p && p.name.toLowerCase().includes(q)) ||
                              (p && p.uhid?.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [accessibleStudies, searchTerm, emergencyFilter, statusFilter, siteFilter, modalityFilter, studyNameFilter, radiologistFilter, patients]);

  // Derived options for dropdowns
  const availableSites = useMemo(() => hospitals.filter(h => accessibleStudies.some(s => s.hospitalId === h.id)), [hospitals, accessibleStudies]);
  const availableModalities = useMemo(() => Array.from(new Set(accessibleStudies.map(s => s.modality))), [accessibleStudies]);
  const availableStudyNames = useMemo(() => Array.from(new Set(accessibleStudies.map(s => s.bodyPart))), [accessibleStudies]);
  const availableRadiologists = useMemo(() => {
    return radiologists.filter(r => {
      const relatedUser = users.find(u => u.id === r.userId);
      const isIndependentRad = (r.assignedHospitals && r.assignedHospitals.some(hid => hospitals.find(h => h.id === hid)?.organizationType === 'UNNATHI_MANAGED')) || 
                               (relatedUser?.hospitalId && hospitals.find(h => h.id === relatedUser.hospitalId)?.organizationType === 'UNNATHI_MANAGED');
      
      // If current user is an independent hospital user, they ONLY see their own radiologists
      if (user?.hospitalId) {
        return r.assignedHospitals?.includes(user.hospitalId);
      }
      
      // If current user is Global (Site Admin / Super Admin), they ONLY see Global radiologists
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'SITE_ADMIN') {
        return !isIndependentRad;
      }
      
      return true;
    });
  }, [radiologists, user, users, hospitals]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSiteFilter('');
    setModalityFilter('');
    setStudyNameFilter('');
    setRadiologistFilter('');
    setStatusFilter('All');
    setDateFilter('All');
    setEmergencyFilter(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        showToast('Zip file uploaded successfully!');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyLink = (studyId: string) => {
    navigator.clipboard.writeText(window.location.origin + `/viewer/${studyId}`);
    showToast('Link copied to clipboard!');
  };

  const generateAndDownloadReport = (format: 'pdf' | 'word', study: any) => {
    showToast(`Generating ${format.toUpperCase()} report...`);
    
    setTimeout(async () => {
      const reportTitle = `Radiology Report - ${study.caseNumber}`;
      const patientInfo = `Patient Name: ${patients.find(p => p.id === study.patientId)?.name || 'N/A'}
Modality: ${study.modality}
Status: ${study.reportingStatus}
Date: ${new Date(study.createdAt).toLocaleString()}`;
      const reportBody = `FINDINGS:\nNo significant abnormalities detected in this mock report.\n\nIMPRESSION:\nNormal study.`;

      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(reportTitle, 20, 20);
        
        doc.setFontSize(12);
        const splitPatientInfo = doc.splitTextToSize(patientInfo, 170);
        doc.text(splitPatientInfo, 20, 40);
        
        const splitBody = doc.splitTextToSize(reportBody, 170);
        doc.text(splitBody, 20, 80);
        
        doc.save(`Report_${study.caseNumber}.pdf`);
      } else {
        // Create an HTML doc that MS Word can read
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><title>${reportTitle}</title></head>
          <body>
            <h2>${reportTitle}</h2>
            <pre>${patientInfo}</pre>
            <br/><br/>
            <pre>${reportBody}</pre>
          </body>
          </html>
        `;
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${study.caseNumber}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 800);
  };

  const toggleSelectStudy = (id: string) => {
    setSelectedStudies(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleAssignRadiologist = (studyId: string, radId: string) => {
    updateStudy(studyId, { assignedRadiologistId: radId, reportingStatus: 'Pending', assignedAt: new Date().toISOString() });
  };

  const toggleSeries = (id: string) => {
    setExpandedSeries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread': return 'bg-gray-500 text-white';
      case 'Pending': return 'bg-[#F26B50] text-white';
      case 'Final': return 'bg-[#009688] text-white';
      case 'Verified': 
      case 'Dispatched': return 'bg-[#4CAF50] text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const handleAction = (action: string, study: any) => {
    if (action === 'History') {
      setSelectedStudyForHistory(study);
      setHistoryModalOpen(true);
    } else if (action === 'Info') {
      setSelectedStudyForInfo(study);
      setInfoModalOpen(true);
    } else {
      alert(`Triggered: ${action}`);
    }
  };

  const handleDownload = (format: 'pdf' | 'word', studyId: string) => {
    alert(`Downloading ${format.toUpperCase()} for study ${studyId}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#f0f2f5] font-sans">
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
      
      {/* Top Header / Filter Bar */}
      <div className="bg-[#2D333B] text-white px-2 py-1 flex items-center justify-between text-xs border-b border-[#1E2328]">
        <div className="flex items-center space-x-1">
          <Button onClick={() => setDateFilter('Today')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${dateFilter === 'Today' ? 'bg-[#3D444D] text-white' : 'text-slate-300'}`}>Today</Button>
          <Button onClick={() => setDateFilter('Yesterday')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${dateFilter === 'Yesterday' ? 'bg-[#3D444D] text-white' : 'text-slate-300'}`}>Yesterday</Button>
          <Button onClick={() => setDateFilter('Month')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${dateFilter === 'Month' ? 'bg-[#3D444D] text-white' : 'text-slate-300'}`}>Month</Button>
          <div className="w-px h-4 bg-slate-600 mx-1"></div>
          
          <Button onClick={() => setStatusFilter('All')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'All' ? 'bg-[#3D444D] text-white' : 'text-slate-300'}`}>All</Button>
          <Button onClick={() => setStatusFilter('Active')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Active' ? 'bg-[#3D444D] text-[#4CAF50]' : 'text-[#4CAF50]'}`}>Active</Button>
          <Button onClick={() => setStatusFilter('New')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'New' ? 'bg-[#3D444D] text-[#2196F3]' : 'text-[#2196F3]'}`}>New</Button>
          <Button onClick={() => setStatusFilter('Unread')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Unread' ? 'bg-[#3D444D] text-gray-300' : 'text-gray-300'}`}>Unread</Button>
          <Button onClick={() => setStatusFilter('Pending')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Pending' ? 'bg-[#3D444D] text-[#F26B50]' : 'text-[#F26B50]'}`}>Pending</Button>
          <Button onClick={() => setStatusFilter('Action Needed')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Action Needed' ? 'bg-[#3D444D] text-[#FF9800]' : 'text-[#FF9800]'}`}>Action Needed</Button>
          <Button onClick={() => setStatusFilter('Draft')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Draft' ? 'bg-[#3D444D] text-slate-300' : 'text-slate-300'}`}>Draft</Button>
          <Button onClick={() => setStatusFilter('Final')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Final' ? 'bg-[#3D444D] text-[#009688]' : 'text-[#009688]'}`}>Final</Button>
          <Button onClick={() => setStatusFilter('Review')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Review' ? 'bg-[#3D444D] text-[#E91E63]' : 'text-[#E91E63]'}`}>Review</Button>
          <Button onClick={() => setStatusFilter('Cancel')} variant="ghost" className={`h-7 px-2 hover:bg-[#3D444D] rounded-sm text-xs font-semibold ${statusFilter === 'Cancel' ? 'bg-[#3D444D] text-[#F44336]' : 'text-[#F44336]'}`}>Cancel</Button>
        </div>
      </div>

      {/* Secondary Search Bar */}
      <div className="bg-white p-2 flex items-center space-x-2 border-b border-slate-200 text-xs shadow-sm">
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className="border border-slate-300 rounded-sm px-2 py-1 bg-white focus:outline-none w-40">
          <option value="">Select Site Names</option>
          {availableSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Patient ID / Name / Accession No" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-sm px-2 py-1 w-60 focus:outline-none focus:border-blue-500" 
          />
        </div>
        <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)} className="border border-slate-300 rounded-sm px-2 py-1 bg-white focus:outline-none w-32">
          <option value="">Modality</option>
          {availableModalities.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={studyNameFilter} onChange={e => setStudyNameFilter(e.target.value)} className="border border-slate-300 rounded-sm px-2 py-1 bg-white focus:outline-none w-48">
          <option value="">Select Study Name</option>
          {availableStudyNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={radiologistFilter} onChange={e => setRadiologistFilter(e.target.value)} className="border border-slate-300 rounded-sm px-2 py-1 bg-white focus:outline-none w-40">
          <option value="">Select Radiologist</option>
          {availableRadiologists.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button onClick={() => {}} className="h-7 px-4 bg-[#0D2461] hover:bg-[#081840] text-white text-xs rounded-sm font-semibold">Go</Button>
          <Button onClick={handleClearFilters} variant="outline" className="h-7 px-3 text-xs rounded-sm">Clear</Button>
        </div>
      </div>
      
      <div className="bg-slate-100 p-2 flex justify-between items-center border-b border-slate-200">
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/studies/new')} className="h-7 bg-[#2D333B] hover:bg-[#1E2328] text-white text-xs px-3 rounded-sm">
            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Study
          </Button>
          <Button onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }} className="h-7 bg-[#2D333B] hover:bg-[#1E2328] text-white text-xs px-3 rounded-sm">
            {isUploading ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
            {isUploading ? 'Uploading...' : 'Zip Upload'}
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".zip" onChange={handleZipUpload} />
          <Button onClick={handleRefresh} variant="outline" className={`h-7 bg-white text-xs px-3 rounded-sm border-slate-300 shadow-sm flex items-center ${isRefreshing ? 'opacity-50' : ''}`}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setEmergencyFilter(!emergencyFilter)} className={`h-7 text-white text-xs px-3 rounded-sm transition-colors ${emergencyFilter ? 'bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}>
            Emergency
          </Button>
          <select className="h-7 border border-slate-300 rounded-sm px-2 text-xs bg-white">
            <option>Assigned studies</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="h-7 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 rounded-sm">Online staff</Button>
          <div className="relative">
            <input type="text" placeholder="Search text" className="h-7 border border-slate-300 rounded-sm pl-2 pr-8 text-xs focus:outline-none" />
            <Search className="w-3.5 h-3.5 absolute right-2 top-1.5 text-slate-400" />
          </div>
          <span className="text-xs font-bold text-slate-700 mx-2">Exams : {filteredStudies.length}</span>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#414E5B] text-white sticky top-0 z-20 shadow-md">
            <tr>
              <th className="py-2 px-3 font-semibold w-[12%] cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B] text-center">Patient ID</th>
              <th className="py-2 px-3 font-semibold w-[18%] cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B]">Patient Name</th>
              <th className="py-2 px-2 font-semibold w-[8%] text-center cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B]">Age / Sex</th>
              <th className="py-2 px-2 font-semibold w-[5%] text-center cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B]">Mod. ↕</th>
              <th className="py-2 px-3 font-semibold w-[15%] cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B]">Study / Description ↕</th>
              <th className="py-2 px-2 font-semibold w-[8%] text-center cursor-pointer border-r border-[#515E6B] hover:bg-[#515E6B]">Date ↕</th>
              <th className="py-2 px-3 font-semibold w-[10%] text-center border-r border-[#515E6B]">History / Attach</th>
              <th className="py-2 px-3 font-semibold w-[8%] text-center border-r border-[#515E6B]">Report</th>
              <th className="py-2 px-3 font-semibold w-[12%] text-center border-r border-[#515E6B]">Radiologist</th>
              <th className="py-2 px-2 font-semibold w-[5%] text-center border-r border-[#515E6B]">Se / Img</th>
              <th className="py-2 px-3 font-semibold text-center hover:bg-[#515E6B] cursor-pointer">Centre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStudies.map((study, idx) => {
              const patient = patients.find(p => p.id === study.patientId);
              const hospital = hospitals.find(h => h.id === study.hospitalId);
              const rad = radiologists.find(r => r.id === study.assignedRadiologistId);
              
              const dateStr = format(new Date(study.studyDate), 'dd-MM-yy');
              const timeStr = format(new Date(study.studyDate), 'HH:mm');
              
              const historyDate = study.updatedAt ? format(new Date(study.updatedAt), 'dd-MM-yy HH:mm') : '-';
              const assignedTime = study.assignedAt ? format(new Date(study.assignedAt), 'dd-MM-yy HH:mm') : '';
              const reportTime = study.finalizedAt ? format(new Date(study.finalizedAt), 'dd-MM-yy HH:mm') : '';

              const isExpanded = expandedSeries[study.id];

              return (
                <React.Fragment key={study.id}>
                  <tr className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${selectedStudies.includes(study.id) ? 'bg-blue-50' : ''}`}>
                    <td className="py-2 px-3 align-top">
                      <div className="font-semibold text-slate-800">{study.caseNumber}</div>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <input type="checkbox" checked={selectedStudies.includes(study.id)} onChange={() => toggleSelectStudy(study.id)} className="rounded-sm border-slate-300" />
                        <Pencil onClick={() => { setSelectedPatientForEdit(patient); setEditPatientModalOpen(true); }} className="w-3.5 h-3.5 text-[#00A8CC] cursor-pointer hover:text-blue-700" title="Edit Patient" />
                      </div>
                    </td>
                    
                    <td className="py-2 px-3 align-top font-bold text-slate-700 pt-3">
                      {patient?.name}
                    </td>
                    
                    <td className="py-2 px-2 align-top text-center pt-3 text-slate-600 font-semibold">
                      {patient?.age}Y / {patient?.gender?.charAt(0)}
                    </td>
                    
                    <td className="py-2 px-2 align-top text-center pt-3 font-bold text-slate-800">
                      {study.modality}
                    </td>
                    
                    <td className="py-2 px-3 align-top">
                      <div className="font-bold text-slate-800 uppercase text-[11px] mb-1 leading-tight">{study.bodyPart}</div>
                      <div className="text-slate-500 text-[10px] leading-tight">{study.studyDescription}</div>
                    </td>
                    
                    <td className="py-2 px-2 align-top text-center">
                      <div className="font-semibold text-slate-700">{dateStr}</div>
                      <div className="text-slate-500 mt-1">{timeStr}</div>
                    </td>
                    
                    <td className="py-2 px-2 align-top">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] text-slate-500 mb-1">{historyDate}</div>
                        <div className="flex items-center space-x-1.5 border border-slate-200 px-2 py-0.5 rounded bg-white cursor-pointer hover:bg-slate-50 shadow-sm" onClick={() => handleAction('History', study)}>
                          <FileText className="w-3 h-3 text-[#00A8CC]" />
                          <span className="font-mono text-[10px] font-bold text-[#0D2461]">TT : {study.tat}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-2 px-2 align-top text-center pt-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm ${getStatusColor(study.reportingStatus)}`}>
                        {study.reportingStatus}
                      </span>
                      {study.reportingStatus === 'Pending' && rad && <div className="text-[10px] text-[#F26B50] font-semibold mt-1">{rad.name}</div>}
                    </td>
                    
                    <td className="py-2 px-2 align-top">
                      {['Final', 'Verified', 'Dispatched'].includes(study.reportingStatus) ? (
                        <div className="flex flex-col items-center">
                          <div className="flex space-x-2 mb-1">
                            <button onClick={() => generateAndDownloadReport('pdf', study)} className="p-1 hover:bg-red-50 text-red-600 rounded bg-white shadow-sm border border-red-100" title="Download PDF">
                              <FileIcon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => generateAndDownloadReport('word', study)} className="p-1 hover:bg-blue-50 text-blue-600 rounded bg-white shadow-sm border border-blue-100" title="Download Word">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <div className="font-bold text-slate-800 ml-1">{rad?.name}</div>
                          </div>
                          {assignedTime && <div className="text-[9px] text-slate-400">{assignedTime}</div>}
                          {reportTime && <div className="text-[9px] text-slate-400">{reportTime}</div>}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {['Unread', 'Pending'].includes(study.reportingStatus) && !study.assignedRadiologistId ? (
                            <select 
                              onChange={(e) => e.target.value && handleAssignRadiologist(study.id, e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white w-full"
                              value={study.assignedRadiologistId || ''}
                            >
                              <option value="">Select Radiologist</option>
                              {availableRadiologists.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          ) : (
                            <>
                              <div className="font-bold text-slate-800">{rad?.name || 'Unassigned'}</div>
                              <div className="text-[9px] text-slate-400 mt-1">{assignedTime}</div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-2 px-2 align-top pt-2.5 text-center">
                      <div className="text-[10px] font-bold text-slate-600 mb-1">{study.series?.length || 1} / {study.series?.reduce((acc: any, s: any) => acc + s.imageCount, 0) || 1}</div>
                      <div className="flex justify-center space-x-1">
                        <button onClick={() => toggleSeries(study.id)} className="p-1 text-slate-500 hover:text-[#0D2461] hover:bg-slate-200 rounded" title="View Series">
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => navigate(`/viewer/${study.id}`)} className="p-1 text-[#00A8CC] hover:text-blue-600 hover:bg-blue-50 rounded" title="Open Viewer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    
                    <td className="py-2 px-3 align-top text-center pt-2.5">
                      <div className="font-semibold text-slate-700 text-xs mb-1 truncate max-w-[120px] mx-auto" title={hospital?.name}>{hospital?.name}</div>
                      <div className="flex justify-center space-x-1">
                        <button onClick={() => generateAndDownloadReport('pdf', study)} className="p-1 hover:bg-slate-200 rounded" title="Download Report"><Download className="w-3 h-3 text-slate-600" /></button>
                        <button onClick={() => { setSelectedStudyForShare(study); setShareModalOpen(true); }} className="p-1 hover:bg-slate-200 rounded" title="Share"><Share2 className="w-3 h-3 text-slate-600" /></button>
                        <button onClick={() => handleCopyLink(study.id)} className="p-1 hover:bg-slate-200 rounded" title="Copy Link"><Copy className="w-3 h-3 text-slate-600" /></button>
                        <button onClick={() => handleAction('Info', study)} className="p-1 hover:bg-slate-200 rounded" title="More Info"><Info className="w-3 h-3 text-slate-600" /></button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#2D333B]">
                      <td colSpan={11} className="p-0 border-b border-[#1E2328]">
                        <div className="flex items-center space-x-2 p-2 overflow-x-auto">
                          {study.series?.map((series: any, sIdx: number) => (
                            <div key={sIdx} className="flex flex-col items-center justify-center p-2 bg-[#1E2328] border border-gray-700 rounded-lg cursor-pointer hover:border-teal-500 w-32 shrink-0">
                              <img src={series.image} alt={series.name} className="w-full aspect-square object-cover rounded mb-1 opacity-80" />
                              <div className="text-[10px] text-teal-400 truncate w-full text-center">{series.name}</div>
                              <div className="text-[9px] text-gray-500">{series.imageCount} imgs</div>
                            </div>
                          ))}
                          {(!study.series || study.series.length === 0) && (
                            <div className="p-4 text-xs text-gray-500 italic">No series data available</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-slate-200 p-2 text-xs flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      </div>

      {/* Existing History Modal for editing */}
      <AddHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        study={selectedStudyForHistory}
        patient={patients.find(p => p.id === selectedStudyForHistory?.patientId)}
        hospital={hospitals.find(h => h.id === selectedStudyForHistory?.hospitalId)}
      />
      
      <MoreInfoModal 
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        study={selectedStudyForInfo}
        patient={patients.find(p => p.id === selectedStudyForInfo?.patientId)}
        hospital={hospitals.find(h => h.id === selectedStudyForInfo?.hospitalId)}
      />
      
      <EditPatientModal
        isOpen={editPatientModalOpen}
        onClose={() => setEditPatientModalOpen(false)}
        patient={selectedPatientForEdit}
      />
      
      {selectedStudyForShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          study={selectedStudyForShare}
        />
      )}
    </div>
  );
}
