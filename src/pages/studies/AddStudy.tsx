import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { History, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function AddStudy() {
  const { user } = useAuthStore();
  const { addStudy, addInvoice, patients, hospitals, studies, templates, modalities } = useMockDb();
  const navigate = useNavigate();

  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.siteId) return h.parentSiteId === user.siteId;
    if (user?.hospitalId) return h.id === user.hospitalId;
    return false;
  });

  const [formData, setFormData] = useState({
    patientId: patients?.[0]?.id || '',
    modality: 'CT',
    studyDescription: '',
    bodyPart: '',
    priority: 'Routine',
    hospitalId: user?.hospitalId || scopedHospitals?.[0]?.id || '',
    referringDoctor: '',
    historyAttachment: '',
    studyUid: '',
    clinicalHistory: '',
    provisionalDiagnosis: '',
    relevantNotes: '',
    creatinineFlag: false,
    pregnancyFlag: false,
    technician: ''
  });

  const previousStudies = studies.filter(s => s.patientId === formData.patientId).sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudy = {
      ...formData,
      referringPhysician: formData.referringDoctor,
      id: 'st' + Date.now(),
      caseNumber: 'CAS-' + Math.floor(10000 + Math.random() * 90000),
      accessionNumber: 'ACC-' + Math.floor(10000 + Math.random() * 90000),
      studyDate: new Date().toISOString(),
      status: 'New',
      reportingStatus: 'Pending',
      tat: '0h',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;
    
    addStudy(newStudy);

    // Auto-generate invoice based on configured Template pricing
    const matchingTemplate = templates?.find(t => t.modality === formData.modality && t.studyName === formData.studyDescription.toUpperCase());
    if (matchingTemplate && matchingTemplate.price && matchingTemplate.price > 0) {
      addInvoice({
        id: 'inv' + Date.now(),
        studyId: newStudy.id,
        patientId: newStudy.patientId,
        hospitalId: newStudy.hospitalId,
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        amount: matchingTemplate.price,
        status: 'Unpaid',
        date: new Date().toISOString(),
        dueDate: new Date().toISOString()
      });
    }

    navigate('/studies');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Add New Study</h1>
        <Button variant="outline" onClick={() => navigate('/studies')}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Select Patient</label>
            <select className="w-full border rounded-md p-2" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.uhid})</option>)}
            </select>
            
            {previousStudies.length > 0 && (
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center text-[#0D2461] font-bold mb-3">
                  <History className="w-4 h-4 mr-2" />
                  Prior Scans ({previousStudies.length})
                </div>
                <div className="space-y-2">
                  {previousStudies.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.modality} - {s.studyDescription}</p>
                          <p className="text-xs text-slate-500">{format(new Date(s.studyDate), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {s.reportingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Modality</label>
            <select className="w-full border rounded-md p-2" value={formData.modality} onChange={e => setFormData({...formData, modality: e.target.value})}>
              {modalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select className="w-full border rounded-md p-2" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              {['Routine', 'Urgent', 'Emergency', 'Follow Up'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Study Description</label>
            {(() => {
              const availableTemplates = templates?.filter(t => t.hospitalId === formData.hospitalId && t.modality === formData.modality && t.isActive) || [];
              return (
                <>
                  <Input 
                    required 
                    list="study-templates"
                    value={formData.studyDescription} 
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setFormData({...formData, studyDescription: val});
                    }} 
                    placeholder="e.g. MRI Brain with Contrast" 
                  />
                  <datalist id="study-templates">
                    {availableTemplates.map(t => (
                      <option key={t.id} value={t.studyName} />
                    ))}
                  </datalist>
                </>
              );
            })()}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Body Part</label>
            <Input value={formData.bodyPart} onChange={e => setFormData({...formData, bodyPart: e.target.value})} placeholder="e.g. Brain" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Referring Doctor</label>
            <Input value={formData.referringDoctor} onChange={e => setFormData({...formData, referringDoctor: e.target.value})} />
          </div>

          {user?.role !== 'HOSPITAL_ADMIN' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital</label>
              <select className="w-full border rounded-md p-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
                {scopedHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">History / Prescription Image (URL)</label>
            <Input type="url" placeholder="e.g. https://example.com/prescription.jpg" value={formData.historyAttachment} onChange={e => setFormData({...formData, historyAttachment: e.target.value})} />
          </div>
          
          {/* New Fields added per requirements */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Study UID</label>
            <Input value={formData.studyUid} onChange={e => setFormData({...formData, studyUid: e.target.value})} placeholder="DICOM Study Instance UID" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Technician / User</label>
            <Input value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} placeholder="Technician Name" />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Clinical History</label>
            <textarea className="w-full border rounded-md p-2 text-sm" rows={2} value={formData.clinicalHistory} onChange={e => setFormData({...formData, clinicalHistory: e.target.value})} placeholder="Clinical History..." />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Provisional Diagnosis</label>
            <textarea className="w-full border rounded-md p-2 text-sm" rows={2} value={formData.provisionalDiagnosis} onChange={e => setFormData({...formData, provisionalDiagnosis: e.target.value})} placeholder="Provisional Diagnosis..." />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Previous Surgery / Relevant Notes</label>
            <textarea className="w-full border rounded-md p-2 text-sm" rows={2} value={formData.relevantNotes} onChange={e => setFormData({...formData, relevantNotes: e.target.value})} placeholder="Relevant Notes..." />
          </div>

          <div className="space-y-2 col-span-2 flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={formData.creatinineFlag} onChange={e => setFormData({...formData, creatinineFlag: e.target.checked})} className="rounded border-gray-300" />
              <span className="text-sm font-medium">Creatinine Flag</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={formData.pregnancyFlag} onChange={e => setFormData({...formData, pregnancyFlag: e.target.checked})} className="rounded border-gray-300" />
              <span className="text-sm font-medium">Pregnancy Flag</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/studies')}>Cancel</Button>
          <Button type="submit">Save Study</Button>
        </div>
      </form>
    </div>
  );
}
