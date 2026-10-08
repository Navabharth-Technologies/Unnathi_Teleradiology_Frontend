import { useState } from "react";
import { useMockDb } from "../../store/useMockDb";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Search, PlusCircle, Eye, Share2, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareModal } from "../../components/modals/ShareModal";
import { AddHistoryModal } from "../../components/modals/AddHistoryModal";
import { format } from "date-fns";
import { useAuthStore } from "../../store/useAuthStore";
import { Card } from "../../components/ui/card";

export default function StudiesList() {
  const { studies, patients, hospitals, updateStudy } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [historyStudy, setHistoryStudy] = useState(null);
  const [sharingStudy, setSharingStudy] = useState(null);
  const navigate = useNavigate();
  const { currentRole, selectedHospitalId, user } = useAuthStore();

  const filtered = studies.filter((s) => {
    if (selectedHospitalId && s.hospitalId !== selectedHospitalId) return false;
    if (user?.role === "SITE_ADMIN") {
      const hospital = hospitals.find((h) => h.id === s.hospitalId);
      if (hospital?.parentSiteId !== user.siteId) return false;
    }
    return (
      s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getPatientName = (id) =>
    patients.find((p) => p.id === id)?.name || "Unknown";
  const getHospitalName = (id) =>
    hospitals.find((h) => h.id === id)?.name || "Unknown";

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Emergency":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Urgent":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-info/10 text-info border-info/20";
      case "Final":
        return "bg-success/10 text-success border-success/20";
      case "Action Needed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-unnathi-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent -z-10 rounded-xl blur-xl"></div>
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2 tracking-tight">
            <ClipboardList className="w-5 h-5 text-accent" />
            Study Worklist
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 pl-7">
            Manage and assign all incoming diagnostic studies efficiently
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search by case or accession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[300px] border-border/50 bg-background/50 backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all shadow-sm hover:shadow-md"
            />
          </div>
          {currentRole !== "Accountant" && (
            <Button onClick={() => navigate("/studies/new")} className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Study
            </Button>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-background/10 backdrop-blur-sm -z-10 pointer-events-none"></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 backdrop-blur-md border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Case No
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Patient
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Hospital
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Modality/Study
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Priority
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider">
                  Date
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase py-4 tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((study) => (
                <TableRow
                  key={study.id}
                  className="hover:bg-accent/5 transition-all duration-200 border-b border-border/40 group cursor-pointer"
                  onClick={() => navigate(`/viewer/${study.id}`)}
                >
                  <TableCell className="py-4 font-bold text-foreground text-sm">
                    {study.caseNumber}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-primary text-sm">
                    {getPatientName(study.patientId)}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {getHospitalName(study.hospitalId)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-foreground text-sm">
                      {study.modality}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {study.studyDescription}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityColor(study.priority)}`}
                    >
                      {study.priority}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusColor(study.status)}`}
                    >
                      {study.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {format(new Date(study.studyDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/viewer/${study.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryStudy(study);
                        }}
                      >
                        <ClipboardList
                          className={`w-4 h-4 ${study.clinicalHistory ? "text-success" : "text-muted-foreground"}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingStudy(study);
                        }}
                      >
                        <Share2 className="w-4 h-4 text-info" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    No studies found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddHistoryModal
        isOpen={!!historyStudy}
        onClose={() => setHistoryStudy(null)}
        study={historyStudy}
        patient={
          historyStudy
            ? patients.find((p) => p.id === historyStudy.patientId)
            : undefined
        }
        hospital={
          historyStudy
            ? hospitals.find((h) => h.id === historyStudy.hospitalId)
            : undefined
        }
      />

      <ShareModal
        isOpen={!!sharingStudy}
        onClose={() => setSharingStudy(null)}
        study={sharingStudy}
        patient={patients.find((p) => p.id === sharingStudy?.patientId)}
        hospital={hospitals.find((h) => h.id === sharingStudy?.hospitalId)}
      />
    </div>
  );
}
