import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Server, Users, Shield, Database, Bell, Mail, HardDrive, Key, FileJson, X, Save, Plus, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function Utilities() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const utilityCards = [
    { title: 'System Configuration', desc: 'Manage global system parameters and locale settings.', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'DICOM Nodes', desc: 'Configure PACS nodes, AE titles, IPs, and ports.', icon: Server, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Modality Setup', desc: 'Manage imaging modalities and equipment codes.', icon: Activity, color: 'text-teal-500', bg: 'bg-teal-50', link: '/utilities/modality' },
    { title: 'User Roles & Permissions', desc: 'Define access control lists for different staff roles.', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Database Management', desc: 'Backup, restore, and optimize database tables.', icon: Database, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Notification Rules', desc: 'Set up SMS and Email alerts for critical reports.', icon: Bell, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Email Templates', desc: 'Customize report delivery and invoice emails.', icon: Mail, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { title: 'Storage Management', desc: 'Configure cloud buckets and auto-archiving rules.', icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'API Keys', desc: 'Manage webhook integrations and external API access.', icon: Key, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Audit Logs', desc: 'View system activity and user action history.', icon: FileJson, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setActiveModal(null);
    }, 800);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'System Configuration':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Timezone</label>
              <select className="w-full border-slate-200 rounded-md bg-slate-50 p-2 text-sm focus:ring-1 focus:ring-[#00A8CC] outline-none">
                <option>Asia/Kolkata (IST)</option>
                <option>America/New_York (EST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Date Format</label>
              <select className="w-full border-slate-200 rounded-md bg-slate-50 p-2 text-sm focus:ring-1 focus:ring-[#00A8CC] outline-none">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" defaultChecked className="rounded text-[#00A8CC]" />
              <span className="text-sm font-medium text-slate-700">Enable Two-Factor Authentication System-wide</span>
            </div>
          </div>
        );
      case 'DICOM Nodes':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-slate-700">Configured Nodes</h4>
              <Button size="sm" variant="outline" className="h-7 text-xs border-[#00A8CC] text-[#00A8CC] hover:bg-cyan-50"><Plus className="w-3 h-3 mr-1" /> Add Node</Button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-slate-800">MAIN_PACS_SERVER</div>
                <div className="text-xs text-slate-500">192.168.1.100 : 104</div>
              </div>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Online</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-slate-800">BACKUP_ARCHIVE</div>
                <div className="text-xs text-slate-500">192.168.1.101 : 11112</div>
              </div>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Online</span>
            </div>
          </div>
        );
      case 'Database Management':
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800">
              Last backup was performed <strong>2 hours ago</strong>. Database health is good.
            </div>
            <Button className="w-full bg-[#0D2461] hover:bg-[#081840] text-white">Trigger Manual Backup</Button>
            <Button className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">Optimize Tables (Vacuum)</Button>
          </div>
        );
      case 'Notification Rules':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <div className="font-semibold text-sm text-slate-800">Critical Finding Alerts</div>
                <div className="text-xs text-slate-500">Send SMS when TAT is breached by 1 hour.</div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <div className="font-semibold text-sm text-slate-800">Daily Digest</div>
                <div className="text-xs text-slate-500">Email summary of completed reports to Admin.</div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        );
      case 'User Roles & Permissions':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-700">Configured Roles</h4>
              <Button size="sm" variant="outline" className="h-7 text-xs border-[#00A8CC] text-[#00A8CC] hover:bg-cyan-50"><Plus className="w-3 h-3 mr-1" /> Add Role</Button>
            </div>
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-slate-800">Super Admin</div>
                  <div className="text-xs text-slate-500">Full system access</div>
                </div>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">All Access</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-slate-800">Radiologist</div>
                  <div className="text-xs text-slate-500">Reporting and viewing</div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Restricted</span>
              </div>
            </div>
          </div>
        );
      case 'Email Templates':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Select Template</label>
              <select className="w-full border-slate-200 rounded-md bg-slate-50 p-2 text-sm focus:ring-1 focus:ring-[#00A8CC] outline-none">
                <option>Report Ready Notification</option>
                <option>New User Welcome</option>
                <option>Monthly Invoice</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Subject Line</label>
              <Input defaultValue="Your Radiological Report is Ready [{{PatientName}}]" className="text-sm bg-slate-50" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md h-24 text-xs text-slate-500 overflow-hidden">
              Dear {"{{PatientName}}"}{","}<br/><br/>
              Your {"{{Modality}}"} report is now available on the patient portal...
            </div>
          </div>
        );
      case 'Storage Management':
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">AWS S3 Primary Storage</span>
                <span className="text-xs font-bold text-[#00A8CC]">78% Used</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                <div className="bg-[#00A8CC] h-2 rounded-full w-[78%]"></div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">3.9 TB / 5.0 TB</div>
            </div>
            <div className="flex items-center justify-between border border-slate-200 p-3 rounded-md">
              <div className="text-sm font-semibold text-slate-700">Auto-archive old studies</div>
              <select className="border-none bg-slate-100 text-xs py-1 px-2 rounded outline-none text-slate-600">
                <option>&gt; 3 months</option>
                <option>&gt; 6 months</option>
                <option>&gt; 1 year</option>
              </select>
            </div>
          </div>
        );
      case 'API Keys':
        return (
          <div className="space-y-4">
            <Button size="sm" className="w-full bg-[#00A8CC] hover:bg-[#008ba8] text-white"><Plus className="w-4 h-4 mr-2" /> Generate New API Key</Button>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-sm text-slate-800">External HIS Integration</div>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Never used</span>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-slate-200 px-2 py-1 rounded flex-1 text-slate-600 font-mono tracking-widest">sk_test_••••••••••••8x2a</code>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700">👁</Button>
              </div>
            </div>
          </div>
        );
      case 'Audit Logs':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
              <div className="flex items-center space-x-3 text-xs">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="font-semibold text-slate-700">Admin Login</span>
              </div>
              <span className="text-[10px] text-slate-400">2 mins ago</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
              <div className="flex items-center space-x-3 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-semibold text-slate-700">Config Updated</span>
              </div>
              <span className="text-[10px] text-slate-400">1 hr ago</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
              <div className="flex items-center space-x-3 text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="font-semibold text-slate-700">Failed Login (Admin)</span>
              </div>
              <span className="text-[10px] text-slate-400">5 hrs ago</span>
            </div>
            <Button variant="ghost" className="w-full text-xs text-[#00A8CC]">View Full Logs →</Button>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
            Configure settings for <strong>{activeModal}</strong>. Advanced configurations require super-admin privileges.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative">
      <div className="flex justify-between items-center bg-[#0D2461] p-4 rounded-xl shadow-sm text-white">
        <div>
          <h1 className="text-2xl font-bold">Utilities</h1>
          <p className="text-sm text-blue-200 mt-1">System configuration and advanced settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {utilityCards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => {
              if (card.link) navigate(card.link);
              else setActiveModal(card.title);
            }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[#00A8CC]/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-transparent group-hover:bg-[#00A8CC] transition-colors"></div>
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#0D2461] transition-colors">{card.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0D2461] p-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {activeModal}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {renderModalContent()}
              
              <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-slate-500 hover:bg-slate-100">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-[#00A8CC] hover:bg-[#008ba8] text-white min-w-[100px]"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
