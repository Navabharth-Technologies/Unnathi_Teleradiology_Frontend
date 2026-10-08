import { useState } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { History, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AddStudy() {
  const { user } = useAuthStore();
  const {
    addStudy,
    addInvoice,
    patients,
    hospitals,
    studies,
    templates,
    modalities,
  } = useMockDb();
  const navigate = useNavigate();

  const scopedHospitals = hospitals.filter((h) => {
    if (user?.role === "SUPER_ADMIN") return true;
    if (user?.siteId) return h.parentSiteId === user.siteId;
    if (user?.hospitalId) return h.id === user.hospitalId;
    return false;
  });

  const [formData, setFormData] = useState({
    patientId: patients?.[0]?.id || "",
    modality: "CT",
    studyDescription: "",
    bodyPart: "",
    priority: "Routine",
    hospitalId: user?.hospitalId || scopedHospitals?.[0]?.id || "",
    referringDoctor: "",
    historyAttachment: "",
    studyUid: "",
    clinicalHistory: "",
    provisionalDiagnosis: "",
    relevantNotes: "",
    creatinineFlag: false,
    pregnancyFlag: false,
    technician: "",
  });

  const previousStudies = studies
    .filter((s) => s.patientId === formData.patientId)
    .sort(
      (a, b) =>
        new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime(),
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStudy = {
      ...formData,
      referringPhysician: formData.referringDoctor,
      id: "st" + Date.now(),
      caseNumber: "CAS-" + Math.floor(10000 + Math.random() * 90000),
      accessionNumber: "ACC-" + Math.floor(10000 + Math.random() * 90000),
      studyDate: new Date().toISOString(),
      status: "New",
      reportingStatus: "Pending",
      tat: "0h",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addStudy(newStudy);

    // Auto-generate invoice based on configured Template pricing
    const matchingTemplate = templates?.find(
      (t) =>
        t.modality === formData.modality &&
        t.studyName === formData.studyDescription.toUpperCase(),
    );
    if (
      matchingTemplate &&
      matchingTemplate.price &&
      matchingTemplate.price > 0
    ) {
      addInvoice({
        id: "inv" + Date.now(),
        studyId: newStudy.id,
        patientId: newStudy.patientId,
        hospitalId: newStudy.hospitalId,
        invoiceNumber:
          "INV-" +
          new Date().getFullYear() +
          "-" +
          Math.floor(1000 + Math.random() * 9000),
        amount: matchingTemplate.price,
        status: "Unpaid",
        date: new Date().toISOString(),
        dueDate: new Date().toISOString(),
      });
    }

    navigate("/studies");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-center bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Add New Study
          </h1>
          <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
            Register a new patient scan and auto-generate billing
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/studies")}
          className="font-bold border border-transparent hover:border-border rounded-xl px-5 text-slate-500 hover:text-primary transition-all"
        >
          Cancel
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8 animate-unnathi-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              value={formData.patientId}
              onChange={(e) =>
                setFormData({ ...formData, patientId: e.target.value })
              }
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.uhid})
                </option>
              ))}
            </select>

            {previousStudies.length > 0 && (
              <div className="mt-6 bg-slate-50/50 border border-border rounded-xl p-5">
                <div className="flex items-center text-primary font-black text-sm mb-4 tracking-tight">
                  <History className="w-4 h-4 mr-2 text-accent" />
                  Prior Scans ({previousStudies.length})
                </div>
                <div className="space-y-3">
                  {previousStudies.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm text-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-info/10 text-info rounded-lg border border-info/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-primary tracking-tight">
                            {s.modality} - {s.studyDescription}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {format(new Date(s.studyDate), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${["Final", "Verified", "Dispatched"].includes(s.reportingStatus) ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}
                      >
                        {s.reportingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Modality <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              value={formData.modality}
              onChange={(e) =>
                setFormData({ ...formData, modality: e.target.value })
              }
            >
              {modalities.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Priority
            </label>
            <select
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              {["Routine", "Urgent", "Emergency", "Follow Up"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Study Description <span className="text-rose-500">*</span>
            </label>
            {(() => {
              const availableTemplates =
                templates?.filter(
                  (t) =>
                    t.hospitalId === formData.hospitalId &&
                    t.modality === formData.modality &&
                    t.isActive,
                ) || [];
              return (
                <>
                  <Input
                    required
                    list="study-templates"
                    value={formData.studyDescription}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData({ ...formData, studyDescription: val });
                    }}
                    placeholder="e.g. MRI Brain with Contrast"
                    className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
                  />

                  <datalist id="study-templates">
                    {availableTemplates.map((t) => (
                      <option key={t.id} value={t.studyName} />
                    ))}
                  </datalist>
                </>
              );
            })()}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Body Part
            </label>
            <Input
              value={formData.bodyPart}
              onChange={(e) =>
                setFormData({ ...formData, bodyPart: e.target.value })
              }
              placeholder="e.g. Brain"
              className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Referring Doctor
            </label>
            <Input
              value={formData.referringDoctor}
              onChange={(e) =>
                setFormData({ ...formData, referringDoctor: e.target.value })
              }
              className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
            />
          </div>

          {user?.role !== "HOSPITAL_ADMIN" && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Hospital
              </label>
              <select
                className="w-full border border-border rounded-xl p-3 bg-background text-primary font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
                value={formData.hospitalId}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalId: e.target.value })
                }
              >
                {scopedHospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              History / Prescription Images (URLs, one per line)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. https://example.com/prescription1.jpg&#10;https://example.com/prescription2.jpg"
              value={formData.historyAttachment}
              onChange={(e) =>
                setFormData({ ...formData, historyAttachment: e.target.value })
              }
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
            />
          </div>

          {/* New Fields added per requirements */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Study UID
            </label>
            <Input
              value={formData.studyUid}
              onChange={(e) =>
                setFormData({ ...formData, studyUid: e.target.value })
              }
              placeholder="DICOM Study Instance UID"
              className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Technician / User
            </label>
            <Input
              value={formData.technician}
              onChange={(e) =>
                setFormData({ ...formData, technician: e.target.value })
              }
              placeholder="Technician Name"
              className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Clinical History
            </label>
            <textarea
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              rows={2}
              value={formData.clinicalHistory}
              onChange={(e) =>
                setFormData({ ...formData, clinicalHistory: e.target.value })
              }
              placeholder="Clinical History..."
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Provisional Diagnosis
            </label>
            <textarea
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              rows={2}
              value={formData.provisionalDiagnosis}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  provisionalDiagnosis: e.target.value,
                })
              }
              placeholder="Provisional Diagnosis..."
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Previous Surgery / Relevant Notes
            </label>
            <textarea
              className="w-full border border-border rounded-xl p-3 bg-background text-primary font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
              rows={2}
              value={formData.relevantNotes}
              onChange={(e) =>
                setFormData({ ...formData, relevantNotes: e.target.value })
              }
              placeholder="Relevant Notes..."
            />
          </div>

          <div className="space-y-2 col-span-2 flex items-center space-x-6 border-t border-border pt-6 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.creatinineFlag}
                onChange={(e) =>
                  setFormData({ ...formData, creatinineFlag: e.target.checked })
                }
                className="rounded text-accent focus:ring-accent border-border bg-background shadow-inner w-5 h-5 transition-all"
              />
              <span className="text-sm font-bold text-primary group-hover:text-accent transition-colors">
                Creatinine Flag
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.pregnancyFlag}
                onChange={(e) =>
                  setFormData({ ...formData, pregnancyFlag: e.target.checked })
                }
                className="rounded text-accent focus:ring-accent border-border bg-background shadow-inner w-5 h-5 transition-all"
              />
              <span className="text-sm font-bold text-primary group-hover:text-accent transition-colors">
                Pregnancy Flag
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/studies")}
            className="font-bold text-slate-500 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-border rounded-xl px-6 transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white font-bold rounded-xl px-8 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
          >
            Save Study
          </Button>
        </div>
      </form>
    </div>
  );
}
