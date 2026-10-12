import React, { useState } from "react";
import { Save, Server, Globe, Shield, Key, Network, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6 w-full max-w-full min-w-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-inner">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              System Settings
            </h1>
            <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
              Configure global platform parameters and integrations
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#102A43] hover:bg-[#1A3A5A] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all border border-transparent cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Configurations
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm font-bold shadow-sm animate-unnathi-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Platform configurations saved and synchronized successfully!</span>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-full min-w-0">
        {/* Navigation Sidebar */}
        <div className="col-span-1 space-y-3 min-w-0">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-black flex items-center transition-all duration-300 ${
              activeTab === "general"
                ? "bg-primary text-white shadow-md hover:-translate-y-0.5"
                : "bg-card text-slate-500 hover:text-primary hover:bg-accent/5 border border-border shadow-sm hover:shadow"
            }`}
          >
            <Globe className="w-5 h-5 mr-3" /> General
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-black flex items-center transition-all duration-300 ${
              activeTab === "integrations"
                ? "bg-primary text-white shadow-md hover:-translate-y-0.5"
                : "bg-card text-slate-500 hover:text-primary hover:bg-accent/5 border border-border shadow-sm hover:shadow"
            }`}
          >
            <Network className="w-5 h-5 mr-3" /> Integrations
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-black flex items-center transition-all duration-300 ${
              activeTab === "security"
                ? "bg-primary text-white shadow-md hover:-translate-y-0.5"
                : "bg-card text-slate-500 hover:text-primary hover:bg-accent/5 border border-border shadow-sm hover:shadow"
            }`}
          >
            <Shield className="w-5 h-5 mr-3" /> Security
          </button>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-3 min-w-0 w-full max-w-full">
          {activeTab === "general" && (
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
              <div className="bg-slate-50/50 border-b border-border p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                  <Globe className="w-4 h-4 mr-2" /> Global Settings
                </h3>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Platform Name
                  </label>
                  <Input
                    defaultValue="Unnathi Teleradiology Cloud"
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    defaultValue="support@unnathi.com"
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-primary">
                      Maintenance Mode
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      Temporarily disable platform access for all users except
                      Super Admins
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
              <div className="bg-slate-50/50 border-b border-border p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                  <Network className="w-4 h-4 mr-2" /> HL7 & PACS Integrations
                </h3>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    DICOM Node AE Title
                  </label>
                  <Input
                    defaultValue="UNNATHI_PACS"
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Primary DICOM Port
                  </label>
                  <Input
                    type="number"
                    defaultValue={104}
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-primary">
                      Enable HL7 Auto-Routing
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      Automatically route incoming HL7 ORM messages to mapped
                      radiologists
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A6A8]"></div>
                  </label>
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-primary">
                      API Webhooks
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      Send event payloads to external systems when reports are
                      finalized.
                    </p>
                  </div>
                  <Input
                    type="url"
                    placeholder="https://external-system.com/webhook"
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up w-full max-w-full min-w-0">
              <div className="bg-slate-50/50 border-b border-border p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                  <Key className="w-4 h-4 mr-2" /> Security & Access Controls
                </h3>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-primary">
                      Enforce Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      Require all administrative users to use 2FA for login
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A6A8]"></div>
                  </label>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Session Timeout (Minutes)
                  </label>
                  <Input
                    type="number"
                    defaultValue={30}
                    className="h-11 rounded-xl border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-sm font-bold shadow-inner transition-all w-full"
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Users will be automatically logged out after this period of
                    inactivity.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    IP Whitelisting
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter IP addresses (comma separated)"
                    className="w-full h-24 rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm font-mono outline-none focus-visible:bg-white focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner resize-none transition-all"
                    defaultValue="192.168.1.1, 10.0.0.1"
                  ></textarea>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Only allow dashboard access from these IP addresses. Leave
                    blank to allow all.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
