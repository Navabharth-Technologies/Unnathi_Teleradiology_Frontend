import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Server,
  Shield,
  Database,
  Bell,
  Mail,
  HardDrive,
  Key,
  FileJson,
  X,
  Save,
  Plus,
  Activity,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function Utilities() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const utilityCards = [
    {
      title: "System Configuration",
      desc: "Manage global system parameters and locale settings.",
      icon: Settings,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "DICOM Nodes",
      desc: "Configure PACS nodes, AE titles, IPs, and ports.",
      icon: Server,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Modality Setup",
      desc: "Manage imaging modalities and equipment codes.",
      icon: Activity,
      color: "text-accent",
      bg: "bg-accent/10",
      link: "/utilities/modality",
    },
    {
      title: "User Roles & Permissions",
      desc: "Define access control lists for different staff roles.",
      icon: Shield,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Database Management",
      desc: "Backup, restore, and optimize database tables.",
      icon: Database,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Notification Rules",
      desc: "Set up SMS and Email alerts for critical reports.",
      icon: Bell,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Email Templates",
      desc: "Customize report delivery and invoice emails.",
      icon: Mail,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Storage Management",
      desc: "Configure cloud buckets and auto-archiving rules.",
      icon: HardDrive,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "API Keys",
      desc: "Manage webhook integrations and external API access.",
      icon: Key,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Audit Logs",
      desc: "View system activity and user action history.",
      icon: FileJson,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
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
      case "System Configuration":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                Timezone
              </label>
              <select className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm">
                <option>Asia/Kolkata (IST)</option>
                <option>America/New_York (EST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                Date Format
              </label>
              <select className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Enable Two-Factor Authentication System-wide
              </span>
            </div>
          </div>
        );
      case "DICOM Nodes":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-foreground">
                Configured Nodes
              </h4>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Node
              </Button>
            </div>
            <div className="bg-muted/30 border border-border rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  MAIN_PACS_SERVER
                </div>
                <div className="text-xs text-muted-foreground">
                  192.168.1.100 : 104
                </div>
              </div>
              <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                Online
              </span>
            </div>
            <div className="bg-muted/30 border border-border rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  BACKUP_ARCHIVE
                </div>
                <div className="text-xs text-muted-foreground">
                  192.168.1.101 : 11112
                </div>
              </div>
              <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                Online
              </span>
            </div>
          </div>
        );
      case "Database Management":
        return (
          <div className="space-y-4">
            <div className="bg-accent/10 border border-accent/20 p-3 rounded-md text-sm text-accent font-medium">
              Last backup was performed <strong>2 hours ago</strong>. Database
              health is good.
            </div>
            <Button className="w-full">Trigger Manual Backup</Button>
            <Button variant="outline" className="w-full">
              Optimize Tables (Vacuum)
            </Button>
          </div>
        );
      case "Notification Rules":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  Critical Finding Alerts
                </div>
                <div className="text-xs text-muted-foreground">
                  Send SMS when TAT is breached by 1 hour.
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  Daily Digest
                </div>
                <div className="text-xs text-muted-foreground">
                  Email summary of completed reports to Admin.
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>
        );
      case "User Roles & Permissions":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                Configured Roles
              </h4>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Role
              </Button>
            </div>
            <div className="space-y-2">
              <div className="bg-muted/30 border border-border rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    Super Admin
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Full system access
                  </div>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                  All Access
                </span>
              </div>
              <div className="bg-muted/30 border border-border rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    Radiologist
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reporting and viewing
                  </div>
                </div>
                <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                  Restricted
                </span>
              </div>
            </div>
          </div>
        );
      case "Email Templates":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                Select Template
              </label>
              <select className="w-full h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm">
                <option>Report Ready Notification</option>
                <option>New User Welcome</option>
                <option>Monthly Invoice</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                Subject Line
              </label>
              <Input defaultValue="Your Radiological Report is Ready [{{PatientName}}]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                Body content (HTML Allowed)
              </label>
              <textarea
                className="w-full h-32 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm resize-none font-mono text-xs"
                defaultValue="<p>Dear {{PatientName}},</p><p>Your radiological report is now available.</p>"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Configuration options for this utility will be available in the next
            update.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            System Utilities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and manage core system parameters and backend services
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {utilityCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => {
                if (card.link) navigate(card.link);
                else setActiveModal(card.title);
              }}
              className="bg-card rounded-lg p-5 shadow-sm border border-border hover:shadow-level-1 hover:border-foreground/30 transition-all duration-200 cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-center mb-3">
                <div
                  className={`p-2 rounded-md ${card.bg} ${card.color} shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="ml-3 font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {card.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-auto">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dynamic Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-lg shadow-level-3 border border-border flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 border-b border-border bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">
                {activeModal}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">{renderModalContent()}</div>

            <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30 rounded-b-lg">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" /> Save Settings
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
