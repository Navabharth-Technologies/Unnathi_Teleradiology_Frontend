import { useAuthStore } from '../store/useAuthStore';

export default function Dashboard() {
  const { currentRole, user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.name}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          {currentRole} Overview
        </h2>
        <p className="text-slate-500">
          This is a placeholder for the {currentRole} dashboard. 
          Use the role switcher in the top right to view different interfaces.
        </p>
      </div>
    </div>
  );
}
