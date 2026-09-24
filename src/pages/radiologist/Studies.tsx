import React from 'react';
import { RecentStudiesTable } from '../../components/tables/RecentStudiesTable';
import { Filter, Search } from 'lucide-react';

const Studies = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Radiology Worklist</h1>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Search accession, patient, study UID..."
          />
        </div>
        
        <select className="border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-teal-500">
          <option>All Modalities</option>
          <option>MRI</option>
          <option>CT</option>
          <option>X-Ray</option>
          <option>USG</option>
        </select>

        <select className="border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-teal-500">
          <option>All Statuses</option>
          <option>Unassigned</option>
          <option>Reading</option>
          <option>Reported</option>
          <option>Verified</option>
        </select>
        
        <button className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 border">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>

      <RecentStudiesTable />
    </div>
  );
};

export default Studies;
