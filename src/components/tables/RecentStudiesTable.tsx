import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRecentStudies } from '../../mock/data';
import { FileSearch } from 'lucide-react';

export const RecentStudiesTable = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border shadow-sm mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileSearch className="w-5 h-5 mr-2 text-teal-600" />
          Recent Studies
        </h3>
        <button 
          onClick={() => navigate('/studies')} 
          className="text-sm text-teal-600 font-medium hover:text-teal-700 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Center</th>
              <th className="px-6 py-3">Modality</th>
              <th className="px-6 py-3">Radiologist</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockRecentStudies.map((study) => (
              <tr key={study.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {study.patientName}
                  <div className="text-xs text-gray-500">{study.patientId}</div>
                </td>
                <td className="px-6 py-4">{study.center}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">
                    {study.modality}
                  </span>
                </td>
                <td className="px-6 py-4">{study.radiologist}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                    study.priority === 'STAT' ? 'bg-red-100 text-red-800 border-red-200' :
                    study.priority === 'Urgent' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {study.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    study.status === 'Verified' ? 'bg-green-100 text-green-800' :
                    study.status === 'Reported' ? 'bg-blue-100 text-blue-800' :
                    study.status === 'Reading' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {study.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate('/pacs')}
                    className="bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white px-3 py-1.5 rounded transition-colors font-medium text-sm"
                  >
                    Open PACS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
