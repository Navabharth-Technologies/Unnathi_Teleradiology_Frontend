import { X } from 'lucide-react';
import type { Study, Patient, Hospital } from '../../types';
import { format } from 'date-fns';

interface MoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: Study | null;
  patient: Patient | undefined;
  hospital: Hospital | undefined;
}

export function MoreInfoModal({ isOpen, onClose, study, patient, hospital }: MoreInfoModalProps) {
  if (!isOpen || !study) return null;

  const rows = [
    { label: 'Site Name', value: hospital?.name || '-' },
    { label: 'Patient ID', value: patient?.uhid || '-' },
    { label: 'Patient Name', value: patient?.name || '-' },
    { label: 'Modality', value: study.modality },
    { label: 'Study Name', value: study.bodyPart },
    { label: 'Ref. Phy', value: patient?.referringDoctor || '-' },
    { label: 'Exam Date', value: study.studyDate ? format(new Date(study.studyDate), 'dd-MM-yyyy HH:mm') : '-' },
    { label: 'Uploaded On', value: study.createdAt ? format(new Date(study.createdAt), 'dd-MM-yyyy HH:mm') : '-' },
    { label: 'History Time', value: study.historyText || study.historyAttachment ? format(new Date(study.updatedAt), 'dd-MM-yyyy HH:mm') : '-' }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-3 bg-slate-600 text-white flex justify-center relative">
          <h2 className="text-sm font-bold">More Info</h2>
          <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            {rows.map((row, i) => (
              <div key={row.label} className={`flex border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                <div className="w-1/3 py-2 px-3 text-xs text-slate-500 font-medium border-r border-slate-100">{row.label}</div>
                <div className="w-2/3 py-2 px-3 text-xs text-slate-800 font-bold">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
