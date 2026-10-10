import React from "react";
import { Search, Filter } from "lucide-react";

export default function AuditLogs() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D2461]">
            Platform Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global security and activity monitoring
          </p>
        </div>
        <button
          onClick={() =>
            alert(
              "Advanced filters will be enabled when connected to the live audit database.",
            )
          }
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by IP, User, Action..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D2461] focus:ring-1 focus:ring-[#0D2461]"
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                No audit logs found. Future activity will be recorded here.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
