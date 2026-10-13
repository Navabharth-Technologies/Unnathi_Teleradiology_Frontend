import React, { useState, useMemo } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { format, parse, isValid } from "date-fns";
import * as dicomParser from "dicom-parser";
import JSZip from "jszip";
import {
  Search,
  RefreshCw,
  FileText,
  Download,
  Info,
  CheckCircle2,
  Activity,
  FileIcon,
  Copy,
  Upload,
  Pencil,
  Share2,
  Eye,
  PlusCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { AddHistoryModal } from "../../components/modals/AddHistoryModal";
import { MoreInfoModal } from "../../components/modals/MoreInfoModal";
import { EditPatientModal } from "../../components/modals/EditPatientModal";
import { ShareModal } from "../../components/modals/ShareModal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdvancedReporting() {
  const navigate = useNavigate();
  const { user, selectedHospitalId } = useAuthStore();
  const {
    studies,
    patients,
    hospitals,
    radiologists,
    users,
    sites,
    updateStudy,
    addStudy,
    addPatient,
  } = useMockDb();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSeries, setExpandedSeries] = useState({});
  // Filter States
  const [dateFilter, setDateFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");
  const [studyNameFilter, setStudyNameFilter] = useState("");
  const [radiologistFilter, setRadiologistFilter] = useState("");
  const [emergencyFilter, setEmergencyFilter] = useState(false);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Modals
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudyForHistory, setSelectedStudyForHistory] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedStudyForInfo, setSelectedStudyForInfo] = useState(null);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedStudyForShare, setSelectedStudyForShare] = useState(null);
  const fileInputRef = React.useRef(null);

  // Derive access list
  const accessibleStudies = useMemo(() => {
    return studies.filter((s) => {
      // Super Admin sees all studies (including independent hospitals)
      if (user?.role === "SUPER_ADMIN") {
        return true;
      }
      // Site Admin sees all studies from hospitals that belong to their site
      if (user?.role === "SITE_ADMIN") {
        const hospital = hospitals.find((h) => h.id === s.hospitalId);
        return hospital?.parentSiteId === user.siteId;
      }
      // Radiologist sees only assigned.
      if (user?.role === "RADIOLOGIST") {
        const radProfile = radiologists.find(
          (r) => r.userId === user.id || r.name === user.name,
        );
        return s.assignedRadiologistId === radProfile?.id;
      }
      // Hospital Admin/Staff sees only their hospital.
      return selectedHospitalId ? s.hospitalId === selectedHospitalId : false;
    });
  }, [studies, user, radiologists, hospitals, selectedHospitalId]);

  // Filtering
  const filteredStudies = useMemo(() => {
    return accessibleStudies.filter((s) => {
      // 1. Date Filter: Today, Yesterday, Month, All
      if (dateFilter !== "All") {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + 86400000;
        const startOfYesterday = startOfToday - 86400000;
        const endOfYesterday = startOfToday;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const datesToCheck = [];
        if (s.studyDate) {
          const t = new Date(s.studyDate).getTime();
          if (!isNaN(t)) datesToCheck.push(t);
        }
        if (s.createdAt) {
          const t = new Date(s.createdAt).getTime();
          if (!isNaN(t)) datesToCheck.push(t);
        }
        if (s.registrationDate) {
          const t = new Date(s.registrationDate).getTime();
          if (!isNaN(t)) datesToCheck.push(t);
        }

        if (datesToCheck.length === 0) return false;

        if (dateFilter === "Today") {
          const isTodayMatch = datesToCheck.some((t) => t >= startOfToday && t < endOfToday);
          if (!isTodayMatch) return false;
        } else if (dateFilter === "Yesterday") {
          const isYesterdayMatch = datesToCheck.some((t) => t >= startOfYesterday && t < endOfYesterday);
          if (!isYesterdayMatch) return false;
        } else if (dateFilter === "Month") {
          const thirtyDaysAgo = now.getTime() - 30 * 86400000;
          const isMonthMatch = datesToCheck.some(
            (t) => (t >= startOfMonth && t <= now.getTime()) || (t >= thirtyDaysAgo && t <= now.getTime())
          );
          if (!isMonthMatch) return false;
        }
      }

      // 2. Emergency Filter
      if (emergencyFilter && s.priority !== "Emergency") return false;

      // 3. Assignment Filter
      if (assignmentFilter === "assigned" && !s.assignedRadiologistId) return false;
      if (assignmentFilter === "unassigned" && s.assignedRadiologistId) return false;
      if (assignmentFilter === "urgent" && s.priority !== "Emergency" && s.priority !== "Urgent") return false;

      // 4. Status Filter
      if (statusFilter !== "All") {
        if (statusFilter === "Active") {
          const isFinishedOrCancelled =
            ["Final", "Verified", "Dispatched", "Cancelled"].includes(s.reportingStatus) ||
            ["Final", "Completed", "Cancelled"].includes(s.status);
          if (isFinishedOrCancelled) return false;
        } else if (statusFilter === "New") {
          const isNew =
            s.status === "New" ||
            s.reportingStatus === "New" ||
            s.reportingStatus === "Unassigned" ||
            (!s.assignedRadiologistId && !["Final", "Verified", "Dispatched"].includes(s.reportingStatus));
          if (!isNew) return false;
        } else if (statusFilter === "Unread") {
          const isUnread =
            s.status === "Unread" ||
            s.reportingStatus === "Unread" ||
            (!s.assignedRadiologistId && !["Final", "Verified", "Dispatched"].includes(s.reportingStatus));
          if (!isUnread) return false;
        } else if (statusFilter === "Pending") {
          const isPending =
            s.status === "Pending" ||
            s.reportingStatus === "Pending" ||
            s.reportingStatus === "Assigned" ||
            s.status === "In Progress";
          if (!isPending) return false;
        } else if (statusFilter === "Action Needed") {
          const isActionNeeded =
            s.priority === "Emergency" ||
            s.reportingStatus === "Action Needed" ||
            s.reportingStatus === "Rejected" ||
            s.tatBreached === true ||
            s.status === "Action Needed";
          if (!isActionNeeded) return false;
        } else if (statusFilter === "Draft") {
          const isDraft = s.status === "Draft" || s.reportingStatus === "Draft";
          if (!isDraft) return false;
        } else if (statusFilter === "Final") {
          const isFinal =
            s.status === "Final" ||
            s.status === "Completed" ||
            ["Final", "Verified", "Dispatched"].includes(s.reportingStatus);
          if (!isFinal) return false;
        } else if (statusFilter === "Review") {
          const isReview =
            s.status === "Review" ||
            s.reportingStatus === "Review" ||
            s.reportingStatus === "Under Review";
          if (!isReview) return false;
        } else if (statusFilter === "Cancel") {
          const isCancelled =
            s.status === "Cancelled" ||
            s.status === "Cancel" ||
            s.reportingStatus === "Cancelled";
          if (!isCancelled) return false;
        }
      }

      // 5. Dropdown Filters
      if (siteFilter && s.hospitalId !== siteFilter) return false;
      if (modalityFilter && s.modality !== modalityFilter) return false;
      if (studyNameFilter && s.bodyPart !== studyNameFilter) return false;
      if (radiologistFilter && s.assignedRadiologistId !== radiologistFilter)
        return false;

      // 6. Search Term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const p = patients.find((pat) => pat.id === s.patientId);
        const matchesSearch =
          s.caseNumber?.toLowerCase().includes(q) ||
          s.accessionNumber?.toLowerCase().includes(q) ||
          (p && p.name?.toLowerCase().includes(q)) ||
          (p && p.uhid?.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [
    accessibleStudies,
    searchTerm,
    dateFilter,
    statusFilter,
    assignmentFilter,
    emergencyFilter,
    siteFilter,
    modalityFilter,
    studyNameFilter,
    radiologistFilter,
    patients,
  ]);

  // Derived options for dropdowns
  const availableSites = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return hospitals;
    if (user?.role === "SITE_ADMIN")
      return hospitals.filter((h) => h.parentSiteId === user.siteId);
    if (selectedHospitalId)
      return hospitals.filter((h) => h.id === selectedHospitalId);
    return hospitals.filter((h) =>
      accessibleStudies.some((s) => s.hospitalId === h.id),
    );
  }, [hospitals, user, selectedHospitalId, accessibleStudies]);
  const availableModalities = useMemo(
    () => Array.from(new Set(accessibleStudies.map((s) => s.modality))),
    [accessibleStudies],
  );
  const availableStudyNames = useMemo(
    () => Array.from(new Set(accessibleStudies.map((s) => s.bodyPart))),
    [accessibleStudies],
  );
  const availableRadiologists = useMemo(() => {
    return radiologists.filter((r) => {
      const relatedUser = users.find((u) => u.id === r.userId);
      const isIndependentRad =
        (r.assignedHospitals &&
          r.assignedHospitals.some(
            (hid) =>
              hospitals.find((h) => h.id === hid)?.organizationType ===
              "COMPANY_MANAGED",
          )) ||
        (relatedUser?.hospitalId &&
          hospitals.find((h) => h.id === relatedUser.hospitalId)
            ?.organizationType === "COMPANY_MANAGED");

      const effectiveHospitalId = user?.hospitalId || selectedHospitalId;

      if (effectiveHospitalId) {
        const hospital = hospitals.find((h) => h.id === effectiveHospitalId);
        // If the context is an independent hospital (COMPANY_MANAGED), they should only see their own radiologists
        if (hospital?.organizationType === "COMPANY_MANAGED") {
          return r.assignedHospitals?.includes(effectiveHospitalId) || relatedUser?.hospitalId === effectiveHospitalId;
        }
      }

      // If current user is Global (Site Admin / Super Admin) and no independent hospital is selected, they ONLY see Global radiologists
      if (user?.role === "SUPER_ADMIN" || user?.role === "SITE_ADMIN") {
        return !isIndependentRad;
      }
      return true;
    });
  }, [radiologists, user, users, hospitals]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSiteFilter("");
    setModalityFilter("");
    setStudyNameFilter("");
    setRadiologistFilter("");
    setStatusFilter("All");
    setDateFilter("All");
    setEmergencyFilter(false);
    setAssignmentFilter("all");
    showToast("All filters reset successfully.");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let patientName = "Unknown Patient";
      let patientUHID = `PAT-${Date.now().toString().slice(-6)}`;
      let age = 45;
      let gender = "Female";
      let modality = "CT";
      let studyDesc = file.name.replace(/\.[^/.]+$/, "") || "CT Scan";
      let bodyPart = "BODY";
      let accessionNo = `ACC-${Date.now().toString().slice(-6)}`;
      let studyDate = new Date().toISOString();

      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        let dicomEntry = null;

        for (const relativePath in zipContent.files) {
          const entry = zipContent.files[relativePath];
          if (
            !entry.dir &&
            (relativePath.toLowerCase().endsWith(".dcm") ||
              !relativePath.includes("."))
          ) {
            dicomEntry = entry;
            break;
          }
        }

        if (dicomEntry) {
          const buffer = await dicomEntry.async("arraybuffer");
          const byteArray = new Uint8Array(buffer);
          const parser = dicomParser.default ?? dicomParser;
          const ds = parser.parseDicom(byteArray, { untilTag: "00200013" });

          const getTagStr = (tag) => {
            try {
              return ds.string(tag) || "";
            } catch {
              return "";
            }
          };

          const rawName = getTagStr("x00100010");
          if (rawName) {
            const parts = rawName.split("^").map((s) => s.trim()).filter(Boolean);
            patientName = parts.length >= 2 ? `${parts[1]} ${parts[0]}` : parts[0] || rawName;
          }

          const rawId = getTagStr("x00100020");
          if (rawId) patientUHID = rawId;

          const rawMod = getTagStr("x00080060");
          if (rawMod) modality = rawMod;

          const rawDesc = getTagStr("x00081030");
          if (rawDesc) studyDesc = rawDesc;

          const rawBody = getTagStr("x00180015");
          if (rawBody) bodyPart = rawBody;

          const rawAcc = getTagStr("x00080050");
          if (rawAcc) accessionNo = rawAcc;

          const rawSex = getTagStr("x00100040")?.toUpperCase().trim();
          if (rawSex === "M") gender = "Male";
          else if (rawSex === "F") gender = "Female";

          const rawAge = getTagStr("x00101010");
          if (rawAge) {
            const parsedAge = parseInt(rawAge);
            if (!isNaN(parsedAge)) age = parsedAge;
          }
        } else {
          // If zip has images/files without .dcm, name patient from zip filename
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
          if (cleanName) {
            patientName = cleanName.toUpperCase();
          }
        }
      } catch (zipErr) {
        console.warn("ZIP/DICOM deep parse fallback to file metadata:", zipErr);
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
        if (cleanName) {
          patientName = cleanName.toUpperCase();
        }
      }

      // Determine target hospital context
      const targetHospitalId =
        selectedHospitalId ||
        user?.hospitalId ||
        availableSites?.[0]?.id ||
        hospitals?.[0]?.id ||
        "";

      // Check existing patient or create new
      let existingPat = patients.find((p) => p.uhid === patientUHID);
      let patId = existingPat?.id;

      if (!patId) {
        const newPatient = {
          id: `p${Date.now()}`,
          uhid: patientUHID,
          name: patientName,
          age: age || 40,
          gender: gender || "Female",
          hospitalId: targetHospitalId,
          registrationDate: new Date().toISOString(),
        };
        await addPatient(newPatient);
        patId = newPatient.id;
        existingPat = newPatient;
      }

      // Create new Study
      const caseNumber = `CAS-ZIP-${Date.now().toString().slice(-5)}`;
      const newStudy = {
        id: `st${Date.now()}`,
        patientId: patId,
        caseNumber,
        accessionNumber: accessionNo,
        hospitalId: targetHospitalId,
        modality,
        studyDescription: studyDesc,
        bodyPart: bodyPart || modality,
        priority: "Routine",
        studyDate: new Date().toISOString(),
        assignedRadiologistId: "",
        status: "New",
        reportingStatus: "Pending",
        paymentStatus: "Unpaid",
        superAdminPaymentStatus: "Pending",
        tat: "24h",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addStudy(newStudy);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);

      // Auto-open Clinical History & Assignment modal for this uploaded study
      setSelectedStudyForHistory(newStudy);
      setHistoryModalOpen(true);
      showToast(`Study ${caseNumber} created! Opening Clinical History & Assignment...`);
    } catch (err) {
      console.error("Failed to process Zip file:", err);
      setIsUploading(false);
      showToast("Error processing Zip file. Please try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleCopyLink = (studyId) => {
    navigator.clipboard.writeText(
      window.location.origin + `/viewer/${studyId}`,
    );
    showToast("Link copied to clipboard!");
  };

  const generateAndDownloadReport = (format, study) => {
    showToast(`Generating ${format.toUpperCase()} report...`);
    // Determine the correct branding logo for this study
    const hospital = hospitals.find((h) => h.id === study.hospitalId);
    let currentLogo = null;
    if (hospital?.branding?.logo) {
      currentLogo = hospital.branding.logo;
    } else if (hospital?.parentSiteId) {
      const parentSite = sites.find((s) => s.id === hospital.parentSiteId);
      if (parentSite?.branding?.logo) currentLogo = parentSite.branding.logo;
    }
    setTimeout(async () => {
      const reportTitle = `Radiology Report - ${study.caseNumber}`;
      const patientInfo = `Patient Name: ${patients.find((p) => p.id === study.patientId)?.name || "N/A"}
Modality: ${study.modality}
Status: ${study.reportingStatus}
Date: ${new Date(study.createdAt).toLocaleString()}`;
      const reportBody = `FINDINGS:\nNo significant abnormalities detected in this mock report.\n\nIMPRESSION:\nNormal study.`;

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        // Add logo if available
        if (currentLogo && currentLogo.startsWith("data:image")) {
          try {
            // Calculate dimensions to maintain aspect ratio, assuming max height of 20
            doc.addImage(currentLogo, "PNG", 150, 10, 40, 20, "", "FAST");
          } catch (e) {
            console.error("Failed to add logo to PDF", e);
          }
        }
        doc.setFontSize(20);
        doc.text(reportTitle, 20, 20);
        doc.setFontSize(12);
        const splitPatientInfo = doc.splitTextToSize(patientInfo, 170);
        doc.text(splitPatientInfo, 20, 40);
        const splitBody = doc.splitTextToSize(reportBody, 170);
        doc.text(splitBody, 20, 80);
        doc.save(`Report_${study.caseNumber}.pdf`);
      } else {
        // Create an HTML doc that MS Word can read
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><title>${reportTitle}</title></head>
          <body>
            ${currentLogo ? `<div style="text-align: right; margin-bottom: 20px;"><img src="${currentLogo}" style="max-height: 60px;" /></div>` : ""}
            <h2>${reportTitle}</h2>
            <pre>${patientInfo}</pre>
            <br/><br/>
            <pre>${reportBody}</pre>
          </body>
          </html>
        `;
        const blob = new Blob(["\ufeff", htmlContent], {
          type: "application/msword",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Report_${study.caseNumber}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 800);
  };

  const toggleSelectStudy = (id) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleAssignRadiologist = (studyId, radId) => {
    updateStudy(studyId, {
      assignedRadiologistId: radId,
      reportingStatus: "Pending",
      assignedAt: new Date().toISOString(),
    });
  };

  const toggleSeries = (id) => {
    setExpandedSeries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Unread":
        return "bg-gray-500 text-white";
      case "Pending":
        return "bg-[#F26B50] text-white";
      case "Final":
        return "bg-[#009688] text-white";
      case "Verified":
      case "Dispatched":
        return "bg-[#4CAF50] text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  const handleAction = (action, study) => {
    if (action === "History") {
      setSelectedStudyForHistory(study);
      setHistoryModalOpen(true);
    } else if (action === "Info") {
      setSelectedStudyForInfo(study);
      setInfoModalOpen(true);
    } else {
      alert(`Triggered: ${action}`);
    }
  };

  const handleDownload = (format, studyId) => {
    alert(`Downloading ${format.toUpperCase()} for study ${studyId}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] font-sans animate-unnathi-fade-in relative overflow-hidden">
      {/* Colorful Light Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1FC8D0]/10 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[150px]"
          animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <motion.div
          className="absolute top-[40%] left-[60%] w-full md:w-[300px] h-[300px] bg-[#8B5CF6]/10 rounded-full blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating small particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-[#1FC8D0] to-[#2563EB]"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              y: [0, -40 - Math.random() * 60],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, Math.random() * 0.6 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full p-4 md:p-6 space-y-4 w-full max-w-full min-w-0">
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-5 border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-[#1FC8D0]" />
            <span className="text-sm font-bold font-['Plus_Jakarta_Sans']">
              {toastMessage}
            </span>
          </div>
        )}

        {/* Top Header / Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col space-y-4 w-full max-w-full min-w-0">
          {/* Date & Status Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-full min-w-0">
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-hide min-w-0 w-full md:w-auto">
              {["Today", "Yesterday", "Month", "All"].map((date) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={date}
                  onClick={() => setDateFilter(date)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${dateFilter === date ? "bg-gradient-to-r from-[#1FC8D0] to-[#2563EB] shadow-[0_4px_12px_rgba(31,200,208,0.3)] text-white border border-transparent" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {date}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-hide w-full md:w-auto min-w-0 max-w-full">
              {[
                {
                  id: "All",
                  label: "All",
                  color: "text-slate-600",
                  bg: "bg-slate-100 border-slate-200 hover:bg-slate-200",
                },
                {
                  id: "Active",
                  label: "Active",
                  color: "text-emerald-700",
                  bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                },
                {
                  id: "New",
                  label: "New",
                  color: "text-blue-700",
                  bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
                },
                {
                  id: "Unread",
                  label: "Unread",
                  color: "text-slate-500",
                  bg: "bg-slate-100 border-slate-200 hover:bg-slate-200",
                },
                {
                  id: "Pending",
                  label: "Pending",
                  color: "text-orange-700",
                  bg: "bg-orange-50 border-orange-200 hover:bg-orange-100",
                },
                {
                  id: "Action Needed",
                  label: "Action Needed",
                  color: "text-rose-700",
                  bg: "bg-rose-50 border-rose-200 hover:bg-rose-100",
                },
                {
                  id: "Draft",
                  label: "Draft",
                  color: "text-indigo-700",
                  bg: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
                },
                {
                  id: "Final",
                  label: "Final",
                  color: "text-teal-700",
                  bg: "bg-teal-50 border-teal-200 hover:bg-teal-100",
                },
                {
                  id: "Review",
                  label: "Review",
                  color: "text-fuchsia-700",
                  bg: "bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100",
                },
                {
                  id: "Cancel",
                  label: "Cancel",
                  color: "text-red-700",
                  bg: "bg-red-50 border-red-200 hover:bg-red-100",
                },
              ].map((status) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300 border whitespace-nowrap ${statusFilter === status.id ? `${status.bg} shadow-md ring-2 ring-offset-2 ring-${status.color.split("-")[1]}-400/60` : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:shadow-sm"}`}
                >
                  <span
                    className={statusFilter === status.id ? status.color : ""}
                  >
                    {status.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Secondary Search Bar */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 w-full max-w-full min-w-0">
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-colors w-full md:w-40 min-w-0"
            >
              <option value="">Select Site Names</option>
              {availableSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="relative w-full md:w-auto md:flex-1 min-w-0 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Patient ID / Name / Accession No"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded-xl pl-9 pr-4 py-2 w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-all placeholder-slate-400 min-w-0"
              />
            </div>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-colors w-full md:w-32 min-w-0"
            >
              <option value="">Modality</option>
              {availableModalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={studyNameFilter}
              onChange={(e) => setStudyNameFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-colors w-full md:w-48 min-w-0"
            >
              <option value="">Select Study Name</option>
              {availableStudyNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto min-w-0 max-w-full">
              <select
                value={radiologistFilter}
                onChange={(e) => setRadiologistFilter(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-colors flex-1 w-full md:w-40 min-w-0"
              >
                <option value="">Select Radiologist</option>
                {availableRadiologists.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    showToast(`Filter applied. Showing ${filteredStudies.length} matching studies.`);
                  }}
                  className="flex-1 md:flex-none bg-[#123B5D] hover:bg-[#0B1F33] text-white text-xs px-5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer active:scale-95"
                >
                  Go
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="flex-1 md:flex-none text-xs px-4 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors font-bold shrink-0 cursor-pointer"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-slate-100 gap-4">
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
              <Button
                onClick={() => navigate("/studies/new")}
                className="bg-[#16A6A8] hover:bg-[#128a8c] text-white text-xs px-4 py-2 rounded-xl font-bold shadow-sm shadow-[#16A6A8]/20 transition-all w-full md:w-auto cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Add Study
              </Button>
              <Button
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                variant="outline"
                className="border-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto cursor-pointer"
              >
                {isUploading ? (
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin text-[#16A6A8]" />
                ) : (
                  <Upload className="w-4 h-4 mr-1.5 text-slate-400" />
                )}
                {isUploading ? "Uploading..." : "Zip Upload"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".zip"
                onChange={handleZipUpload}
              />
              <Button
                onClick={handleRefresh}
                variant="outline"
                className={`border-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto cursor-pointer ${isRefreshing ? "opacity-70" : ""}`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1.5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </Button>
              <Button
                onClick={() => setEmergencyFilter(!emergencyFilter)}
                className={`text-xs px-4 py-2 rounded-xl font-bold shadow-sm transition-all w-full md:w-auto cursor-pointer ${emergencyFilter ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
              >
                Emergency
              </Button>
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="col-span-2 md:col-span-1 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A6A8]/20 transition-colors w-full md:w-auto"
              >
                <option value="all">Assigned Studies (All)</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
                <option value="urgent">Urgent / Emergency</option>
              </select>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center space-x-2 bg-[#176B87]/10 px-3 py-1.5 rounded-xl border border-[#176B87]/20">
                <div className="w-2 h-2 rounded-full bg-[#1FC8D0] animate-pulse"></div>
                <span className="text-[11px] font-black tracking-widest text-[#176B87] uppercase">
                  Online Staff
                </span>
              </div>
              <div className="text-[11px] font-black tracking-widest text-slate-500 uppercase bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Exams:{" "}
                <span className="text-[#0F172A]">{filteredStudies.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-slate-200 animate-unnathi-slide-up">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-500 sticky top-0 z-20 shadow-sm border-b border-slate-200 font-black">
            <tr>
              <th className="py-4 px-4 w-[12%] cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px] rounded-tl-2xl">
                Patient ID
              </th>
              <th className="py-4 px-4 w-[18%] cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Patient Name
              </th>
              <th className="py-4 px-3 w-[8%] text-center cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Age / Sex
              </th>
              <th className="py-4 px-3 w-[5%] text-center cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Mod.
              </th>
              <th className="py-4 px-4 w-[15%] cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Study / Description
              </th>
              <th className="py-4 px-3 w-[8%] text-center cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Date
              </th>
              <th className="py-4 px-4 w-[10%] text-center hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                History / Attach
              </th>
              <th className="py-4 px-4 w-[8%] text-center hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Report
              </th>
              <th className="py-4 px-4 w-[12%] text-center hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Radiologist
              </th>
              <th className="py-4 px-3 w-[5%] text-center hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px]">
                Se / Img
              </th>
              <th className="py-4 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px] rounded-tr-2xl">
                Centre
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 stagger-children">
            {filteredStudies.map((study, idx) => {
              const patient = patients.find((p) => p.id === study.patientId);
              const hospital = hospitals.find((h) => h.id === study.hospitalId);
              const rad = radiologists.find(
                (r) => r.id === study.assignedRadiologistId,
              );
              const dateStr = format(new Date(study.studyDate), "dd-MM-yy");
              const timeStr = format(new Date(study.studyDate), "HH:mm");
              const historyDate = study.updatedAt
                ? format(new Date(study.updatedAt), "dd-MM-yy HH:mm")
                : "-";
              const assignedTime = study.assignedAt
                ? format(new Date(study.assignedAt), "dd-MM-yy HH:mm")
                : "";
              const reportTime = study.finalizedAt
                ? format(new Date(study.finalizedAt), "dd-MM-yy HH:mm")
                : "";

              const isExpanded = expandedSeries[study.id];

              return (
                <React.Fragment key={study.id}>
                  <tr
                    className={`animate-unnathi-fade-in hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgb(22,166,168,0.08)] hover:z-10 relative transition-all duration-300 ease-out cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"} ${selectedStudies.includes(study.id) ? "bg-[#16A6A8]/5 border-l-[3px] border-l-[#16A6A8]" : "border-l-[3px] border-l-transparent"}`}
                  >
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-[#0F172A]">
                        {study.caseNumber}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          checked={selectedStudies.includes(study.id)}
                          onChange={() => toggleSelectStudy(study.id)}
                          className="rounded text-[#16A6A8] focus:ring-[#16A6A8] border-slate-300 w-3.5 h-3.5"
                        />
                        <Pencil
                          onClick={() => {
                            setSelectedPatientForEdit(patient);
                            setEditPatientModalOpen(true);
                          }}
                          className="w-3.5 h-3.5 text-[#16A6A8] cursor-pointer hover:text-[#128a8c]"
                          title="Edit Patient"
                        />
                      </div>
                    </td>

                    <td
                      className="py-3 px-4 align-top font-black text-[#0F172A] pt-4"
                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    >
                      {patient?.name}
                    </td>

                    <td className="py-3 px-3 align-top text-center pt-4 text-slate-600 font-bold">
                      {patient?.age}Y / {patient?.gender?.charAt(0)}
                    </td>

                    <td className="py-3 px-3 align-top text-center pt-4 font-black text-[#123B5D]">
                      {study.modality}
                    </td>

                    <td className="py-2 px-3 align-top">
                      <div className="font-bold text-slate-800 uppercase text-[11px] mb-1 leading-tight">
                        {study.bodyPart}
                      </div>
                      <div className="text-slate-500 text-[10px] leading-tight">
                        {study.studyDescription}
                      </div>
                    </td>

                    <td className="py-2 px-2 align-top text-center">
                      <div className="font-semibold text-slate-700">
                        {dateStr}
                      </div>
                      <div className="text-slate-500 mt-1">{timeStr}</div>
                    </td>

                    <td className="py-2 px-2 align-top">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] text-slate-500 mb-1">
                          {historyDate}
                        </div>
                        <div
                          className="flex items-center space-x-1.5 border border-slate-200 px-2 py-0.5 rounded bg-white cursor-pointer hover:bg-slate-50 shadow-sm"
                          onClick={() => handleAction("History", study)}
                        >
                          <FileText className="w-3 h-3 text-accent" />
                          <span className="font-mono text-[10px] font-bold text-primary">
                            TT : {study.tat}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-2 align-top text-center pt-2.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm ${getStatusColor(study.reportingStatus)}`}
                      >
                        {study.reportingStatus}
                      </span>
                      {study.reportingStatus === "Pending" && rad && (
                        <div className="text-[10px] text-[#F26B50] font-semibold mt-1">
                          {rad.name}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-2 align-top">
                      {["Final", "Verified", "Dispatched"].includes(
                        study.reportingStatus,
                      ) ? (
                        <div className="flex flex-col items-center">
                          <div className="flex space-x-2 mb-1">
                            <button
                              onClick={() =>
                                generateAndDownloadReport("pdf", study)
                              }
                              className="p-1 hover:bg-red-50 text-red-600 rounded bg-white shadow-sm border border-red-100"
                              title="Download PDF"
                            >
                              <FileIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                generateAndDownloadReport("word", study)
                              }
                              className="p-1 hover:bg-blue-50 text-blue-600 rounded bg-white shadow-sm border border-blue-100"
                              title="Download Word"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <div className="font-bold text-slate-800 ml-1">
                              {rad?.name}
                            </div>
                          </div>
                          {assignedTime && (
                            <div className="text-[9px] text-slate-400">
                              {assignedTime}
                            </div>
                          )}
                          {reportTime && (
                            <div className="text-[9px] text-slate-400">
                              {reportTime}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {["Unread", "Pending"].includes(
                            study.reportingStatus,
                          ) && !study.assignedRadiologistId ? (
                            <select
                              onChange={(e) =>
                                e.target.value &&
                                handleAssignRadiologist(
                                  study.id,
                                  e.target.value,
                                )
                              }
                              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white w-full"
                              value={study.assignedRadiologistId || ""}
                            >
                              <option value="">Select Radiologist</option>
                              {availableRadiologists.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <div className="font-bold text-slate-800">
                                {rad?.name || "Unassigned"}
                              </div>
                              <div className="text-[9px] text-slate-400 mt-1">
                                {assignedTime}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-2 align-top pt-2.5 text-center">
                      <div className="text-[10px] font-bold text-slate-600 mb-1">
                        {study.series?.length || 1} /{" "}
                        {study.series?.reduce(
                          (acc, s) => acc + s.imageCount,
                          0,
                        ) || 1}
                      </div>
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => toggleSeries(study.id)}
                          className="p-1 text-slate-500 hover:text-primary hover:bg-slate-200 rounded"
                          title="View Series"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/viewer/${study.id}`)}
                          className="p-1 text-[#00A8CC] hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Open Viewer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-3 align-top text-center pt-2.5">
                      <div
                        className="font-semibold text-slate-700 text-xs mb-1 truncate max-w-[120px] mx-auto"
                        title={hospital?.name}
                      >
                        {hospital?.name}
                      </div>
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() =>
                            generateAndDownloadReport("pdf", study)
                          }
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Download Report"
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudyForShare(study);
                            setShareModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Share"
                        >
                          <Share2 className="w-3 h-3 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(study.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Copy Link"
                        >
                          <Copy className="w-3 h-3 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleAction("Info", study)}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="More Info"
                        >
                          <Info className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#2D333B]">
                      <td
                        colSpan={11}
                        className="p-0 border-b border-[#1E2328]"
                      >
                        <div className="flex items-center space-x-2 p-2 overflow-x-auto">
                          {study.series?.map((series, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col items-center justify-center p-2 bg-[#1E2328] border border-gray-700 rounded-lg cursor-pointer hover:border-teal-500 w-32 shrink-0"
                            >
                              <img
                                src={series.image}
                                alt={series.name}
                                className="w-full aspect-square object-cover rounded mb-1 opacity-80"
                              />
                              <div className="text-[10px] text-teal-400 truncate w-full text-center">
                                {series.name}
                              </div>
                              <div className="text-[9px] text-gray-500">
                                {series.imageCount} imgs
                              </div>
                            </div>
                          ))}
                          {(!study.series || study.series.length === 0) && (
                            <div className="p-4 text-xs text-gray-500 italic">
                              No series data available
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filteredStudies.length === 0 && (
              <tr>
                <td colSpan={11} className="py-16 text-center text-slate-400 font-bold text-sm bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Activity className="w-8 h-8 text-slate-300 animate-pulse" />
                    <p className="text-slate-700 font-extrabold text-sm">No studies found matching the selected filters</p>
                    <p className="text-xs text-slate-400 font-medium">
                      Active criteria: Date [{dateFilter}], Status [{statusFilter}]
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-2 text-xs font-bold text-[#16A6A8] hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-slate-200 p-2 text-xs flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"></div>

      {/* Existing History Modal for editing */}
      <AddHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        study={selectedStudyForHistory}
        patient={patients.find(
          (p) => p.id === selectedStudyForHistory?.patientId,
        )}
        hospital={hospitals.find(
          (h) => h.id === selectedStudyForHistory?.hospitalId,
        )}
      />

      <MoreInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        study={selectedStudyForInfo}
        patient={patients.find((p) => p.id === selectedStudyForInfo?.patientId)}
        hospital={hospitals.find(
          (h) => h.id === selectedStudyForInfo?.hospitalId,
        )}
      />

      <EditPatientModal
        isOpen={editPatientModalOpen}
        onClose={() => setEditPatientModalOpen(false)}
        patient={selectedPatientForEdit}
      />

      {selectedStudyForShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          study={selectedStudyForShare}
        />
      )}
    </div>
  );
}
