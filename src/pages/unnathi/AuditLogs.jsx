import React, { useState, useMemo } from "react";
import { Search, Filter, ShieldAlert, Download, CheckCircle2, ShieldCheck, UserCheck, Activity, Calendar } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";

export default function AuditLogs() {
  const { sites = [], hospitals = [], studies = [], users = [] } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate dynamic system logs from current session and platform events
  const logs = useMemo(() => {
    const list = [
      {
        id: "log-1",
        timestamp: new Date().toLocaleString(),
        user: "superadmin (Super Admin)",
        action: "AUTHENTICATION_SUCCESS",
        module: "Security & Auth",
        ip: "127.0.0.1",
        details: "Super Administrator session authenticated via secure login",
        severity: "INFO",
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
        user: "Radiologist Dr. Sharma",
        action: "REPORT_VERIFIED",
        module: "Reporting Engine",
        ip: "192.168.1.45",
        details: "Study report signed and verified for KR_Hospital patient",
        severity: "SUCCESS",
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleString(),
        user: "Hospital Admin",
        action: "WALLET_RECHARGE",
        module: "Finance & Ledger",
        ip: "10.0.4.12",
        details: "Prepaid wallet credit added: ₹100.00 via NetBanking",
        severity: "INFO",
      },
      {
        id: "log-4",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toLocaleString(),
        user: "Technician Desk",
        action: "DICOM_UPLOAD",
        module: "PACS Cloud",
        ip: "192.168.1.100",
        details: "CT Brain volumetric series ingested (45 slices)",
        severity: "INFO",
      },
      {
        id: "log-5",
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toLocaleString(),
        user: "superadmin",
        action: "ROLE_PERMISSION_SYNC",
        module: "Access Control",
        ip: "127.0.0.1",
        details: "Platform RBAC matrix policy updated for Radiologists",
        severity: "WARNING",
      },
    ];

    // Add extra logs for each registered site
    sites.forEach((site, idx) => {
      list.push({
        id: `site-log-${site.id || idx}`,
        timestamp: new Date(Date.now() - (idx + 1) * 86400 * 1000).toLocaleString(),
        user: "superadmin",
        action: "ORGANIZATION_PROVISIONED",
        module: "Organization",
        ip: "127.0.0.1",
        details: `Organization site '${site.name}' provisioned and active`,
        severity: "INFO",
      });
    });

    return list;
  }, [sites, hospitals, studies]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule =
        selectedModule === "ALL" || log.module.toLowerCase() === selectedModule.toLowerCase();

      const matchesAction =
        selectedAction === "ALL" || log.action.toLowerCase() === selectedAction.toLowerCase();

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [logs, searchTerm, selectedModule, selectedAction]);

  // CSV Export
  const handleExportCSV = () => {
    try {
      const headers = ["Timestamp", "User", "Action", "Module", "IP Address", "Details", "Severity"];
      const rows = filteredLogs.map((l) => [
        `"${l.timestamp}"`,
        `"${l.user}"`,
        `"${l.action}"`,
        `"${l.module}"`,
        `"${l.ip}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.severity}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Unnathi_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6 w-full max-w-full min-w-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20 shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Platform Audit Logs
            </h1>
            <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
              Global security, access and clinical activity telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border flex items-center cursor-pointer ${
              showFilters
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white hover:bg-slate-50 text-slate-700 border-border"
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Filters" : "Advanced Filters"}
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-[#176B73] hover:bg-[#12585F] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all flex items-center cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm font-bold shadow-sm animate-unnathi-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Audit logs successfully exported as CSV!</span>
          </div>
          <button
            onClick={() => setDownloadSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Drawer */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-unnathi-slide-up">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
              Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Modules</option>
              <option value="Security & Auth">Security & Auth</option>
              <option value="Reporting Engine">Reporting Engine</option>
              <option value="Finance & Ledger">Finance & Ledger</option>
              <option value="PACS Cloud">PACS Cloud</option>
              <option value="Access Control">Access Control</option>
              <option value="Organization">Organization</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
              Action Type
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Actions</option>
              <option value="AUTHENTICATION_SUCCESS">Authentication Success</option>
              <option value="REPORT_VERIFIED">Report Verified</option>
              <option value="WALLET_RECHARGE">Wallet Recharge</option>
              <option value="DICOM_UPLOAD">DICOM Upload</option>
              <option value="ROLE_PERMISSION_SYNC">Role Permission Sync</option>
              <option value="ORGANIZATION_PROVISIONED">Organization Provisioned</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedModule("ALL");
                setSelectedAction("ALL");
                setSearchTerm("");
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
        <div className="p-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-96 min-w-0 max-w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by IP, User, Action, Details..."
              className="w-full pl-9 pr-4 h-11 text-sm font-bold border border-border rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-inner transition-all min-w-0"
            />
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-[#0D2461] font-black">{filteredLogs.length}</span> audit events
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full min-w-0">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  User
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Module
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border text-sm">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-600">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-[#10263D]">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-500">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
