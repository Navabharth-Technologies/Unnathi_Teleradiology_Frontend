import React, { useState, useMemo } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { format, parse, isValid } from "date-fns";
import * as dicomParser from "dicom-parser";
import JSZip from "jszip";
import { extractDicomArchive } from "../../utils/dicomExtractor";
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
  AlertTriangle,
  Send,
  ShieldAlert,
  Clock,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { AddHistoryModal } from "../../components/modals/AddHistoryModal";
import { MoreInfoModal } from "../../components/modals/MoreInfoModal";
import { EditPatientModal } from "../../components/modals/EditPatientModal";
import { ShareModal } from "../../components/modals/ShareModal";
import { RequestSuperAdminModal } from "../../components/modals/RequestSuperAdminModal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  downloadStandardReportPDF,
  downloadStandardReportWord,
} from "../../utils/reportDownloader";

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
    templates,
    updateStudy,
    addStudy,
    addPatient,
    updateHospital,
    addWalletTransaction,
  } = useMockDb();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSeries, setExpandedSeries] = useState({});
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeMethod, setRechargeMethod] = useState("UPI");
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [blockedHospital, setBlockedHospital] = useState(null);
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
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false);
  const [selectedStudyForSuperAdmin, setSelectedStudyForSuperAdmin] = useState(null);
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
    // If a specific site/hospital filter is active, filter radiologists for that hospital
    const effectiveHospitalId = siteFilter || user?.hospitalId || selectedHospitalId;

    if (effectiveHospitalId) {
      const hospital = hospitals.find((h) => h.id === effectiveHospitalId);
      // If the context is an independent hospital (COMPANY_MANAGED), show assigned or internal
      if (hospital?.organizationType === "COMPANY_MANAGED") {
        const rads = radiologists.filter((r) => {
          const relatedUser = users.find((u) => u.id === r.userId);
          return (
            r.assignedHospitals?.includes(effectiveHospitalId) ||
            relatedUser?.hospitalId === effectiveHospitalId
          );
        });
        if (rads.length > 0) return rads;
      }
    }

    // By default for Site Admin, Super Admin, and Global reporting, show all active radiologists in the system
    // Also include any radiologist who has already been assigned to one of the accessible studies
    const assignedRadIds = new Set(accessibleStudies.map((s) => s.assignedRadiologistId).filter(Boolean));
    return radiologists.filter((r) => {
      if (assignedRadIds.has(r.id)) return true;
      if (user?.role === "SITE_ADMIN" && user.siteId) {
        const relatedUser = users.find((u) => u.id === r.userId);
        if (r.siteId === user.siteId || relatedUser?.siteId === user.siteId) return true;
      }
      return r.status !== "Inactive";
    });
  }, [radiologists, user, users, hospitals, siteFilter, selectedHospitalId, accessibleStudies]);

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

  const handleQuickRecharge = async () => {
    const amt = Number(rechargeAmount);
    if (isNaN(amt) || amt <= 0 || !blockedHospital) return;
    const currentBase = Number(blockedHospital.walletBalance || 0);
    const newBal = currentBase + amt;
    await updateHospital(blockedHospital.id, { walletBalance: newBal });

    addWalletTransaction({
      id: "tx_" + Date.now(),
      hospitalId: blockedHospital.id,
      siteId: blockedHospital.parentSiteId || null,
      type: "Recharge",
      amount: amt,
      balanceBefore: currentBase,
      balanceAfter: newBal,
      paymentMethod: rechargeMethod || "UPI",
      referenceId: `ZIP-TOPUP-${Date.now().toString().slice(-6)}`,
      remarks: "Quick wallet recharge from Reporting ZIP upload portal",
      status: "Completed",
      createdAt: new Date().toISOString(),
    });

    setRechargeSuccess(true);
    setTimeout(() => {
      setShowRechargeModal(false);
      setRechargeSuccess(false);
      setRechargeAmount("");
      setBlockedHospital(null);
      showToast("Wallet recharged successfully! You can now upload the ZIP.");
    }, 1200);
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if hospital is prepaid and has zero or insufficient wallet balance
    const targetHospital =
      hospitals.find((h) => h.id === selectedHospitalId) ||
      hospitals.find((h) => h.id === user?.hospitalId) ||
      availableSites?.[0] ||
      hospitals?.[0];

    if (targetHospital) {
      const isPrepaid = (targetHospital.accountType || "Prepaid") === "Prepaid";
      if (isPrepaid) {
        const unbilledStudies = studies.filter(
          (s) =>
            s.hospitalId === targetHospital.id &&
            ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) &&
            s.superAdminPaymentStatus !== "Paid",
        );
        const totalUnbilledAmount = unbilledStudies.reduce((sum, s) => {
          const comm =
            targetHospital.modalityCommissions?.[s.modality] ||
            (s.modality === "MRI"
              ? 150
              : s.modality === "CT"
                ? 100
                : ["X-Ray", "CR", "DR"].includes(s.modality)
                  ? 30
                  : 50);
          return sum + comm;
        }, 0);
        const effectiveBalance = (Number(targetHospital.walletBalance) || 0) - totalUnbilledAmount;

        // Block if balance is 0 or less (shortage even by 1 Rs)
        if (effectiveBalance <= 0) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          setBlockedHospital(targetHospital);
          setShowRechargeModal(true);
          return;
        }
      }
    }

    setIsUploading(true);
    try {
      // Extract real images and DICOM metadata from ZIP archive
      const extracted = await extractDicomArchive(file, JSZip);

      const patientName = extracted.patientName;
      const patientUHID = extracted.patientUHID;
      const age = extracted.age;
      const gender = extracted.gender;
      const modality = extracted.modality;
      const studyDesc = extracted.studyDesc;
      const bodyPart = extracted.bodyPart;
      const accessionNo = extracted.accessionNo;
      const seriesList = extracted.seriesList;

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

      // Push raw DICOM files to local Orthanc PACS if available
      let orthancStudyId = null;
      try {
        const buffersToUpload =
          extracted.allRawBuffers && extracted.allRawBuffers.length > 0
            ? extracted.allRawBuffers
            : (seriesList || []).map((s) => s.rawBuffer).filter(Boolean);

        if (buffersToUpload.length > 0) {
          for (const buf of buffersToUpload) {
            try {
              const resp = await fetch("/orthanc-pacs/instances", {
                method: "POST",
                headers: { "Content-Type": "application/dicom" },
                body: buf,
              }).catch(() =>
                fetch("http://localhost:8042/instances", {
                  method: "POST",
                  headers: { "Content-Type": "application/dicom" },
                  body: buf,
                })
              );
              if (resp && resp.ok) {
                const data = await resp.json();
                if (data?.ParentStudy) {
                  orthancStudyId = data.ParentStudy;
                }
              }
            } catch (postErr) {
              console.warn("Could not post DICOM slice to Orthanc:", postErr);
            }
          }
        }
      } catch (orthancErr) {
        console.warn("Orthanc upload encountered an error:", orthancErr);
      }

      // Clean series objects so rawBuffer and unneeded binary properties aren't saved to state/localStorage
      // Group individual slices by series to maintain correct series count and segment structure (e.g. 1/96)
      const seriesMap = new Map();
      (seriesList || []).forEach((s) => {
        const { rawBuffer, ...rest } = s;
        const key = rest.seriesInstanceUID || rest.seriesDescription || rest.name || "SERIES_1";
        if (!seriesMap.has(key)) {
          seriesMap.set(key, {
            id: seriesMap.size + 1,
            name: (rest.seriesDescription || rest.name || `SERIES_${seriesMap.size + 1}`).toUpperCase().slice(0, 24),
            seriesInstanceUID: rest.seriesInstanceUID,
            seriesDescription: rest.seriesDescription,
            studyInstanceUID: rest.studyInstanceUID,
            image: rest.image || rest.fullImage,
            fullImage: rest.fullImage || rest.image,
            slices: [],
            imageCount: 0,
          });
        }
        const item = seriesMap.get(key);
        const img = rest.fullImage || rest.image;
        if (img) item.slices.push(img);
        item.imageCount = item.slices.length || 1;
        if (!item.image && img) {
          item.image = img;
          item.fullImage = img;
        }
      });

      const sanitizedSeries = Array.from(seriesMap.values()).map((ser) => ({
        ...ser,
        // Pick representative middle slice for thumbnail
        image: ser.slices[Math.floor(ser.slices.length / 2)] || ser.slices[0] || ser.image,
        fullImage: ser.slices[Math.floor(ser.slices.length / 2)] || ser.slices[0] || ser.fullImage,
        imageCount: ser.slices.length || 1,
      }));

      // Create new Study with real extracted series/images attached
      const caseNumber = `CAS-ZIP-${Date.now().toString().slice(-5)}`;
      const newStudy = {
        id: `st${Date.now()}`,
        patientId: patId,
        patientName: patientName,
        patientUHID: patientUHID,
        age: age || 40,
        gender: gender || "Female",
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
        series: sanitizedSeries,
        studyInstanceUID: extracted.studyInstanceUID || undefined,
        orthancStudyId: orthancStudyId || undefined,
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

  const generateAndDownloadReport = async (format, study) => {
    showToast(`Generating standardized ${format.toUpperCase()} report...`);
    const patient = patients.find((p) => p.id === study.patientId);
    try {
      if (format === "pdf") {
        await downloadStandardReportPDF({
          study,
          patient,
          hospitals,
          sites,
          radiologists,
          templates,
        });
      } else {
        downloadStandardReportWord({
          study,
          patient,
          hospitals,
          sites,
          radiologists,
          templates,
        });
      }
    } catch (err) {
      console.error(`Failed to generate ${format} report:`, err);
      showToast(`Error generating ${format.toUpperCase()} report.`);
    }
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
      case "Critical":
        return "bg-rose-600 text-white animate-pulse shadow-rose-200";
      case "Final":
        return "bg-[#009688] text-white";
      case "Verified":
        return "bg-[#4CAF50] text-white";
      case "Dispatched":
        return "bg-[#0D2461] text-white border border-[#0D2461]";
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
              const patient = patients.find((p) => p.id === study.patientId) || {
                id: study.patientId,
                name: study.patientName || study.patient || "Patient",
                uhid: study.patientUHID || study.uhid || "",
                age: study.age || "",
                gender: study.gender || "",
              };
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
                      <div className="inline-flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (study.reportingStatus === "Verified") {
                              updateStudy(study.id, {
                                reportingStatus: "Dispatched",
                                status: "Final",
                                dispatchedAt: new Date().toISOString(),
                              });
                              setToastMessage(`Status for ${study.caseNumber} updated to Dispatched.`);
                              setTimeout(() => setToastMessage(""), 3500);
                            } else if (study.reportingStatus === "Dispatched") {
                              updateStudy(study.id, {
                                reportingStatus: "Verified",
                              });
                              setToastMessage(`Status for ${study.caseNumber} returned to Verified.`);
                              setTimeout(() => setToastMessage(""), 3500);
                            }
                          }}
                          title={
                            study.reportingStatus === "Verified"
                              ? "Click to automatically mark as Dispatched / Sent to user"
                              : study.reportingStatus === "Dispatched"
                                ? "Report dispatched to user. Click to toggle back to Verified if needed."
                                : "Report status"
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all ${getStatusColor(study.reportingStatus)}`}
                        >
                          <span>{study.reportingStatus}</span>
                          {study.reportingStatus === "Verified" && (
                            <Send className="w-2.5 h-2.5 opacity-80" />
                          )}
                        </button>
                        {study.reportingStatus === "Verified" && (
                          <span className="text-[8px] text-slate-400 font-medium mt-0.5 select-none">
                            Click to Dispatch
                          </span>
                        )}
                      </div>
                      {study.reportingStatus === "Pending" && rad && (
                        <div className="text-[10px] text-[#F26B50] font-semibold mt-1">
                          {rad.name}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-2 align-top">
                      {["Final", "Verified", "Dispatched", "Critical"].includes(
                        study.reportingStatus,
                      ) || study.isCritical || study.reportText ? (
                        <div className="flex flex-col items-center">
                          <div className="flex space-x-2 mb-1 items-center">
                            <button
                              onClick={() =>
                                generateAndDownloadReport("pdf", study)
                              }
                              className="p-1 hover:bg-red-50 text-red-600 rounded bg-white shadow-sm border border-red-100 transition-colors"
                              title="Download Standardized PDF Report"
                            >
                              <FileIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                generateAndDownloadReport("word", study)
                              }
                              className="p-1 hover:bg-blue-50 text-blue-600 rounded bg-white shadow-sm border border-blue-100 transition-colors"
                              title="Download Standardized Word Report"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <div className="font-bold text-slate-800 ml-1 text-xs">
                              {rad?.name || "Radiologist"}
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
                        <div className="flex flex-col items-center w-full">
                          {["Unread", "Pending"].includes(
                            study.reportingStatus,
                          ) && !study.assignedRadiologistId ? (
                            <div className="w-full space-y-1.5">
                              <select
                                onChange={(e) =>
                                  e.target.value &&
                                  handleAssignRadiologist(
                                    study.id,
                                    e.target.value,
                                  )
                                }
                                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white w-full outline-none focus:ring-1 focus:ring-[#16A6A8]"
                                value={study.assignedRadiologistId || ""}
                              >
                                <option value="">Select Radiologist</option>
                                {(() => {
                                  const hosp = hospitals.find((h) => h.id === study.hospitalId);
                                  const isIndep = hosp && (!hosp.parentSiteId && (hosp.organizationType === "UNNATHI_MANAGED" || !hosp.organizationType || hosp.organizationType !== "COMPANY_MANAGED"));

                                  if (isIndep) {
                                    const internalRads = radiologists.filter((r) => {
                                      const relatedUser = users.find((u) => u.id === r.userId);
                                      return r.assignedHospitals?.includes(hosp.id) || relatedUser?.hospitalId === hosp.id;
                                    });
                                    const globalRads = radiologists.filter((r) => {
                                      const relatedUser = users.find((u) => u.id === r.userId);
                                      const isInternal = r.assignedHospitals?.includes(hosp.id) || relatedUser?.hospitalId === hosp.id;
                                      const isCompExclusive = r.siteId || (r.assignedHospitals && r.assignedHospitals.some((hid) => hospitals.find((h) => h.id === hid)?.organizationType === "COMPANY_MANAGED"));
                                      return !isInternal && !isCompExclusive;
                                    });

                                    return (
                                      <>
                                        <optgroup label="Internal Radiologists">
                                          {internalRads.map((r) => (
                                            <option key={r.id} value={r.id}>
                                              {r.name}
                                            </option>
                                          ))}
                                          {internalRads.length === 0 && (
                                            <option disabled value="">(No internal doc)</option>
                                          )}
                                        </optgroup>
                                        <optgroup label="🌐 Global Radiologists Pool">
                                          {globalRads.map((r) => (
                                            <option key={r.id} value={r.id}>
                                              ★ {r.name} [Global Panel]
                                            </option>
                                          ))}
                                        </optgroup>
                                      </>
                                    );
                                  }

                                  return availableRadiologists.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.name}
                                    </option>
                                  ));
                                })()}
                              </select>

                              {/* Independent Hospital Escalation Indicator / Trigger */}
                              {(() => {
                                const hosp = hospitals.find((h) => h.id === study.hospitalId);
                                const isIndep = hosp && (!hosp.parentSiteId && (hosp.organizationType === "UNNATHI_MANAGED" || !hosp.organizationType || hosp.organizationType !== "COMPANY_MANAGED"));

                                if (!isIndep) return null;

                                if (study?.assignmentRequest?.status === "Pending") {
                                  return (
                                    <div className="bg-amber-50 border border-amber-300 rounded px-1.5 py-1 text-[10px] text-amber-800 font-bold flex flex-col items-center">
                                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-700">
                                        <Clock className="w-2.5 h-2.5 animate-spin" />
                                        Super Admin Req
                                      </span>
                                      <span className="text-[9px] font-mono text-amber-900 mt-0.5">
                                        {study.assignmentRequest.routePreference === "TELERADIOLOGY_COMPANY" ? "→ Teleradiology" : "→ Global Rad"}
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStudyForSuperAdmin(study);
                                      setSuperAdminModalOpen(true);
                                    }}
                                    className="w-full text-[10px] font-bold py-0.5 px-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    title="Doctor unavailable / on leave? Request Super Admin to assign"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    <span>Escalate / Leave</span>
                                  </button>
                                );
                              })()}
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-slate-800">
                                {rad?.name || "Unassigned"}
                              </div>
                              {study.assignmentRequest?.status === "Assigned" && (
                                <div className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">
                                  via Super Admin
                                </div>
                              )}
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
          patient={patients.find(
            (p) => p.id === selectedStudyForShare.patientId,
          )}
          hospital={hospitals.find(
            (h) => h.id === selectedStudyForShare.hospitalId,
          )}
          onShared={() => {
            updateStudy(selectedStudyForShare.id, {
              reportingStatus: "Dispatched",
              status: "Final",
              dispatchedAt: new Date().toISOString(),
            });
            setToastMessage(`Report for ${selectedStudyForShare.caseNumber} sent to user and status automatically updated to Dispatched.`);
            setTimeout(() => setToastMessage(""), 4500);
          }}
        />
      )}

      {selectedStudyForSuperAdmin && (
        <RequestSuperAdminModal
          isOpen={superAdminModalOpen}
          onClose={() => {
            setSuperAdminModalOpen(false);
            setSelectedStudyForSuperAdmin(null);
          }}
          study={selectedStudyForSuperAdmin}
          patient={patients.find(
            (p) => p.id === selectedStudyForSuperAdmin.patientId,
          )}
          hospital={hospitals.find(
            (h) => h.id === selectedStudyForSuperAdmin.hospitalId,
          )}
          sites={sites}
          onSubmit={(payload) => {
            updateStudy(selectedStudyForSuperAdmin.id, payload);
            setToastMessage("Escalation request submitted to Super Admin successfully.");
            setTimeout(() => setToastMessage(""), 4000);
          }}
        />
      )}

      {/* QUICK RECHARGE POPUP MODAL FOR PREPAID SHORTAGE */}
      {showRechargeModal && blockedHospital && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Wallet Recharge Required
                  </h2>
                  <p className="text-xs text-white/90 font-bold uppercase tracking-widest mt-0.5">
                    {blockedHospital.name} (Prepaid)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRechargeModal(false);
                  setBlockedHospital(null);
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Current Base Wallet:</span>
                  <span className="font-black text-slate-700">₹ {Number(blockedHospital.walletBalance) || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Account Type:</span>
                  <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                    Prepaid
                  </span>
                </div>
                <div className="border-t border-rose-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-black text-rose-900">Effective Balance:</span>
                  <span className="text-base font-black text-rose-600">
                    ₹ {Number(blockedHospital.walletBalance) || 0} (Shortage)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  The prepaid wallet balance has reached zero or is insufficient to cover the required scan commission. Please recharge your wallet before uploading new DICOM or ZIP studies.
                </p>
              </div>

              {rechargeSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center space-x-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Wallet recharged successfully!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                      Enter Recharge Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="100"
                        placeholder="e.g. 1000"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black text-slate-800 text-sm"
                      />
                    </div>
                    {/* Quick amount chips */}
                    <div className="flex gap-2 mt-2">
                      {[500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRechargeAmount(String(amt))}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={rechargeMethod}
                      onChange={(e) => setRechargeMethod(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-700 text-xs bg-white"
                    >
                      <option value="UPI">UPI / QR Code (Instant)</option>
                      <option value="Net Banking">Net Banking (NEFT/RTGS)</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Manual Admin Top-up">Admin Authorized Deposit</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRechargeModal(false);
                        setBlockedHospital(null);
                      }}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickRecharge}
                      disabled={!rechargeAmount || Number(rechargeAmount) <= 0}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Recharge & Unlock</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
