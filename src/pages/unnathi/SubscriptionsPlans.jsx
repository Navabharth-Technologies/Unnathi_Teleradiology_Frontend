import React, { useState } from "react";
import { CreditCard, Search } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";

export default function SubscriptionsPlans() {
  const { sites, hospitals } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");

  const entities = [
    ...sites.map((s) => ({ ...s, entityType: "Company" })),
    ...hospitals.map((h) => ({
      ...h,
      entityType:
        h.organizationType === "COMPANY_MANAGED"
          ? "Company Hospital"
          : "Independent Hospital",
    })),
  ].filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6 w-full max-w-full min-w-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-inner">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Subscriptions & Plans
            </h1>
            <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
              Manage billing plans and commercial models for created organizations
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
        <div className="p-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-72 min-w-0 max-w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 h-11 text-sm font-bold border border-border rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-inner transition-all min-w-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full min-w-0">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Organization Name
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Account Type
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Wallet / Credit Limit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {entities.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    No organizations found. Subscriptions will appear here when a
                    new company or independent hospital is created.
                  </td>
                </tr>
              ) : (
                entities.map((entity) => (
                  <tr
                    key={entity.id}
                    className="hover:bg-accent/5 transition-all duration-300 group hover:-translate-y-[1px] hover:shadow-sm relative z-0 hover:z-10"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary flex items-center">
                      <CreditCard className="w-4 h-4 mr-3 text-slate-400" />{" "}
                      {entity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {entity.entityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {entity.accountType || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">
                      {entity.accountType === "Prepaid" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase tracking-widest">
                          ₹{entity.walletBalance || 0} Wallet
                        </span>
                      ) : entity.accountType === "Postpaid" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 uppercase tracking-widest">
                          ₹{entity.creditLimit || 0} Limit
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
