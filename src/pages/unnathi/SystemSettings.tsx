import React, { useState } from 'react';
import { Settings, Save, Server, Globe, Shield, Key, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global platform parameters and integrations</p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Configurations
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium flex items-center transition-colors ${
              activeTab === 'general' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            }`}>
            <Globe className="w-4 h-4 mr-3" /> General
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium flex items-center transition-colors ${
              activeTab === 'integrations' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            }`}>
            <Server className="w-4 h-4 mr-3" /> Integrations
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium flex items-center transition-colors ${
              activeTab === 'security' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            }`}>
            <Shield className="w-4 h-4 mr-3" /> Security
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader className="border-b border-border pb-4 mb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Global Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Platform Name</label>
                  <Input defaultValue="Unnathi Teleradiology Cloud" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Support Email</label>
                  <Input type="email" defaultValue="support@unnathi.com" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Maintenance Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Temporarily disable platform access for all users except Super Admins</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-destructive peer-checked:border-destructive"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader className="border-b border-border pb-4 mb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Network className="w-4 h-4 mr-2" /> HL7 & PACS Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">DICOM Node AE Title</label>
                  <Input defaultValue="UNNATHI_PACS" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Primary DICOM Port</label>
                  <Input type="number" defaultValue={104} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Enable HL7 Auto-Routing</h4>
                    <p className="text-xs text-muted-foreground mt-1">Automatically route incoming HL7 ORM messages to mapped radiologists</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                  </label>
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">API Webhooks</h4>
                    <p className="text-xs text-muted-foreground mt-1">Send event payloads to external systems when reports are finalized.</p>
                  </div>
                  <Input type="url" placeholder="https://external-system.com/webhook" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader className="border-b border-border pb-4 mb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Key className="w-4 h-4 mr-2" /> Security & Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Enforce Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Require all administrative users to use 2FA for login</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                  </label>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Session Timeout (Minutes)</label>
                  <Input type="number" defaultValue={30} />
                  <p className="text-[10px] text-muted-foreground mt-1">Users will be automatically logged out after this period of inactivity.</p>
                </div>

                <div className="pt-4 border-t border-border space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">IP Whitelisting</label>
                  <textarea rows={3} placeholder="Enter IP addresses (comma separated)" className="w-full h-24 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm resize-none font-mono text-xs" defaultValue="192.168.1.1, 10.0.0.1"></textarea>
                  <p className="text-[10px] text-muted-foreground mt-1">Only allow dashboard access from these IP addresses. Leave blank to allow all.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
