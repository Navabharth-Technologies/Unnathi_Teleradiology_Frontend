import React, { useState } from 'react';
import { Settings, Save, Server, Globe, Shield, Key, Network } from 'lucide-react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-unnathi-fade-in pb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D2461]">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global platform parameters and integrations</p>
        </div>
        <button className="bg-[#0D2461] hover:bg-[#0D2461]/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Save Configurations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center shadow-sm transition-colors ${activeTab === 'general' ? 'bg-[#0D2461] text-white' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
            <Globe className="w-4 h-4 mr-3" /> General
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center shadow-sm transition-colors ${activeTab === 'integrations' ? 'bg-[#0D2461] text-white' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
            <Server className="w-4 h-4 mr-3" /> Integrations
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center shadow-sm transition-colors ${activeTab === 'security' ? 'bg-[#0D2461] text-white' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
            <Shield className="w-4 h-4 mr-3" /> Security
          </button>
        </div>
        
        <div className="col-span-1 md:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-unnathi-fade-in">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Global Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Platform Name</label>
                  <input type="text" defaultValue="Unnathi Teleradiology Cloud" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Support Email</label>
                  <input type="email" defaultValue="support@unnathi.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Maintenance Mode</h4>
                    <p className="text-xs text-slate-500">Temporarily disable platform access for all users except Super Admins</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-unnathi-fade-in">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center">
                <Network className="w-4 h-4 mr-2" /> HL7 & PACS Integrations
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">DICOM Node AE Title</label>
                  <input type="text" defaultValue="UNNATHI_PACS" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Primary DICOM Port</label>
                  <input type="number" defaultValue={104} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Enable HL7 Auto-Routing</h4>
                    <p className="text-xs text-slate-500">Automatically route incoming HL7 ORM messages to mapped radiologists</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A8CC]"></div>
                  </label>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">API Webhooks</h4>
                  <p className="text-xs text-slate-500 mb-3">Send event payloads to external systems when reports are finalized.</p>
                  <input type="url" placeholder="https://external-system.com/webhook" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-unnathi-fade-in">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center">
                <Key className="w-4 h-4 mr-2" /> Security & Access Controls
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Enforce Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-slate-500">Require all administrative users to use 2FA for login</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A8CC]"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Session Timeout (Minutes)</label>
                  <input type="number" defaultValue={30} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" />
                  <p className="text-xs text-slate-500 mt-1">Users will be automatically logged out after this period of inactivity.</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-1">IP Whitelisting</label>
                  <textarea rows={3} placeholder="Enter IP addresses (comma separated)" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D2461]" defaultValue="192.168.1.1, 10.0.0.1"></textarea>
                  <p className="text-xs text-slate-500 mt-1">Only allow dashboard access from these IP addresses. Leave blank to allow all.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
