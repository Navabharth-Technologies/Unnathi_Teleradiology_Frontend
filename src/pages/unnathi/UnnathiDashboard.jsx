import React, { useMemo, useState } from "react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Building2,
  HeartPulse,
  Users,
  UserRound,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Activity,
  Clock,
  FileText,
  AlertTriangle,
  Database,
  Cloud,
  Network,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldAlert,
  Send,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Scan,
  Search,
  DollarSign,
  Stethoscope,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const UnnathiDashboard = () => {
  const { sites, hospitals, users, radiologists, patients, studies, updateStudy } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Pending emergency / leave assignment requests from Independent Hospitals
  const pendingRequests = useMemo(() => {
    return studies.filter((s) => s.assignmentRequest?.status === "Pending");
  }, [studies]);

  const globalRadiologists = useMemo(() => {
    return radiologists.filter((r) => {
      const isCompExclusive =
        r.siteId ||
        (r.assignedHospitals &&
          r.assignedHospitals.some(
            (hid) =>
              hospitals.find((h) => h.id === hid)?.organizationType ===
              "COMPANY_MANAGED"
          ));
      return !isCompExclusive;
    });
  }, [radiologists, hospitals]);

  // Strict scoping based on role
  const scopedSites = sites.filter((c) => {
    if (user?.role === "SUPER_ADMIN") return true;
    if (user?.role === "SITE_ADMIN") return c.id === user.siteId;
    return false;
  });

  const handleOpenDashboard = (hospitalId) => {
    useAuthStore.getState().setSelectedHospitalId(hospitalId);
    if (user?.role === "SUPER_ADMIN") {
      useAuthStore.getState().setRole("HOSPITAL_ADMIN");
    }
    navigate("/admin/dashboard");
  };

  const scopedHospitals = hospitals.filter((h) => {
    if (user?.role === "SUPER_ADMIN") return true;
    if (user?.role === "SITE_ADMIN") return h.parentSiteId === user.siteId;
    return false;
  });

  const totalRechargedWallet = useMemo(() => {
    return (
      scopedSites.reduce((acc, s) => acc + (s.walletBalance || 0), 0) +
      scopedHospitals.reduce((acc, h) => acc + (h.walletBalance || 0), 0)
    );
  }, [scopedSites, scopedHospitals]);

  const totalUnbilledAmount = useMemo(() => {
    return scopedHospitals.reduce((acc, h) => {
      const unbilledStudies = studies.filter(
        (s) =>
          s.hospitalId === h.id &&
          ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) &&
          s.superAdminPaymentStatus !== "Paid"
      );
      return (
        acc +
        unbilledStudies.reduce((sum, s) => {
          const comm =
            h.modalityCommissions?.[s.modality] ||
            (s.modality === "MRI"
              ? 150
              : s.modality === "CT"
                ? 100
                : ["X-Ray", "CR", "DR"].includes(s.modality)
                  ? 30
                  : 50);
          return sum + comm;
        }, 0)
      );
    }, 0);
  }, [scopedHospitals, studies]);

  const effectiveRemainingBalance = totalRechargedWallet - totalUnbilledAmount;

  const stats = [
    {
      label: "Remaining Balance",
      subLabel: totalUnbilledAmount > 0 ? `₹ ${totalUnbilledAmount} unbilled usage` : "Spendable funds",
      value: `₹ ${effectiveRemainingBalance}`,
      icon: Activity,
      color: "emerald",
      badge: "Available",
      link: "/finance/ledger",
    },
    {
      label: "Recharged Amount",
      subLabel: "Total wallet credit",
      value: `₹ ${totalRechargedWallet}`,
      icon: Wallet,
      color: "indigo",
      badge: "Lifetime Base",
      link: "/finance/ledger",
    },
    {
      label: "Sites",
      subLabel: "Associated sites",
      value: scopedSites.length,
      icon: Building2,
      color: "blue",
      link: "/unnathi/sites",
    },
    {
      label: "Total Hospitals",
      subLabel: "Connected centres",
      value: scopedHospitals.length,
      icon: HeartPulse,
      color: "rose",
      link: "/unnathi/hospitals",
    },
    {
      label: "Radiologists",
      subLabel: "Reporting panel",
      value: radiologists.length,
      icon: UserRound,
      color: "amber",
      link: "/admin/radiologists",
    },
  ];

  // 7-day studies trend
  const trendData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[(d.getDay() + 6) % 7];
      const dateStr = d.toISOString().split("T")[0];
      const matchCount = studies.filter((s) => {
        const sDate = (s.studyDate || s.createdAt || "").split("T")[0];
        return sDate === dateStr;
      }).length;
      result.push({
        name: dayName,
        date: dateStr,
        studies: matchCount,
        completed: studies.filter((s) => {
          const sDate = (s.studyDate || s.createdAt || "").split("T")[0];
          return (
            sDate === dateStr &&
            (["Final", "Verified", "Dispatched"].includes(s.reportingStatus) ||
              s.status === "Final" ||
              s.status === "Completed")
          );
        }).length,
      });
    }
    const totalCounted = result.reduce((acc, r) => acc + r.studies, 0);
    if (studies.length > 0 && totalCounted === 0) {
      result[result.length - 1].studies = studies.length;
      result[result.length - 1].completed = studies.filter(
        (s) =>
          ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) ||
          s.status === "Final" ||
          s.status === "Completed",
      ).length;
    }
    return result;
  }, [studies]);

  // Modality distribution
  const modalityData = useMemo(() => {
    if (!studies || studies.length === 0) {
      return [{ name: "No Studies", value: 1, color: "#E2E8F0" }];
    }
    const counts = {};
    studies.forEach((s) => {
      const m = s.modality || "Other";
      counts[m] = (counts[m] || 0) + 1;
    });
    const palette = [
      "#0284c7",
      "#0d9488",
      "#8b5cf6",
      "#f59e0b",
      "#f43f5e",
      "#10b981",
    ];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: palette[idx % palette.length],
    }));
  }, [studies]);

  // TAT Performance
  const tatData = useMemo(() => {
    const completedStudies = studies.filter(
      (s) =>
        ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) ||
        s.status === "Final" ||
        s.status === "Completed",
    );
    const routineCount = completedStudies.filter(
      (s) => s.priority !== "STAT" && s.priority !== "Emergency",
    ).length;
    const statCount = completedStudies.filter(
      (s) =>
        s.priority === "STAT" ||
        s.priority === "Emergency" ||
        s.reportingStatus === "Critical" ||
        s.isCritical === true,
    ).length;
    const inProgress = studies.length - completedStudies.length;

    return [
      { name: "Verified", count: completedStudies.length, color: "#10b981" },
      { name: "Routine", count: routineCount, color: "#3b82f6" },
      { name: "STAT", count: statCount, color: "#f43f5e" },
      { name: "Pending", count: Math.max(0, inProgress), color: "#f59e0b" },
    ];
  }, [studies]);

  // Filter state for the Scans & Reports Financial Breakdown section
  const [breakdownSearch, setBreakdownSearch] = useState("");
  const [breakdownTypeFilter, setBreakdownTypeFilter] = useState("ALL"); // "ALL", "HOSPITAL", "TELERADIOLOGY"
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);

  // Helper to determine cost for a study based on hospital modality commissions
  const getStudyCost = (study, hosp) => {
    if (study.cost !== undefined && study.cost !== null) return Number(study.cost);
    if (!hosp) {
      return study.modality === "MRI"
        ? 150
        : study.modality === "CT"
          ? 100
          : ["X-Ray", "CR", "DR"].includes(study.modality)
            ? 30
            : 50;
    }
    return (
      hosp.modalityCommissions?.[study.modality] ??
      (study.modality === "MRI"
        ? 150
        : study.modality === "CT"
          ? 100
          : ["X-Ray", "CR", "DR"].includes(study.modality)
            ? 30
            : 50)
    );
  };

  // Comprehensive facility-wise Scans and Reports Analytics grouped hierarchically:
  // 1st: Teleradiology Sites (with their nested managed hospitals)
  // 2nd: Standalone / Direct Independent Hospitals
  const scanningAndReportsAnalytics = useMemo(() => {
    // Helper to resolve real patient name automatically from patients store or study record
    const resolvePatientName = (study) => {
      if (study.patientName && study.patientName !== "Anonymous") return study.patientName;
      if (study.patientId && patients && patients.length > 0) {
        const found = patients.find((p) => p.id === study.patientId);
        if (found?.name) return found.name;
        if (found?.patientName) return found.patientName;
      }
      return study.patientName || "Patient Record";
    };

    // Helper to build modality & studies metrics for any list of studies
    const buildStudyMetrics = (studyList, hospResolver) => {
      const modalityBreakdown = {};
      let totalCost = 0;
      let completedReportsCount = 0;
      let pendingReportsCount = 0;

      studyList.forEach((study) => {
        const hosp = typeof hospResolver === "function" ? hospResolver(study) : hospResolver;
        const mod = study.modality || "Other";
        const unitCost = getStudyCost(study, hosp);
        const isReported =
          ["Final", "Verified", "Dispatched"].includes(study.reportingStatus) ||
          study.status === "Final" ||
          study.status === "Completed";

        if (isReported) completedReportsCount++;
        else pendingReportsCount++;

        totalCost += unitCost;

        if (!modalityBreakdown[mod]) {
          modalityBreakdown[mod] = {
            modality: mod,
            count: 0,
            unitCost,
            totalCost: 0,
            reportedCount: 0,
            pendingCount: 0,
            studies: [],
          };
        }
        modalityBreakdown[mod].count += 1;
        modalityBreakdown[mod].totalCost += unitCost;
        if (isReported) modalityBreakdown[mod].reportedCount += 1;
        else modalityBreakdown[mod].pendingCount += 1;
        modalityBreakdown[mod].studies.push({
          id: study.id,
          caseNumber: study.caseNumber || study.id,
          patientName: resolvePatientName(study),
          modality: mod,
          bodyPart: study.bodyPart || "General",
          reportingStatus: study.reportingStatus || study.status || "Pending",
          cost: unitCost,
          date: (study.studyDate || study.createdAt || "").split("T")[0] || "N/A",
        });
      });

      return {
        totalScans: studyList.length,
        completedReports: completedReportsCount,
        pendingReports: pendingReportsCount,
        totalCost,
        modalityBreakdown: Object.values(modalityBreakdown),
      };
    };

    // 1. Process Teleradiology Sites and their nested Hospitals
    const siteGroups = sites.map((site) => {
      const siteHospitals = hospitals.filter((h) => h.parentSiteId === site.id);
      const siteHospitalIds = siteHospitals.map((h) => h.id);

      // Studies for each hospital under this site
      const childHospitalsData = siteHospitals.map((hosp) => {
        const hospStudies = studies.filter((s) => s.hospitalId === hosp.id);
        const metrics = buildStudyMetrics(hospStudies, hosp);
        return {
          id: hosp.id,
          name: hosp.name,
          city: hosp.city,
          accountType: hosp.accountType || "Prepaid",
          ...metrics,
        };
      });

      // All studies belonging to this site (either siteId or mapped hospital)
      const allSiteStudies = studies.filter(
        (s) => s.siteId === site.id || siteHospitalIds.includes(s.hospitalId)
      );

      const siteMetrics = buildStudyMetrics(allSiteStudies, (std) =>
        hospitals.find((h) => h.id === std.hospitalId)
      );

      return {
        id: `site-${site.id}`,
        rawId: site.id,
        name: site.name,
        code: site.code,
        city: site.city,
        facilityType: "TELERADIOLOGY",
        typeLabel: site.organizationType === "COMPANY_MANAGED" ? "Teleradiology Company" : "Teleradiology Site",
        parentOrgName: `${siteHospitals.length} Associated Hospital${siteHospitals.length === 1 ? "" : "s"}`,
        hospitals: childHospitalsData,
        ...siteMetrics,
      };
    });

    // 2. Standalone / Direct Independent Hospitals (not belonging to any site)
    const directHospitals = hospitals.filter(
      (h) => !h.parentSiteId || !sites.some((s) => s.id === h.parentSiteId)
    );

    const directHospitalGroups = directHospitals.map((hosp) => {
      const hospStudies = studies.filter((s) => s.hospitalId === hosp.id);
      const metrics = buildStudyMetrics(hospStudies, hosp);
      return {
        id: `direct-${hosp.id}`,
        rawId: hosp.id,
        name: hosp.name,
        city: hosp.city,
        facilityType: "DIRECT_HOSPITAL",
        typeLabel: "Direct / Standalone Hospital",
        parentOrgName: "Independent Facility",
        hospitals: [], // No child hospitals
        ...metrics,
      };
    });

    // Grand totals
    const grandTotalScans = studies.length;
    const grandTotalReports = studies.filter(
      (s) =>
        ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) ||
        s.status === "Final" ||
        s.status === "Completed"
    ).length;
    const grandTotalCost = studies.reduce((sum, s) => {
      const hosp = hospitals.find((h) => h.id === s.hospitalId);
      return sum + getStudyCost(s, hosp);
    }, 0);

    return {
      sites: siteGroups,
      directHospitals: directHospitalGroups,
      allGroups: [...siteGroups, ...directHospitalGroups],
      grandTotalScans,
      grandTotalReports,
      grandTotalCost,
    };
  }, [hospitals, sites, studies, patients]);

  const filteredGroups = useMemo(() => {
    return scanningAndReportsAnalytics.allGroups.filter((group) => {
      if (breakdownTypeFilter === "TELERADIOLOGY" && group.facilityType !== "TELERADIOLOGY") return false;
      if (breakdownTypeFilter === "HOSPITAL" && group.facilityType === "TELERADIOLOGY") return false;
      if (breakdownSearch.trim()) {
        const q = breakdownSearch.toLowerCase();
        const matchesGroup =
          group.name.toLowerCase().includes(q) ||
          group.typeLabel.toLowerCase().includes(q) ||
          (group.city && group.city.toLowerCase().includes(q));
        const matchesChildHospital = group.hospitals?.some(
          (h) => h.name.toLowerCase().includes(q) || (h.city && h.city.toLowerCase().includes(q))
        );
        return matchesGroup || matchesChildHospital;
      }
      return true;
    });
  }, [scanningAndReportsAnalytics, breakdownTypeFilter, breakdownSearch]);

  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
          <p className="font-bold text-slate-300">{label || item.name}</p>
          <p className="text-emerald-400 font-extrabold text-sm">
            {item.value} {item.value === 1 ? "Study" : "Studies"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (user?.role === "SUPER_ADMIN") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[1600px] mx-auto space-y-8 pb-12 w-full max-w-full min-w-0"
      >
        <motion.div variants={itemVariants} className="flex flex-col mb-4">
          <h1 className="text-3xl font-black text-[#10263D] tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-[#176B73]" />
            Platform Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 pl-9">
            Comprehensive platform telemetry and operations overview
          </p>
        </motion.div>

        {/* Independent Hospital Radiologist Leave / Urgent Escalation Section */}
        {pendingRequests.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-400 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                    Independent Hospital Escalation Requests
                    <span className="px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full">
                      {pendingRequests.length} Pending
                    </span>
                  </h2>
                  <p className="text-xs text-amber-800 font-semibold mt-0.5">
                    Internal doctor unavailable or on leave. Urgent dispatch requested to Global Radiologist or Teleradiology Company.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/radiologist/reporting")}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open Worklist</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((study) => {
                const hosp = hospitals.find((h) => h.id === study.hospitalId);
                const req = study.assignmentRequest || {};
                const isTeleradPref = req.routePreference === "TELERADIOLOGY_COMPANY";

                return (
                  <div
                    key={study.id}
                    className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                          {req.urgency || "Urgent"}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {study.caseNumber}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {hosp?.name || "Independent Hospital"}
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold">
                        {study.modality} • {study.bodyPart}
                      </p>
                      <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700">
                        <span className="font-bold text-amber-800 block">
                          Reason: {req.reason}
                        </span>
                        {req.notes && (
                          <span className="text-slate-500 block mt-0.5 italic">
                            "{req.notes}"
                          </span>
                        )}
                        <span className="mt-1 block font-bold text-[#176B73]">
                          Requested Route:{" "}
                          {isTeleradPref
                            ? `Teleradiology Company ${req.targetSiteName ? `(${req.targetSiteName})` : ""}`
                            : "Direct Global Radiologist"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Assignment Actions for Super Admin */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[10px] font-black uppercase text-slate-400">
                        Super Admin Routing Action:
                      </div>

                      {/* Option A: Quick Assign to a Global Radiologist */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const radId = e.target.value;
                            updateStudy(study.id, {
                              assignedRadiologistId: radId,
                              reportingStatus: "Pending",
                              assignedAt: new Date().toISOString(),
                              assignmentRequest: {
                                ...req,
                                status: "Assigned",
                                resolvedAt: new Date().toISOString(),
                                resolvedType: "GLOBAL_RADIOLOGIST",
                              },
                            });
                          }
                        }}
                        className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- Assign to Global Radiologist --</option>
                        {globalRadiologists.map((r) => (
                          <option key={r.id} value={r.id}>
                            ★ {r.name} ({r.specialization || "General"})
                          </option>
                        ))}
                      </select>

                      {/* Option B: Route to a Teleradiology Company */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const siteId = e.target.value;
                            updateStudy(study.id, {
                              siteId: siteId,
                              assignmentRequest: {
                                ...req,
                                status: "Assigned",
                                resolvedAt: new Date().toISOString(),
                                resolvedType: "TELERADIOLOGY_COMPANY",
                                routedSiteId: siteId,
                              },
                            });
                          }
                        }}
                        className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- Route to Teleradiology Company --</option>
                        {sites
                          .filter((s) => s.organizationType === "COMPANY_MANAGED" || !s.organizationType)
                          .map((site) => (
                            <option key={site.id} value={site.id}>
                              🏢 {site.name} {site.city ? `(${site.city})` : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Row 1: Primary */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Primary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl border border-indigo-400/20 flex flex-col justify-between shadow-[0_8px_30px_rgb(99,102,241,0.2)] text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-black text-lg bg-white/20 px-2 py-0.5 rounded-lg">
                  ₹
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight mb-1">
                  {sites.reduce((acc, s) => acc + (s.walletBalance || 0), 0) +
                    hospitals.reduce(
                      (acc, h) => acc + (h.walletBalance || 0),
                      0,
                    )}
                </h3>
                <p className="text-[11px] text-indigo-100 font-bold uppercase tracking-widest">
                  Total Funds
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-6 rounded-2xl border-t-4 border-t-blue-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700 shadow-sm border border-blue-200">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-blue-950 tracking-tight mb-1">
                  {scopedSites.length}
                </h3>
                <p className="text-[11px] text-blue-600/80 font-bold uppercase tracking-widest">
                  Organizations
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F0FDF4] p-6 rounded-2xl border-t-4 border-t-emerald-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shadow-sm border border-emerald-200">
                  <HeartPulse className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-emerald-950 tracking-tight mb-1">
                  {scopedHospitals.length}
                </h3>
                <p className="text-[11px] text-emerald-600/80 font-bold uppercase tracking-widest">
                  Active Centres
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#FFFBEB] p-6 rounded-2xl border-t-4 border-t-amber-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-100/50 rounded-full blur-xl group-hover:bg-amber-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shadow-sm border border-amber-200">
                  <UserRound className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-amber-950 tracking-tight mb-1">
                  {radiologists.length}
                </h3>
                <p className="text-[11px] text-amber-600/80 font-bold uppercase tracking-widest">
                  Radiologists
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F5F3FF] p-6 rounded-2xl border-t-4 border-t-purple-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-purple-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-100/50 rounded-full blur-xl group-hover:bg-purple-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-700 shadow-sm border border-purple-200">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-purple-950 tracking-tight mb-1">
                  {studies.length}
                </h3>
                <p className="text-[11px] text-purple-600/80 font-bold uppercase tracking-widest">
                  Studies Today
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 2: Operations */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-gradient-to-r from-[#F1F5F9] to-white p-5 rounded-2xl border-l-4 border-l-slate-400 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                  Pending Studies
                </p>
                <h3 className="text-2xl font-black text-slate-800">
                  {studies.filter((s) => s.status === "Pending").length}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#FEF2F2] to-white p-5 rounded-2xl border-l-4 border-l-rose-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md hover:shadow-rose-500/10 transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1">
                  STAT / Emergency
                </p>
                <h3 className="text-2xl font-black text-rose-700">
                  {
                    studies.filter(
                      (s) =>
                        s.priority === "STAT" ||
                        s.priority === "Emergency" ||
                        s.reportingStatus === "Critical" ||
                        s.isCritical === true,
                    ).length
                  }
                </h3>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600 border border-rose-200 shadow-sm group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#FFF7ED] to-white p-5 rounded-2xl border-l-4 border-l-orange-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">
                  TAT Breached
                </p>
                <h3 className="text-2xl font-black text-orange-700">0</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600 border border-orange-200 shadow-sm group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#F0FDF4] to-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">
                  Reports Completed
                </p>
                <h3 className="text-2xl font-black text-emerald-700">
                  {
                    studies.filter(
                      (s) =>
                        s.status === "Completed" ||
                        s.status === "Final" ||
                        ["Final", "Verified", "Dispatched"].includes(
                          s.reportingStatus,
                        ),
                    ).length
                  }
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 border border-emerald-200 shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 3: Analytics */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Live Operations & Telemetry Analytics
            </h2>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: 7-day Studies Trend */}
            <div className="bg-white p-5 rounded-2xl border-t-4 border-t-blue-500 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    7-Day Studies Trend
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Volume & Reporting Velocity
                  </p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="studyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="studies"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#studyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Modality Distribution */}
            <div className="bg-white p-5 rounded-2xl border-t-4 border-t-teal-500 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Modality Distribution
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Breakdown by Imaging Type
                  </p>
                </div>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <PieChartIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={modalityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {modalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 border-t border-slate-100">
                {modalityData.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span>
                      {m.name}: {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: TAT Performance */}
            <div className="bg-white p-5 rounded-2xl border-t-4 border-t-purple-500 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    TAT & Status Breakdown
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Fulfillment Efficiency
                  </p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tatData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {tatData.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 4: Organization table */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Organization Directory
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Centres
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Radiologists
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Studies Today
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {scopedSites.slice(0, 5).map((site) => {
                    const siteHospIds = hospitals
                      .filter((h) => h.parentSiteId === site.id)
                      .map((h) => h.id);
                    const siteStudiesCount = studies.filter(
                      (s) =>
                        s.siteId === site.id ||
                        siteHospIds.includes(s.hospitalId),
                    ).length;
                    const siteRadiologistsCount =
                      radiologists.filter((r) => r.siteId === site.id).length ||
                      users.filter(
                        (u) =>
                          u.role === "RADIOLOGIST" &&
                          (u.siteId === site.id || !u.siteId),
                      ).length;

                    return (
                      <tr
                        key={site.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        onClick={() => navigate("/unnathi/sites")}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-black text-[#10263D] group-hover:text-[#176B73] transition-colors">
                          {site.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">
                          {site.organizationType === "COMPANY_MANAGED"
                            ? "Teleradiology"
                            : "Company"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                          {siteHospIds.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                          {siteRadiologistsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                          {siteStudiesCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">
                          {site.settings?.accountType || "Trial"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Row 4.5: Scans & Reports Financial & Operational Analytics */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-50 text-[#176B73] rounded-lg border border-teal-100">
                  <Scan className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-black text-[#10263D] tracking-tight">
                  Facility Scans & Reports Financial Breakdown
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Comprehensive tracking of scan modalities, report generation status, and calculated costs across all hospitals & teleradiology companies
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setBreakdownTypeFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition-all ${breakdownTypeFilter === "ALL" ? "bg-white text-[#10263D] shadow-xs" : "hover:text-[#10263D]"}`}
                >
                  All ({scanningAndReportsAnalytics.allGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownTypeFilter("HOSPITAL")}
                  className={`px-3 py-1 rounded-lg transition-all ${breakdownTypeFilter === "HOSPITAL" ? "bg-white text-[#176B73] shadow-xs" : "hover:text-[#10263D]"}`}
                >
                  Hospitals
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownTypeFilter("TELERADIOLOGY")}
                  className={`px-3 py-1 rounded-lg transition-all ${breakdownTypeFilter === "TELERADIOLOGY" ? "bg-white text-indigo-600 shadow-xs" : "hover:text-[#10263D]"}`}
                >
                  Teleradiology
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter facility..."
                  value={breakdownSearch}
                  onChange={(e) => setBreakdownSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-[#176B73] focus:border-[#176B73] w-44"
                />
              </div>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-teal-50/70 to-white p-4 rounded-xl border border-teal-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-teal-700">Total Scans Performed</p>
                <p className="text-2xl font-black text-[#10263D] mt-0.5">{scanningAndReportsAnalytics.grandTotalScans}</p>
                <span className="text-[10px] font-semibold text-slate-400">Across all modalities</span>
              </div>
              <div className="p-3 bg-teal-100/60 text-[#176B73] rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/70 to-white p-4 rounded-xl border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Completed Reports</p>
                <p className="text-2xl font-black text-[#10263D] mt-0.5">{scanningAndReportsAnalytics.grandTotalReports}</p>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {scanningAndReportsAnalytics.grandTotalScans > 0
                    ? `${Math.round((scanningAndReportsAnalytics.grandTotalReports / scanningAndReportsAnalytics.grandTotalScans) * 100)}% verified / dispatched`
                    : "0%"}
                </span>
              </div>
              <div className="p-3 bg-emerald-100/60 text-emerald-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/70 to-white p-4 rounded-xl border border-indigo-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Total Billing / Cost</p>
                <p className="text-2xl font-black text-indigo-950 mt-0.5">₹ {scanningAndReportsAnalytics.grandTotalCost}</p>
                <span className="text-[10px] font-semibold text-indigo-600">Sum of modality scan rates</span>
              </div>
              <div className="p-3 bg-indigo-100/60 text-indigo-700 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Breakdown Cards & Tables by Facility */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-slate-400">
                No facilities match your search or filter.
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isExpanded = expandedFacilityId === group.id;
                const isTelerad = group.facilityType === "TELERADIOLOGY";

                return (
                  <div key={group.id} className="transition-colors hover:bg-slate-50/40">
                    {/* Facility Header Row */}
                    <div
                      onClick={() => setExpandedFacilityId(isExpanded ? null : group.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isTelerad
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}
                        >
                          {isTelerad ? <Building2 className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-[#10263D] text-base hover:text-[#176B73] transition-colors">
                              {group.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                                isTelerad
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {group.typeLabel}
                            </span>
                            {group.city && (
                              <span className="text-[11px] font-semibold text-slate-400">
                                • {group.city}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {group.parentOrgName}
                          </p>
                        </div>
                      </div>

                      {/* Stat Metrics & Quick Tags */}
                      <div className="flex items-center gap-4 sm:gap-6 ml-11 md:ml-0 flex-wrap">
                        {/* Modality Badges */}
                        <div className="hidden lg:flex items-center gap-1.5">
                          {group.modalityBreakdown.length > 0 ? (
                            group.modalityBreakdown.map((m) => (
                              <span
                                key={m.modality}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {m.modality}: <span className="font-black text-[#10263D]">{m.count}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">No scans recorded</span>
                          )}
                        </div>

                        {/* Total Scans */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scans</p>
                          <p className="text-sm font-black text-[#10263D]">{group.totalScans}</p>
                        </div>

                        {/* Reports Status */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports</p>
                          <div className="flex items-center gap-1 text-xs font-black">
                            <span className="text-emerald-600">{group.completedReports} Done</span>
                            {group.pendingReports > 0 && (
                              <span className="text-amber-500">/ {group.pendingReports} Pend</span>
                            )}
                          </div>
                        </div>

                        {/* Calculated Cost */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
                          <p className="text-sm font-black text-emerald-600">₹ {group.totalCost}</p>
                        </div>

                        {/* Expand/Collapse Chevron */}
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ml-2"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-[#176B73]" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail View: Nested Hospitals, Modality Breakdown & Studies */}
                    {isExpanded && (
                      <div className="bg-slate-50/70 p-5 border-t border-slate-100 space-y-5">
                        {/* If this is a Teleradiology Site, display its Hospitals strip */}
                        {isTelerad && group.hospitals && group.hospitals.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                                Associated Hospitals under {group.name} ({group.hospitals.length})
                              </h4>
                              <span className="text-[11px] font-semibold text-slate-400">
                                Real-time hospital operational breakdown
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {group.hospitals.map((hosp) => (
                                <div
                                  key={hosp.id}
                                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-black text-[#10263D] text-sm">
                                        {hosp.name}
                                      </h5>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {hosp.city ? `${hosp.city} • ` : ""}{hosp.accountType} Account
                                      </span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-100">
                                      {hosp.totalScans} Scan{hosp.totalScans === 1 ? "" : "s"}
                                    </span>
                                  </div>

                                  {/* Modality Chips for this Hospital */}
                                  <div className="flex flex-wrap gap-1">
                                    {hosp.modalityBreakdown.length > 0 ? (
                                      hosp.modalityBreakdown.map((m) => (
                                        <span
                                          key={m.modality}
                                          className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-700"
                                        >
                                          {m.modality}: {m.count} (₹{m.totalCost})
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">No scans yet</span>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-emerald-600 font-bold">
                                      {hosp.completedReports} Done / {hosp.pendingReports} Pend
                                    </span>
                                    <span className="font-black text-emerald-600">
                                      ₹ {hosp.totalCost}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {group.modalityBreakdown.length === 0 ? (
                          <p className="text-xs font-semibold text-slate-400 italic py-2">
                            No study records or scans uploaded for this facility yet.
                          </p>
                        ) : (
                          <>
                            {/* Modality Cost Cards */}
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                <Scan className="w-3.5 h-3.5 text-teal-600" />
                                Modality Tariff & Volume Breakdown
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {group.modalityBreakdown.map((item) => (
                                  <div
                                    key={item.modality}
                                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-50 text-[#176B73] border border-teal-100">
                                        {item.modality}
                                      </span>
                                      <span className="text-xs font-black text-slate-800">
                                        {item.count} scan{item.count === 1 ? "" : "s"}
                                      </span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                      <span className="text-slate-400 font-semibold">Rate: ₹{item.unitCost}</span>
                                      <span className="font-black text-emerald-600">₹{item.totalCost}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                                      <span className="text-emerald-600">{item.reportedCount} reported</span>
                                      {item.pendingCount > 0 && (
                                        <span className="text-amber-500">{item.pendingCount} pending</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Individual Studies and Cost Table */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                              <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[#176B73]" />
                                  Individual Scan Reports & Cost Breakdown
                                </span>
                                <span className="text-xs font-bold text-slate-500">
                                  {group.totalScans} Total Studies Recorded
                                </span>
                              </div>
                              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                                <table className="min-w-full divide-y divide-slate-100 text-xs">
                                  <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Case #
                                      </th>
                                      <th className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Patient Name
                                      </th>
                                      <th className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Scanning Type (Modality)
                                      </th>
                                      <th className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Body Part
                                      </th>
                                      <th className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Report Status
                                      </th>
                                      <th className="px-4 py-2.5 text-right font-black text-slate-500 uppercase tracking-wider text-[10px]">
                                        Scanning & Report Cost
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {group.modalityBreakdown
                                      .flatMap((m) => m.studies)
                                      .map((std) => {
                                        const isReportFinal = [
                                          "Final",
                                          "Verified",
                                          "Dispatched",
                                        ].includes(std.reportingStatus);

                                        return (
                                          <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-2 font-mono font-bold text-slate-700">
                                              {std.caseNumber}
                                            </td>
                                            <td className="px-4 py-2 font-black text-slate-900">
                                              {std.patientName}
                                            </td>
                                            <td className="px-4 py-2">
                                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                                                {std.modality}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 font-semibold text-slate-600">
                                              {std.bodyPart}
                                            </td>
                                            <td className="px-4 py-2">
                                              <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                  isReportFinal
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}
                                              >
                                                {std.reportingStatus}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-black text-emerald-600">
                                              ₹ {std.cost}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Row 5: Platform health */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Platform Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white text-blue-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Database className="w-6 h-6 text-blue-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-widest mb-1">
                  Total Storage
                </p>
                <p className="text-xl font-black">{Math.max(1, studies.length * 45)} MB</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white text-emerald-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="w-6 h-6 text-emerald-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-widest mb-1">
                  Monthly Studies
                </p>
                <p className="text-xl font-black">{studies.length}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F8FAFC] to-white text-slate-900 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cloud className="w-6 h-6 text-cyan-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                  DICOM Uploads
                </p>
                <p className="text-xl font-black">{studies.length}/hr</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F5F3FF] to-white text-purple-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-6 h-6 text-purple-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-purple-600/80 font-bold uppercase tracking-widest mb-1">
                  Avg Study Size
                </p>
                <p className="text-xl font-black">45 MB</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#FFFBEB] to-white text-amber-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="w-6 h-6 text-amber-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-amber-600/80 font-bold uppercase tracking-widest mb-1">
                  Radiologists
                </p>
                <p className="text-xl font-black">0 Online</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] border border-emerald-400/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
              <Network className="w-6 h-6 text-white mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-1">
                  System Health
                </p>
                <p className="text-xl font-black text-white">Optimal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col mb-4">
        <h1 className="text-3xl font-black text-[#10263D] tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-[#176B73]" />
          Company Dashboard
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-1 pl-9">
          Overview of your organization and associated facilities
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
      >
        {stats.map((stat, i) => {
          const bgColors = {
            emerald:
              "from-emerald-500 to-emerald-700 shadow-[0_8px_30px_rgb(16,185,129,0.3)]",
            indigo:
              "from-indigo-500 to-indigo-700 shadow-[0_8px_30px_rgb(99,102,241,0.3)]",
            blue: "from-blue-500 to-blue-700 shadow-[0_8px_30px_rgb(59,130,246,0.3)]",
            rose: "from-rose-500 to-rose-700 shadow-[0_8px_30px_rgb(244,63,94,0.3)]",
            amber:
              "from-amber-500 to-amber-700 shadow-[0_8px_30px_rgb(245,158,11,0.3)]",
          };
          return (
            <div
              key={stat.label}
              onClick={() => navigate(stat.link)}
              className={`bg-gradient-to-br ${bgColors[stat.color] || bgColors.blue} p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44`}
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div
                  className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-inner`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.badge && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight mb-1 truncate">
                  {stat.value}
                </h3>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                  {stat.label}
                </p>
                {stat.subLabel && (
                  <p className="text-[10px] font-medium text-white/70 mt-0.5 truncate">
                    {stat.subLabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Organization Hierarchy */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-[#10263D]">
            Organization Hierarchy Overview
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Structured view of sites and their associated hospitals
          </p>
        </div>

        <div className="p-6 space-y-6">
          {scopedSites.map((company) => (
            <div
              key={company.id}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-slate-200 text-[#176B73] rounded-xl shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#10263D] text-lg">
                      {company.name}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {company.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/unnathi/sites")}
                  className="text-xs font-bold text-[#176B73] flex items-center hover:text-[#10263D] transition-colors bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100"
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Direct Company Hospitals */}
              {scopedHospitals.filter((h) => h.parentSiteId === company.id)
                .length > 0 ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scopedHospitals
                    .filter((h) => h.parentSiteId === company.id)
                    .map((hospital) => (
                      <div
                        key={hospital.id}
                        className="group flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-[#176B73]/30 hover:bg-teal-50/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => handleOpenDashboard(hospital.id)}
                      >
                        <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#176B73] border border-slate-100 group-hover:border-teal-100 group-hover:shadow-sm rounded-lg transition-all">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#10263D] group-hover:text-[#176B73] transition-colors">
                            {hospital.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Direct Hospital
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-bold text-slate-400">
                  No hospitals mapped to this company yet.
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UnnathiDashboard;
