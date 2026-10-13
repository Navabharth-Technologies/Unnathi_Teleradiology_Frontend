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
  const { templates, addTemplate, deleteTemplate, hospitals } = useMockDb();
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
      if (user?.role === "SUPER_ADMIN") return true;
      if (user?.role === "SITE_ADMIN") {
        const hosp = hospitals.find((h) => h.id === t.hospitalId);
        return hosp?.parentSiteId === user?.siteId;
      }
      return t.hospitalId === user?.hospitalId;
    });
  }, [templates, hospitals, user]);

  const filtered = useMemo(() => {
    return scopedTemplates.filter((t) => {
      if (
        selectedHospitalFilter !== "ALL" &&
        t.hospitalId !== selectedHospitalFilter
      ) {
        return false;
      }
      if (
        selectedModalityFilter !== "ALL" &&
        t.modality?.toUpperCase() !== selectedModalityFilter.toUpperCase()
      ) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesMod = t.modality?.toLowerCase().includes(q);
        const matchesName = t.studyName?.toLowerCase().includes(q);
        const hospName = hospitals.find((h) => h.id === t.hospitalId)?.name || "";
        const matchesHosp = hospName.toLowerCase().includes(q);
        if (!matchesMod && !matchesName && !matchesHosp) return false;
      }
      return true;
    });
  }, [
    scopedTemplates,
    selectedHospitalFilter,
    selectedModalityFilter,
    searchTerm,
    hospitals,
  ]);

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-[#0D2461] tracking-tight flex items-center gap-2.5">
            <span>Study Catalog & Templates</span>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {standardStudiesCatalog.length} Standard Studies Catalog
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure, edit, and assign custom hospital-to-hospital pricing for MRI, CT, USG, and X-Ray studies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Hospital Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20"
            >
              <option value="ALL">All Hospitals ({accessibleHospitals.length})</option>
              {accessibleHospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.parentSiteId ? "(Site Child)" : "(Independent)"}
                </option>
              ))}
            </select>
          </div>

          {/* Modality Filter */}
          <select
            value={selectedModalityFilter}
            onChange={(e) => setSelectedModalityFilter(e.target.value)}
            className="h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20"
          >
            <option value="ALL">All Modalities</option>
            <option value="MRI">MRI (98 Studies)</option>
            <option value="CT">CT (75 Studies)</option>
            <option value="USG">USG (54 Studies)</option>
            <option value="X-RAY">X-RAY (65 Studies)</option>
          </select>

          {/* Search Input */}
          <div className="relative group min-w-[220px]">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input
              placeholder="Search study name or price..."
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
            className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Add / Customize Study
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">
                Hospital Scope
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">
                Modality
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">
                Study Name
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">
                Price (₹)
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-center">
                Status
              </TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tpl) => {
              const hosp = hospitals.find((h) => h.id === tpl.hospitalId);
              return (
                <TableRow
                  key={tpl.id}
                  className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <TableCell className="py-4 px-6">
                    <div className="font-bold text-slate-800 text-xs">
                      {hosp?.name || "Global / Unassigned"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {hosp?.parentSiteId ? "Teleradiology Centre" : "Independent Hospital"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 font-bold text-slate-800 text-sm">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-black">
                      {tpl.modality}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 font-semibold text-slate-800 text-sm uppercase">
                    {tpl.studyName}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right font-black text-emerald-600 text-sm">
                    {tpl.price !== undefined && tpl.price !== null && tpl.price !== ""
                      ? `₹${Number(tpl.price).toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    {tpl.isActive ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/utilities/templates/${tpl.id}/edit`)
                        }
                        className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Study & Price"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(tpl.id)}
                        className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-slate-500 text-sm font-medium"
                >
                  <div className="max-w-md mx-auto space-y-3">
                    <p className="font-bold text-slate-700">
                      No customized study templates found for this filter.
                    </p>
                    <p className="text-xs text-slate-500">
                      You can click "Add / Customize Study" to select any of the 292 standard studies from the catalog (MRI, CT, USG, X-RAY) and assign custom prices per hospital.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
