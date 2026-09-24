import React, { useState } from 'react';
import { CheckCircle, XCircle, QrCode, CheckCircle2 } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';

const Verification = () => {
  const { studies, patients, hospitals, radiologists, updateStudy } = useMockDb();
  
  const pendingReports = studies.filter(s => s.reportingStatus === 'Final');
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    pendingReports.length > 0 ? pendingReports[0].id : null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If the currently selected report isn't in pendingReports anymore (because we verified it), reset it
  const selectedReport = pendingReports.find(r => r.id === selectedReportId) || pendingReports[0];
  const hospital = hospitals.find(h => h.id === selectedReport?.hospitalId);
  const patient = patients.find(p => p.id === selectedReport?.patientId);
  const radiologist = radiologists.find(r => r.id === selectedReport?.assignedRadiologistId);

  const handleAction = (action: 'approve' | 'reject') => {
    if (!selectedReport) return;
    
    if (action === 'approve') {
      updateStudy(selectedReport.id, { 
        reportingStatus: 'Verified',
        paymentStatus: 'Unpaid'
      });
    } else {
      updateStudy(selectedReport.id, { reportingStatus: 'Review' });
    }

    // Show toast
    const actionText = action === 'approve' ? 'verified' : 'rejected';
    setToastMessage(`Report for ${patient?.name || 'patient'} has been ${actionText}.`);
    setTimeout(() => setToastMessage(null), 3000);
    
    // Auto-select next item
    const remaining = pendingReports.filter(r => r.id !== selectedReport.id);
    if (remaining.length > 0) {
      setSelectedReportId(remaining[0].id);
    } else {
      setSelectedReportId(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="absolute top-0 right-0 z-50 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg shadow-md flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-teal-600" />
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Verification Queue</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Pending Review ({pendingReports.length})</h2>
          {pendingReports.map(study => (
            <div 
              key={study.id} 
              onClick={() => setSelectedReportId(study.id)}
              className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-colors border-l-4 ${
                selectedReportId === study.id ? 'border-l-teal-500 border-teal-500 bg-teal-50/30' : 'border-l-yellow-400 hover:border-teal-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{patients.find(p => p.id === study.patientId)?.name || 'Unknown'}</h3>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">{study.priority}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{study.modality} - {hospitals.find(h => h.id === study.hospitalId)?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-400">Reported by: {radiologists.find(r => r.id === study.assignedRadiologistId)?.name || 'Unknown'}</p>
            </div>
          ))}
          
          <div className="bg-gray-50 border border-dashed rounded-xl p-4 text-center text-gray-500 text-sm">
            End of queue
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">Report Preview: {patient?.name || 'Unknown'}</h2>
                  <p className="text-sm text-gray-500">{selectedReport.modality} | {selectedReport.studyDate}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('reject')} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium flex items-center border border-red-200 transition-colors">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button onClick={() => handleAction('approve')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Verify
                  </button>
                </div>
              </div>
              
              <div className="p-8 flex-1 bg-gray-200 flex items-center justify-center overflow-y-auto">
                {/* Mock PDF Sheet */}
                <div className="bg-white w-full max-w-2xl min-h-[600px] shadow-lg p-10 font-serif">
                  <div className="border-b-2 border-gray-900 pb-4 mb-6 flex justify-between">
                    <div>
                      <h1 className="text-2xl font-bold uppercase tracking-widest">{hospital?.name || 'Unknown'}</h1>
                      <p className="text-sm text-gray-600">Advanced Diagnostic Imaging</p>
                    </div>
                    <div className="text-right">
                      <QrCode className="w-16 h-16 ml-auto text-gray-800" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                    <div>
                      <p><strong>Patient:</strong> {patient?.name || 'Unknown'}</p>
                      <p><strong>Patient ID:</strong> {patient?.uhid || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Date:</strong> {selectedReport.studyDate}</p>
                      <p><strong>Ref Dr:</strong> {patient?.referringDoctor || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h2 className="font-bold text-lg underline uppercase">{selectedReport.modality} Scan</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold">FINDINGS:</h3>
                      <p className="mt-2 text-justify">Brain parenchyma appears normal in signal intensity. No focal lesion seen in cerebral or cerebellar hemispheres. Ventricles and basal cisterns are normal. Midline structures are centrally placed.</p>
                    </div>
                    <div className="pt-4">
                      <h3 className="font-bold">IMPRESSION:</h3>
                      <p className="mt-2 font-bold uppercase">Normal {selectedReport.modality} Scan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 border rounded-xl text-gray-500 p-12 min-h-[600px]">
              <CheckCircle className="w-16 h-16 text-teal-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">All Caught Up!</h3>
              <p className="mt-2">There are no pending reports to verify in your queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
