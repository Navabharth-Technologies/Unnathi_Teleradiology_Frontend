import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import standardStudiesCatalog from "../../data/standardStudiesCatalog.json";

export default function StudyTemplatesList() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState("ALL");
  const [selectedModalityFilter, setSelectedModalityFilter] = useState("ALL");

  // Filter accessible hospitals based on role
  const accessibleHospitals = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return hospitals;
    if (user?.role === "SITE_ADMIN") {
      return hospitals.filter((h) => h.parentSiteId === user?.siteId);
    }
    if (user?.hospitalId) {
      return hospitals.filter((h) => h.id === user.hospitalId);
    }
    return hospitals;
  }, [hospitals, user]);

  const scopedTemplates = useMemo(() => {
    return (templates || []).filter((t) => {
      // Global templates are accessible to all admins
      if (!t.hospitalId || t.hospitalId === "ALL") return true;
      if (user?.role === "SUPER_ADMIN") return true;
      if (user?.role === "SITE_ADMIN") {
        const hosp = hospitals.find((h) => h.id === t.hospitalId);
        return hosp?.parentSiteId === user?.siteId;
      }
      return t.hospitalId === user?.hospitalId;
    });
  }, [templates, hospitals, user]);

  // Combine custom templates with catalog studies for the active hospital
  const displayedItems = useMemo(() => {
    const isAllHospitals = selectedHospitalFilter === "ALL";
    const targetHospId = isAllHospitals ? "ALL" : selectedHospitalFilter;

    // Generate full list: custom templates + catalog studies
    const result = [];
    const seenKeys = new Set();

    // 1. Group custom templates by study and hospital
    scopedTemplates.forEach((t) => {
      if (
        !isAllHospitals &&
        t.hospitalId &&
        t.hospitalId !== "ALL" &&
        t.hospitalId !== selectedHospitalFilter
      ) {
        return;
      }
      if (
        selectedModalityFilter !== "ALL" &&
        t.modality?.toUpperCase() !== selectedModalityFilter.toUpperCase()
      ) {
        return;
      }

      // Mark that this study has a configured template
      const normModality = (t.modality || "").toUpperCase();
      const normStudy = (t.studyName || "").toUpperCase();
      const matchKey = isAllHospitals
        ? `${normModality}__${normStudy}`
        : `${t.hospitalId || "ALL"}__${normModality}__${normStudy}`;

      seenKeys.add(matchKey);
      result.push({
        id: t.id,
        isCustomized: true,
        hospitalId: t.hospitalId || "ALL",
        modality: t.modality,
        studyName: t.studyName,
        price: t.price,
        isActive: t.isActive !== false,
        rawTemplate: t,
      });
    });

    // 2. Add standard catalog studies if not already configured
    standardStudiesCatalog.forEach((catStudy, idx) => {
      if (
        selectedModalityFilter !== "ALL" &&
        catStudy.modality.toUpperCase() !== selectedModalityFilter.toUpperCase()
      ) {
        return;
      }

      const normModality = catStudy.modality.toUpperCase();
      const normStudy = catStudy.studyName.toUpperCase();
      const matchKey = isAllHospitals
        ? `${normModality}__${normStudy}`
        : `${targetHospId}__${normModality}__${normStudy}`;

      if (!seenKeys.has(matchKey)) {
        seenKeys.add(matchKey);
        result.push({
          id: `cat_${idx}_${targetHospId}`,
          isCustomized: false,
          hospitalId: targetHospId,
          modality: catStudy.modality,
          studyName: catStudy.studyName,
          price: undefined,
          isActive: true,
          rawTemplate: null,
        });
      }
    });

    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return result.filter(
        (item) =>
          item.studyName.toLowerCase().includes(q) ||
          item.modality.toLowerCase().includes(q) ||
          (item.price && String(item.price).includes(q)),
      );
    }

    return result;
  }, [
    scopedTemplates,
    selectedHospitalFilter,
    selectedModalityFilter,
    searchTerm,
  ]);

  // Quick edit modal / state for assigning price directly
  const [editingItem, setEditingItem] = useState(null);
  const [quickPrice, setQuickPrice] = useState("");

  const handleSavePrice = async () => {
    if (!editingItem) return;
    const priceVal = quickPrice === "" ? undefined : Number(quickPrice);

    if (editingItem.rawTemplate) {
      // Update existing template
      await updateTemplate(editingItem.rawTemplate.id, {
        price: priceVal,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new template from catalog study
      await addTemplate({
        id: `tpl_${Date.now()}`,
        hospitalId: editingItem.hospitalId || "ALL",
        modality: editingItem.modality,
        studyName: editingItem.studyName,
        price: priceVal,
        isActive: true,
        templateContent: `<h3>${editingItem.studyName} Report</h3><p><strong>Clinical Indication:</strong></p><p><strong>Technique:</strong> Standard protocol imaging was performed.</p><p><strong>Findings:</strong></p><p><strong>Impression:</strong></p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setEditingItem(null);
    setQuickPrice("");
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-[#0D2461] tracking-tight flex items-center gap-2.5">
            <span>Study Catalog & Pricing</span>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {displayedItems.length} Studies Listed
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            All 292 standard studies (MRI, CT, USG, X-RAY) from your catalog. Assign or edit custom prices for each hospital below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Hospital Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Hospital:</span>
            <select
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
              className="h-8 text-xs font-bold bg-transparent text-slate-800 outline-none cursor-pointer"
            >
              {accessibleHospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.parentSiteId ? "(Site Child)" : "(Independent)"}
                </option>
              ))}
              {accessibleHospitals.length > 1 && (
                <option value="ALL">All Hospitals</option>
              )}
            </select>
          </div>

          {/* Modality Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-bold text-slate-500">Modality:</span>
            <select
              value={selectedModalityFilter}
              onChange={(e) => setSelectedModalityFilter(e.target.value)}
              className="h-8 text-xs font-bold bg-transparent text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Modalities (292)</option>
              <option value="MRI">MRI (98 Studies)</option>
              <option value="CT">CT (75 Studies)</option>
              <option value="USG">USG (54 Studies)</option>
              <option value="X-RAY">X-RAY (65 Studies)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative group min-w-[240px]">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input
              placeholder="Search any study name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 h-10 text-xs bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20"
            />
          </div>

          <Button
            onClick={() =>
              navigate(
                `/utilities/templates/new${selectedHospitalFilter !== "ALL" ? `?hospitalId=${selectedHospitalFilter}` : ""}`,
              )
            }
            className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-4 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#00A8CC]" />
            <span>Create / Design Template</span>
          </Button>
        </div>
      </div>

      {/* Main Table listing all studies */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase w-1/4">
                Hospital Scope
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase w-32">
                Modality
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">
                Study Name
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right w-40">
                Hospital Price (₹)
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-center w-32">
                Status
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right w-44">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.map((item) => {
              const hosp = hospitals.find((h) => h.id === item.hospitalId);
              const hasPrice =
                item.price !== undefined &&
                item.price !== null &&
                item.price !== "";

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                >
                  <TableCell className="py-3.5 px-6">
                    <div className="font-bold text-slate-800 text-xs">
                      {item.hospitalId === "ALL" || !item.hospitalId
                        ? "All Hospitals (Global Default)"
                        : hosp?.name || "All Assigned Hospitals"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {item.hospitalId === "ALL" || !item.hospitalId
                        ? "Applicable to all centers & sites"
                        : hosp?.parentSiteId
                          ? "Teleradiology Site Child"
                          : "Independent Hospital"}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                        item.modality === "MRI"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : item.modality === "CT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.modality === "USG"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-teal-50 text-teal-700 border border-teal-200"
                      }`}
                    >
                      {item.modality}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-6">
                    <span className="font-bold text-slate-900 text-xs uppercase block">
                      {item.studyName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.isCustomized ? "Custom Hospital Template" : "Standard Catalog Study"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-6 text-right">
                    {hasPrice ? (
                      <span className="font-black text-emerald-600 text-sm">
                        ₹{Number(item.price).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-medium">
                        Not Configured
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 px-6 text-center">
                    {hasPrice ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">
                        Standard
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setQuickPrice(hasPrice ? String(item.price) : "");
                        }}
                        className="h-8 px-2.5 text-xs font-bold border-slate-200 text-[#176B73] hover:bg-teal-50 hover:border-teal-200 cursor-pointer"
                        title="Set or update pricing for this hospital"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        {hasPrice ? "Edit Price" : "Set Price"}
                      </Button>

                      {item.isCustomized ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/utilities/templates/${item.id}`)}
                          className="h-8 px-2.5 text-xs font-bold border-slate-200 text-[#0D2461] hover:bg-slate-50 cursor-pointer"
                          title="Edit Template Report Document"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-[#00A8CC]" />
                          Template
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (item.hospitalId && item.hospitalId !== "ALL") {
                              params.set("hospitalId", item.hospitalId);
                            } else {
                              params.set("hospitalId", "ALL");
                            }
                            navigate(`/utilities/templates/new?${params.toString()}`);
                          }}
                          className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="Create custom template document for this study"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Template
                        </Button>
                      )}

                      {item.isCustomized && (
                        <button
                          onClick={() => deleteTemplate(item.rawTemplate.id)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Reset to Catalog Default"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Quick Price Assignment Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {editingItem.modality}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                {editingItem.studyName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Hospital:{" "}
                <span className="font-bold text-slate-800">
                  {editingItem.hospitalId === "ALL" || !editingItem.hospitalId
                    ? "All Hospitals (Global Default)"
                    : hospitals.find((h) => h.id === editingItem.hospitalId)?.name || "Selected Hospital"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Assign Price (₹) {editingItem.hospitalId === "ALL" ? "Across All Hospitals" : "for this Hospital"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-black text-slate-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0"
                  autoFocus
                  placeholder="e.g. 1500"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="pl-8 h-11 text-sm font-bold text-slate-900 border-slate-300 rounded-xl focus:border-[#176B73] focus:ring-[#176B73]/20 shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {editingItem.hospitalId === "ALL"
                  ? "This default price applies to all hospitals unless a hospital-specific override price is set."
                  : "This price will specifically be applied to invoices and billing for this hospital."}
              </p>
            </div>

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePrice}
                className="rounded-xl bg-[#0D2461] hover:bg-[#081840] text-white font-black text-xs h-9 px-4 cursor-pointer"
              >
                Save Price
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
