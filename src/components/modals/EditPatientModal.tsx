import { useState, useEffect } from 'react';
import type { Patient } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function EditPatientModal({ isOpen, onClose, patient }: EditPatientModalProps) {
  const { updatePatient } = useMockDb();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setAge(patient.age?.toString() || '');
      setGender(patient.gender || '');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSave = () => {
    updatePatient(patient.id, {
      name,
      age: parseInt(age) || undefined,
      gender: gender as any
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E2328] rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-700">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white">Edit Patient Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Patient Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Age</label>
              <Input 
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-700 flex justify-end space-x-3 bg-slate-800/30">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-500 text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
