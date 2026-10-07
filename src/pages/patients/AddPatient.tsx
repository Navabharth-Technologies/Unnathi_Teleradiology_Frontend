import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';

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
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Add New Patient</h1>
          <p className="text-sm text-muted-foreground mt-1">Register a new patient into the system</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
            <CardDescription>Enter demographic and registration information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Patient Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Date of Birth</label>
                <Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                <select 
                  className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                  value={formData.gender} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="patient@example.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Referring Doctor</label>
                <Input value={formData.referringDoctor} onChange={e => setFormData({...formData, referringDoctor: e.target.value})} placeholder="Dr. Name" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Branch</label>
                <select 
                  className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                  value={formData.branchId} 
                  onChange={e => setFormData({...formData, branchId: e.target.value})}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Hospital</label>
                <select 
                  className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                  value={formData.hospitalId} 
                  onChange={e => setFormData({...formData, hospitalId: e.target.value})}
                >
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 bg-muted/50 border-t border-border mt-4 py-4 px-6 rounded-b-lg">
            <Button type="button" variant="ghost" onClick={() => navigate('/patients')}>Cancel</Button>
            <Button type="submit">Save Patient</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
