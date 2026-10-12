import React, { useState, useMemo } from "react";
import { Database, HardDrive, Server, Download, CheckCircle2, Layers, Filter, RefreshCw } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";

export default function StorageUsage() {
  const { sites = [], hospitals = [], studies = [] } = useMockDb();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [filterType, setFilterType] = useState("ALL");

  // Calculate storage per modality (average realistic DICOM size: CT ~55MB, MRI ~70MB, XRAY ~18MB, USG ~24MB, Default ~40MB)
  const modalitySizes = {
    CT: 55,
    MRI: 70,
    "X-RAY": 18,
    XRAY: 18,
    USG: 24,
    ULTRASOUND: 24,
  };

  // Compute organization consumers
  const consumerList = useMemo(() => {
    const list = [];

    // Map parent sites / companies
    sites.forEach((site) => {
      const childHospIds = hospitals
        .filter((h) => h.parentSiteId === site.id)
        .map((h) => h.id);

      const orgStudies = studies.filter(
        (s) => s.siteId === site.id || childHospIds.includes(s.hospitalId)
      );

      const usedMB = orgStudies.reduce((sum, s) => {
        const mod = (s.modality || "CT").toUpperCase();
        return sum + (modalitySizes[mod] || 45);
      }, 0);

      const allocatedGB = 500; // 500 GB standard site tier
      const usedGB = usedMB / 1024;
      const percentage = Math.min(100, Math.max(usedMB > 0 ? 1 : 0, Number(((usedGB / allocatedGB) * 100).toFixed(1))));

      list.push({
        id: site.id,
        name: site.name,
        type: site.organizationType === "COMPANY_MANAGED" ? "Teleradiology Company" : "Hospital Group",
        studiesCount: orgStudies.length,
        usedMB,
        usedGB,
        allocatedGB,
        percentage,
        status: percentage > 85 ? "Critical" : percentage > 60 ? "Warning" : "Optimal",
      });
    });

    // Map independent hospitals
    hospitals
      .filter((h) => !h.parentSiteId || !sites.some((s) => s.id === h.parentSiteId))
      .forEach((hosp) => {
        const orgStudies = studies.filter((s) => s.hospitalId === hosp.id);
        const usedMB = orgStudies.reduce((sum, s) => {
          const mod = (s.modality || "CT").toUpperCase();
          return sum + (modalitySizes[mod] || 45);
        }, 0);

        const allocatedGB = 200; // 200 GB clinic tier
        const usedGB = usedMB / 1024;
        const percentage = Math.min(100, Math.max(usedMB > 0 ? 1 : 0, Number(((usedGB / allocatedGB) * 100).toFixed(1))));

        list.push({
          id: hosp.id,
          name: hosp.name,
          type: "Independent Hospital",
          studiesCount: orgStudies.length,
          usedMB,
          usedGB,
          allocatedGB,
          percentage,
          status: percentage > 85 ? "Critical" : percentage > 60 ? "Warning" : "Optimal",
        });
      });

    return list;
  }, [sites, hospitals, studies]);

  // Overall platform storage stats
  const totalAllocatedTB = 2.0; // 2.0 TB platform cloud capacity
  const totalAllocatedGB = totalAllocatedTB * 1024;
  const totalUsedMB = useMemo(() => {
    return studies.reduce((sum, s) => {
      const mod = (s.modality || "CT").toUpperCase();
      return sum + (modalitySizes[mod] || 45);
    }, 0);
  }, [studies]);

  const totalUsedGB = totalUsedMB / 1024;
  const totalUsedTB = Number((totalUsedGB / 1024).toFixed(4));
  const availableTB = Math.max(0, Number((totalAllocatedTB - totalUsedTB).toFixed(2)));

  // Filtered consumers
  const filteredConsumers = useMemo(() => {
    if (filterType === "ALL") return consumerList;
    return consumerList.filter((c) => c.type.toLowerCase().includes(filterType.toLowerCase()));
  }, [consumerList, filterType]);

  // CSV Report Generator
  const handleDownload = () => {
    try {
      const headers = [
        "Organization Name",
        "Category",
        "Total Studies",
        "Storage Used (MB)",
        "Storage Used (GB)",
        "Allocated Limit (GB)",
        "Utilization Rate (%)",
        "System Status",
        "Exported At",
      ];

      const timestamp = new Date().toLocaleString();
      const rows = consumerList.map((c) => [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.type}"`,
        c.studiesCount,
        c.usedMB.toFixed(2),
        c.usedGB.toFixed(3),
        c.allocatedGB,
        `${c.percentage}%`,
        `"${c.status}"`,
        `"${timestamp}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Unnathi_Storage_Report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6 w-full max-w-full min-w-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0D2461]">
            Storage & Usage
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
            Real-time PACS archive consumption, cloud allocation, and organization quotas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center bg-[#176B73] hover:bg-[#12585F] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm font-bold shadow-sm animate-unnathi-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Storage & Usage report successfully downloaded as CSV!</span>
          </div>
          <button
            onClick={() => setDownloadSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              Total Allocated
            </p>
            <h3 className="text-3xl font-black text-[#0D2461]">
              {totalAllocatedTB.toFixed(1)} TB
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Platform cloud storage pool ({totalAllocatedGB.toLocaleString()} GB)
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
            <Server className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              Total Used
            </p>
            <h3 className="text-3xl font-black text-rose-600">
              {totalUsedGB >= 1
                ? `${totalUsedGB.toFixed(2)} GB`
                : `${totalUsedMB.toFixed(1)} MB`}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {studies.length} active DICOM {studies.length === 1 ? "study" : "studies"} stored
            </p>
          </div>
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100">
            <HardDrive className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              Available
            </p>
            <h3 className="text-3xl font-black text-emerald-600">
              {availableTB.toFixed(2)} TB
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {((availableTB / totalAllocatedTB) * 100).toFixed(1)}% remaining buffer
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
            <Database className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Top Consumers Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-[#0D2461]">
              Top Consumers by Organization
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live consumption breakdown per registered hospital & teleradiology company
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#176B73]/20"
            >
              <option value="ALL">All Categories</option>
              <option value="Teleradiology">Teleradiology Companies</option>
              <option value="Hospital">Hospitals</option>
            </select>
          </div>
        </div>

        <div className="space-y-5">
          {filteredConsumers.length > 0 ? (
            filteredConsumers.map((org) => (
              <div
                key={org.id || org.name}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#10263D]">{org.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-bold uppercase tracking-wider">
                      {org.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-slate-600">
                      {org.studiesCount} {org.studiesCount === 1 ? "Study" : "Studies"}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[#10263D]">
                      {org.usedGB >= 1 ? `${org.usedGB.toFixed(2)} GB` : `${org.usedMB.toFixed(1)} MB`} / {org.allocatedGB} GB
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        org.status === "Optimal"
                          ? "bg-emerald-100 text-emerald-800"
                          : org.status === "Warning"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {org.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      org.status === "Critical"
                        ? "bg-rose-500"
                        : org.status === "Warning"
                        ? "bg-amber-500"
                        : "bg-[#176B73]"
                    }`}
                    style={{
                      width: `${Math.max(2, org.percentage)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 font-semibold text-sm">
              No matching organizations found for the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* Cloud Archive Infrastructure Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">DICOM Compression</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Lossless JPEG-2000 pipeline enabled with 2.8x average storage reduction.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">Auto-Purge & Retention</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Statutory 7-year medical imaging retention policy enforced across all nodes.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">Storage Redundancy</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Triple-replicated geographic backups active with 99.999% SLA uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
