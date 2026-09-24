import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, ZoomIn, ZoomOut, Move, Contrast, Save, Edit3, Share2, 
  LayoutGrid, Crosshair, BoxSelect, Maximize, RotateCw, Settings, Grid3X3, ArrowRightLeft, Type as TypeIcon,
  CheckCircle2, Image as ImageIcon, Lock, X
} from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { ShareModal } from '../../components/modals/ShareModal';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

export default function ViewerShell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuthStore();
  const { studies, patients, hospitals, updateStudy, users, templates } = useMockDb();
  
  const study = studies.find(s => s.id === id);
  const patient = patients.find(p => p.id === study?.patientId);
  const hospital = hospitals.find(h => h.id === study?.hospitalId);

  const [reportText, setReportText] = useState('');
  const [activeTool, setActiveTool] = useState<'zoom-in' | 'zoom-out' | 'move' | 'contrast' | 'crosshair' | '3d'>('move');
  const [zoom, setZoom] = useState(100);
  const [windowLevel, setWindowLevel] = useState({ w: 1500, l: -500 });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportingExpanded, setIsReportingExpanded] = useState(true);
  const [activeSeries, setActiveSeries] = useState(0);
  const [reportStatus, setReportStatus] = useState<'Draft' | 'Critical' | 'Final'>(
    study?.reportingStatus === 'Final' ? 'Final' : 'Draft'
  );
  const [showLockedWarning, setShowLockedWarning] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    if (study && templates) {
      const available = templates.filter(t => t.hospitalId === study.hospitalId && t.modality === study.modality && t.isActive);
      const match = available.find(t => t.studyName.toUpperCase() === study.studyDescription.toUpperCase());
      if (match) {
        setSelectedTemplateId(match.id);
      }
    }
  }, [study, templates]);

  if (!study || !patient) return <div>Loading...</div>;

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (tool === 'zoom-in') setZoom(z => Math.min(z + 25, 400));
    if (tool === 'zoom-out') setZoom(z => Math.max(z - 25, 25));
    if (tool === 'contrast') setWindowLevel(wl => ({ w: wl.w === 1500 ? 400 : 1500, l: wl.l === -500 ? 40 : -500 }));
  };

  const handleSaveDraft = () => {
    updateStudy(study.id, { reportingStatus: 'Draft' });
    navigate('/radiologist/worklist');
  };

  const handleSignReport = () => {
    if (!study) return;

    // Only send to verifier if a verifier is explicitly assigned to this hospital
    const hasVerifier = !!hospital?.verifierId;
    
    const baseUpdates = { reportText, finalizedAt: new Date().toISOString() };

    if (reportStatus === 'Final') {
      if (hasVerifier) {
        // Send to verifier for review
        updateStudy(study.id, { ...baseUpdates, reportingStatus: 'Review' });
      } else {
        // Bypass verifier directly to verified/billing
        updateStudy(study.id, { ...baseUpdates, reportingStatus: 'Verified', status: 'Final' });
      }
    } else {
      updateStudy(study.id, { ...baseUpdates, reportingStatus: reportStatus });
    }
    navigate('/radiologist/worklist');
  };

  const mockSeries = [
    { id: 1, name: 't2tsesag2', image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=150' },
    { id: 2, name: 't1tsesag2', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=150' },
    { id: 3, name: 't2tseax2', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150' },
    { id: 4, name: 'flair_sag', image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=150' },
    { id: 5, name: 't1_coronal', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=150' }
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0c10] text-slate-300 overflow-hidden font-sans">
      
      {/* Top Header / Application Bar */}
      <div className="h-10 bg-[#1f2833] flex items-center justify-between px-4 border-b border-[#0b0c10] text-xs">
        <div className="flex items-center space-x-6 text-slate-300 font-semibold tracking-wider uppercase">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-300 hover:text-white h-7 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <span className="flex items-center cursor-pointer hover:text-white"><LayoutGrid className="w-3.5 h-3.5 mr-1.5"/> Dashboard</span>
          <span className="flex items-center cursor-pointer hover:text-white"><Grid3X3 className="w-3.5 h-3.5 mr-1.5"/> RIS</span>
          <span className="flex items-center cursor-pointer text-[#45a29e]"><Edit3 className="w-3.5 h-3.5 mr-1.5"/> Reporting</span>
        </div>
        <div className="flex items-center space-x-4 font-semibold text-slate-400">
          <span>Report Query: +91 7411999911</span>
        </div>
      </div>

      {/* Viewer Toolbar */}
      <div className="h-12 border-b border-[#1f2833] bg-[#0b0c10] flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3">
          {/* Layout Tool */}
          <div className="flex items-center border border-slate-700 rounded-md overflow-hidden bg-slate-900/50">
            <button className="px-3 py-1.5 hover:bg-slate-700 text-xs font-semibold border-r border-slate-700 flex items-center"><LayoutGrid className="w-3.5 h-3.5 mr-2"/> 1 x 2</button>
            <button className="px-3 py-1.5 hover:bg-slate-700 text-xs font-semibold">Default</button>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          
          {/* DICOM Tools */}
          {[
             { tool: 'move' as const, Icon: Move, label: 'Pan' },
             { tool: 'zoom-in' as const, Icon: ZoomIn, label: 'Zoom In' },
             { tool: 'zoom-out' as const, Icon: ZoomOut, label: 'Zoom Out' },
             { tool: 'contrast' as const, Icon: Contrast, label: 'Window/Level' },
             { tool: 'crosshair' as const, Icon: Crosshair, label: 'Crosshair' },
             { tool: '3d' as const, Icon: BoxSelect, label: 'MPR / 3D' },
          ].map(({ tool, Icon, label }) => (
            <button
              key={tool} title={label}
              onClick={() => handleToolClick(tool)}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                activeTool === tool ? 'bg-[#45a29e] text-[#0b0c10]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          
          <button title="Text Annotation" className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white">
            <TypeIcon className="h-4 w-4" />
          </button>
          <button title="Rotate" className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8">
            <Share2 className="w-3.5 h-3.5 mr-2" /> Share
          </Button>
          <button title="Settings" className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side Panel (Patient Info & Series) */}
        <div className="w-64 border-r border-[#1f2833] bg-[#0b0c10] flex flex-col z-20 shadow-2xl">
          {/* Patient Header */}
          <div className="p-4 border-b border-[#1f2833]">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-2 truncate">{patient.name}</h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="text-slate-500">Modality</div>
              <div className="text-slate-300 font-semibold">{study.modality}</div>
              <div className="text-slate-500">Study Name</div>
              <div className="text-[#45a29e] font-bold uppercase truncate" title={study.studyDescription}>{study.studyDescription}</div>
            </div>
          </div>
          
          <div className="flex gap-2 p-3 border-b border-[#1f2833]">
             <Button variant="outline" className="flex-1 bg-[#1f2833] border-[#1f2833] text-xs h-8 hover:text-white"><Maximize className="w-3 h-3 mr-2"/> PENDING</Button>
             <Button variant="outline" className="flex-1 bg-[#1f2833] border-[#1f2833] text-xs h-8 hover:text-white"><BoxSelect className="w-3 h-3 mr-2"/> KEY IMAGES</Button>
          </div>
          
          <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-slate-400">
             <span>Series</span>
             <span className="bg-slate-800 text-slate-300 px-1.5 rounded">{mockSeries.length}</span>
          </div>

          {/* Series Thumbnails */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 custom-scrollbar">
            {mockSeries.map((series, index) => (
               <div 
                  key={series.id} 
                  onClick={() => setActiveSeries(index)}
                  className={`relative flex flex-col rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeSeries === index ? 'border-[#45a29e] shadow-[0_0_15px_rgba(69,162,158,0.2)]' : 'border-[#1f2833] hover:border-slate-600'}`}
               >
                 <div className="h-24 bg-black relative">
                   <img src={series.image} alt={series.name} className="w-full h-full object-cover opacity-70 grayscale" />
                   <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                   </div>
                   <div className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1.5 rounded text-white font-mono">1</div>
                 </div>
                 <div className="bg-[#1f2833] text-center py-1.5 text-[10px] font-semibold text-slate-300 truncate px-1">
                   {series.name}
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {/* Main DICOM Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
               src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800" 
               alt="DICOM Scan" 
               style={{ transform: `scale(${zoom / 100})`, filter: `brightness(${windowLevel.w / 1500}) contrast(${windowLevel.l === -500 ? 1 : 1.2})`, transition: 'transform 0.2s ease' }}
               className="max-h-full max-w-full object-contain grayscale"
            />
          </div>
          
          {/* DICOM Meta Overlays (Corners) */}
          <div className="absolute top-4 left-4 text-xs font-mono text-emerald-400/80 space-y-1">
            <div>MRI</div>
            <div>68686</div>
            <div className="uppercase">{patient.name}</div>
            <div>023Y / {patient.gender === 'Male' ? 'M' : 'F'}</div>
          </div>
          
          <div className="absolute top-4 right-4 text-xs font-mono text-emerald-400/80 text-right space-y-1">
            <div>18-09-2026</div>
            <div>09:11:42</div>
            <div>ILT2TSESAGP</div>
            <div>Img: {activeSeries + 1} / {mockSeries.length}</div>
          </div>
          
          <div className="absolute bottom-4 left-4 text-xs font-mono text-emerald-400/80 space-y-1">
            <div>TR: 3200</div>
            <div>TE: 104</div>
            <div>THK: 4.0</div>
          </div>
          
          <div className="absolute bottom-4 right-4 text-xs font-mono text-emerald-400/80 text-right space-y-1">
            <div>W: {windowLevel.w}</div>
            <div>L: {windowLevel.l}</div>
            <div>Zoom: {zoom}%</div>
          </div>
        </div>

        {/* Right Reporting Panel - Redesigned matching screenshot */}
        {currentRole === 'RADIOLOGIST' && (
          <div className={`${isReportingExpanded ? 'w-1/2' : 'w-0 overflow-hidden'} border-l border-slate-300 bg-slate-100 flex flex-col transition-all duration-300 ease-in-out relative z-10 shadow-2xl`}>
            
            {/* Top Toolbar matching screenshot */}
            <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between shadow-sm z-20">
              
              {/* Left Side: Body part dropdown & Load */}
              <div className="flex items-center space-x-2">
                {(() => {
                  const availableTemplates = templates?.filter(t => t.hospitalId === study.hospitalId && t.modality === study.modality && t.isActive) || [];
                  const handleLoadTemplate = () => {
                    const tpl = availableTemplates.find(t => t.id === selectedTemplateId);
                    if (tpl) {
                       setReportText(tpl.templateContent);
                    }
                  };
                  return (
                    <>
                      <select 
                        className="text-xs border border-slate-300 rounded p-1.5 text-slate-700 bg-white max-w-[200px] font-semibold truncate"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="">Select Template...</option>
                        {availableTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.studyName}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleLoadTemplate}
                        disabled={!selectedTemplateId}
                        className={`text-xs px-3 py-1.5 rounded font-medium ${selectedTemplateId ? 'bg-[#00A8CC] text-white hover:bg-[#008ba8] cursor-pointer shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Load
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Middle: Radios & Save */}
              <div className="flex items-center space-x-4 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="status" className="w-3 h-3 text-[#00A8CC] border-slate-300 focus:ring-[#00A8CC]" checked={reportStatus === 'Draft'} onChange={() => setReportStatus('Draft')} />
                  <span className="text-[11px] font-bold text-slate-600">Draft</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="status" className="w-3 h-3 text-red-500 border-slate-300 focus:ring-red-500" checked={reportStatus === 'Critical'} onChange={() => setReportStatus('Critical')} />
                  <span className="text-[11px] font-bold text-slate-600">Critical</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="status" className="w-3 h-3 text-emerald-600 border-slate-300 focus:ring-emerald-600" checked={reportStatus === 'Final'} onChange={() => setReportStatus('Final')} />
                  <span className="text-[11px] font-bold text-slate-600">Final</span>
                </label>
                
                <div className="w-px h-4 bg-slate-300 mx-2"></div>
                
                <button onClick={handleSignReport} className="text-xs bg-[#7ed957] hover:bg-[#68bd45] text-white px-4 py-1 rounded font-bold transition-colors">
                  Save
                </button>
              </div>

              {/* Right Side: Add Report, Add Key Image */}
              <div className="flex items-center space-x-2">
                <button className="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded font-semibold flex items-center transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Add Report
                </button>
                <button className="text-xs bg-[#0D2461] hover:bg-[#081840] text-white px-3 py-1.5 rounded font-semibold flex items-center shadow-sm transition-colors">
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Add Key Image
                </button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsReportingExpanded(false)}
                  className="ml-2 text-slate-400 hover:text-slate-700 h-7 w-7 p-0"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Rich Text Editor Container */}
            <div className="flex-1 p-4 flex flex-col bg-slate-100 overflow-hidden relative">
              
              {showLockedWarning && (
                <div className="absolute top-6 right-6 z-30 bg-orange-50 border border-orange-200 rounded-lg p-3 max-w-sm shadow-lg flex items-start animate-in fade-in slide-in-from-top-4 duration-300">
                  <Lock className="w-5 h-5 text-orange-500 mt-0.5 mr-3 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-orange-800 font-bold text-xs mb-1">Report currently locked</h4>
                    <p className="text-orange-700/80 text-[10px] leading-tight mb-2">
                      The report is locked because the radiologist is editing it. You can edit it after the radiologist closes the report page. If the radiologist leaves the computer, it will unlock automatically after a set time limit.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowLockedWarning(false)} className="text-[10px] font-bold text-orange-600 hover:text-orange-800 bg-orange-100 px-2 py-1 rounded">Close</button>
                      <button className="text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded">Unlock</button>
                    </div>
                  </div>
                </div>
              )}

              <RichTextEditor 
                value={reportText}
                onChange={setReportText}
                className="flex-1 h-full shadow-sm border-slate-200"
                placeholder="Type report here...&#10;&#10;Procedure:&#10;&#10;Findings:&#10;&#10;Impression:"
              />
            </div>
          </div>
        )}
      </div>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        study={study}
        patient={patient}
        hospital={hospital}
      />
    </div>
  );
}
