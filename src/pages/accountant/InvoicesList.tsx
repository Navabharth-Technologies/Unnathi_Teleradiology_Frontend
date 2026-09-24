import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, FileText, IndianRupee, X, Loader2, CheckCircle, Receipt, Download, Printer } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import type { Study } from '../../types';

export default function InvoicesList() {
  const { user } = useAuthStore();
  const { invoices, studies, patients, hospitals, addInvoice, updateStudy, updateInvoice } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [generatingForStudy, setGeneratingForStudy] = useState<Study | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('1500');

  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const unbilledStudies = studies.filter(s => {
    if (s.paymentStatus === 'Paid' || !['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus)) return false;
    
    // EXCLUDE if an invoice already exists for this study
    if (invoices.some(i => i.studyId === s.id)) return false;
    
    // Scoping
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') {
      const h = hospitals.find(h => h.id === s.hospitalId);
      return h?.parentSiteId === user.siteId;
    }
    if (user?.hospitalId) return s.hospitalId === user.hospitalId;
    if (selectedHospitalId) return s.hospitalId === selectedHospitalId;
    
    // Fallback: match hospital names dynamically in case of mock DB mismatches
    if ((user?.name || '').toLowerCase().includes('suyog') && (getHospitalName(s.hospitalId) || '').toLowerCase().includes('suyog')) return true;
    
    return false; // Global fallback
  });

  const filteredInvoices = invoices.filter(i => {
    if (!(i.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Scoping
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') {
      const h = hospitals.find(h => h.id === i.hospitalId);
      return h?.parentSiteId === user.siteId;
    }
    if (user?.hospitalId) return i.hospitalId === user.hospitalId;
    if (selectedHospitalId) return i.hospitalId === selectedHospitalId;
    
    // Fallback
    if ((user?.name || '').toLowerCase().includes('suyog') && (getHospitalName(i.hospitalId) || '').toLowerCase().includes('suyog')) return true;

    return false; // Global fallback
  });

  const handleGenerateInvoice = () => {
    if (generatingForStudy) {
      const newInvoice = {
        id: 'inv' + Date.now(),
        studyId: generatingForStudy.id,
        patientId: generatingForStudy.patientId,
        hospitalId: generatingForStudy.hospitalId,
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        amount: parseInt(invoiceAmount),
        status: 'Unpaid' as const,
        date: new Date().toISOString(),
        dueDate: new Date().toISOString()
      };
      addInvoice(newInvoice);
      setGeneratingForStudy(null);
    }
  };

  const handleMarkPaid = () => {
    if (payingInvoice) {
      const inv = invoices.find(i => i.id === payingInvoice);
      if (inv) {
        updateInvoice(inv.id, { status: 'Paid' });
        updateStudy(inv.studyId, { paymentStatus: 'Paid' });
      }
      setPayingInvoice(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !viewingReceipt) return;
    setDownloadingReceipt('downloading');
    
    try {
      // Small delay for UI update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${viewingReceipt.invoiceNumber}.pdf`);
      
      setDownloadingReceipt('success');
      setTimeout(() => {
        setDownloadingReceipt(null);
        setViewingReceipt(null);
      }, 1500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setDownloadingReceipt(null);
    }
  };

  return (
    <>
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Billing & Invoices</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage unbilled studies and generated invoices</p>
          </div>
        </div>
      </div>

      {/* Unbilled Studies Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-amber-50/30 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-amber-900">Unbilled Studies</h2>
            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-1">Requires immediate invoicing</p>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">Case No</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Patient / Hospital</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Modality</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Date</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unbilledStudies.map(study => (
              <TableRow key={study.id} className="hover:bg-amber-50/30 transition-colors border-b border-slate-50">
                <TableCell className="py-4 px-6 font-bold text-slate-800 text-sm">{study.caseNumber}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="font-black text-[#0D2461]">{getPatientName(study.patientId)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{getHospitalName(study.hospitalId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{study.modality}</span>
                </TableCell>
                <TableCell className="py-4 px-4 font-semibold text-slate-600 text-sm">{format(new Date(study.studyDate), 'dd MMM yyyy')}</TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <Button size="sm" onClick={() => {
                    const hosp = hospitals.find(h => h.id === study.hospitalId);
                    const comm = hosp?.modalityCommissions?.[study.modality] || 0;
                    setInvoiceAmount(String(comm));
                    setGeneratingForStudy(study);
                  }} className="h-9 px-4 text-xs font-black rounded-lg bg-[#0D2461] hover:bg-[#081840] text-white shadow-sm shadow-[#0D2461]/20">
                    <FileText className="mr-2 h-3.5 w-3.5" /> Generate Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {unbilledStudies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-emerald-500">
                    <CheckCircle className="h-8 w-8 mb-3 opacity-50" />
                    <p className="text-sm font-bold">All studies are billed!</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-[#0D2461]">Generated Invoices</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track payment statuses</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Invoice Number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px] h-10 rounded-xl bg-white border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold shadow-sm"
            />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">Invoice No</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Patient / Hospital</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Amount</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Date</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Status</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map(inv => (
              <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <TableCell className="py-4 px-6 font-mono text-slate-600 font-bold text-xs">{inv.invoiceNumber}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="font-black text-[#0D2461]">{getPatientName(inv.patientId)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{getHospitalName(inv.hospitalId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4 font-black text-emerald-600">₹{inv.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell className="py-4 px-4 font-semibold text-slate-600 text-sm">{format(new Date(inv.date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="py-4 px-4">
                  {inv.status === 'Paid' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-600">Paid</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-50 text-rose-600">Unpaid</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  {inv.status !== 'Paid' ? (
                    <Button size="sm" className="h-9 px-4 text-xs font-black rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20" onClick={() => setPayingInvoice(inv.id)}>
                      <IndianRupee className="mr-1.5 h-3.5 w-3.5" /> Mark Paid
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-9 px-4 text-xs font-black rounded-lg border-slate-200 text-[#0D2461] hover:text-[#00A8CC] hover:bg-cyan-50 transition-colors"
                      onClick={() => setViewingReceipt(inv)}
                    >
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      View Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* ─── Custom Overlay Modals ────────────────────────────────────────────── */}
      
      {/* Generate Invoice Overlay */}
      {generatingForStudy && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Generate Invoice</h2>
                </div>
              </div>
              <button onClick={() => setGeneratingForStudy(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Generating For Case</p>
                <p className="text-lg font-black text-indigo-900 mt-1">{generatingForStudy.caseNumber}</p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Amount (₹)</label>
                <Input 
                  type="number" 
                  value={invoiceAmount} 
                  onChange={(e) => setInvoiceAmount(e.target.value)} 
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setGeneratingForStudy(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleGenerateInvoice} className="h-11 px-8 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Overlay */}
      {payingInvoice && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Record Payment</h2>
                </div>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 font-semibold text-sm leading-relaxed">
                Are you sure you want to mark this invoice as fully paid? This will also update the corresponding study's status.
              </p>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setPayingInvoice(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleMarkPaid} className="h-11 px-8 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Overlay */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-50/80 flex justify-between items-center border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Receipt Preview</h2>
                </div>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50 flex-1 relative">
              {/* The Receipt Document */}
              <div 
                ref={receiptRef} 
                className="bg-white p-10 max-w-lg mx-auto shadow-sm border border-slate-200 rounded-sm relative overflow-hidden"
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <span className="text-[10rem] font-black tracking-tighter text-slate-900 -rotate-45">PAID</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-[#0D2461] tracking-tight">UNNATHI</h3>
                      <p className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-widest mt-0.5">Site Solutions</p>
                      <div className="mt-4 text-xs font-semibold text-slate-500 leading-relaxed">
                        123 Healthcare Blvd,<br/>
                        Tech Park, Bangalore<br/>
                        finance@unnathi.com
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-black uppercase tracking-widest mb-3">
                        Payment Receipt
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receipt No.</p>
                      <p className="text-base font-black text-slate-800 font-mono mt-0.5">{viewingReceipt.invoiceNumber.replace('INV-', 'RCT-')}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">Date Paid</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{format(new Date(viewingReceipt.date), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Billed To</p>
                      <p className="text-sm font-black text-[#0D2461]">{getHospitalName(viewingReceipt.hospitalId)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Patient: {getPatientName(viewingReceipt.patientId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Original Invoice</p>
                      <p className="text-sm font-bold font-mono text-slate-800">{viewingReceipt.invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-4 px-4">
                            <p className="text-sm font-bold text-slate-800">Site Reporting Services</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">Professional fee for diagnostic reporting.</p>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-800">₹{viewingReceipt.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mb-8">
                    <div className="w-1/2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                        <span className="text-sm font-bold text-slate-800">₹{viewingReceipt.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tax (0%)</span>
                        <span className="text-sm font-bold text-slate-800">₹0</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-black text-[#0D2461] uppercase tracking-widest">Total Paid</span>
                        <span className="text-xl font-black text-emerald-600">₹{viewingReceipt.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-6 border-t border-slate-100">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">Payment Processed Successfully</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Thank you for your business</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white shrink-0">
              <Button variant="ghost" onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow && receiptRef.current) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Receipt ${viewingReceipt.invoiceNumber}</title>
                        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                        <style>@page { size: A4; margin: 0; } body { padding: 2rem; -webkit-print-color-adjust: exact; print-color-adjust: exact; }</style>
                      </head>
                      <body>${receiptRef.current.outerHTML}</body>
                      <script>window.onload = function() { window.print(); window.close(); }</script>
                    </html>
                  `);
                  printWindow.document.close();
                }
              }} className="font-bold text-slate-600 hover:text-[#0D2461]">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setViewingReceipt(null)} className="px-6 rounded-xl font-bold border-slate-200">
                  Close
                </Button>
                <Button 
                  onClick={handleDownloadPDF} 
                  disabled={downloadingReceipt === 'downloading'}
                  className="px-8 rounded-xl font-black bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md shadow-cyan-500/20 transition-all"
                >
                  {downloadingReceipt === 'downloading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...
                    </>
                  ) : downloadingReceipt === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
