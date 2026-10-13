import { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { X, Link2, Plus, Sparkles, Building2, AlertTriangle, Send, ShieldAlert, CheckCircle } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { createPortal } from "react-dom";
import { RequestSuperAdminModal } from "./RequestSuperAdminModal";
import standardStudiesCatalog from "../../data/standardStudiesCatalog.json";

const ADDITIONAL_INFO_OPTIONS = [
  "Emergency",
  "STAT",
  "Post Operative",
  "Follow Up",
  "Subspeciality",
  "Callback",
];

const STANDARD_MODALITIES = [
  "CT",
  "MRI",
  "X-RAY",
  "USG",
  "MAMMO",
  "PET-CT",
  "DEXA",
  "ECG",
  "OTHER",
];

export function AddHistoryModal({ isOpen, onClose, study, patient, hospital }) {
  const {
    updateStudy,
    addStudy,
    updatePatient,
    radiologists,
    studies,
    users,
    hospitals,
    sites,
    templates,
  } = useMockDb();
  const { currentRole, user } = useAuthStore();
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false);

  // Filter available hospitals strictly based on access permissions
  const availableHospitals = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return hospitals;
    if (user?.role === "SITE_ADMIN" || user?.siteId) {
      return hospitals.filter((h) => h.parentSiteId === user.siteId);
    }
    if (user?.role === "HOSPITAL_ADMIN" || user?.hospitalId) {
      return hospitals.filter((h) => h.id === user.hospitalId);
    }
    // Context-based fallback for radiologist or staff
    if (study?.hospitalId) {
      const studyHospital = hospitals.find((h) => h.id === study.hospitalId);
      if (studyHospital?.parentSiteId) {
        return hospitals.filter((h) => h.parentSiteId === studyHospital.parentSiteId);
      }
      return [studyHospital].filter(Boolean);
    }
    return hospitals;
  }, [hospitals, user, study]);

  const resolvedHospital =
    hospital ||
    availableHospitals.find((h) => h.id === study?.hospitalId) ||
    availableHospitals.find((h) => h.id === user?.hospitalId) ||
    availableHospitals[0];

  // Hospital Selection State
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    resolvedHospital?.id || study?.hospitalId || "",
  );

  const activeHospital =
    availableHospitals.find((h) => h.id === selectedHospitalId) ||
    hospitals.find((h) => h.id === selectedHospitalId) ||
    resolvedHospital;

  // Strict check if activeHospital is an independent hospital
  const isIndependentHospital = Boolean(
    activeHospital &&
      (!activeHospital.parentSiteId &&
        (activeHospital.organizationType === "UNNATHI_MANAGED" ||
          !activeHospital.organizationType ||
          activeHospital.organizationType !== "COMPANY_MANAGED"))
  );

  // Split radiologists for Independent Hospital: Internal vs Global Panel
  const { internalRadiologists, globalRadiologists } = useMemo(() => {
    if (!isIndependentHospital) {
      return { internalRadiologists: [], globalRadiologists: radiologists };
    }
    const internal = [];
    const globalPool = [];
    radiologists.forEach((r) => {
      const relatedUser = users.find((u) => u.id === r.userId);
      const isInternal =
        r.assignedHospitals?.includes(activeHospital?.id) ||
        relatedUser?.hospitalId === activeHospital?.id;
      if (isInternal) {
        internal.push(r);
      } else {
        // Global radiologist (not restricted to a company site)
        const isCompanyExclusive =
          r.siteId ||
          (r.assignedHospitals &&
            r.assignedHospitals.some(
              (hid) =>
                hospitals.find((h) => h.id === hid)?.organizationType ===
                "COMPANY_MANAGED"
            ));
        if (!isCompanyExclusive) {
          globalPool.push(r);
        }
      }
    });
    return { internalRadiologists: internal, globalRadiologists: globalPool };
  }, [radiologists, users, hospitals, activeHospital, isIndependentHospital]);

  // Patient Editable Fields
  const [patientName, setPatientName] = useState(patient?.name || "");
  const [patientGender, setPatientGender] = useState(patient?.gender || "Female");
  const [patientAge, setPatientAge] = useState(patient?.age || "");

  // Study Editable Fields
  const [modality, setModality] = useState(study?.modality || "CT");
  const [studyDescription, setStudyDescription] = useState(
    study?.studyDescription || "",
  );
  const [bodyPart, setBodyPart] = useState(study?.bodyPart || "");
  const [clinicalHistory, setClinicalHistory] = useState(
    study?.clinicalHistory || "",
  );
  const [refPhysician, setRefPhysician] = useState(
    study?.referringPhysician || patient?.referringDoctor || "",
  );
  const [selectedInfo, setSelectedInfo] = useState(study?.additionalInfo || []);
  const [selectedRadiologist, setSelectedRadiologist] = useState(
    study?.assignedRadiologistId || "",
  );
  const [attachments, setAttachments] = useState(() => {
    const existing = study?.attachments || [];
    if (existing.length === 0 && study?.historyAttachment) {
      return [{ name: "Legacy Attachment", url: study.historyAttachment }];
    }
    return existing;
  });

  // Adding New / Additional Scanning
  const [isAddingNewScan, setIsAddingNewScan] = useState(false);
  const [newScanModality, setNewScanModality] = useState("CT");
  const [newScanDescription, setNewScanDescription] = useState("");
  const [newScanBodyPart, setNewScanBodyPart] = useState("");

  // Existing Patient Scans
  const patientPreviousScans = studies.filter(
    (s) => s.patientId === (study?.patientId || patient?.id),
  );

  useEffect(() => {
    if (study && isOpen) {
      setSelectedHospitalId(resolvedHospital?.id || study?.hospitalId || "");
      setPatientName(patient?.name || "");
      setPatientGender(patient?.gender || "Female");
      setPatientAge(patient?.age ? String(patient.age) : "");
      setModality(study.modality || "CT");
      setStudyDescription(study.studyDescription || "");
      setBodyPart(study.bodyPart || "");
      setClinicalHistory(study.clinicalHistory || "");
      setRefPhysician(
        study.referringPhysician || patient?.referringDoctor || "",
      );
      setSelectedInfo(study.additionalInfo || []);
      setSelectedRadiologist(study.assignedRadiologistId || "");
      setAttachments(() => {
        const existing = study.attachments || [];
        if (existing.length === 0 && study.historyAttachment) {
          return [{ name: "Legacy Attachment", url: study.historyAttachment }];
        }
        return existing;
      });
      setIsAddingNewScan(false);
      setNewScanDescription("");
      setNewScanBodyPart("");
    }
  }, [study, isOpen, patient, resolvedHospital?.id]);

  if (!isOpen || !study) return null;

  const isFinalized = ["Final", "Verified", "Dispatched"].includes(
    study?.reportingStatus || "",
  );

  const toggleInfo = (info) => {
    if (selectedInfo.includes(info)) {
      setSelectedInfo(selectedInfo.filter((i) => i !== info));
    } else {
      setSelectedInfo([...selectedInfo, info]);
    }
  };

  const handleLinkFollowUp = () => {
    if (!patient || !study) return;
    const previousStudies = studies
      .filter((s) => s.patientId === patient.id && s.id !== study.id)
      .sort(
        (a, b) =>
          new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime(),
      );

    if (previousStudies.length > 0) {
      let linkedText = "";
      previousStudies.forEach((prev) => {
        if (prev.clinicalHistory)
          linkedText += `[Prev History - ${new Date(prev.studyDate).toLocaleDateString()}]: ${prev.clinicalHistory}\n`;
        if (prev.reportText)
          linkedText += `[Prev Report - ${new Date(prev.studyDate).toLocaleDateString()}]: ${prev.reportText}\n`;
      });
      if (linkedText) {
        setClinicalHistory((prev) =>
          prev ? `${prev}\n\n${linkedText.trim()}` : linkedText.trim(),
        );
      } else {
        alert(
          "Previous studies found, but they have no clinical history or reports.",
        );
      }
      if (!selectedInfo.includes("Follow Up")) {
        setSelectedInfo((prev) => [...prev, "Follow Up"]);
      }
    } else {
      alert("No previous scanning records found for this patient.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFinalized) return;

    // 1. Update Patient details if modified
    if (patient?.id) {
      const patientUpdates = {};
      if (patientName && patientName !== patient.name) {
        patientUpdates.name = patientName;
      }
      if (patientGender && patientGender !== patient.gender) {
        patientUpdates.gender = patientGender;
      }
      if (patientAge && parseInt(patientAge) !== patient.age) {
        patientUpdates.age = parseInt(patientAge) || patient.age;
      }
      if (Object.keys(patientUpdates).length > 0) {
        updatePatient(patient.id, patientUpdates);
      }
    }

    // 2. Update Primary Study Details
    const updates = {
      clinicalHistory,
      referringPhysician: refPhysician,
      additionalInfo: selectedInfo,
      historyAttachment:
        attachments.length > 0 ? attachments[0].url : undefined,
      attachments: attachments,
      status: study.status || "Unread",
      reportingStatus: study.reportingStatus || "Unread",
      modality: modality,
      studyDescription: studyDescription,
      bodyPart: bodyPart,
    };

    if (selectedHospitalId) {
      updates.hospitalId = selectedHospitalId;
    }

    if (currentRole !== "RADIOLOGIST" && selectedRadiologist !== undefined) {
      updates.assignedRadiologistId = selectedRadiologist;
    }

    updateStudy(study.id, updates);

    // 3. Create Additional/New Scanning if user filled it in
    if (isAddingNewScan && newScanDescription.trim()) {
      const newStudyRecord = {
        id: `st${Date.now()}`,
        patientId: study.patientId,
        caseNumber: `CAS-SCAN-${Date.now().toString().slice(-5)}`,
        accessionNumber: `ACC-${Date.now().toString().slice(-6)}`,
        hospitalId: selectedHospitalId || study.hospitalId,
        modality: newScanModality,
        studyDescription: newScanDescription.trim(),
        bodyPart: newScanBodyPart.trim() || newScanModality,
        priority: selectedInfo.includes("Emergency") ? "Emergency" : "Routine",
        studyDate: new Date().toISOString(),
        assignedRadiologistId: selectedRadiologist || "",
        status: "New",
        reportingStatus: "Pending",
        paymentStatus: "Unpaid",
        superAdminPaymentStatus: "Pending",
        tat: "24h",
        clinicalHistory: clinicalHistory,
        referringPhysician: refPhysician,
        additionalInfo: selectedInfo,
        attachments: attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addStudy(newStudyRecord);
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D2461] p-4 px-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="font-black text-lg tracking-wide flex items-center">
              Clinical History & Assignment
            </h2>
            <p className="text-[11px] text-slate-300 font-medium">
              Edit patient details, reassign hospital or radiologist, and add new scanning series
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinalized && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-center shrink-0">
            <p className="text-sm font-bold text-amber-800">
              This study is already finalized. Clinical history and assignments are read-only.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left/Middle Columns: Patient Details & Form */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Patient & Study Details
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Case: {study.caseNumber || "N/A"}
                </span>
              </div>

              {/* Row 1: Hospital Dropdown & Modality Dropdown */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Hospital <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    disabled={isFinalized}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg h-9 text-xs px-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                  >
                    <option value="">-- Select Hospital --</option>
                    {availableHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.city ? `(${h.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Modality
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    disabled={isFinalized}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg h-9 text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                  >
                    {STANDARD_MODALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Editable Patient Name, Gender, Age */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Patient Name
                  </label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient Name"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 font-bold border-slate-300 h-9 text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    disabled={isFinalized}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg h-9 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <Input
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Age (Y)"
                    type="number"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 font-bold border-slate-300 h-9 text-center text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Row 3: Study Description & Body Part */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Study Description <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={studyDescription}
                    onChange={(e) => setStudyDescription(e.target.value.toUpperCase())}
                    placeholder="e.g. MRI - BRAIN, CT - CHEST"
                    list="history-study-catalog"
                    disabled={isFinalized}
                    required
                    className="bg-white text-slate-800 font-bold border-slate-300 h-9 text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
                  />
                  <datalist id="history-study-catalog">
                    {/* Hospital custom templates */}
                    {templates
                      ?.filter(
                        (t) =>
                          t.hospitalId === (selectedHospitalId || study?.hospitalId) &&
                          t.modality?.toUpperCase() === modality?.toUpperCase() &&
                          t.isActive,
                      )
                      .map((t) => (
                        <option key={t.id} value={t.studyName}>
                          {t.studyName} {t.price ? `(₹${t.price})` : ""}
                        </option>
                      ))}
                    {/* Standard Catalog */}
                    {standardStudiesCatalog
                      .filter(
                        (c) => c.modality.toUpperCase() === modality?.toUpperCase(),
                      )
                      .map((c, idx) => (
                        <option key={`cat_${idx}`} value={c.studyName} />
                      ))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Body Part
                  </label>
                  <Input
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    placeholder="e.g. Spine, Abdomen, Brain"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 font-bold border-slate-300 h-9 text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Row 4: Clinical History & Referring Physician */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Clinical History <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Enter clinical complaints, symptoms, previous history *"
                    value={clinicalHistory}
                    onChange={(e) => setClinicalHistory(e.target.value)}
                    disabled={isFinalized}
                    className="resize-none h-20 border-slate-300 focus-visible:ring-[#00A8CC] focus-visible:border-[#00A8CC] text-xs font-medium disabled:bg-slate-50 disabled:text-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Referring Physician (Optional)
                  </label>
                  <Input
                    placeholder="Dr. Name / Department"
                    value={refPhysician}
                    onChange={(e) => setRefPhysician(e.target.value)}
                    disabled={isFinalized}
                    className="border-slate-300 focus-visible:ring-[#00A8CC] focus-visible:border-[#00A8CC] h-9 text-xs font-semibold disabled:bg-slate-50 disabled:text-slate-500 mb-2"
                  />

                  {/* Section to select existing scans or toggle adding new scanning */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-600" />
                        Scans For Patient ({patientPreviousScans.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewScan(!isAddingNewScan)}
                        className="text-[10px] font-black text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        {isAddingNewScan ? "Cancel" : "Add Scan"}
                      </button>
                    </div>

                    {patientPreviousScans.length > 0 && !isAddingNewScan && (
                      <select
                        onChange={(e) => {
                          const chosen = patientPreviousScans.find(
                            (s) => s.id === e.target.value,
                          );
                          if (chosen) {
                            setModality(chosen.modality || "CT");
                            setStudyDescription(chosen.studyDescription || "");
                            setBodyPart(chosen.bodyPart || "");
                          }
                        }}
                        defaultValue=""
                        className="w-full text-[11px] font-semibold border border-slate-300 rounded bg-white px-2 py-1 text-slate-700 outline-none"
                      >
                        <option value="" disabled>
                          -- Select Scan To Load / Edit --
                        </option>
                        {patientPreviousScans.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.modality} - {s.studyDescription || s.bodyPart} ({s.caseNumber})
                          </option>
                        ))}
                      </select>
                    )}

                    {isAddingNewScan && (
                      <div className="space-y-1.5 mt-1.5 pt-1.5 border-t border-slate-200">
                        <div className="grid grid-cols-3 gap-1.5">
                          <select
                            value={newScanModality}
                            onChange={(e) => setNewScanModality(e.target.value)}
                            className="text-[11px] font-bold border border-slate-300 rounded px-1.5 py-1 bg-white"
                          >
                            {STANDARD_MODALITIES.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="New Study Name *"
                            value={newScanDescription}
                            list="new-scan-catalog"
                            onChange={(e) => setNewScanDescription(e.target.value.toUpperCase())}
                            className="col-span-2 text-[11px] font-bold border border-slate-300 rounded px-2 py-1 bg-white uppercase"
                          />
                          <datalist id="new-scan-catalog">
                            {standardStudiesCatalog
                              .filter(
                                (c) => c.modality.toUpperCase() === newScanModality?.toUpperCase(),
                              )
                              .map((c, idx) => (
                                <option key={`new_cat_${idx}`} value={c.studyName} />
                              ))}
                          </datalist>
                        </div>
                        <input
                          type="text"
                          placeholder="Body Part (optional)"
                          value={newScanBodyPart}
                          onChange={(e) => setNewScanBodyPart(e.target.value)}
                          className="w-full text-[11px] font-medium border border-slate-300 rounded px-2 py-1 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Additional Info, Follow-up, Records & Radiologist */}
            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 space-y-4">
              <div className="text-center text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                Additional Info
              </div>

              <div className="space-y-2">
                {ADDITIONAL_INFO_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      checked={selectedInfo.includes(option)}
                      disabled={isFinalized}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedInfo([...selectedInfo, option]);
                        else
                          setSelectedInfo(
                            selectedInfo.filter((a) => a !== option),
                          );
                      }}
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {option}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="button"
                  onClick={handleLinkFollowUp}
                  disabled={isFinalized}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center justify-center gap-2 h-9 text-xs font-bold disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Link2 className="w-4 h-4" /> Link Follow Up
                </Button>

                <div
                  className={`border-2 border-dashed border-slate-200 rounded-lg p-3 text-center transition-colors flex flex-col items-center justify-center gap-2 ${isFinalized ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"}`}
                  onClick={() => {
                    if (isFinalized) return;
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "image/*,.pdf";
                    input.onchange = (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const newAttachments = Array.from(files).map(
                          (file) => ({
                            name: file.name,
                            url: URL.createObjectURL(file),
                          }),
                        );
                        setAttachments((prev) => [...prev, ...newAttachments]);
                      }
                    };
                    input.click();
                  }}
                >
                  <div className="text-xs font-medium text-slate-500">
                    Click to attach clinical records
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded p-1.5 text-xs"
                      >
                        <span
                          className="truncate max-w-[150px] font-bold text-emerald-700"
                          title={att.name}
                        >
                          {att.name}
                        </span>
                        {!isFinalized && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-200/50 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Radiologist Dropdown */}
              {currentRole !== "RADIOLOGIST" && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Assign Radiologist
                    </div>
                    {isIndependentHospital && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Independent Hospital
                      </span>
                    )}
                  </div>

                  <select
                    className="w-full h-9 px-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                    value={selectedRadiologist}
                    disabled={isFinalized}
                    onChange={(e) => setSelectedRadiologist(e.target.value)}
                  >
                    <option value="">-- Select Radiologist --</option>
                    {isIndependentHospital ? (
                      <>
                        <optgroup label="Internal Hospital Radiologists">
                          {internalRadiologists.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.specialization ? `(${r.specialization})` : ""}
                            </option>
                          ))}
                          {internalRadiologists.length === 0 && (
                            <option disabled value="none-internal">
                              (No internal radiologist configured)
                            </option>
                          )}
                        </optgroup>
                        <optgroup label="🌐 Global Radiologists Pool (Emergency / Leave Access)">
                          {globalRadiologists.map((r) => (
                            <option key={r.id} value={r.id}>
                              ★ {r.name} {r.specialization ? `(${r.specialization})` : ""} [Global Panel]
                            </option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      radiologists.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.specialization ? `(${r.specialization})` : ""}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Independent Hospital Radiologist Unavailable / On Leave Escalation */}
                  {isIndependentHospital && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-black text-amber-900 leading-tight">
                              Radiologist On Leave or Urgent Same-Day Dispatch?
                            </div>
                            <div className="text-[11px] text-amber-700 font-medium mt-0.5 leading-snug">
                              Need Super Admin to route this case to a Teleradiology company or assign directly to a Global radiologist?
                            </div>
                          </div>
                        </div>
                      </div>

                      {study?.assignmentRequest?.status === "Pending" ? (
                        <div className="mt-2.5 p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            <span>Escalation Request Sent to Super Admin</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {study?.assignmentRequest?.routePreference === "TELERADIOLOGY_COMPANY"
                              ? "Route: Teleradiology"
                              : "Route: Global Rad"}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSuperAdminModalOpen(true)}
                          className="mt-2.5 w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Request to Super Admin (On Leave / Urgent)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-10 cursor-pointer"
            >
              {isFinalized ? "Close" : "Cancel"}
            </Button>
            {!isFinalized && (
              <Button
                type="submit"
                className="bg-[#0D2461] hover:bg-[#081840] text-white px-7 rounded-xl shadow-md font-bold h-10 cursor-pointer active:scale-95 transition-all"
              >
                Save & Update
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Independent Hospital Super Admin Escalation Modal */}
      {superAdminModalOpen && (
        <RequestSuperAdminModal
          isOpen={superAdminModalOpen}
          onClose={() => setSuperAdminModalOpen(false)}
          study={study}
          patient={patient}
          hospital={activeHospital}
          sites={sites}
          onSubmit={(payload) => {
            updateStudy(study.id, payload);
          }}
        />
      )}
    </div>,
    document.body,
  );
}
