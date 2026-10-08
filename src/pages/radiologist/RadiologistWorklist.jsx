import { useState } from "react";
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
import { Search, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card } from "../../components/ui/card";

export default function RadiologistWorklist() {
  const { studies, patients, radiologists, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const defaultRadId =
    radiologists.find((r) => r.userId === user?.id || r.name === user?.name)
      ?.id || radiologists[0]?.id;
  const [selectedRadId, setSelectedRadId] = useState(defaultRadId);

  const currentRadiologist = radiologists.find((r) => r.id === selectedRadId);

  const myStudies = studies
    .filter((s) => s.assignedRadiologistId === selectedRadId)
    .filter(
      (s) =>
        s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.modality.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.priority === "Emergency" && b.priority !== "Emergency") return -1;
      if (b.priority === "Emergency" && a.priority !== "Emergency") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPatientName = (id) =>
    patients.find((p) => p.id === id)?.name || "Unknown";
  const getPatientUhid = (id) =>
    patients.find((p) => p.id === id)?.uhid || "Unknown";
  const getHospitalName = (id) =>
    hospitals.find((h) => h.id === id)?.name || "Unknown";

  const getStatusStyle = (status) => {
    switch (status) {
      case "Final":
      case "Verified":
      case "Dispatched":
        return "bg-success/10 text-success border-success/20";
      case "Draft":
        return "bg-muted text-muted-foreground border-border";
      case "Review":
      case "Pending":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "Action Needed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Unread":
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            My Worklist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Viewing assigned studies for{" "}
            {currentRadiologist?.name || "Selected Radiologist"}
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case or modality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          {user?.role !== "RADIOLOGIST" ? (
            <div className="flex items-center space-x-2">
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm font-medium outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                value={selectedRadId}
                onChange={(e) => setSelectedRadId(e.target.value)}
              >
                {radiologists.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (
                    {
                      studies.filter((s) => s.assignedRadiologistId === r.id)
                        .length
                    }
                    )
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-md border border-border">
              <span className="text-sm font-semibold text-primary">
                {currentRadiologist?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                  Case No / Priority
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                  Patient / Hospital
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                  Modality / Study
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-center">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myStudies.map((study) => (
                <TableRow
                  key={study.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border group cursor-pointer"
                  onClick={() => navigate(`/viewer/${study.id}`)}
                >
                  <TableCell className="py-3 align-top">
                    <div className="font-semibold text-foreground text-sm">
                      {study.caseNumber}
                    </div>
                    <div className="mt-1">
                      {study.priority === "Emergency" ? (
                        <span className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-widest">
                          STAT
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground border border-border text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-widest">
                          Routine
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 align-top">
                    <div className="font-semibold text-primary text-sm">
                      {getPatientName(study.patientId)}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-0.5 mb-1">
                      {getPatientUhid(study.patientId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getHospitalName(study.hospitalId)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 align-top">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase">
                        {study.modality}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {study.bodyPart}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                      {study.studyDescription}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 align-top text-xs text-muted-foreground">
                    {format(new Date(study.studyDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="py-3 align-top text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusStyle(study.reportingStatus)}`}
                    >
                      {study.reportingStatus}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 align-top text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" /> Open Viewer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {myStudies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Filter className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium">
                        No assigned studies found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
