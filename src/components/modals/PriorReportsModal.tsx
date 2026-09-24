import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { X, FileText, History, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import type { Study } from '../../types';

interface PriorReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorStudies: Study[];
  patientName: string;
}

export function PriorReportsModal({ isOpen, onClose, priorStudies, patientName }: PriorReportsModalProps) {
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(priorStudies[0] || null);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0D2461]">Prior Reports</h2>
              <p className="text-xs text-slate-500 font-medium">Patient: {patientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden bg-slate-50">
          
          {/* Left Sidebar: List of Studies */}
          <div className="w-1/3 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-3">
            {priorStudies.length === 0 ? (
              <div className="text-sm text-slate-500 font-medium text-center py-10">No prior reports found.</div>
            ) : (
              priorStudies.map(study => (
                <div 
                  key={study.id} 
                  onClick={() => setSelectedStudy(study)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedStudy?.id === study.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{study.modality}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${['Final', 'Verified', 'Dispatched'].includes(study.reportingStatus) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {study.reportingStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-3">{study.studyDescription}</p>
                  <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(study.studyDate), 'dd MMM yyyy')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Area: Report View */}
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
            {selectedStudy ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-full">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-xl font-black text-[#0D2461]">{selectedStudy.modality} - {selectedStudy.studyDescription}</h3>
                  <div className="text-sm text-slate-500 font-medium mt-1">Reported on {format(new Date(selectedStudy.studyDate), 'dd MMMM yyyy')}</div>
                </div>
                
                {selectedStudy.reportText ? (
                  <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedStudy.reportText}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold">No report content available.</p>
                    <p className="text-sm">This study might not have been finalized or reported yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">
                Select a prior study to view its report.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
