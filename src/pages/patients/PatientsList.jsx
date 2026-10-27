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
import { Search, Eye, X, Users } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "../../store/useAuthStore";
import { Card } from "../../components/ui/card";

export default function PatientsList() {
  const { patients } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const { selectedHospitalId } = useAuthStore();

  const filtered = patients.filter((p) => {
    if (selectedHospitalId && p.hospitalId !== selectedHospitalId) return false;
    return (
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.uhid || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-unnathi-fade-in">
      {/* Header matching standard typography & design system */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent -z-10 rounded-xl blur-xl"></div>
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-accent" />
            Patients Directory
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 pl-7">
            Manage patient records and demographics
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search by Name or UHID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-[320px] border-border/50 bg-background/50 backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all shadow-sm hover:shadow-md text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5">
                  UHID
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5">
                  Patient Name
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5">
                  Age / Gender
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5">
                  Phone
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5">
                  Reg. Date
                </TableHead>
                <TableHead className="text-[11px] font-black text-slate-500 uppercase tracking-wider py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/60"
                >
                  <TableCell className="py-3.5 font-bold text-foreground text-sm">
                    {patient.uhid}
                  </TableCell>
                  <TableCell className="py-3.5 font-bold text-primary text-sm">
                    {patient.name}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm font-medium text-slate-600">
                    {patient.age} • {patient.gender}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm font-medium text-slate-600">
                    {patient.phone || "-"}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm font-medium text-slate-600">
                    {format(new Date(patient.registrationDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewItem(patient)}
                        className="h-8 px-2.5 text-primary hover:text-accent hover:bg-accent/10 transition-colors font-bold"
                        title="View Patient Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-slate-400 font-medium text-sm"
                  >
                    No patients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>



      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-lg shadow-level-3 border border-border flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">
                Patient Details
              </h2>
              <button
                onClick={() => setViewItem(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    UHID
                  </p>
                  <p className="font-medium mt-1">{viewItem.uhid}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Name
                  </p>
                  <p className="font-medium mt-1">{viewItem.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Age/Gender
                  </p>
                  <p className="font-medium mt-1">
                    {viewItem.age} / {viewItem.gender}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Phone
                  </p>
                  <p className="font-medium mt-1">{viewItem.phone || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Address
                  </p>
                  <p className="font-medium mt-1">{viewItem.address || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Registration Date
                  </p>
                  <p className="font-medium mt-1">
                    {format(new Date(viewItem.registrationDate), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
