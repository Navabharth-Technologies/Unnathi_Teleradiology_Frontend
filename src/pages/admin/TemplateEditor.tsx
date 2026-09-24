import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';
import type { UtilityTemplate } from '../../types';

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, addTemplate, updateTemplate, hospitals, modalities } = useMockDb();
  const { user } = useAuthStore();

  const [modality, setModality] = useState('');
  const [studyName, setStudyName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [templateContent, setTemplateContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const tpl = templates.find(t => t.id === id);
      if (tpl) {
        setModality(tpl.modality);
        setStudyName(tpl.studyName);
        setPrice(tpl.price || '');
        setTemplateContent(tpl.templateContent);
        setIsActive(tpl.isActive);
      } else {
        navigate('/utilities/templates'); // Not found
      }
    }
  }, [id, isEditing, templates, navigate]);

  const availableModalities = modalities.map(m => m.name);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && id) {
      updateTemplate(id, {
        modality,
        studyName,
        price: price === '' ? undefined : Number(price),
        templateContent,
        isActive,
        updatedAt: new Date().toISOString()
      });
    } else {
      addTemplate({
        id: `tpl_${Date.now()}`,
        hospitalId: user?.hospitalId || hospitals[0]?.id || 'hosp1', // default fallback
        modality,
        studyName,
        price: price === '' ? undefined : Number(price),
        templateContent,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    navigate('/utilities/templates');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative animate-unnathi-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/utilities/templates')} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5 mr-1.5" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-xl font-black text-[#0D2461]">{isEditing ? 'Edit Template' : 'Design New Template'}</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Rich Text Document Editor</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 mr-4 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
            <input 
              type="checkbox" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-[#00A8CC] focus:ring-[#00A8CC] w-4 h-4 cursor-pointer border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700">Active</span>
          </label>
          <Button onClick={handleSave} className="bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md font-bold px-6">
            <Save className="w-4 h-4 mr-2" /> Save Document
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-6">
          {/* Metadata Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Modality <span className="text-rose-500">*</span></label>
              <select 
                required
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full border border-slate-300 rounded-xl bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-[#00A8CC]/20 outline-none font-bold text-slate-800 transition-all hover:bg-white"
              >
                <option value="" disabled>Select Modality...</option>
                {availableModalities.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Study Name <span className="text-rose-500">*</span></label>
              <Input 
                required
                placeholder="e.g. ABDOMEN AND PELVIS TRIPLE PHASE"
                value={studyName}
                onChange={(e) => setStudyName(e.target.value.toUpperCase())}
                className="h-12 text-sm bg-slate-50 text-slate-900 font-bold border-slate-300 rounded-xl uppercase transition-all hover:bg-white focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Price (₹)</label>
              <Input 
                type="number"
                min="0"
                placeholder="e.g. 1500"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-12 text-sm bg-slate-50 text-slate-900 font-bold border-slate-300 rounded-xl transition-all hover:bg-white focus:bg-white"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Content</span>
            </div>
            <RichTextEditor 
              value={templateContent}
              onChange={setTemplateContent}
              className="flex-1 border-0 shadow-none rounded-none"
              placeholder="Start typing your report template here... Use the toolbar above to format text."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
