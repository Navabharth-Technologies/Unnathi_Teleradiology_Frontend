import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  AlertTriangle,
  Building2,
  UserCheck,
  Send,
  Clock,
  FileText,
  ShieldAlert,
} from "lucide-react";

export function RequestSuperAdminModal({
  isOpen,
  onClose,
  study,
  patient,
  hospital,
  sites = [],
  onSubmit,
}) {
  const [routePreference, setRoutePreference] = useState(
    study?.assignmentRequest?.routePreference || "GLOBAL_RADIOLOGIST",
  );
  const [targetSiteId, setTargetSiteId] = useState(
    study?.assignmentRequest?.targetSiteId || "",
  );
  const [reason, setReason] = useState(
    study?.assignmentRequest?.reason ||
      "Radiologist on leave / Unavailable - Same day dispatch required",
  );
  const [urgency, setUrgency] = useState(
    study?.assignmentRequest?.urgency || "Same-Day (Today)",
  );
  const [notes, setNotes] = useState(study?.assignmentRequest?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter company sites available for outsourcing
  const teleradCompanies = sites.filter(
    (s) => s.organizationType === "COMPANY_MANAGED" || !s.organizationType,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      assignmentRequest: {
        status: "Pending",
        requestedAt: new Date().toISOString(),
        requestedBy: hospital?.name || "Independent Hospital Admin",
        hospitalId: hospital?.id || study?.hospitalId,
        routePreference,
        targetSiteId:
          routePreference === "TELERADIOLOGY_COMPANY" ? targetSiteId : null,
        targetSiteName:
          routePreference === "TELERADIOLOGY_COMPANY"
            ? teleradCompanies.find((s) => s.id === targetSiteId)?.name || ""
            : "",
        reason,
        urgency,
        notes,
      },
      priority: urgency.includes("STAT") ? "STAT" : "Emergency",
    };

    onSubmit(payload);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        {/* Header with emergency alert banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Escalate to Super Admin
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-white/25 rounded-full">
                  Independent Hospital Only
                </span>
              </DialogTitle>
              <DialogDescription className="text-amber-100 text-xs font-semibold mt-0.5">
                Radiologist unavailable or on leave? Route report to Global Pool or Teleradiology Partner for same-day dispatch.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Study Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Patient & Case
              </span>
              <span className="font-black text-slate-800 text-sm">
                {patient?.name || "Patient"}
              </span>
              <span className="text-slate-500 ml-2 font-mono">
                ({study?.caseNumber || "Case"})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Hospital / Study
              </span>
              <span className="font-bold text-[#176B73]">
                {hospital?.name || "Hospital"}
              </span>
              <span className="text-slate-600 ml-1.5 font-semibold">
                • {study?.modality} {study?.bodyPart || ""}
              </span>
            </div>
          </div>

          {/* Routing Preference Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Routing Destination Preference <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRoutePreference("GLOBAL_RADIOLOGIST")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-start gap-1.5 ${
                  routePreference === "GLOBAL_RADIOLOGIST"
                    ? "border-[#176B73] bg-[#176B73]/5 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck
                    className={`w-4 h-4 ${
                      routePreference === "GLOBAL_RADIOLOGIST"
                        ? "text-[#176B73]"
                        : "text-slate-400"
                    }`}
                  />
                  <span className="text-xs font-black text-slate-800">
                    Direct Global Radiologist
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Assign directly to verified on-call global panel radiologist
                </p>
              </div>

              <div
                onClick={() => setRoutePreference("TELERADIOLOGY_COMPANY")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-start gap-1.5 ${
                  routePreference === "TELERADIOLOGY_COMPANY"
                    ? "border-[#176B73] bg-[#176B73]/5 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2
                    className={`w-4 h-4 ${
                      routePreference === "TELERADIOLOGY_COMPANY"
                        ? "text-[#176B73]"
                        : "text-slate-400"
                    }`}
                  />
                  <span className="text-xs font-black text-slate-800">
                    Teleradiology Company
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Route case to an accredited Teleradiology Network partner
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Company Picker */}
          {routePreference === "TELERADIOLOGY_COMPANY" && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Teleradiology Company (Optional)
              </label>
              <select
                value={targetSiteId}
                onChange={(e) => setTargetSiteId(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#176B73]/20 focus:border-[#176B73]"
              >
                <option value="">-- Any Available Teleradiology Company (Super Admin Choice) --</option>
                {teleradCompanies.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} {site.city ? `(${site.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dispatch Urgency & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Dispatch Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#176B73]/20 focus:border-[#176B73]"
              >
                <option value="Same-Day (Today)">Same-Day (Today - Required)</option>
                <option value="STAT (Within 2 Hours)">STAT (Urgent - Within 2 Hours)</option>
                <option value="Emergency (Immediate)">Emergency (Immediate Dispatch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Escalation Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#176B73]/20 focus:border-[#176B73]"
              >
                <option value="Radiologist on leave / Unavailable - Same day dispatch required">
                  Radiologist on Leave - Same Day Required
                </option>
                <option value="Sub-specialty second opinion required">
                  Sub-specialty opinion required
                </option>
                <option value="High case volume overflow">
                  Hospital case volume overflow
                </option>
                <option value="Emergency evening/night coverage">
                  Emergency off-hours coverage
                </option>
              </select>
            </div>
          </div>

          {/* Clinical Instructions / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes for Super Admin / Reporting Doctor
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Dr. Sharma is on leave today. Patient needs report dispatched before 6 PM for surgery."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#176B73]/20 focus:border-[#176B73] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400">
              Super Admin will be notified immediately
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black shadow-md text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Request
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
