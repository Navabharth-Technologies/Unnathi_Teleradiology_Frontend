import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { SiteSettings, Hospital, OrganizationType } from '../../types';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Hospital | null;
}

export default function AddHospitalModal({ isOpen, onClose, initialData }: AddHospitalModalProps) {
  const { addHospital, updateHospital, addUser, sites, users, hospitals } = useMockDb();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    organizationType: (user?.role === 'SUPER_ADMIN' ? 'UNNATHI_MANAGED' : 'COMPANY_MANAGED') as OrganizationType,
    parentSiteId: user?.siteId || '',
    supportedModalities: [] as string[],
    verifierId: '',
    headerSpace: 4,
    modalityCommissions: {} as Record<string, number>,
    accountType: 'Postpaid' as 'Prepaid' | 'Postpaid',
    walletBalance: 0,
    paymentFrequency: 'Monthly' as 'Daily' | 'Weekly' | 'Monthly',
    // Permissions & Settings
    globalHeaderSpace: false,
    emergency: true,
    border: true,
    viewImages: false,
    deleteStudy: false,
    shareStudy: false,
    template: false,
    enablePrepaid: false,
    headerOnlyOnPdf: false,
    shareLinkNewStudy: false,
    demographyAllPages: false,
    billingPage: false,
    transactionHistory: false,
    downloadInFinalize: false,
    allowStudiesWithoutImages: false,
    // Reports & Communication
    keyImagesOnFinal: false,
    sendReportByEmail: false,
    qrInReport: false,
    // File Uploads
    headerUrl: '',
    footerUrl: '',
    brochureForNewStudy: false
  });

  useEffect(() => {
    if (initialData && isOpen) {
      const s = initialData.settings || {};
      setFormData({
        name: initialData.name || '',
        city: initialData.city || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        username: s.username || '',
        password: s.password || '',
        organizationType: initialData.organizationType || (user?.role === 'SUPER_ADMIN' ? 'UNNATHI_MANAGED' : 'COMPANY_MANAGED'),
        parentSiteId: initialData.parentSiteId || user?.siteId || '',
        supportedModalities: initialData.supportedModalities || [],
        verifierId: initialData.verifierId || '',
        headerSpace: s.headerSpace ?? 4,
        modalityCommissions: initialData.modalityCommissions || {},
        accountType: initialData.accountType || 'Postpaid',
        walletBalance: initialData.walletBalance || 0,
        paymentFrequency: initialData.paymentFrequency || 'Monthly',

        globalHeaderSpace: s.globalHeaderSpace ?? false,
        emergency: s.emergency ?? true,
        border: s.border ?? true,
        viewImages: s.viewImages ?? false,
        deleteStudy: s.deleteStudy ?? false,
        shareStudy: s.shareStudy ?? false,
        template: s.template ?? false,
        enablePrepaid: s.enablePrepaid ?? false,
        headerOnlyOnPdf: s.headerOnlyOnPdf ?? false,
        shareLinkNewStudy: s.shareLinkNewStudy ?? false,
        demographyAllPages: s.demographyAllPages ?? false,
        billingPage: s.billingPage ?? false,
        transactionHistory: s.transactionHistory ?? false,
        downloadInFinalize: s.downloadInFinalize ?? false,
        allowStudiesWithoutImages: s.allowStudiesWithoutImages ?? false,

        keyImagesOnFinal: s.keyImagesOnFinal ?? false,
        sendReportByEmail: s.sendReportByEmail ?? false,
        qrInReport: s.qrInReport ?? false,

        headerUrl: s.headerUrl ?? '',
        footerUrl: s.footerUrl ?? '',
        brochureForNewStudy: s.brochureForNewStudy ?? false
      });
    } else if (isOpen) {
      setFormData({
        name: '', city: '', email: '', phone: '', username: '', password: '',
        organizationType: (user?.role === 'SUPER_ADMIN' ? 'UNNATHI_MANAGED' : 'COMPANY_MANAGED') as OrganizationType,
        parentSiteId: user?.siteId || '',
        supportedModalities: [], verifierId: '', headerSpace: 4, modalityCommissions: {},
        globalHeaderSpace: false, emergency: true, border: true, viewImages: false, deleteStudy: false, shareStudy: false, template: false, enablePrepaid: false, headerOnlyOnPdf: false, shareLinkNewStudy: false, demographyAllPages: false, billingPage: false, transactionHistory: false, downloadInFinalize: false, allowStudiesWithoutImages: false,
        keyImagesOnFinal: false, sendReportByEmail: false, qrInReport: false,
        headerUrl: '', footerUrl: '', brochureForNewStudy: false
      });
    }
  }, [initialData, isOpen, user?.role, user?.siteId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleModalityToggle = (mod: string) => {
    setFormData(prev => {
      const current = prev.supportedModalities;
      if (current.includes(mod)) {
        return { ...prev, supportedModalities: current.filter(m => m !== mod) };
      }
      return { ...prev, supportedModalities: [...current, mod] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const settings: SiteSettings = {
      username: formData.username,
      password: formData.password,
      headerSpace: formData.headerSpace,
      globalHeaderSpace: formData.globalHeaderSpace,
      emergency: formData.emergency,
      border: formData.border,
      viewImages: formData.viewImages,
      deleteStudy: formData.deleteStudy,
      shareStudy: formData.shareStudy,
      template: formData.template,
      enablePrepaid: formData.enablePrepaid,
      headerOnlyOnPdf: formData.headerOnlyOnPdf,
      shareLinkNewStudy: formData.shareLinkNewStudy,
      demographyAllPages: formData.demographyAllPages,
      billingPage: formData.billingPage,
      transactionHistory: formData.transactionHistory,
      downloadInFinalize: formData.downloadInFinalize,
      allowStudiesWithoutImages: formData.allowStudiesWithoutImages,
      keyImagesOnFinal: formData.keyImagesOnFinal,
      sendReportByEmail: formData.sendReportByEmail,
      qrInReport: formData.qrInReport,
      headerUrl: formData.headerUrl,
      footerUrl: formData.footerUrl,
      brochureForNewStudy: formData.brochureForNewStudy
    };

    if (initialData) {
      updateHospital(initialData.id, {
        name: formData.name,
        code: formData.name.substring(0, 4).toUpperCase(),
        organizationType: formData.organizationType,
        parentSiteId: formData.parentSiteId,
        contactPerson: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.city,
        city: formData.city,
        supportedModalities: formData.supportedModalities,
        verifierId: formData.verifierId || null,
        settings,
        modalityCommissions: formData.modalityCommissions,
        accountType: formData.accountType,
        walletBalance: formData.walletBalance,
        paymentFrequency: formData.paymentFrequency,
        updatedAt: new Date().toISOString()
      });
    } else {
      const newHospitalId = `hosp_${Date.now()}`;
      addHospital({
        id: newHospitalId,
        name: formData.name,
        code: formData.name.substring(0, 4).toUpperCase(),
        organizationType: formData.organizationType,
        parentSiteId: formData.parentSiteId,
        contactPerson: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.city,
        city: formData.city,
        status: 'Active',
        supportedModalities: formData.supportedModalities,
        verifierId: formData.verifierId || null,
        settings,
        modalityCommissions: formData.modalityCommissions,
        accountType: formData.accountType,
        walletBalance: formData.walletBalance,
        paymentFrequency: formData.paymentFrequency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (formData.username && formData.password) {
        addUser({
          id: `u_${Date.now()}`,
          name: `${formData.name} Admin`,
          email: formData.email || `${formData.username}@hospital.com`,
          phone: formData.phone,
          role: 'HOSPITAL_ADMIN',
          hospitalId: newHospitalId,
          status: 'Active',
          createdAt: new Date().toISOString()
        });
      }
    }
    onClose();
  };

  const CheckboxItem = ({ name, label }: { name: keyof typeof formData, label: string }) => (
    <label className="flex items-center space-x-2.5 cursor-pointer group">
      <div className="relative flex items-center justify-center w-4 h-4">
        <input
          type="checkbox"
          name={name}
          checked={formData[name] as boolean}
          onChange={handleChange}
          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-sm bg-white checked:bg-[#2C4A6B] checked:border-[#2C4A6B] transition-all cursor-pointer"
        />
        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-[1px]">
          <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span className="text-[13px] text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-[850px] max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#384b61] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-white text-base font-bold tracking-wide">Create Site</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {user?.role === 'SUPER_ADMIN' && (
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-6">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Organization Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Organization Type</label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="UNNATHI_MANAGED">Independent Hospital</option>
                    <option value="COMPANY_MANAGED">Site Sub-Hospital</option>
                  </select>
                </div>
                {formData.organizationType === 'COMPANY_MANAGED' && (
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Select Site</label>
                    <select
                      name="parentSiteId"
                      value={formData.parentSiteId}
                      onChange={handleChange}
                      className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Company...</option>
                      {sites.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: BASIC INFORMATION */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Institute Name <span className="text-rose-500">*</span></label>
                <Input name="name" required value={formData.name} onChange={handleChange} placeholder="Name of the Institute" className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">City <span className="text-rose-500">*</span></label>
                <Input name="city" required value={formData.city} onChange={handleChange} placeholder="Enter city" className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Email</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Mail ID" className="h-9 text-[13px]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Mobile No.</label>
                <div className="flex h-9">
                  <div className="bg-slate-100 border border-r-0 border-slate-300 px-3 flex items-center justify-center rounded-l-md text-[13px] text-slate-600 font-medium">
                    +91
                  </div>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile No" className="h-9 text-[13px] rounded-l-none border-l-0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Username <span className="text-rose-500">*</span></label>
                <Input name="username" required value={formData.username} onChange={handleChange} placeholder="Username" className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Password <span className="text-rose-500">*</span></label>
                <Input name="password" required type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="h-9 text-[13px]" />
              </div>

              <div className="space-y-1.5 col-span-full">
                <label className="text-[12px] font-bold text-slate-700">Supported Modalities</label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {['CT', 'MRI', 'X-Ray', 'Ultrasound', 'PET'].map(mod => (
                    <label key={mod} className="flex items-center space-x-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={formData.supportedModalities.includes(mod)}
                          onChange={() => handleModalityToggle(mod)}
                          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-sm bg-white checked:bg-[#2C4A6B] checked:border-[#2C4A6B] transition-all cursor-pointer"
                        />
                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-[1px]">
                          <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[13px] text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{mod}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Assign Verifier (Optional)</label>
                <select
                  name="verifierId"
                  value={formData.verifierId}
                  onChange={handleChange}
                  className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="">No Verifier (Skip Verification)</option>
                  {users.filter(u => {
                    if (u.role !== 'VERIFIER') return false;
                    
                    if (user?.role === 'SUPER_ADMIN') {
                      // Hide independent hospital verifiers
                      const isIndependent = u.hospitalId && hospitals.find(h => h.id === u.hospitalId)?.organizationType === 'UNNATHI_MANAGED';
                      return !isIndependent;
                    }
                    
                    if (user?.role === 'SITE_ADMIN') {
                      return u.siteId === user.siteId;
                    }
                    
                    return false;
                  }).map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Header Space</label>
                <Input name="headerSpace" type="number" value={formData.headerSpace} onChange={handleChange} className="h-9 text-[13px]" />
              </div>
            </div>
          </div>

          {user?.role === 'SUPER_ADMIN' && formData.supportedModalities.length > 0 && (
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-[#00A8CC] uppercase tracking-widest mb-4">Superadmin Commissions Pricing (₹)</h3>
              <p className="text-xs text-slate-500 mb-4">Set the agreed amount that this hospital pays to the Superadmin per finalized scan.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.supportedModalities.map(mod => (
                  <div key={mod} className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">{mod} Scan</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">₹</span>
                      </div>
                      <Input 
                        type="number"
                        min="0"
                        value={formData.modalityCommissions[mod] || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            modalityCommissions: {
                              ...prev.modalityCommissions,
                              [mod]: parseInt(e.target.value) || 0
                            }
                          }));
                        }}
                        className="pl-8 h-9 text-[13px]" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {user?.role === 'SUPER_ADMIN' && (
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-[#00A8CC] uppercase tracking-widest mb-4">Account Type & Payment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Account Type</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Postpaid">Postpaid Account</option>
                    <option value="Prepaid">Prepaid Wallet</option>
                  </select>
                </div>
                
                {formData.accountType === 'Prepaid' && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-[12px] font-bold text-slate-700">Initial Wallet Balance (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">₹</span>
                      </div>
                      <Input 
                        type="number" 
                        name="walletBalance"
                        value={formData.walletBalance} 
                        onChange={handleChange}
                        className="pl-8 h-9 text-[13px]" 
                      />
                    </div>
                  </div>
                )}
                
                {formData.accountType === 'Postpaid' && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-[12px] font-bold text-slate-700">Payment Schedule (SLA)</label>
                    <select
                      name="paymentFrequency"
                      value={formData.paymentFrequency}
                      onChange={handleChange}
                      className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Daily">Daily Clearance</option>
                      <option value="Weekly">Weekly Clearance</option>
                      <option value="Monthly">Monthly Clearance</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: PERMISSIONS & SETTINGS */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Permissions & Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
              <CheckboxItem name="globalHeaderSpace" label="Global Header Space" />
              <CheckboxItem name="emergency" label="Emergency" />
              <CheckboxItem name="border" label="Border" />
              <CheckboxItem name="viewImages" label="View Images" />

              <CheckboxItem name="deleteStudy" label="Delete Study" />
              <CheckboxItem name="shareStudy" label="Share Study" />
              <CheckboxItem name="template" label="Template" />
              <CheckboxItem name="enablePrepaid" label="Enable Prepaid" />

              <CheckboxItem name="headerOnlyOnPdf" label="Header Only on PDF" />
              <CheckboxItem name="shareLinkNewStudy" label="Share Link (New Study)" />
              <CheckboxItem name="demographyAllPages" label="Demography All Pages" />
              <CheckboxItem name="billingPage" label="Billing Page" />

              <CheckboxItem name="transactionHistory" label="Transaction History" />
              <CheckboxItem name="downloadInFinalize" label="Download in Finalize" />
              <CheckboxItem name="allowStudiesWithoutImages" label="Allow Studies Without Images" />
            </div>
          </div>

          {/* Section: REPORTS & COMMUNICATION */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Reports & Communication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2">
              <CheckboxItem name="keyImagesOnFinal" label="Key Images on Final" />
              <CheckboxItem name="sendReportByEmail" label="Send Report by Email" />
              <CheckboxItem name="qrInReport" label="QR in Report" />
            </div>
          </div>

          {/* Section: FILE UPLOADS */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">File Uploads</h3>
            <div className="flex flex-wrap items-center gap-6">
              <button type="button" className="flex items-center space-x-2 px-6 py-2 border border-slate-300 border-dashed rounded-md text-slate-500 hover:text-[#2C4A6B] hover:border-[#2C4A6B] hover:bg-slate-50 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Header</span>
              </button>
              <button type="button" className="flex items-center space-x-2 px-6 py-2 border border-slate-300 border-dashed rounded-md text-slate-500 hover:text-[#2C4A6B] hover:border-[#2C4A6B] hover:bg-slate-50 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Footer</span>
              </button>
              <div className="pl-4">
                <CheckboxItem name="brochureForNewStudy" label="Brochure for New Study" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 px-6 text-sm font-bold text-slate-600">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-[#465f7b] hover:bg-[#2C4A6B] text-white rounded-md shadow-sm h-9 px-8 text-sm font-bold">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
