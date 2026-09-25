import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, MessageCircle, Copy, Link as LinkIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: any;
  patient: any;
  hospital: any;
}

export function ShareModal({ isOpen, onClose, study, patient, hospital }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const demoLink = `${window.location.origin}/viewer/${study?.id}`;
  
  const patientName = patient?.name || 'Patient';
  const hospitalName = hospital?.name || 'our center';
  const patientDetailsString = `Dear ${patientName},\nHere is the report for your scanning at ${hospitalName}.\nLink: ${demoLink}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(patientDetailsString);
    if (phoneNumber.trim()) {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
      window.open(`https://wa.me/${finalNumber}?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0D2461]">Share Study & Report</h2>
              <p className="text-xs text-slate-500 font-medium">{patient?.name} • {study?.modality}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Share via WhatsApp</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-semibold">+91</span>
                  </div>
                  <Input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter mobile number (Optional)"
                    className="pl-10 h-11 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button 
                  onClick={handleWhatsApp}
                  className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold h-11 px-6 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Copy Links</h3>
              <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                onClick={() => handleCopy(patientDetailsString, 'details')}
                className="border-slate-200 hover:bg-slate-50 text-[#0D2461] font-bold flex-1 h-11"
              >
                {copied === 'details' ? <CheckIcon className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied === 'details' ? 'Copied!' : 'Copy with Details'}
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => handleCopy(demoLink, 'link')}
                className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold w-full h-11"
              >
                {copied === 'link' ? <CheckIcon className="w-4 h-4 mr-2 text-emerald-500" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                {copied === 'link' ? 'Link Copied!' : 'Copy Link Only'}
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preview Text</p>
            <pre className="text-sm text-slate-700 font-medium whitespace-pre-wrap font-sans">
              {patientDetailsString}
            </pre>
          </div>

        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button variant="outline" onClick={onClose} className="font-bold rounded-xl border-slate-200 hover:bg-white text-slate-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function CheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
