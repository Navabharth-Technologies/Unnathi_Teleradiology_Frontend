import React, { useState } from 'react';
import { Save, Send, FileCheck2 } from 'lucide-react';
import { useToastStore } from '../../app/store/useToastStore';

const Reporting = () => {
  const { showToast } = useToastStore();

  const handleSave = () => showToast('Draft saved successfully', 'success');
  const handleSubmit = () => showToast('Report submitted for verification', 'success');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Radiology Report Editor</h1>
        <div className="flex gap-3">
          <button onClick={handleSave} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center hover:bg-gray-50">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </button>
          <button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Submit for Verification
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {/* Study Context Panel */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">Study Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Patient:</span> <span className="font-medium">Ravi Kumar (45/M)</span></p>
              <p><span className="text-gray-500">Study:</span> <span className="font-medium">MRI Brain Plain</span></p>
              <p><span className="text-gray-500">Center:</span> <span className="font-medium">City Scan Center</span></p>
              <p><span className="text-gray-500">Date:</span> <span className="font-medium">01 Sep 2026</span></p>
            </div>
            
            <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3 mt-6">Clinical History</h3>
            <p className="text-sm text-gray-700">Headache since 2 weeks. H/o hypertension.</p>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
            <h3 className="font-semibold text-teal-900 mb-2">Templates</h3>
            <select className="w-full border-teal-200 rounded-md text-sm p-2 bg-white">
              <option>Select Template...</option>
              <option>Normal MRI Brain</option>
              <option>MRI Brain with Contrast</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileCheck2 className="w-5 h-5 mr-2 text-teal-600" />
              Findings
            </h3>
            <textarea 
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 resize-none font-sans"
              defaultValue={`Brain parenchyma appears normal in signal intensity.
No focal lesion seen in cerebral or cerebellar hemispheres.
Ventricles and basal cisterns are normal.
Midline structures are centrally placed.`}
            />
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Impression</h3>
            <textarea 
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 resize-none font-bold"
              defaultValue={`Normal MRI Brain.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
