import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import {
  IndianRupee,
  Download,
  Building2,
  HeartPulse,
  ChevronDown,
  ChevronRight,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function GlobalBilling() {
  const {
    invoices,
    hospitals,
    sites,
    studies,
    templates,
    updateHospital,
    updateSite,
    updateInvoice,
    updateStudy,
  } = useMockDb();
  const { user } = useAuthStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    targetId: "",
    targetType: "hospital",
    amount: "",
    paymentMethod: "NEFT",
    reference: "",
  });

  const handleReceivePayment = (e) => {
    e.preventDefault();
    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0 || !paymentData.targetId) return;

    if (paymentData.targetType === "hospital") {
      const hospital = hospitals.find((h) => h.id === paymentData.targetId);
      if (hospital) {
        if (hospital.accountType === "Prepaid") {
          updateHospital(hospital.id, {
            walletBalance: (hospital.walletBalance || 0) + amount,
          });
        } else {
          // Postpaid: Apply payment to unpaid invoices and studies
          let remaining = amount;
          const unpaidInvoices = invoices.filter(
            (i) => i.targetId === hospital.id && i.targetType === "hospital" && i.status !== "Paid"
          );
          for (const inv of unpaidInvoices) {
            if (remaining >= inv.amount) {
              updateInvoice(inv.id, { status: "Paid" });
              remaining -= inv.amount;
            } else {
              break;
            }
          }
          const unbilledStudies = studies.filter(
            (s) =>
              s.hospitalId === hospital.id &&
              ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) &&
              s.superAdminPaymentStatus !== "Paid",
          );
          unbilledStudies.forEach((s) => updateStudy(s.id, { superAdminPaymentStatus: "Paid" }));
        }
      }
    } else {
      const site = sites.find((s) => s.id === paymentData.targetId);
      if (site) {
        if (site.accountType === "Prepaid") {
          updateSite(site.id, {
            walletBalance: (site.walletBalance || 0) + amount,
          });
        } else {
          // Postpaid: Apply payment to unpaid invoices and studies
          let remaining = amount;
          const unpaidInvoices = invoices.filter(
            (i) => i.targetId === site.id && i.targetType === "site" && i.status !== "Paid"
          );
          for (const inv of unpaidInvoices) {
            if (remaining >= inv.amount) {
              updateInvoice(inv.id, { status: "Paid" });
              remaining -= inv.amount;
            } else {
              break;
            }
          }
          const unbilledStudies = studies.filter(
            (s) =>
              s.siteId === site.id &&
              ["Final", "Verified", "Dispatched"].includes(s.reportingStatus) &&
              s.superAdminPaymentStatus !== "Paid",
          );
          unbilledStudies.forEach((s) => updateStudy(s.id, { superAdminPaymentStatus: "Paid" }));
        }
      }
    }
    setShowPaymentModal(false);
    setPaymentData({
      targetId: "",
      targetType: "hospital",
      amount: "",
      paymentMethod: "NEFT",
      reference: "",
    });
  };

  // Scope data based on role
  const scopedSites = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return sites;
    if (user?.role === "SITE_ADMIN")
      return sites.filter((c) => c.id === user.siteId);
    return [];
    return [];
  }, [sites, user]);

  // Hierarchical Data Processing
  const hierarchy = useMemo(() => {
    const data = [];
    // Group by Company -> Hospital
    scopedSites.forEach((company) => {
      const companyHospitals = hospitals.filter(
        (h) => h.parentSiteId === company.id,
      );
      let companyTotal = 0;
      let companyUnpaid = 0;
      const hospitalNodes = companyHospitals.map((hospital) => {
        let hospTotal = 0;
        let hospUnpaid = 0;

        // Hospitals created by Teleradiology Company/Site use Commission Collection model (No invoices/templates)
        const completedStudies = studies.filter(
          (s) =>
            s.hospitalId === hospital.id &&
            ["Final", "Verified", "Dispatched"].includes(s.reportingStatus),
        );

        completedStudies.forEach((s) => {
          const comm =
            hospital.modalityCommissions?.[s.modality] ??
            (s.modality === "MRI"
              ? 150
              : s.modality === "CT"
                ? 100
                : ["X-Ray", "CR", "DR"].includes(s.modality)
                  ? 30
                  : 50);
          hospTotal += comm;
          if (s.superAdminPaymentStatus !== "Paid" && s.paymentStatus !== "Paid") {
            hospUnpaid += comm;
          }
        });

        companyTotal += hospTotal;
        companyUnpaid += hospUnpaid;
        return {
          type: "hospital",
          data: hospital,
          total: hospTotal,
          unpaid: hospUnpaid,
          invoices: [],
        };
      });
      data.push({
        type: "company",
        data: company,
        total: companyTotal,
        unpaid: companyUnpaid,
        children: hospitalNodes,
      });
    });
    // Group Independent Hospitals (Commercial Clients) - strictly Independent hospitals use Invoices & Billing
    if (user?.role === "SUPER_ADMIN") {
      const independentHospitals = hospitals.filter(
        (h) => !h.parentSiteId && (h.organizationType === "UNNATHI_MANAGED" || h.organizationType === "Independent" || !h.organizationType),
      );
      if (independentHospitals.length > 0) {
        let indTotal = 0;
        let indUnpaid = 0;
        const hospitalNodes = independentHospitals.map((hospital) => {
          const hospInvoices = invoices.filter(
            (inv) => inv.hospitalId === hospital.id,
          );
          let hospTotal = hospInvoices.reduce((acc, inv) => acc + inv.amount, 0);
          let hospUnpaid = hospInvoices
            .filter((i) => i.status !== "Paid")
            .reduce((acc, inv) => acc + inv.amount, 0);
          const unbilledStudies = studies.filter(
            (s) =>
              s.hospitalId === hospital.id &&
              ["Final", "Verified", "Dispatched"].includes(
                s.reportingStatus,
              ) &&
              !hospInvoices.some((i) => i.studyId === s.id),
          );

          unbilledStudies.forEach((s) => {
            const template = templates.find(
              (t) =>
                t.hospitalId === hospital.id &&
                t.modality === s.modality &&
                (t.studyName === s.bodyPart ||
                  t.studyName === s.studyDescription),
            );
            const price = template?.price || 500;
            hospTotal += price;
            hospUnpaid += price;
          });

          indTotal += hospTotal;
          indUnpaid += hospUnpaid;
          return {
            type: "hospital",
            data: hospital,
            total: hospTotal,
            unpaid: hospUnpaid,
            invoices: hospInvoices,
          };
        });
        data.push({
          type: "unnathi_managed",
          name: "Independent Hospitals (Commercial Billing)",
          total: indTotal,
          unpaid: indUnpaid,
          children: hospitalNodes,
        });
      }
    }
    return data;
  }, [invoices, hospitals, scopedSites, user, studies, templates]);

  // KPI Calculations (Based on the scoped hierarchy to avoid double-counting or out-of-scope invoices)
  const { totalRevenue, totalPaid, totalUnpaid } = useMemo(() => {
    let rev = 0;
    let unpaid = 0;
    hierarchy?.forEach((node) => {
      rev += node.total;
      unpaid += node.unpaid;
    });
    return {
      totalRevenue: rev,
      totalPaid: rev - unpaid,
      totalUnpaid: unpaid,
    };
  }, [hierarchy]);

  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderHierarchy = (nodes, depth = 0) => {
    return nodes.map((node, index) => {
      const isExpanded =
        !!expandedNodes[`${node.type}-${node.data?.id || "unnathi"}`];
      const hasChildren = node.children && node.children.length > 0;
      const id = `${node.type}-${node.data?.id || "unnathi"}`;
      return (
        <React.Fragment key={id}>
          <tr
            className={`border-b border-border hover:bg-slate-50/50 transition-colors ${depth === 0 ? "bg-card" : depth === 1 ? "bg-slate-50/70" : "bg-slate-50/30"}`}
          >
            <td className="px-6 py-5">
              <div
                className="flex items-center"
                style={{ paddingLeft: `${depth * 2}rem` }}
              >
                {
                  hasChildren ? (
                    <button
                      onClick={() => toggleNode(id)}
                      className="mr-2 text-slate-500 hover:text-primary transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <span className="w-6" />
                  ) // spacer
                }

                {node.type === "company" && (
                  <Building2 className="w-4 h-4 text-primary mr-2" />
                )}
                {(node.type === "hospital" ||
                  node.type === "unnathi_managed") && (
                  <HeartPulse className="w-4 h-4 text-accent mr-2" />
                )}

                <span className="font-bold text-primary">
                  {node.data?.name || node.name}
                </span>
                {node.data?.code && (
                  <span className="ml-3 text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-wider uppercase border border-border">
                    {node.data.code}
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              <span className="text-sm font-bold text-slate-800">
                ₹{node.total.toLocaleString("en-IN")}
              </span>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${node.unpaid > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
              >
                ₹{node.unpaid.toLocaleString("en-IN")}
              </span>
            </td>
            <td className="px-6 py-5 whitespace-nowrap text-right">
              {node.type === "hospital" && (
                node.data?.parentSiteId ? (
                  <Link
                    to="/finance/ledger"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:text-primary-hover hover:bg-primary/10 transition-all ml-auto"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Commission Ledger
                  </Link>
                ) : (
                  <button className="text-accent hover:text-accent-hover hover:bg-accent/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-end ml-auto gap-1.5">
                    <FileText className="w-4 h-4" />
                    View Invoices
                  </button>
                )
              )}
            </td>
          </tr>
          {isExpanded &&
            hasChildren &&
            renderHierarchy(node.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-unnathi-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-card p-5 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {user?.role === "SUPER_ADMIN"
              ? "Global Financial Overview"
              : "Company Financial Overview"}
          </h1>
          <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
            {user?.role === "SUPER_ADMIN"
              ? "Platform-wide financial accounts across all networks"
              : "Financial overview for your organization"}
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role === "SUPER_ADMIN" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm font-bold text-sm hover:-translate-y-0.5 duration-300"
            >
              <IndianRupee className="w-4 h-4" />
              Receive Payment
            </button>
          )}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all shadow-sm font-bold text-sm hover:-translate-y-0.5 duration-300">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-unnathi-slide-up">
        <div className="bg-gradient-to-br from-primary to-indigo-900 rounded-2xl shadow-md border border-primary p-6 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <IndianRupee className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <p className="text-[11px] font-black text-white/80 uppercase tracking-widest">
                {user?.role === "SITE_ADMIN" ? "Total Commission Collected" : "Total Network Revenue"}
              </p>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] font-bold text-accent mt-2 bg-accent/10 inline-block px-2 py-0.5 rounded-full border border-accent/20">
              {user?.role === "SITE_ADMIN" ? "Modality Commission Model" : "+12.5% from last month"}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <IndianRupee className="w-32 h-32 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">
              {user?.role === "SITE_ADMIN" ? "Commissions Settled" : "Payments Received"}
            </p>
            <p className="text-4xl font-black text-emerald-600 tracking-tight">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] font-black text-slate-400 mt-2 uppercase tracking-widest">
              {user?.role === "SITE_ADMIN" ? "Settled commission earnings" : "Verified and settled across network"}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <AlertCircle className="w-32 h-32 text-rose-600" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">
              {user?.role === "SITE_ADMIN" ? "Outstanding Commission" : "Total Outstanding"}
            </p>
            <p className="text-4xl font-black text-rose-600 tracking-tight">
              ₹{totalUnpaid.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] font-black text-slate-400 mt-2 uppercase tracking-widest">
              {user?.role === "SITE_ADMIN" ? "Pending commission settlement" : "Pending collection and processing"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="p-5 border-b border-border bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-black text-primary">
            Organizational Ledger
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Expand rows to view Centers and Hospitals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Organization / Entity
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {user?.role === "SITE_ADMIN" ? "Total Commission" : "Total Revenue"}
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {user?.role === "SITE_ADMIN" ? "Outstanding Commission" : "Outstanding Amount"}
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {renderHierarchy(hierarchy)}
              {hierarchy.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No financial data available across the network.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="bg-primary p-5">
              <h2 className="text-lg font-bold text-white">Receive Payment</h2>
              <p className="text-indigo-200 text-xs mt-1">
                Add wallet balance to a site or hospital
              </p>
            </div>

            <form
              onSubmit={handleReceivePayment}
              className="p-6 space-y-5 bg-card"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Organization Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      value="hospital"
                      checked={paymentData.targetType === "hospital"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          targetType: e.target.value,
                          targetId: "",
                        })
                      }
                      className="text-accent focus:ring-accent"
                    />

                    <span className="text-sm font-bold text-slate-700">
                      Hospital
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      value="site"
                      checked={paymentData.targetType === "site"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          targetType: e.target.value,
                          targetId: "",
                        })
                      }
                      className="text-accent focus:ring-accent"
                    />

                    <span className="text-sm font-bold text-slate-700">
                      Site (Company)
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Select{" "}
                  {paymentData.targetType === "hospital" ? "Hospital" : "Site"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={paymentData.targetId}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, targetId: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-border rounded-lg text-sm font-medium bg-background focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none shadow-inner transition-all"
                >
                  <option value="">-- Select --</option>
                  {paymentData.targetType === "hospital"
                    ? hospitals
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))
                    : sites
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Amount Received (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-border rounded-lg text-sm font-medium bg-background focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none shadow-inner transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full h-11 px-3 border border-border rounded-lg text-sm font-medium bg-background focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none shadow-inner transition-all"
                >
                  <option value="NEFT">NEFT / RTGS / IMPS</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Transaction Reference / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR Number or Cash Receipt No"
                  value={paymentData.reference}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      reference: e.target.value,
                    })
                  }
                  className="w-full h-11 px-3 border border-border rounded-lg text-sm font-medium bg-background focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none shadow-inner transition-all"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-primary bg-background border border-border hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 duration-300 flex items-center gap-2"
                >
                  <IndianRupee className="w-4 h-4" />
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
