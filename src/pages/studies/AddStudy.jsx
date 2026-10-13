import { useState } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { History, FileText, Wallet, Lock, CheckCircle2, X } from "lucide-react";
import { format } from "date-fns";
import standardStudiesCatalog from "../../data/standardStudiesCatalog.json";

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
    updateHospital,
    addWalletTransaction,
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

  // Quick Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeMethod, setRechargeMethod] = useState("UPI");
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // Active hospital & wallet computation
  const selectedHospital =
    hospitals.find((h) => h.id === formData.hospitalId) ||
    scopedHospitals[0] ||
    hospitals[0];

  const unbilledStudies = studies.filter(
    (s) =>
      s.hospitalId === selectedHospital?.id &&
      ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) &&
      s.superAdminPaymentStatus !== "Paid",
  );

  const totalUnbilledAmount = unbilledStudies.reduce((sum, s) => {
    const comm =
      selectedHospital?.modalityCommissions?.[s.modality] ||
      (s.modality === "MRI"
        ? 150
        : s.modality === "CT"
          ? 100
          : ["X-Ray", "CR", "DR"].includes(s.modality)
            ? 30
            : 50);
    return sum + comm;
  }, 0);

  const effectiveBalance =
    (Number(selectedHospital?.walletBalance) || 0) - totalUnbilledAmount;
  const isPrepaid = (selectedHospital?.accountType || "Prepaid") === "Prepaid";
  const isWalletInsufficient = isPrepaid && effectiveBalance <= 0;

  const handleQuickRecharge = async () => {
    const amt = Number(rechargeAmount);
    if (isNaN(amt) || amt <= 0 || !selectedHospital) return;
    const currentBase = Number(selectedHospital.walletBalance || 0);
    const newBal = currentBase + amt;
    await updateHospital(selectedHospital.id, { walletBalance: newBal });

    // Record transaction in MS SQL Server
    addWalletTransaction({
      id: "tx_" + Date.now(),
      hospitalId: selectedHospital.id,
      siteId: selectedHospital.parentSiteId || null,
      type: "Recharge",
      amount: amt,
      balanceBefore: currentBase,
      balanceAfter: newBal,
      paymentMethod: rechargeMethod || "UPI",
      referenceId: `STUDY-TOPUP-${Date.now().toString().slice(-6)}`,
      remarks: "Quick wallet recharge from Add Study portal",
      status: "Completed",
      createdAt: new Date().toISOString(),
    });

    setRechargeSuccess(true);
    setTimeout(() => {
      setShowRechargeModal(false);
      setRechargeSuccess(false);
      setRechargeAmount("");
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPrepaid && isWalletInsufficient) {
      setShowRechargeModal(true);
      return;
    }
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

    // Auto-generate invoice ONLY for Independent hospitals based on configured Template pricing
    const isIndependentHospital =
      selectedHospital &&
      !selectedHospital.parentSiteId &&
      selectedHospital.organizationType !== "COMPANY_MANAGED";

    const matchingTemplate = templates?.find(
      (t) =>
        t.modality === formData.modality &&
        t.studyName === formData.studyDescription.toUpperCase(),
    );
    if (
      isIndependentHospital &&
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
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
              const hospitalTemplates =
                templates?.filter(
                  (t) =>
                    t.hospitalId === formData.hospitalId &&
                    t.modality === formData.modality &&
                    t.isActive,
                ) || [];
              const catalogStudies = standardStudiesCatalog.filter(
                (c) => c.modality.toUpperCase() === formData.modality?.toUpperCase(),
              );

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
                    placeholder="e.g. MRI - BRAIN, CT - CHEST"
                    className="h-11 px-3 border-border rounded-xl text-primary font-bold shadow-inner focus:border-accent focus:ring-accent"
                  />

                  <datalist id="study-templates">
                    {hospitalTemplates.map((t) => (
                      <option key={t.id} value={t.studyName} />
                    ))}
                    {catalogStudies.map((c, idx) => (
                      <option key={`cat_${idx}`} value={c.studyName} />
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
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Hospital
                </label>
                {isPrepaid ? (
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                      isWalletInsufficient
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-emerald-50 border-emerald-200 text-emerald-600"
                    }`}
                  >
                    Wallet: ₹ {effectiveBalance}
                  </span>
                ) : (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg border bg-indigo-50 border-indigo-200 text-indigo-600">
                    Postpaid ({selectedHospital?.paymentFrequency || "Monthly"})
                  </span>
                )}
              </div>
              <select
                className="w-full border border-border rounded-xl p-3 bg-background text-primary font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-inner"
                value={formData.hospitalId}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalId: e.target.value })
                }
              >
                {scopedHospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.accountType || "Prepaid"})
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

        {/* Low Wallet Alert Banner */}
        {isPrepaid && isWalletInsufficient && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-rose-900">
                  Wallet Recharge Mandated for {selectedHospital?.name}
                </p>
                <p className="text-xs font-medium text-rose-700 mt-0.5">
                  Available balance: ₹ {effectiveBalance}. Prepaid sites must have sufficient funds before registering new studies.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowRechargeModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 h-10 rounded-xl shadow-md shadow-rose-600/20"
            >
              <Wallet className="w-4 h-4 mr-1.5" />
              Recharge Wallet
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/studies")}
            className="font-bold text-slate-500 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-border rounded-xl px-6 transition-all"
          >
            Cancel
          </Button>
          {isPrepaid && isWalletInsufficient ? (
            <Button
              type="button"
              onClick={() => setShowRechargeModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-8 shadow-sm animate-pulse"
            >
              <Lock className="w-4 h-4 mr-2" />
              Recharge to Save Study
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white font-bold rounded-xl px-8 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              Save Study
            </Button>
          )}
        </div>
      </form>

      {/* QUICK RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Recharge Hospital Wallet
                  </h2>
                  <p className="text-xs text-white/80 font-bold uppercase tracking-widest mt-0.5">
                    {selectedHospital?.name} (Prepaid)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Current Base Wallet:</span>
                  <span className="font-black text-slate-700">₹ {Number(selectedHospital?.walletBalance) || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-rose-500">Unbilled Scans ({unbilledStudies.length}):</span>
                  <span className="font-black text-rose-600">- ₹ {totalUnbilledAmount}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-center text-sm">
                  <span className="font-black text-emerald-950">Available Balance:</span>
                  <span className={`font-black ${effectiveBalance <= 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    ₹ {effectiveBalance}
                  </span>
                </div>
              </div>

              {rechargeSuccess ? (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Wallet recharged successfully! Unlocking study creation...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Enter Recharge Amount (₹) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-bold">₹</span>
                      </div>
                      <Input
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="500"
                        className="pl-9 h-12 text-base font-black bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Add:</span>
                      {[100, 500, 1000, 2000].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setRechargeAmount(String((Number(rechargeAmount) || 0) + amt))}
                          className="text-xs font-black px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-slate-600 border border-slate-200 transition-all cursor-pointer"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["UPI", "NetBanking", "Card"].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setRechargeMethod(m)}
                          className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                            rechargeMethod === m
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end p-5 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRechargeModal(false)}
                className="h-11 px-5 rounded-xl font-bold border-slate-200 text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleQuickRecharge}
                disabled={!rechargeAmount || Number(rechargeAmount) <= 0 || rechargeSuccess}
                className="h-11 px-7 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Confirm & Add Funds
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
