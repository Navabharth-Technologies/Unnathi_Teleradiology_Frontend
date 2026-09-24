import React, { useState } from 'react';
import { mockRecentStudies } from '../../mock/data';
import { Search, Plus, UserCircle, Phone, Calendar, X } from 'lucide-react';

// Reusing some mock data but acting as patients
const mockPatients = [
  { id: 'P-1001', name: 'Ravi Kumar', age: 45, gender: 'Male', phone: '+91 9876543210', lastStudy: '2026-09-01', totalStudies: 3 },
  { id: 'P-1002', name: 'Anita Desai', age: 32, gender: 'Female', phone: '+91 9876543211', lastStudy: '2026-09-01', totalStudies: 1 },
  { id: 'P-1003', name: 'Vikram Singh', age: 58, gender: 'Male', phone: '+91 9876543212', lastStudy: '2026-08-28', totalStudies: 5 },
  { id: 'P-1004', name: 'Priya Patel', age: 27, gender: 'Female', phone: '+91 9876543213', lastStudy: '2026-08-15', totalStudies: 2 },
  { id: 'P-1005', name: 'Rahul Verma', age: 61, gender: 'Male', phone: '+91 9876543214', lastStudy: '2026-07-10', totalStudies: 8 },
];

const Patients = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 relative">
      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Register Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="Patient Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="Age" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select className="w-full border border-gray-300 rounded-md p-2">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 font-medium bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700">Register</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Patients</h1>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Register Patient
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
              placeholder="Search by name, ID, or phone..."
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2">
              <option>All Centers</option>
              <option>City Scan Center</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Demographics</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Last Study</th>
                <th className="px-6 py-3 text-center">Total Studies</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient) => (
                <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserCircle className="h-10 w-10 text-gray-400" />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {patient.age} Y / {patient.gender}
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {patient.lastStudy}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {patient.totalStudies}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-teal-600 hover:text-teal-900 font-medium text-sm mr-3">View Profile</button>
                    <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">New Order</button>
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

export default Patients;
