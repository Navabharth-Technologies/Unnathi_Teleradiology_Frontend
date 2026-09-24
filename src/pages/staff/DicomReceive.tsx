import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  CheckCircle2, AlertCircle, Upload, Loader2,
  FileImage, Zap, User, Calendar, Stethoscope, Activity, X
} from 'lucide-react';
import * as dicomParser from 'dicom-parser';
import JSZip from 'jszip';
import { format, parse, isValid } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedDicom {
  patientName: string;
  patientId: string;
  dob: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  modality: string;
  studyDescription: string;
  bodyPart: string;
  accessionNumber: string;
  studyDate: string;
  studyInstanceUID: string;
}

type Stage = 'drop' | 'parsing' | 'preview' | 'registering' | 'done' | 'error';

// ─── DICOM Tag Helpers ────────────────────────────────────────────────────────

function getTag(ds: any, tag: string): string {
  try {
    return ds.string(tag) || '';
  } catch {
    return '';
  }
}

function parseDicomGender(raw: string): 'Male' | 'Female' | 'Other' {
  const v = raw.toUpperCase().trim();
  if (v === 'M') return 'Male';
  if (v === 'F') return 'Female';
  return 'Other';
}

function parseDicomDate(raw: string): string {
  // DICOM date format is YYYYMMDD
  if (raw && raw.length === 8) {
    try {
      const parsed = parse(raw, 'yyyyMMdd', new Date());
      if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
    } catch { /* fall through */ }
  }
  return '';
}

function calcAge(dob: string): string {
  if (!dob) return '';
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  } catch { return ''; }
}

function formatDicomName(raw: string): string {
  // DICOM patient name format: LAST^FIRST^MIDDLE → "First Last"
  if (!raw) return '';
  const parts = raw.split('^').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[1]} ${parts[0]}`;
  return parts[0] || raw;
}

// ─── Mock DICOM Simulations ────────────────────────────────────────────────────

const MOCK_PATIENTS = [
  { patientName: 'Rajesh Kumar', patientId: 'PAT-SIM-001', dob: '1978-03-22', age: '48', gender: 'Male' as const, modality: 'MRI', studyDescription: 'MRI Brain with Contrast', bodyPart: 'Brain', accessionNumber: `ACC-${Date.now()}`, studyDate: format(new Date(), 'yyyy-MM-dd'), studyInstanceUID: '1.2.840.10008.5.' + Date.now() },
  { patientName: 'Priya Sharma', patientId: 'PAT-SIM-002', dob: '1990-07-14', age: '35', gender: 'Female' as const, modality: 'CT', studyDescription: 'CT Chest HRCT', bodyPart: 'Chest', accessionNumber: `ACC-${Date.now() + 1}`, studyDate: format(new Date(), 'yyyy-MM-dd'), studyInstanceUID: '1.2.840.10008.5.' + (Date.now() + 1) },
  { patientName: 'Mohammed Irfan', patientId: 'PAT-SIM-003', dob: '1965-11-05', age: '60', gender: 'Male' as const, modality: 'X-Ray', studyDescription: 'X-Ray Chest PA View', bodyPart: 'Chest', accessionNumber: `ACC-${Date.now() + 2}`, studyDate: format(new Date(), 'yyyy-MM-dd'), studyInstanceUID: '1.2.840.10008.5.' + (Date.now() + 2) },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DicomReceive() {
  const navigate = useNavigate();
  const { patients, hospitals, addPatient, addStudy } = useMockDb();
  const { user } = useAuthStore();

  const [stage, setStage] = useState<Stage>('drop');
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsed, setParsed] = useState<ParsedDicom | null>(null);
  const [fileName, setFileName] = useState('');
  const [existingPatientId, setExistingPatientId] = useState<string | null>(null);

  // Editable fields for correction
  const [fields, setFields] = useState<ParsedDicom | null>(null);

  const defaultHospitalId = user?.hospitalId || hospitals[0]?.id || '';

  // ─── Parse real DICOM file ───────────────────────────────────────────────

  const processDicomFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStage('parsing');
    setErrorMsg('');

    try {
      let buffer: ArrayBuffer;

      // Real ZIP parsing using JSZip
      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // Find the first file that looks like a DICOM (ends with .dcm or has no extension but is a file)
        let dicomFile: JSZip.JSZipObject | null = null;
        for (const relativePath in zipContent.files) {
          const zipEntry = zipContent.files[relativePath];
          if (!zipEntry.dir && (relativePath.toLowerCase().endsWith('.dcm') || !relativePath.includes('.'))) {
            dicomFile = zipEntry;
            break;
          }
        }

        if (!dicomFile) {
          throw new Error('No valid DICOM files (.dcm) found inside the ZIP archive.');
        }

        // Extract the ArrayBuffer of the first found DICOM file
        buffer = await dicomFile.async('arraybuffer');
      } else {
        // Direct DICOM file upload
        buffer = await file.arrayBuffer();
      }

      const byteArray = new Uint8Array(buffer);

      // Handle both CJS default export and named export
      const parser = (dicomParser as any).default ?? dicomParser;
      const dataSet = parser.parseDicom(byteArray, { untilTag: '00200013' });

      const rawName = getTag(dataSet, 'x00100010');
      const rawDob  = getTag(dataSet, 'x00100030');
      const rawDate = getTag(dataSet, 'x00080020');
      const dob     = parseDicomDate(rawDob);

      const result: ParsedDicom = {
        patientName:      formatDicomName(rawName) || 'Unknown Patient',
        patientId:        getTag(dataSet, 'x00100020') || `PAT-${Date.now()}`,
        dob,
        age:              getTag(dataSet, 'x00101010') || calcAge(dob),
        gender:           parseDicomGender(getTag(dataSet, 'x00100040')),
        modality:         getTag(dataSet, 'x00080060') || 'Unknown',
        studyDescription: getTag(dataSet, 'x00081030') || 'Study',
        bodyPart:         getTag(dataSet, 'x00180015') || '',
        accessionNumber:  getTag(dataSet, 'x00080050') || `ACC-${Date.now()}`,
        studyDate:        parseDicomDate(rawDate) || format(new Date(), 'yyyy-MM-dd'),
        studyInstanceUID: getTag(dataSet, 'x0020000d') || '',
      };

      setParsed(result);
      setFields(result);
      checkDuplicate(result.patientId);
      setStage('preview');
    } catch (e: any) {
      setErrorMsg(`Failed to parse DICOM file: ${e.message}. The file may not be a valid DICOM format.`);
      setStage('error');
    }
  }, []);

  const checkDuplicate = (patientId: string) => {
    const existing = patients.find(p => p.uhid === patientId);
    setExistingPatientId(existing?.id || null);
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processDicomFile(file);
  }, [processDicomFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processDicomFile(file);
  };

  // ─── Simulate DICOM Push ─────────────────────────────────────────────────

  const simulatePush = () => {
    const mock = MOCK_PATIENTS[Math.floor(Math.random() * MOCK_PATIENTS.length)];
    setFileName('simulated_push.dcm');
    setStage('parsing');
    setTimeout(() => {
      setParsed(mock);
      setFields(mock);
      checkDuplicate(mock.patientId);
      setStage('preview');
    }, 1200);
  };

  // ─── Register Patient + Study ─────────────────────────────────────────────

  const handleRegister = () => {
    if (!fields) return;
    setStage('registering');

    setTimeout(() => {
      let patId = existingPatientId;

      // Create patient only if not existing
      if (!patId) {
        const newPatient = {
          id: 'p' + Date.now(),
          uhid: fields.patientId,
          name: fields.patientName,
          dob: fields.dob,
          age: parseInt(fields.age) || 0,
          gender: fields.gender,
          phone: '',
          email: '',
          referringDoctor: '',
          hospitalId: defaultHospitalId,
          registrationDate: new Date().toISOString(),
        };
        addPatient(newPatient);
        patId = newPatient.id;
      }

      // Create study
      const caseNum = `CAS-DICOM-${Date.now().toString().slice(-5)}`;
      const newStudy = {
        id: 'st' + Date.now(),
        patientId: patId!,
        caseNumber: caseNum,
        accessionNumber: fields.accessionNumber,
        hospitalId: defaultHospitalId,
        modality: fields.modality as any,
        studyDescription: fields.studyDescription,
        bodyPart: fields.bodyPart,
        priority: 'Routine' as const,
        studyDate: new Date(fields.studyDate).toISOString(),
        status: 'New' as any,
        reportingStatus: 'Pending' as const,
        paymentStatus: 'Unpaid' as const,
        tat: '24h',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addStudy(newStudy);
      setStage('done');
    }, 1500);
  };

  const updateField = (key: keyof ParsedDicom, value: string) => {
    setFields(f => f ? { ...f, [key]: value } : f);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-unnathi-fade-in relative">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">DICOM Receive</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Push DICOM images or bulk ZIP files from modality — patient & study are auto-registered</p>
          </div>
        </div>
      </div>

      {/* STAGE: DROP ZONE */}
      {stage === 'drop' && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-20 text-center transition-all cursor-pointer ${
              dragging
                ? 'border-[#00A8CC] bg-cyan-50 scale-[1.01]'
                : 'border-slate-300 bg-white hover:border-[#00A8CC] hover:bg-cyan-50/20'
            }`}
            onClick={() => document.getElementById('dicom-file-input')?.click()}
          >
            <input
              id="dicom-file-input"
              type="file"
              accept=".dcm,.DCM,application/dicom,.zip,application/zip"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center space-y-6">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-colors shadow-lg ${dragging ? 'bg-gradient-to-br from-[#0D2461] to-[#00A8CC] text-white' : 'bg-white shadow-sm border border-slate-100'}`}>
                <Upload className={`h-12 w-12 ${dragging ? 'text-white' : 'text-[#0D2461]'}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-[#0D2461] tracking-tight">
                  {dragging ? 'Drop files to upload' : 'Drag & Drop DICOM or ZIP file'}
                </p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">or click to browse</p>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2.5 text-xs font-bold text-emerald-700 shadow-sm tracking-wide">
                <CheckCircle2 className="h-4 w-4" />
                <span>Supports .dcm and .zip · Patient info auto-extracted</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-4 py-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Simulate Push Button */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex items-center justify-between group hover:border-[#00A8CC] transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <div className="bg-violet-100 p-2 rounded-lg"><Zap className="h-5 w-5 text-violet-600" /></div>
                <p className="font-black text-slate-800 tracking-wide">Simulate Modality Push</p>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1 ml-11">Simulate a scanner pushing an image with realistic metadata</p>
            </div>
            <Button
              onClick={simulatePush}
              className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 ml-4 font-bold shadow-md shadow-violet-600/20 rounded-xl px-6"
            >
              Simulate Push
            </Button>
          </div>
        </div>
      )}

      {/* STAGE: PARSING */}
      {stage === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0D2461] to-[#00A8CC] flex items-center justify-center shadow-lg">
              <FileImage className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-sm border border-slate-100">
              <Loader2 className="h-8 w-8 text-[#00A8CC] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-black text-[#0D2461]">Parsing DICOM Archive...</p>
            <p className="text-sm font-medium text-slate-500">Extracting patient metadata from <span className="font-bold text-[#00A8CC]">{fileName}</span></p>
          </div>
        </div>
      )}

      {/* STAGE: PREVIEW */}
      {stage === 'preview' && fields && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`rounded-2xl p-5 flex items-start space-x-4 shadow-sm border ${existingPatientId ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`p-2 rounded-xl ${existingPatientId ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {existingPatientId ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div>
              <p className={`text-base font-black tracking-wide ${existingPatientId ? 'text-amber-800' : 'text-emerald-800'}`}>
                {existingPatientId
                  ? `Existing patient found (UHID: ${fields.patientId})`
                  : `New patient detected (UHID: ${fields.patientId})`}
              </p>
              <p className={`text-sm font-medium mt-1 ${existingPatientId ? 'text-amber-600' : 'text-emerald-600'}`}>
                {existingPatientId ? 'Study will be linked to the existing record.' : 'A new patient record will be created.'} Extracted from <strong>{fileName}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="font-black text-[#0D2461] tracking-wide">Patient Information</h2>
                <Badge variant="outline" className="ml-auto text-[10px] font-bold bg-slate-50 text-slate-500 border-slate-200 tracking-widest uppercase">Auto-extracted</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patient Name</label>
                  <Input value={fields.patientName} onChange={e => updateField('patientName', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patient ID (UHID)</label>
                    <Input value={fields.patientId} onChange={e => updateField('patientId', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                    <Input value={fields.age} onChange={e => updateField('age', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <Input type="date" value={fields.dob} onChange={e => updateField('dob', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      className="w-full border-slate-200 rounded-xl px-3 h-10 text-sm font-semibold bg-slate-50 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] border"
                      value={fields.gender}
                      onChange={e => updateField('gender', e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="font-black text-[#0D2461] tracking-wide">Study Information</h2>
                <Badge variant="outline" className="ml-auto text-[10px] font-bold bg-slate-50 text-slate-500 border-slate-200 tracking-widest uppercase">Auto-extracted</Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modality</label>
                    <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200 h-10">
                      <Stethoscope className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-800 text-sm">{fields.modality}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Study Date</label>
                    <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200 h-10">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-800 font-bold text-sm">{fields.studyDate}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Study Description</label>
                  <Input value={fields.studyDescription} onChange={e => updateField('studyDescription', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Body Part</label>
                    <Input value={fields.bodyPart} onChange={e => updateField('bodyPart', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Accession No</label>
                    <Input value={fields.accessionNumber} onChange={e => updateField('accessionNumber', e.target.value)} className="h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20" />
                  </div>
                </div>
                {fields.studyInstanceUID && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Study Instance UID</label>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500 font-mono truncate">{fields.studyInstanceUID}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <Button variant="outline" onClick={() => { setStage('drop'); setParsed(null); setFields(null); }} className="font-bold border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              ← Push Another File
            </Button>
            <div className="flex items-center space-x-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Review details, then confirm</p>
              <Button
                className="bg-[#0D2461] hover:bg-[#081840] text-white px-8 h-11 font-black rounded-xl shadow-md shadow-[#0D2461]/20"
                onClick={handleRegister}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Register & Add to Worklist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: REGISTERING */}
      {stage === 'registering' && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center shadow-inner">
            <Loader2 className="h-12 w-12 text-[#00A8CC] animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-black text-[#0D2461]">Registering to PACS...</p>
            <p className="text-sm font-medium text-slate-500">Creating patient record and adding study to worklist</p>
          </div>
        </div>
      )}

      {/* STAGE: DONE */}
      {stage === 'done' && fields && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-4xl font-black text-[#0D2461] tracking-tight">Successfully Registered!</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 inline-block shadow-sm">
              <p className="text-slate-800 font-medium">
                <strong className="text-lg text-[#0D2461]">{fields.patientName}</strong> ({fields.patientId})
              </p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                {fields.modality} — {fields.studyDescription}
              </p>
            </div>
            <p className="text-sm text-emerald-600 font-bold bg-emerald-50 py-1.5 px-4 rounded-full inline-block border border-emerald-100 mt-4">
              Study is now in the worklist, ready for radiologist assignment
            </p>
          </div>
          <div className="flex space-x-4 pt-4">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-600" onClick={() => { setStage('drop'); setParsed(null); setFields(null); }}>
              Push Another DICOM
            </Button>
            <Button className="h-12 px-8 rounded-xl font-black bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md shadow-cyan-500/20" onClick={() => navigate('/studies')}>
              View Studies Worklist →
            </Button>
          </div>
        </div>
      )}

      {/* STAGE: ERROR */}
      {stage === 'error' && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="w-24 h-24 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center shadow-inner">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-black text-[#0D2461] tracking-tight">Failed to Parse Archive</p>
            <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl max-w-md mx-auto">{errorMsg}</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200" onClick={() => setStage('drop')}>Try Again</Button>
            <Button onClick={simulatePush} className="h-11 px-6 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20">
              <Zap className="mr-2 h-4 w-4" /> Use Simulation Instead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
