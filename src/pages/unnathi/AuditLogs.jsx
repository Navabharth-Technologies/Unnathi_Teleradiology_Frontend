import React from "react";
import { Search, Filter, ShieldAlert } from "lucide-react";

export default function AuditLogs() {
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
              Global security and activity monitoring
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            alert(
              "Advanced filters will be enabled when connected to the live audit database.",
            )
          }
          className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all border border-border flex items-center shrink-0"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
        <div className="p-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-96 min-w-0 max-w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search logs by IP, User, Action..."
              className="w-full pl-9 pr-4 h-11 text-sm font-bold border border-border rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-inner transition-all min-w-0"
            />
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border text-sm">
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                >
                  No audit logs found. Future activity will be recorded here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
