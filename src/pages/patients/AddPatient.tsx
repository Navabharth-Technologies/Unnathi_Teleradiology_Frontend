import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select'; // Need to install proper shadcn select if using real one, for now use standard select for speed or a wrapper
import { useNavigate } from 'react-router-dom';

export default function AddPatient() {
  const { addPatient, branches, hospitals } = useMockDb();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    referringDoctor: '',
    branchId: branches[0]?.id || '',
    hospitalId: hospitals[0]?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = {
      ...formData,
      id: 'p' + Date.now(),
      uhid: 'UHID-' + Math.floor(1000 + Math.random() * 9000),
      age: new Date().getFullYear() - new Date(formData.dob).getFullYear(),
      registrationDate: new Date().toISOString()
    } as any;
    
    addPatient(newPatient);
    navigate('/patients');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Add New Patient</h1>
        <Button variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient Name</label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <select className="w-full border rounded-md p-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Referring Doctor</label>
            <Input value={formData.referringDoctor} onChange={e => setFormData({...formData, referringDoctor: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <select className="w-full border rounded-md p-2" value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hospital</label>
            <select className="w-full border rounded-md p-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
          <Button type="submit">Save Patient</Button>
        </div>
      </form>
    </div>
  );
}
