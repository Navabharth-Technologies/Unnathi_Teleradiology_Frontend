import React, { useState } from 'react';
import { Building, Shield, FileText, Server, HardDrive, Lock, Save, Plus, CheckCircle2 } from 'lucide-react';

const tabs = [
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'templates', label: 'Report Templates', icon: FileText },
  { id: 'dicom', label: 'DICOM Nodes', icon: Server },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'security', label: 'Security & Audit', icon: Lock },
];

const OrganizationTab = () => (
  <div className="space-y-4 max-w-2xl">
    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Organization Details</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
        <input type="text" defaultValue="K-PACS Cloud Diagnostics" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
        <input type="email" defaultValue="admin@k-pacs.cloud" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea rows={3} defaultValue="123 Health Avenue, Medical District" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
      </div>
    </div>
  </div>
);

const RolesTab = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center border-b pb-2">
      <h3 className="text-lg font-bold text-gray-900">Roles & Permissions</h3>
      <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border">Add Role</button>
    </div>
    <table className="w-full text-sm text-left border">
      <thead className="bg-gray-50 border-b">
        <tr><th className="p-3">Role Name</th><th className="p-3">Users</th><th className="p-3">Permissions</th><th className="p-3">Action</th></tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="p-3 font-medium">Super Admin</td><td className="p-3">2</td><td className="p-3">Full Access</td>
          <td className="p-3 text-teal-600 cursor-pointer hover:underline">Edit</td>
        </tr>
        <tr className="border-b">
          <td className="p-3 font-medium">Radiologist</td><td className="p-3">15</td><td className="p-3">Read/Write Reports, View PACS</td>
          <td className="p-3 text-teal-600 cursor-pointer hover:underline">Edit</td>
        </tr>
        <tr>
          <td className="p-3 font-medium">Receptionist</td><td className="p-3">8</td><td className="p-3">Patient Registration, Billing</td>
          <td className="p-3 text-teal-600 cursor-pointer hover:underline">Edit</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const TemplatesTab = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center border-b pb-2">
      <h3 className="text-lg font-bold text-gray-900">Report Templates</h3>
      <button className="text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1 rounded border border-teal-200 flex items-center"><Plus className="w-4 h-4 mr-1"/> New Template</button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {['Normal Chest X-Ray', 'MRI Brain Stroke Protocol', 'CT Abdomen/Pelvis', 'USG Whole Abdomen'].map(t => (
        <div key={t} className="border p-4 rounded-lg flex justify-between items-start hover:shadow-sm bg-gray-50">
          <div>
            <h4 className="font-bold text-gray-800">{t}</h4>
            <p className="text-xs text-gray-500 mt-1">Updated 2 days ago</p>
          </div>
          <div className="flex gap-2">
            <button className="text-teal-600 text-sm hover:underline">Edit</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DicomTab = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center border-b pb-2">
      <h3 className="text-lg font-bold text-gray-900">DICOM Nodes</h3>
      <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border">Add Node</button>
    </div>
    <table className="w-full text-sm text-left border">
      <thead className="bg-gray-50 border-b">
        <tr><th className="p-3">AE Title</th><th className="p-3">IP Address</th><th className="p-3">Port</th><th className="p-3">Description</th></tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="p-3 font-medium">KPACS_CT_01</td><td className="p-3">192.168.1.100</td><td className="p-3">104</td><td className="p-3">Main CT Scanner</td>
        </tr>
        <tr className="border-b">
          <td className="p-3 font-medium">KPACS_MRI_01</td><td className="p-3">192.168.1.101</td><td className="p-3">104</td><td className="p-3">3T MRI Machine</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const StorageTab = () => (
  <div className="space-y-6 max-w-3xl">
    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Storage Configuration</h3>
    
    <div className="grid grid-cols-3 gap-4">
      <div className="border rounded-lg p-4 bg-teal-50 border-teal-200">
        <p className="text-sm text-teal-800 mb-1">Total Cloud Storage</p>
        <p className="text-2xl font-bold text-teal-900">2.5 TB</p>
        <div className="w-full bg-teal-200 rounded-full h-1.5 mt-2"><div className="bg-teal-600 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
        <p className="text-xs text-teal-700 mt-1">45% used of 5TB</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Hot Storage (SSD)</p>
        <p className="text-xl font-bold text-gray-900">800 GB</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Cold Storage (Archive)</p>
        <p className="text-xl font-bold text-gray-900">1.7 TB</p>
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Auto-Archival Rules</h4>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Move studies to Cold Storage after:</span>
        <select className="border border-gray-300 rounded-md p-1.5 text-sm"><option>6 Months</option><option>1 Year</option><option>3 Years</option></select>
      </div>
    </div>
  </div>
);

const SecurityTab = () => (
  <div className="space-y-6 max-w-2xl">
    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Security & Audit Settings</h3>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h4 className="font-medium text-gray-900">Two-Factor Authentication (2FA)</h4>
          <p className="text-sm text-gray-500">Require all staff to use 2FA to access the platform.</p>
        </div>
        <input type="checkbox" className="w-4 h-4 text-teal-600" defaultChecked />
      </div>
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h4 className="font-medium text-gray-900">Session Timeout</h4>
          <p className="text-sm text-gray-500">Automatically log out inactive users.</p>
        </div>
        <select className="border border-gray-300 rounded-md p-1.5 text-sm"><option>15 Minutes</option><option>30 Minutes</option><option>1 Hour</option></select>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Audit Logs</h4>
          <p className="text-sm text-gray-500">HIPAA compliant tracking of all study views and edits.</p>
        </div>
        <button className="text-sm text-teal-600 font-medium hover:underline">Download Report</button>
      </div>
    </div>
  </div>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState('organization');
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization': return <OrganizationTab />;
      case 'roles': return <RolesTab />;
      case 'templates': return <TemplatesTab />;
      case 'dicom': return <DicomTab />;
      case 'storage': return <StorageTab />;
      case 'security': return <SecurityTab />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      {/* Simple Toast Notification */}
      {showToast && (
        <div className="absolute top-0 right-0 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg shadow-sm flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-teal-600" />
          Settings saved successfully.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Settings</h1>
        <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-4 min-h-[500px]">
          <div className="col-span-1 border-r bg-gray-50/50 p-4 space-y-1">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="col-span-3 p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
