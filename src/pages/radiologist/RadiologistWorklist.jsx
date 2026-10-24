import { useState, useMemo } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Search,
  Eye,
  Filter,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  User,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Stethoscope,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function RadiologistWorklist() {
  const { studies, patients, radiologists, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalityFilter, setModalityFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const defaultRadId =
    radiologists.find((r) => r.userId === user?.id || r.name === user?.name)
      ?.id || radiologists[0]?.id;
  const [selectedRadId, setSelectedRadId] = useState(defaultRadId);

  const currentRadiologist = radiologists.find((r) => r.id === selectedRadId);

  // Filter studies belonging to this radiologist
  const assignedStudies = useMemo(() => {
    return studies.filter((s) => s.assignedRadiologistId === selectedRadId);
  }, [studies, selectedRadId]);

  // Telemetry counts
  const totalCount = assignedStudies.length;
  const pendingCount = assignedStudies.filter((s) =>
    ["Unread", "Pending", "Draft", "Action Needed"].includes(s.reportingStatus),
  ).length;
  const emergencyCount = assignedStudies.filter(
    (s) =>
      s.priority === "Emergency" &&
      !["Final", "Verified", "Dispatched"].includes(s.reportingStatus),
  ).length;
  const completedCount = assignedStudies.filter((s) =>
    ["Final", "Verified", "Dispatched"].includes(s.reportingStatus),
  ).length;

  // Filtered list
  const filteredStudies = useMemo(() => {
    return assignedStudies
      .filter((s) => {
        // Status filter
        if (statusFilter === "STAT") {
          return s.priority === "Emergency";
        }
        if (statusFilter === "Pending") {
          return ["Unread", "Pending", "Draft", "Action Needed"].includes(
            s.reportingStatus,
          );
        }
        if (statusFilter === "Completed") {
          return ["Final", "Verified", "Dispatched"].includes(
            s.reportingStatus,
          );
        }
        if (statusFilter !== "All") {
          return s.reportingStatus === statusFilter;
        }
        return true;
      })
      .filter((s) => {
        // Modality filter
        if (modalityFilter === "All") return true;
        return (s.modality || "").toUpperCase() === modalityFilter.toUpperCase();
      })
      .filter((s) => {
        // Search term
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const patient = patients.find((p) => p.id === s.patientId);
        const hospital = hospitals.find((h) => h.id === s.hospitalId);

        return (
          (s.caseNumber || "").toLowerCase().includes(q) ||
          (s.accessionNumber || "").toLowerCase().includes(q) ||
          (s.modality || "").toLowerCase().includes(q) ||
          (s.bodyPart || "").toLowerCase().includes(q) ||
          (s.studyDescription || "").toLowerCase().includes(q) ||
          (patient?.name || "").toLowerCase().includes(q) ||
          (patient?.uhid || "").toLowerCase().includes(q) ||
          (hospital?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.priority === "Emergency" && b.priority !== "Emergency") return -1;
        if (b.priority === "Emergency" && a.priority !== "Emergency") return 1;
        const dateA = new Date(a.studyDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.studyDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [assignedStudies, statusFilter, modalityFilter, searchTerm, patients, hospitals]);

  const getPatient = (id) => patients.find((p) => p.id === id);
  const getHospital = (id) => hospitals.find((h) => h.id === id);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getModalityBadgeStyle = (modality) => {
    const mod = (modality || "").toUpperCase();
    switch (mod) {
      case "CT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/10";
      case "MRI":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/80 ring-1 ring-cyan-500/10";
      case "X-RAY":
      case "DX":
      case "CR":
        return "bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10";
      case "US":
      case "ULTRASOUND":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10";
      case "MAMMO":
        return "bg-pink-50 text-pink-700 border-pink-200/80 ring-1 ring-pink-500/10";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-500/10";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Final":
      case "Verified":
      case "Dispatched":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Draft
          </span>
        );
      case "Pending":
      case "Unread":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Read
          </span>
        );
      case "Action Needed":
      case "Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Action Req.
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {status || "Active"}
          </span>
        );
    }
  };

  const allModalities = ["All", "CT", "MRI", "X-Ray", "US", "MAMMO"];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 w-full max-w-full min-w-0">
      {/* Top Header & Radiologist Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#10263D] to-[#176B73] rounded-xl text-white shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#10263D] tracking-tight">
                Radiologist Worklist
              </h1>
              <p className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
                Real-time assigned studies and diagnostic reporting queue
              </p>
            </div>
          </div>
        </div>

        {/* Radiologist Active Badge / Switcher */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {user?.role !== "RADIOLOGIST" ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 shadow-inner">
              <span className="text-xs font-bold text-slate-500 pl-2">
                Viewing:
              </span>
              <select
                className="bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#176B73]/20 shadow-sm"
                value={selectedRadId}
                onChange={(e) => setSelectedRadId(e.target.value)}
              >
                {radiologists.map((r) => (
                  <option key={r.id} value={r.id}>
                    Dr. {r.name} (
                    {
                      studies.filter((s) => s.assignedRadiologistId === r.id)
                        .length
                    }{" "}
                    cases)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-4 py-2 rounded-xl shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block leading-tight">
                  Assigned Radiologist
                </span>
                <span className="text-sm font-black text-emerald-950">
                  Dr. {currentRadiologist?.name || user?.name}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate("/reporting")}
            className="bg-gradient-to-r from-[#10263D] to-[#176B73] hover:from-[#0d1f31] hover:to-[#135960] text-white shadow-md shadow-[#176B73]/20 h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Full Reporting Suite
          </Button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Assigned */}
        <div
          onClick={() => setStatusFilter("All")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 ${
            statusFilter === "All"
              ? "border-[#176B73] ring-2 ring-[#176B73]/20 shadow-md shadow-[#176B73]/10"
              : "border-slate-200/80 hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Total Queue
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#10263D]">
              {totalCount}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Assigned Studies
            </span>
          </div>
        </div>

        {/* Card 2: Pending Read */}
        <div
          onClick={() => setStatusFilter("Pending")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 ${
            statusFilter === "Pending"
              ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/10"
              : "border-slate-200/80 hover:border-amber-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
              Pending Reads
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-950">
              {pendingCount}
            </span>
            <span className="text-[11px] font-bold text-amber-600/80">
              Awaiting Report
            </span>
          </div>
        </div>

        {/* Card 3: STAT / Emergency */}
        <div
          onClick={() => setStatusFilter("STAT")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 ${
            statusFilter === "STAT"
              ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md shadow-rose-500/10"
              : "border-slate-200/80 hover:border-rose-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
              STAT / Emergency
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-950">
              {emergencyCount}
            </span>
            {emergencyCount > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 animate-pulse">
                High Priority!
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-400">
                None Pending
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Completed / Finalized */}
        <div
          onClick={() => setStatusFilter("Completed")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 ${
            statusFilter === "Completed"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10"
              : "border-slate-200/80 hover:border-emerald-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
              Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-950">
              {completedCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600/80">
              Reports Dispatched
            </span>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 max-w-full overflow-x-auto">
            {[
              { id: "All", label: "All Cases", count: totalCount },
              { id: "Pending", label: "Pending", count: pendingCount },
              { id: "STAT", label: "STAT / Urgent", count: emergencyCount },
              { id: "Completed", label: "Completed", count: completedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-white text-[#10263D] shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    statusFilter === tab.id
                      ? "bg-[#10263D] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search Case ID, Patient, UHID, Hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-xl border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B73]/20 focus:border-[#176B73] shadow-inner bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modality Chips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Modality:
          </span>
          {allModalities.map((mod) => (
            <button
              key={mod}
              onClick={() => setModalityFilter(mod)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                modalityFilter === mod
                  ? "bg-[#10263D] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mod}
            </button>
          ))}
          {(statusFilter !== "All" || modalityFilter !== "All" || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setModalityFilter("All");
                setSearchTerm("");
              }}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4 pl-6">
                  Case Details / Priority
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4">
                  Patient & Hospital
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4">
                  Modality & Study
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4">
                  Timeline
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4 text-center">
                  Reporting Status
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-4 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredStudies.map((study) => {
                const patient = getPatient(study.patientId);
                const hospital = getHospital(study.hospitalId);
                const isEmergency = study.priority === "Emergency";

                return (
                  <TableRow
                    key={study.id}
                    className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                      isEmergency ? "bg-rose-50/20" : ""
                    }`}
                    onClick={() => navigate(`/viewer/${study.id}`)}
                  >
                    {/* Col 1: Case Details & Priority */}
                    <TableCell className="py-4 pl-6 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {study.caseNumber}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(study.caseNumber, study.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="Copy Case Number"
                        >
                          {copiedId === study.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        {isEmergency ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-500/20 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            STAT
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            Routine
                          </span>
                        )}

                        {study.accessionNumber && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Acc: {study.accessionNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Col 2: Patient & Hospital */}
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10263D]/10 to-[#176B73]/20 flex items-center justify-center text-[#10263D] font-black text-xs shrink-0">
                          {patient?.name
                            ? patient.name.slice(0, 2).toUpperCase()
                            : "PT"}
                        </div>
                        <div>
                          <div className="font-bold text-[#10263D] text-sm flex items-center gap-2">
                            <span>{patient?.name || "Patient Unknown"}</span>
                            {patient?.gender && (
                              <span className="text-[11px] font-bold text-slate-400">
                                ({patient.gender.charAt(0)}
                                {patient.age ? ` / ${patient.age}y` : ""})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {patient?.uhid && (
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {patient.uhid}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {hospital?.name || "Hospital Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Col 3: Modality & Study */}
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-md border uppercase ${getModalityBadgeStyle(
                            study.modality,
                          )}`}
                        >
                          {study.modality || "DICOM"}
                        </span>
                        <span className="font-black text-slate-800 text-xs">
                          {study.bodyPart || "General"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 max-w-[240px] truncate">
                        {study.studyDescription || "Standard Diagnostic Scan"}
                      </p>
                    </TableCell>

                    {/* Col 4: Timeline */}
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {study.studyDate
                          ? format(new Date(study.studyDate), "dd MMM yyyy")
                          : "Today"}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                        {study.createdAt
                          ? format(new Date(study.createdAt), "hh:mm a")
                          : "Scheduled"}
                      </span>
                    </TableCell>

                    {/* Col 5: Status */}
                    <TableCell className="py-4 align-middle text-center">
                      {getStatusBadge(study.reportingStatus)}
                    </TableCell>

                    {/* Col 6: Actions */}
                    <TableCell className="py-4 pr-6 align-middle text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          onClick={() => navigate(`/viewer/${study.id}`)}
                          className="bg-gradient-to-r from-[#10263D] to-[#176B73] hover:from-[#0d1f31] hover:to-[#135960] text-white h-8 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 hover:shadow-md transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View DICOM</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (["Final", "Verified", "Dispatched"].includes(study.reportingStatus)) {
                              navigate(`/verification/${study.id}/preview`);
                            } else {
                              navigate(`/viewer/${study.id}`);
                            }
                          }}
                          className="h-8 px-3 rounded-lg text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                          title="Open Diagnostic Report"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Report</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredStudies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                        <Filter className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">
                        No Assigned Cases Found
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        {searchTerm || statusFilter !== "All" || modalityFilter !== "All"
                          ? "No studies match your current search and filter settings."
                          : "You have no pending studies assigned in your queue right now."}
                      </p>
                      {(searchTerm || statusFilter !== "All" || modalityFilter !== "All") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                            setModalityFilter("All");
                          }}
                          className="text-xs font-bold rounded-xl"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
