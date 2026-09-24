import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Plus, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function ModalityList() {
  const { modalities } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModalities = modalities.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toString().includes(searchTerm)
  );

  const tabs = [
    'Study Name',
    'Modality',
    'Action Needed',
    'DICOM configuration',
    'Settings',
    'Site Note'
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      
      {/* Header section with tabs */}
      <div className="flex space-x-1 border-b-4 border-[#5e6c77] pb-0">
        {tabs.map(tab => (
          <div 
            key={tab} 
            className={`px-6 py-2.5 text-sm font-bold rounded-t-md cursor-pointer transition-colors ${
              tab === 'Modality' 
                ? 'bg-[#5e6c77] text-white' 
                : 'bg-[#e2e8f0] text-slate-600 hover:bg-[#cbd5e1]'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-slate-200">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input 
            placeholder="Search modalities..." 
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-[#00A8CC] hover:bg-[#008ba8] text-white h-9">
          <Plus className="w-4 h-4 mr-2" />
          Add Modality
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-sm text-center">
          <thead className="bg-[#5e6c77] text-white">
            <tr>
              <th className="py-2.5 px-4 font-semibold border-r border-[#7a8b99]">Code</th>
              <th className="py-2.5 px-4 font-semibold border-r border-[#7a8b99]">Modality Name</th>
              <th className="py-2.5 px-4 font-semibold">Modality Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredModalities.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-slate-500">No modalities found matching "{searchTerm}"</td>
              </tr>
            ) : (
              filteredModalities.map((modality, index) => (
                <tr 
                  key={modality.id} 
                  className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#eef2f6]'}`}
                >
                  <td className="py-2.5 px-4 font-bold text-slate-700">{modality.code}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{modality.name}</td>
                  <td className="py-2.5 px-4 text-slate-600">{modality.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
