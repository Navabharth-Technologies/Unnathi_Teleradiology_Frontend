import React, { useState } from 'react';
import { mockCenters } from '../../mock/data';
import { Building2, Plus, Search, MoreVertical, X } from 'lucide-react';

const Centers = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 relative">
      {/* Add Center Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Add New Center</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Center Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. City Scan Center" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Delhi" />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 font-medium bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700">Save Center</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Centers</h1>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Center
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search centers..."
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total Centers: {mockCenters.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Center Info</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Modalities</th>
                <th className="px-6 py-3">Studies Today</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCenters.map((center) => (
                <tr key={center.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{center.name}</div>
                        <div className="text-xs text-gray-500">{center.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{center.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {center.modalities.map(mod => (
                        <span key={mod} className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-200">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{center.studiesToday}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      center.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {center.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Centers;
