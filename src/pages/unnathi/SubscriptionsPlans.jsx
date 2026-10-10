import React from "react";
import { CreditCard, Search } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";

export default function SubscriptionsPlans() {
  const { sites, hospitals } = useMockDb();
  const entities = [
    ...sites.map((s) => ({ ...s, entityType: "Company" })),
    ...hospitals.map((h) => ({
      ...h,
      entityType:
        h.organizationType === "COMPANY_MANAGED"
          ? "Company Hospital"
          : "Independent Hospital",
    })),
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D2461]">
            Subscriptions & Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage billing plans and commercial models for created organizations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D2461] focus:ring-1 focus:ring-[#0D2461]"
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Organization Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Account Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Wallet / Credit Limit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {entities.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No organizations found. Subscriptions will appear here when a
                  new company or independent hospital is created.
                </td>
              </tr>
            ) : (
              entities.map((entity) => (
                <tr key={entity.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0D2461] flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-slate-400" />{" "}
                    {entity.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {entity.entityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                    {entity.accountType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {entity.accountType === "Prepaid"
                      ? `₹${entity.walletBalance || 0} Wallet`
                      : entity.accountType === "Postpaid"
                        ? `₹${entity.creditLimit || 0} Limit`
                        : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
