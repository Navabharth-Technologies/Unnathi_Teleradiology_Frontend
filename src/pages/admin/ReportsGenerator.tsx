import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Download, FileSpreadsheet, FileText, Settings, 
  BarChart3, CheckCircle, Clock 
} from 'lucide-react';

export default function ReportsGenerator() {
  const [reportType, setReportType] = useState('tat');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [recentExports, setRecentExports] = useState([
    { id: 1, name: 'TAT_Analysis_Aug2026.csv', date: 'Yesterday', type: 'csv' },
    { id: 2, name: 'Billing_Summary_Q3.pdf', date: '3 days ago', type: 'pdf' },
    { id: 3, name: 'Radiologist_Stats.csv', date: 'Last week', type: 'csv' },
  ]);

  const handleGenerate = (format: 'pdf' | 'csv') => {
    if (format === 'csv') setGeneratingCSV(true);
    if (format === 'pdf') setGeneratingPDF(true);

    setTimeout(() => {
      if (format === 'csv') setGeneratingCSV(false);
      if (format === 'pdf') setGeneratingPDF(false);
      
      const newExport = {
        id: Date.now(),
        name: `Custom_${reportType.toUpperCase()}_Report.${format}`,
        date: 'Just now',
        type: format
      };
      
      setRecentExports([newExport, ...recentExports]);
      setSuccessMessage(`Successfully generated ${format.toUpperCase()} report!`);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1500);
  };

  const handleDownloadOld = (name: string) => {
    setSuccessMessage(`Downloading ${name}...`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-unnathi-fade-in relative">
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 right-8 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg shadow-lg border border-emerald-200 flex items-center space-x-2 z-50 animate-in slide-in-from-right duration-300">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-[#0D2461] p-4 rounded-xl shadow-sm text-white">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports Generator</h1>
            <p className="text-sm text-blue-200 mt-1">Export custom operational and financial reports</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generator Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm shadow-slate-200">
            <div className="bg-[#1E293B] p-3 text-white rounded-t-lg flex items-center">
              <Settings className="w-4 h-4 mr-2 text-slate-300" />
              <h2 className="font-bold text-sm tracking-wide uppercase">Report Parameters</h2>
            </div>
            <CardContent className="p-6 space-y-6 bg-white border border-t-0 border-slate-100 rounded-b-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Type</label>
                  <select 
                    className="w-full border-slate-200 rounded-md p-2 h-11 bg-slate-50 focus:ring-2 focus:ring-[#00A8CC] outline-none text-slate-800 font-medium" 
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                  >
                    <option value="tat">TAT Performance Analysis</option>
                    <option value="financial">Financial & Billing Summary</option>
                    <option value="modality">Modality Utilization</option>
                    <option value="radiologist">Radiologist Workload</option>
                    <option value="referring">Referring Doctor Stats</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date From</label>
                  <Input type="date" className="h-11 bg-slate-50" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date To</label>
                  <Input type="date" className="h-11 bg-slate-50" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital / Branch Filter</label>
                  <select className="w-full border-slate-200 rounded-md p-2 h-11 bg-slate-50 focus:ring-2 focus:ring-[#00A8CC] outline-none text-slate-800">
                    <option value="all">All Hospitals</option>
                    <option value="mysore">Mysore Region</option>
                    <option value="bangalore">Bangalore Region</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-6 mt-6 border-t border-slate-100">
                <Button 
                  disabled={generatingCSV || generatingPDF}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all" 
                  onClick={() => handleGenerate('csv')}
                >
                  {generatingCSV ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Generating CSV...
                    </div>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV
                    </>
                  )}
                </Button>
                <Button 
                  disabled={generatingCSV || generatingPDF}
                  className="flex-1 bg-[#00A8CC] hover:bg-[#008ba8] text-white h-12 text-sm font-bold shadow-md shadow-[#00A8CC]/20 transition-all" 
                  onClick={() => handleGenerate('pdf')}
                >
                  {generatingPDF ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Generating PDF...
                    </div>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" /> Export as PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exports Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm shadow-slate-200">
            <div className="bg-[#334155] p-3 text-white rounded-t-lg flex items-center">
              <Clock className="w-4 h-4 mr-2 text-slate-300" />
              <h2 className="font-bold text-sm tracking-wide uppercase">Recent Exports</h2>
            </div>
            <CardContent className="p-0 bg-white border border-t-0 border-slate-100 rounded-b-lg overflow-hidden">
              <div className="divide-y divide-slate-100">
                {recentExports.map(file => (
                  <div key={file.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${file.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {file.type === 'pdf' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-slate-700 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{file.date}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadOld(file.name)}
                      className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#00A8CC] hover:bg-cyan-50 h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
