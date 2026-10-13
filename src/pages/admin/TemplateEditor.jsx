import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import { ArrowLeft, Save, Building2, Sparkles, BookOpen } from "lucide-react";
import standardStudiesCatalog from "../../data/standardStudiesCatalog.json";

export default function TemplateEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { templates, addTemplate, updateTemplate, hospitals, modalities, sites } =
    useMockDb();
  const { user } = useAuthStore();

  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [modality, setModality] = useState("");
  const [studyName, setStudyName] = useState("");
  const [price, setPrice] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isEditing = Boolean(id);

  // Available hospitals scoped by user permissions
  const availableHospitals = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return hospitals;
    if (user?.role === "SITE_ADMIN") {
      return hospitals.filter((h) => h.parentSiteId === user?.siteId);
    }
    if (user?.hospitalId) {
      return hospitals.filter((h) => h.id === user.hospitalId);
    }
    return hospitals;
  }, [hospitals, user]);

  useEffect(() => {
    if (isEditing && id) {
      const tpl = templates.find((t) => t.id === id);
      if (tpl) {
        setSelectedHospitalId(tpl.hospitalId || "");
        setModality(tpl.modality || "");
        setStudyName(tpl.studyName || "");
        setPrice(tpl.price !== undefined && tpl.price !== null ? tpl.price : "");
        setTemplateContent(tpl.templateContent || "");
        setIsActive(tpl.isActive !== undefined ? tpl.isActive : true);
      } else {
        navigate("/utilities/templates"); // Not found
      }
    } else {
      // New template initialization
      const paramHosp = searchParams.get("hospitalId");
      if (paramHosp && availableHospitals.some((h) => h.id === paramHosp)) {
        setSelectedHospitalId(paramHosp);
      } else if (user?.hospitalId) {
        setSelectedHospitalId(user.hospitalId);
      } else if (availableHospitals.length > 0) {
        setSelectedHospitalId(availableHospitals[0].id);
      }
    }
  }, [id, isEditing, templates, navigate, searchParams, availableHospitals, user]);

  const availableModalities = useMemo(() => {
    const list = modalities.map((m) => m.name);
    ["MRI", "CT", "USG", "X-RAY", "MAMMO"].forEach((m) => {
      if (!list.includes(m)) list.push(m);
    });
    return list;
  }, [modalities]);

  // Catalog filtered suggestions based on selected modality
  const catalogSuggestions = useMemo(() => {
    if (!modality) return standardStudiesCatalog;
    return standardStudiesCatalog.filter(
      (s) => s.modality.toUpperCase() === modality.toUpperCase(),
    );
  }, [modality]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!studyName.trim()) {
      alert("Please enter a study name.");
      return;
    }
    const targetHospId =
      selectedHospitalId || user?.hospitalId || availableHospitals[0]?.id;

    if (isEditing && id) {
      updateTemplate(id, {
        hospitalId: targetHospId,
        modality,
        studyName: studyName.trim().toUpperCase(),
        price: price === "" ? undefined : Number(price),
        templateContent,
        isActive,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addTemplate({
        id: `tpl_${Date.now()}`,
        hospitalId: targetHospId,
        modality: modality || "CT",
        studyName: studyName.trim().toUpperCase(),
        price: price === "" ? undefined : Number(price),
        templateContent,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    navigate("/utilities/templates");
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative animate-unnathi-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/utilities/templates")}
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1.5" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-xl font-black text-[#0D2461]">
              {isEditing ? "Edit Template" : "Design New Template"}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Rich Text Document Editor
            </p>
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
          <Button
            onClick={handleSave}
            className="bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md font-bold px-6"
          >
            <Save className="w-4 h-4 mr-2" /> Save Document
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-6">
          {/* Metadata Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            {/* Row 1: Hospital Assignment */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[#0D2461]">
                  <Building2 className="w-5 h-5 text-[#176B73]" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Hospital Assignment & Pricing Scope
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Prices & study names can be customized per hospital or site
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-72">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] shadow-sm"
                >
                  {availableHospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.parentSiteId ? `(Site Child)` : `(Independent)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Modality, Study Name with Catalog Datalist, and Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Modality <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl bg-slate-50 p-3 text-xs focus:ring-2 focus:ring-[#00A8CC]/20 outline-none font-bold text-slate-800 transition-all hover:bg-white h-11"
                >
                  <option value="" disabled>
                    Select Modality...
                  </option>
                  {availableModalities.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    Study Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded flex items-center gap-1 border border-teal-200">
                    <Sparkles className="w-2.5 h-2.5" /> 292 Catalog Standard
                  </span>
                </div>
                <Input
                  required
                  list="catalog-study-names"
                  placeholder="e.g. MRI - BRAIN, CT - CHEST..."
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value.toUpperCase())}
                  className="h-11 text-xs bg-slate-50 text-slate-900 font-bold border-slate-300 rounded-xl uppercase transition-all hover:bg-white focus:bg-white shadow-inner"
                />
                <datalist id="catalog-study-names">
                  {catalogSuggestions.map((s, idx) => (
                    <option key={idx} value={s.studyName} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Hospital Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-black text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="h-11 pl-7 text-xs bg-slate-50 text-slate-900 font-bold border-slate-300 rounded-xl transition-all hover:bg-white focus:bg-white shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Document Content
              </span>
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
