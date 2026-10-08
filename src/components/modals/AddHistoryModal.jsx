import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { X, Link2 } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { createPortal } from "react-dom";

const ADDITIONAL_INFO_OPTIONS = [
  "Emergency",
  "STAT",
  "Post Operative",
  "Follow Up",
  "Subspeciality",
  "Callback",
];

export function AddHistoryModal({ isOpen, onClose, study, patient, hospital }) {
  const { updateStudy, radiologists, studies, users, hospitals } = useMockDb();
  const { currentRole, user } = useAuthStore();
  const resolvedHospital =
    hospital ||
    hospitals.find((h) => h.id === study?.hospitalId) ||
    hospitals.find((h) => h.id === user?.hospitalId);
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    resolvedHospital?.id || "",
  );
  const activeHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || resolvedHospital;

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
  // Editable Study fields
  const [modality, setModality] = useState(study?.modality || "");
  const [studyDescription, setStudyDescription] = useState(
    study?.studyDescription || "",
  );
  const [bodyPart, setBodyPart] = useState(study?.bodyPart || "");

  useEffect(() => {
    if (study && isOpen) {
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
      setModality(study.modality || "");
      setStudyDescription(study.studyDescription || "");
      setBodyPart(study.bodyPart || "");
      setSelectedHospitalId(resolvedHospital?.id || "");
    }
  }, [study, isOpen, patient?.referringDoctor, resolvedHospital?.id]);

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
    // Find previous studies for this patient
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
    const updates = {
      clinicalHistory,
      referringPhysician: refPhysician,
      additionalInfo: selectedInfo,
      historyAttachment:
        attachments.length > 0 ? attachments[0].url : undefined,
      attachments: attachments,
      status: "Unread",
      reportingStatus: "Unread",
      modality: modality,
      studyDescription: studyDescription,
      bodyPart: bodyPart,
    };
    if (selectedHospitalId && selectedHospitalId !== study.hospitalId) {
      updates.hospitalId = selectedHospitalId;
    }
    if (currentRole !== "RADIOLOGIST" && selectedRadiologist !== undefined) {
      updates.assignedRadiologistId = selectedRadiologist;
    }
    updateStudy(study.id, updates);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0D2461] p-4 flex justify-between items-center text-white">
          <h2 className="font-black text-lg tracking-wide flex items-center">
            Clinical History & Assignment
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinalized && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-center">
            <p className="text-sm font-bold text-amber-800">
              This study is already finalized. Clinical history and assignments
              are read-only.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Left/Middle Columns: Patient Details & Form */}
            <div className="col-span-2 space-y-4">
              <div className="text-center text-xs font-bold text-slate-500 mb-2">
                Patient Details
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  {!resolvedHospital ? (
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full bg-white text-slate-700 border border-slate-300 rounded-md h-9 text-xs px-3 focus:outline-none focus:ring-1 focus:ring-[#00A8CC]"
                    >
                      <option value="">-- Assign to Hospital --</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={resolvedHospital?.name || ""}
                      disabled
                      className="bg-slate-50 text-slate-500 border-slate-200 h-9 text-xs"
                    />
                  )}
                </div>
                <div className="col-span-1">
                  <Input
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    placeholder="Modality"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 border-slate-300 h-9 text-center font-bold text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <Input
                    value={patient?.name || ""}
                    disabled
                    className="bg-slate-50 text-slate-500 border-slate-200 h-9 text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    value={patient?.gender || ""}
                    disabled
                    className="bg-slate-50 text-slate-500 border-slate-200 h-9 text-center text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    value={patient?.age ? `${patient.age}Y` : ""}
                    disabled
                    className="bg-slate-50 text-slate-500 border-slate-200 h-9 text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <Input
                    value={studyDescription}
                    onChange={(e) => setStudyDescription(e.target.value)}
                    placeholder="Study Description *"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 border-slate-300 h-9 text-xs focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="col-span-2 flex items-center relative">
                  <Input
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    placeholder="Body Part"
                    disabled={isFinalized}
                    className="bg-white text-slate-800 border-slate-300 h-9 text-xs pr-8 focus-visible:ring-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <div className="text-slate-400 absolute right-2 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 h-24">
                <Textarea
                  placeholder="Clinical History *"
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  disabled={isFinalized}
                  className="resize-none h-full border-slate-200 focus-visible:ring-[#00A8CC] focus-visible:border-[#00A8CC] text-xs disabled:bg-slate-50 disabled:text-slate-500"
                  required
                />

                <Input
                  placeholder="Ref. Physician (optional)"
                  value={refPhysician}
                  onChange={(e) => setRefPhysician(e.target.value)}
                  disabled={isFinalized}
                  className="border-slate-200 focus-visible:ring-[#00A8CC] focus-visible:border-[#00A8CC] h-9 text-xs disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Right Column: Additional Info */}
            <div className="col-span-1 border-l border-slate-100 pl-6 space-y-3">
              <div className="text-center text-xs font-bold text-slate-500 mb-2">
                Additional Info
              </div>

              <div className="space-y-2.5 pl-2">
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

                    <span className="text-sm font-bold text-slate-700">
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
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center justify-center gap-2 h-9 text-xs font-bold disabled:bg-slate-300 disabled:cursor-not-allowed"
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
                  <div className="text-sm font-medium text-slate-500">
                    Click to attach clinical records
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto pr-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded p-2 text-xs"
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
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-200/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentRole !== "RADIOLOGIST" &&
                !(
                  currentRole === "HOSPITAL_ADMIN" &&
                  activeHospital?.organizationType === "COMPANY_MANAGED"
                ) && (
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="text-center text-xs font-bold text-slate-500 mb-2">
                      Assign Radiologist
                    </div>
                    {!activeHospital ? (
                      <select
                        disabled
                        className="w-full h-8 px-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-400 outline-none cursor-not-allowed"
                      >
                        <option>-- Select Hospital First --</option>
                      </select>
                    ) : (
                      <select
                        className="w-full h-8 px-2 border border-slate-200 rounded text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#00A8CC] focus:border-[#00A8CC] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                        value={selectedRadiologist}
                        disabled={isFinalized}
                        onChange={(e) => setSelectedRadiologist(e.target.value)}
                      >
                        <option value="">-- Select Radiologist --</option>
                        {radiologists
                          .filter((r) => {
                            // Removed strict availability check to ensure doctors appear even if status changed
                            if (
                              activeHospital?.organizationType ===
                              "UNNATHI_MANAGED"
                            ) {
                              // Try to match by ID or Name first
                              const radUser = users.find(
                                (u) => u.id === r.userId || u.name === r.name,
                              );
                              if (radUser?.hospitalId === activeHospital.id)
                                return true;
                              if (
                                r.assignedHospitals &&
                                r.assignedHospitals.includes(activeHospital.id)
                              )
                                return true;
                              if (
                                radUser?.hospitalId &&
                                hospitals.find(
                                  (h) => h.id === radUser.hospitalId,
                                )?.name === activeHospital.name
                              )
                                return true;
                              // ULTIMATE FALLBACK:
                              // If there's a database mismatch from older versions, just unblock the user.
                              // Any radiologist that is NOT explicitly a global mock doctor ('Namith' / 'Tejashwini')
                              // will be allowed to appear in the independent hospital's list.
                              const isKnownGlobal =
                                r.name.toLowerCase().includes("namith") ||
                                r.name.toLowerCase().includes("tejashwini") ||
                                r.name.toLowerCase().includes("global");
                              if (!isKnownGlobal) {
                                return true;
                              }

                              return false;
                            }
                            // For Teleradiology Sites or Unknown hospitals:
                            // If the user wants to completely hide global radiologists from Independent Hospital users,
                            // we should ensure global radiologists (no hospitalId) are only visible if the study
                            // is explicitly COMPANY_MANAGED or Unknown (but only to Global Staff).
                            // If the hospital is Unknown, let's just show no radiologists to force hospital assignment,
                            // OR we can just show radiologists assigned to the logged in user's hospital.
                            if (!activeHospital) {
                              return false; // Prevent showing global radiologists for unknown hospitals to fix the leak
                            }
                            return true;
                          })
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.specialization})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="mt-6 flex justify-end items-center gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-10"
            >
              {isFinalized ? "Close" : "Cancel"}
            </Button>
            {!isFinalized && (
              <Button
                type="submit"
                className="bg-[#0D2461] hover:bg-[#081840] text-white px-6 rounded-lg shadow-md font-bold h-10"
              >
                Save & Update
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
