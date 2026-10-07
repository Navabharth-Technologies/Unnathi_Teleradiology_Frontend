import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Search, Upload, PlusCircle, Eye, UserPlus, X, Share2, ClipboardList, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '../../components/modals/ShareModal';
import { AddHistoryModal } from '../../components/modals/AddHistoryModal';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import type { Study } from '../../types';
import { Card } from '../../components/ui/card';

export default function StudiesList() {
  const { studies, patients, hospitals, updateStudy } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyStudy, setHistoryStudy] = useState<Study | null>(null);
  const [sharingStudy, setSharingStudy] = useState<Study | null>(null);
  const navigate = useNavigate();
  const { currentRole, selectedHospitalId, user } = useAuthStore();

  const filtered = studies.filter(s => {
    if (selectedHospitalId && s.hospitalId !== selectedHospitalId) return false;
    
    if (user?.role === 'SITE_ADMIN') {
      const hospital = hospitals.find(h => h.id === s.hospitalId);
      if (hospital?.parentSiteId !== user.siteId) return false;
    }
    
    return s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
           s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Emergency': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Urgent': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-info/10 text-info border-info/20';
      case 'Final': return 'bg-success/10 text-success border-success/20';
      case 'Action Needed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Study Worklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and assign all incoming diagnostic studies</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by case or accession..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          {currentRole !== 'Accountant' && (
            <Button onClick={() => navigate('/studies/new')}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Study
            </Button>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Case No</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Hospital</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Modality/Study</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Priority</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(study => (
                <TableRow key={study.id} className="hover:bg-muted/30 transition-colors border-b border-border group cursor-pointer" onClick={() => navigate(`/viewer/${study.id}`)}>
                  <TableCell className="py-3 font-medium text-foreground text-sm">{study.caseNumber}</TableCell>
                  <TableCell className="py-3 font-medium text-primary text-sm">{getPatientName(study.patientId)}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{getHospitalName(study.hospitalId)}</TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-foreground text-sm">{study.modality}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{study.studyDescription}</div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityColor(study.priority)}`}>
                      {study.priority}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusColor(study.status)}`}>
                      {study.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {format(new Date(study.studyDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); navigate(`/viewer/${study.id}`); }}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setHistoryStudy(study); }}>
                        <ClipboardList className={`w-4 h-4 ${study.clinicalHistory ? 'text-success' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setSharingStudy(study); }}>
                        <Share2 className="w-4 h-4 text-info" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    No studies found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddHistoryModal 
        isOpen={!!historyStudy}
        onClose={() => setHistoryStudy(null)}
        study={historyStudy}
        patient={historyStudy ? patients.find(p => p.id === historyStudy.patientId) : undefined}
        hospital={historyStudy ? hospitals.find(h => h.id === historyStudy.hospitalId) : undefined}
      />
      
      <ShareModal 
        isOpen={!!sharingStudy} 
        onClose={() => setSharingStudy(null)}
        study={sharingStudy}
        patient={patients.find(p => p.id === sharingStudy?.patientId)}
        hospital={hospitals.find(h => h.id === sharingStudy?.hospitalId)}
      />
    </div>
  );
}
