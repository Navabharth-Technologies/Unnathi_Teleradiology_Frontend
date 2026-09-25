import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, FileCheck2, Filter, Eye, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/dialog';

export default function VerificationWorklist() {
  const { studies, patients, hospitals, radiologists } = useMockDb();
  const { user, selectedHospitalId } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Show studies that are Final (needs verification), Verified, or Dispatched
  const verificationStudies = studies
    .filter(s => ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus))
    .filter(s => {
      // Scoping logic: Ensure the verifier only sees studies for their hospital/site
      if (user?.role === 'SUPER_ADMIN') {
        // Super Admin sees all studies for operational views now
        return true;
      }
      
      if (user?.role === 'SITE_ADMIN') {
        const hospital = hospitals.find(h => h.id === s.hospitalId);
        return hospital?.parentSiteId === user.siteId;
      }
      
      if (selectedHospitalId) return s.hospitalId === selectedHospitalId;
      if (user?.hospitalId) return s.hospitalId === user.hospitalId;
      
      return true; // Global users without specific hospital
    })
    .filter(s => 
      s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(s.patientId).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  function getPatientName(id: string) { return patients.find(p => p.id === id)?.name || 'Unknown'; }
  const getPatientUhid = (id: string) => patients.find(p => p.id === id)?.uhid || 'Unknown';
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';
  const getRadiologistName = (id?: string) => id ? radiologists.find(r => r.id === id)?.name : 'Unknown';

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Verification & Dispatch</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Review finalized reports before dispatching to hospitals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search by case or patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Case Details</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Patient / Hospital</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Radiologist</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verificationStudies.map(study => (
              <TableRow key={study.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                <TableCell className="py-4 px-6 align-top">
                  <div className="font-black text-slate-800 text-sm">{study.caseNumber}</div>
                  <div className="mt-1">
                    <span className="bg-slate-100 text-[#0D2461] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">{study.modality}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-medium">{format(new Date(study.updatedAt), 'dd MMM yyyy, HH:mm')}</div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <div className="font-bold text-slate-800 text-sm uppercase">{getPatientName(study.patientId)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-1">{getPatientUhid(study.patientId)}</div>
                  <div className="text-xs font-semibold text-slate-500">{getHospitalName(study.hospitalId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <div className="font-bold text-slate-800 text-sm uppercase">
                    {getRadiologistName(study.assignedRadiologistId)}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top text-center">
                  {study.reportingStatus === 'Dispatched' ? (
                    <span className="inline-block px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border bg-emerald-50 text-emerald-600 border-emerald-200">
                      Dispatched
                    </span>
                  ) : study.reportingStatus === 'Verified' ? (
                    <span className="inline-block px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border bg-indigo-50 text-indigo-600 border-indigo-200">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border bg-amber-50 text-amber-600 border-amber-200">
                      Awaiting Verification
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full gap-2">
                    {study.reportingStatus === 'Dispatched' ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/verification/${study.id}/preview`)}
                        className="h-9 px-3 text-xs font-black rounded-lg border-slate-200 text-slate-600 hover:text-[#0D2461] hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" /> View
                      </Button>
                    ) : study.reportingStatus === 'Verified' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/verification/${study.id}/preview`)}
                          className="h-9 px-3 text-xs font-black rounded-lg border-slate-200 text-slate-600 hover:text-[#0D2461] hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" /> View
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="h-9 px-3 text-xs font-black rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                            >
                              <Send className="mr-2 h-3.5 w-3.5" /> Dispatch
                            </Button>
                          </DialogTrigger>
                          <DialogPortal>
                            <DialogOverlay />
                            <DialogContent className="sm:max-w-md bg-white border border-slate-100 shadow-xl rounded-2xl p-6">
                              <DialogHeader>
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <DialogTitle className="text-xl font-black text-slate-800">Dispatch Successful</DialogTitle>
                                </div>
                                <DialogDescription className="text-slate-500 font-medium leading-relaxed pl-13">
                                  Report securely dispatched to <span className="text-slate-800 font-bold">{getHospitalName(study.hospitalId)}</span>! The status has been updated to <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">Dispatched</span>.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <DialogClose asChild>
                                  <Button 
                                    className="bg-[#0D2461] hover:bg-[#081840] text-white font-bold px-6 shadow-md"
                                    onClick={() => {
                                      useMockDb.getState().updateStudy(study.id, { reportingStatus: 'Dispatched' });
                                    }}
                                  >
                                    Done
                                  </Button>
                                </DialogClose>
                              </div>
                            </DialogContent>
                          </DialogPortal>
                        </Dialog>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/verification/${study.id}/preview`)}
                        className="h-9 px-4 text-xs font-black rounded-lg bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-sm transition-all"
                      >
                        <FileCheck2 className="mr-2 h-3.5 w-3.5" /> Review & Verify
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {verificationStudies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center">
                    <Filter className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-bold">No reports pending verification.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
