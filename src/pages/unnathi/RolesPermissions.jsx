import React, { useState } from "react";
import {
  Shield,
  Settings2,
  Plus,
  Search,
  X,
  Check,
  Trash2,
  Edit2,
  Ban,
} from "lucide-react";
import { useMockDb } from "../../store/useMockDb";
import { motion, AnimatePresence } from "framer-motion";

export default function RolesPermissions() {
  const {
    users,
    customRoles,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
  } = useMockDb();

  // Extract unique roles from real-time user data
  const rolesMap = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  let activeRoles = Object.entries(rolesMap).map(([role, count]) => ({
    id: role,
    name: role,
    type: "System Built-in",
    users: count,
    status: "Active",
    description: "",
    permissions: [],
  }));

  // Ensure SUPER_ADMIN always shows if no users exist
  if (activeRoles.length === 0) {
    activeRoles = [
      {
        id: "SUPER_ADMIN",
        name: "SUPER_ADMIN",
        type: "System Built-in",
        users: 1,
        status: "Active",
        description: "",
        permissions: [],
      },
    ];
  }
  // Append custom roles
  const customRoleEntries = (customRoles || []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type || "Custom Role",
    users: 0,
    status: r.status || "Active",
    description: r.description,
    permissions: r.permissions || [],
  }));
  activeRoles = [...activeRoles, ...customRoleEntries];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const openCreateModal = () => {
    setEditingRoleId(null);
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (roleId, name, desc, perms) => {
    setEditingRoleId(roleId);
    setNewRoleName(name);
    setNewRoleDesc(desc || "");
    setSelectedPermissions(perms || []);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this custom role?",
      )
    ) {
      deleteCustomRole(id);
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    updateCustomRole(id, {
      status: currentStatus === "Active" ? "Inactive" : "Active",
    });
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    if (editingRoleId) {
      updateCustomRole(editingRoleId, {
        name: newRoleName,
        description: newRoleDesc,
        permissions: selectedPermissions,
      });
    } else {
      addCustomRole({
        id: `role_${Date.now()}`,
        name: newRoleName,
        description: newRoleDesc,
        permissions: selectedPermissions,
        createdAt: new Date().toISOString(),
        type: "Custom",
        status: "Active",
      });
    }
    setIsModalOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedPermissions([]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary flex items-center">
            <Shield className="w-6 h-6 text-accent mr-2" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage system roles and access control lists
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-hover shadow-sm text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Role
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-unnathi-slide-up">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
          <div className="relative w-72 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search roles..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border bg-background text-primary rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium shadow-inner"
            />
          </div>
          <button className="text-primary text-sm font-bold flex items-center bg-card border border-border px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors">
            <Settings2 className="w-4 h-4 mr-2 text-accent" /> Filter
          </button>
        </div>

        <table className="min-w-full">
          <thead className="bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Role Name
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Type
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Users
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm stagger-children">
            {activeRoles.map((role) => (
              <tr
                key={role.id}
                className="animate-unnathi-fade-in hover:bg-accent/5 hover:-translate-y-[2px] hover:shadow-md hover:z-10 relative bg-card transition-all duration-300 ease-out group"
              >
                <td className="px-6 py-4 font-black text-primary flex flex-col tracking-tight">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-accent" /> {role.name}
                  </div>
                  {role.description && (
                    <div className="text-[10px] font-semibold text-slate-400 mt-1 ml-6">
                      {role.description}
                    </div>
                  )}
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-6">
                      {role.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">
                  {role.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                  {role.users} Active Users
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-[10px] uppercase tracking-widest font-black rounded shadow-sm border ${role.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                  >
                    {role.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {role.type !== "System Built-in" ? (
                      <>
                        <button
                          onClick={() =>
                            handleToggleStatus(role.id, role.status)
                          }
                          title={
                            role.status === "Active"
                              ? "Pause/Disable Role"
                              : "Activate Role"
                          }
                          className="text-amber-500 bg-amber-50 hover:bg-amber-500 hover:text-white p-1.5 rounded-lg border border-transparent hover:border-amber-500/20 transition-all"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            openEditModal(
                              role.id,
                              role.name,
                              role.description || "",
                              role.permissions || [],
                            )
                          }
                          title="Edit Permissions"
                          className="text-accent bg-accent/10 hover:bg-accent hover:text-white p-1.5 rounded-lg border border-transparent hover:border-accent/20 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          title="Permanent Delete"
                          className="text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                        System Default (Read Only)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Custom Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-black text-primary">
                    {editingRoleId ? "Edit Custom Role" : "Create Custom Role"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Define a role and configure its permissions.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Senior Radiologist"
                      className="w-full px-4 py-2.5 text-sm border border-border bg-background text-primary rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      placeholder="Briefly describe the purpose of this role..."
                      className="w-full px-4 py-2.5 text-sm border border-border bg-background text-primary rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium resize-none h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
                      Base Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "View Studies",
                        "Edit Studies",
                        "Finalize Reports",
                        "Manage Users",
                        "View Billing",
                        "System Settings",
                      ].map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center p-3 border border-border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                          <div className="relative flex items-center justify-center w-5 h-5 mr-3 border-2 border-slate-300 rounded group-hover:border-accent transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm)}
                              onChange={() => togglePermission(perm)}
                              className="peer absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 z-10 transition-opacity" />
                            <div className="absolute inset-0 bg-accent scale-0 peer-checked:scale-100 transition-transform rounded-[2px]"></div>
                          </div>
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">
                            {perm}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    {editingRoleId ? "Save Changes" : "Create Role"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
