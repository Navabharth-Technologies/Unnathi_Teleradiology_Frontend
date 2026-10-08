import React from "react";
import { Database, HardDrive, Server } from "lucide-react";

export default function StorageUsage() {
  // To be populated by real-time API
  const [storageData, setStorageData] = React.useState({
    totalAllocated: 0,
    totalUsed: 0,
    available: 0,
  });
  const [topConsumers, setTopConsumers] = React.useState([]);

  const handleDownload = () => {
    alert(
      "Export feature will be available once real-time data is integrated.",
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D2461]">
            Storage & Usage
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor platform-wide storage consumption and resources
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">
              Total Allocated
            </p>
            <h3 className="text-3xl font-black text-[#0D2461]">
              {storageData.totalAllocated} TB
            </h3>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <Server className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">Total Used</p>
            <h3 className="text-3xl font-black text-rose-600">
              {storageData.totalUsed} TB
            </h3>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
            <HardDrive className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">Available</p>
            <h3 className="text-3xl font-black text-emerald-600">
              {storageData.available} TB
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <Database className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-[#0D2461] mb-6">
          Top Consumers by Organization
        </h2>
        <div className="space-y-4">
          {topConsumers.length > 0 ? (
            topConsumers.map((org) => (
              <div key={org.name} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{org.name}</span>
                  <span className="font-bold text-slate-500">
                    {org.used} TB / {org.total} TB (
                    {((Number(org.used) / Number(org.total)) * 100).toFixed(0)}
                    %)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${Number(org.used) / Number(org.total) > 0.75 ? "bg-rose-500" : "bg-cyan-500"}`}
                    style={{
                      width: `${(Number(org.used) / Number(org.total)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium text-slate-500 py-4 text-center">
              Awaiting real-time data synchronization...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
