import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function AddSiteModal({ isOpen, onClose, initialData }) {
  const { addSite, updateSite, addUser } = useMockDb();
  const { user } = useAuthStore();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    organizationType: "Teleradiology Company",
    legalName: "",
    gstin: "",
    pan: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    timeZone: "Asia/Kolkata",
    dateFormat: "DD-MM-YYYY",
    status: "Trial",
    goLiveDate: "",
    notes: "",

    adminFullName: "",
    adminEmail: "",
    adminMobile: "",
    adminRole: "SITE_ADMIN",
    loginMode: "Password",
    temporaryPassword: "",
    mfaEnabled: true,
    allowedCentres: "All Centres",
    accountStatus: "Invite Pending",
    supportedModalities: [],
    headerSpace: 4,
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
    headerUrl: "",
    footerUrl: "",
    brochureForNewStudy: false,
    // Subscription Settings
    plan: "Trial",
    billingCycle: "Monthly",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
    maxCentres: 1,
    maxUsers: 10,
    maxRadiologists: 5,
    storageLimit: "1 TB",
    monthlyStudyLimit: null,
    dicomRetention: "12 months",
    reportRetention: "As per contract",
    priceModel: "Flat subscription",
    perStudyRate: 0,
    taxPercent: 18,
    creditLimit: 0,
    gracePeriod: 7,
    autoSuspend: false,
    // Branding Settings
    brandDisplayName: "",
    brandPrimaryColor: "#0B2A5B",
    brandAccentColor: "#00A7C4",
    brandReportHeaderText: "",
    brandReportFooterText: "",
    brandSupportEmail: "",
    brandSupportPhone: "",
    brandPortalSubdomain: "",
    brandCustomDomain: "",
    brandEmailSenderName: "",
    brandLogo: "",
    brandFavicon: "",
    brandHeaderLogo: "",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      const s = initialData.settings || {};
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        organizationType:
          initialData.organizationType || "Teleradiology Company",
        legalName: initialData.legalName || "",
        gstin: initialData.gstin || "",
        pan: initialData.pan || "",
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "India",
        pinCode: initialData.pinCode || "",
        timeZone: initialData.timeZone || "Asia/Kolkata",
        dateFormat: initialData.dateFormat || "DD-MM-YYYY",
        status: initialData.status || "Trial",
        goLiveDate: initialData.goLiveDate || "",
        notes: initialData.notes || "",

        adminFullName: s.adminFullName || "",
        adminEmail: s.adminEmail || "",
        adminMobile: s.adminMobile || "",
        adminRole: s.adminRole || "SITE_ADMIN",
        loginMode: s.loginMode || "Password",
        temporaryPassword: s.temporaryPassword || "",
        mfaEnabled: s.mfaEnabled ?? true,
        allowedCentres: s.allowedCentres || "All Centres",
        accountStatus: s.accountStatus || "Invite Pending",
        supportedModalities: initialData.supportedModalities || [],
        headerSpace: s.headerSpace ?? 4,

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

        headerUrl: s.headerUrl ?? "",
        footerUrl: s.footerUrl ?? "",
        brochureForNewStudy: s.brochureForNewStudy ?? false,
        accountType: initialData.accountType || "Prepaid",
        plan: initialData.subscription?.plan || "Trial",
        billingCycle: initialData.subscription?.billingCycle || "Monthly",
        startDate:
          initialData.subscription?.startDate ||
          new Date().toISOString().split("T")[0],
        expiryDate:
          initialData.subscription?.expiryDate ||
          new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split("T")[0],
        maxCentres: initialData.subscription?.maxCentres || 1,
        maxUsers: initialData.subscription?.maxUsers || 10,
        maxRadiologists: initialData.subscription?.maxRadiologists || 5,
        storageLimit: initialData.subscription?.storageLimit || "1 TB",
        monthlyStudyLimit: initialData.subscription?.monthlyStudyLimit || null,
        dicomRetention: initialData.subscription?.dicomRetention || "12 months",
        reportRetention:
          initialData.subscription?.reportRetention || "As per contract",
        priceModel: initialData.subscription?.priceModel || "Flat subscription",
        perStudyRate: initialData.subscription?.perStudyRate || 0,
        taxPercent: initialData.subscription?.taxPercent || 18,
        creditLimit: initialData.subscription?.creditLimit || 0,
        gracePeriod: initialData.subscription?.gracePeriod || 7,
        autoSuspend: initialData.subscription?.autoSuspend || false,
        brandDisplayName: initialData.branding?.displayName || "",
        brandPrimaryColor: initialData.branding?.primaryColor || "#0B2A5B",
        brandAccentColor: initialData.branding?.accentColor || "#00A7C4",
        brandReportHeaderText: initialData.branding?.reportHeaderText || "",
        brandReportFooterText: initialData.branding?.reportFooterText || "",
        brandSupportEmail: initialData.branding?.supportEmail || "",
        brandSupportPhone: initialData.branding?.supportPhone || "",
        brandPortalSubdomain: initialData.branding?.portalSubdomain || "",
        brandCustomDomain: initialData.branding?.customDomain || "",
        brandEmailSenderName: initialData.branding?.emailSenderName || "",
        brandLogo: initialData.branding?.logo || "",
        brandFavicon: initialData.branding?.favicon || "",
        brandHeaderLogo: initialData.branding?.headerLogo || "",

        assignmentMode:
          initialData.reportingWorkflow?.assignmentMode || "Manual",
        whoCanAssign:
          initialData.reportingWorkflow?.whoCanAssign || "Organization Admin",
        casePriorities: initialData.reportingWorkflow?.casePriorities || [
          "Routine",
          "Urgent",
        ],
        tatClockStart:
          initialData.reportingWorkflow?.tatClockStart || "DICOM receipt",
        tatPauseRules: initialData.reportingWorkflow?.tatPauseRules || [],
        radiologistAcceptance:
          initialData.reportingWorkflow?.radiologistAcceptance ?? false,
        reportingStatuses: initialData.reportingWorkflow?.reportingStatuses || [
          "Uploaded",
          "Pending",
          "Assigned",
          "In Reporting",
          "Final",
        ],
        criticalFindingWorkflow:
          initialData.reportingWorkflow?.criticalFindingWorkflow ?? false,
        queryWorkflow: initialData.reportingWorkflow?.queryWorkflow ?? false,
        addendum: initialData.reportingWorkflow?.addendum ?? false,
        secondReadQa: initialData.reportingWorkflow?.secondReadQa ?? false,
        autoLockFinalReport:
          initialData.reportingWorkflow?.autoLockFinalReport ?? true,
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        code: "",
        organizationType: "Teleradiology Company",
        legalName: "",
        gstin: "",
        pan: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
        pinCode: "",
        timeZone: "Asia/Kolkata",
        dateFormat: "DD-MM-YYYY",
        status: "Trial",
        goLiveDate: "",
        notes: "",
        adminFullName: "",
        adminEmail: "",
        adminMobile: "",
        adminRole: "SITE_ADMIN",
        loginMode: "Password",
        temporaryPassword: "",
        mfaEnabled: true,
        allowedCentres: "All Centres",
        accountStatus: "Invite Pending",
        supportedModalities: [],
        headerSpace: 4,
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
        keyImagesOnFinal: false,
        sendReportByEmail: false,
        qrInReport: false,
        headerUrl: "",
        footerUrl: "",
        brochureForNewStudy: false,
        accountType: "Prepaid",
        plan: "Trial",
        billingCycle: "Monthly",
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        )
          .toISOString()
          .split("T")[0],
        maxCentres: 1,
        maxUsers: 10,
        maxRadiologists: 5,
        storageLimit: "1 TB",
        monthlyStudyLimit: null,
        dicomRetention: "12 months",
        reportRetention: "As per contract",
        priceModel: "Flat subscription",
        perStudyRate: 0,
        taxPercent: 18,
        creditLimit: 0,
        gracePeriod: 7,
        autoSuspend: false,
        assignmentMode: "Manual",
        whoCanAssign: "Organization Admin",
        casePriorities: ["Routine", "Urgent"],
        tatClockStart: "DICOM receipt",
        tatPauseRules: [],
        radiologistAcceptance: false,
        reportingStatuses: [
          "Uploaded",
          "Pending",
          "Assigned",
          "In Reporting",
          "Final",
        ],
        criticalFindingWorkflow: false,
        queryWorkflow: false,
        addendum: false,
        secondReadQa: false,
        autoLockFinalReport: true,
        brandDisplayName: "",
        brandPrimaryColor: "#0B2A5B",
        brandAccentColor: "#00A7C4",
        brandReportHeaderText: "",
        brandReportFooterText: "",
        brandSupportEmail: "",
        brandSupportPhone: "",
        brandPortalSubdomain: "",
        brandCustomDomain: "",
        brandEmailSenderName: "",
        brandLogo: "",
        brandFavicon: "",
        brandHeaderLogo: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const nextState = { ...prev, [name]: value };
        // Auto-generate code if name changes and it's new
        if (name === "name" && !initialData && !prev.code) {
          nextState.code = value
            .substring(0, 7)
            .toUpperCase()
            .replace(/\s+/g, "-");
        }
        return nextState;
      });
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert(
          "Image is too large for the mock database (limit 500KB). Please select a smaller file.",
        );
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalityToggle = (mod) => {
    setFormData((prev) => {
      const current = prev.supportedModalities;
      if (current.includes(mod)) {
        return {
          ...prev,
          supportedModalities: current.filter((m) => m !== mod),
        };
      }
      return { ...prev, supportedModalities: [...current, mod] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.loginMode === "OTP" && !otpVerified) {
      alert("Please verify the Admin Mobile via OTP before submitting.");
      return;
    }

    const settings = {
      adminFullName: formData.adminFullName,
      adminEmail: formData.adminEmail,
      adminMobile: formData.adminMobile,
      adminRole: formData.adminRole,
      loginMode: formData.loginMode,
      temporaryPassword: formData.temporaryPassword,
      mfaEnabled: formData.mfaEnabled,
      allowedCentres: formData.allowedCentres,
      accountStatus: formData.accountStatus,
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
      brochureForNewStudy: formData.brochureForNewStudy,
    };

    const subscription = {
      plan: formData.plan,
      billingCycle: formData.billingCycle,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      maxCentres: formData.maxCentres,
      maxUsers: formData.maxUsers,
      maxRadiologists: formData.maxRadiologists,
      storageLimit: formData.storageLimit,
      monthlyStudyLimit: formData.monthlyStudyLimit,
      dicomRetention: formData.dicomRetention,
      reportRetention: formData.reportRetention,
      priceModel: formData.priceModel,
      perStudyRate: formData.perStudyRate,
      taxPercent: formData.taxPercent,
      creditLimit: formData.creditLimit,
      gracePeriod: formData.gracePeriod,
      autoSuspend: formData.autoSuspend,
    };

    const reportingWorkflow = {
      assignmentMode: formData.assignmentMode,
      whoCanAssign: formData.whoCanAssign,
      casePriorities: formData.casePriorities,
      tatClockStart: formData.tatClockStart,
      tatPauseRules: formData.tatPauseRules,
      radiologistAcceptance: formData.radiologistAcceptance,
      reportingStatuses: formData.reportingStatuses,
      criticalFindingWorkflow: formData.criticalFindingWorkflow,
      queryWorkflow: formData.queryWorkflow,
      addendum: formData.addendum,
      secondReadQa: formData.secondReadQa,
      autoLockFinalReport: formData.autoLockFinalReport,
    };

    const branding = {
      displayName: formData.brandDisplayName,
      primaryColor: formData.brandPrimaryColor,
      accentColor: formData.brandAccentColor,
      reportHeaderText: formData.brandReportHeaderText,
      reportFooterText: formData.brandReportFooterText,
      supportEmail: formData.brandSupportEmail,
      supportPhone: formData.brandSupportPhone,
      portalSubdomain: formData.brandPortalSubdomain,
      customDomain: formData.brandCustomDomain,
      emailSenderName: formData.brandEmailSenderName,
      logo: formData.brandLogo,
      favicon: formData.brandFavicon,
      headerLogo: formData.brandHeaderLogo,
    };

    if (initialData) {
      updateSite(initialData.id, {
        name: formData.name,
        code: formData.code,
        organizationType: formData.organizationType,
        legalName: formData.legalName,
        gstin: formData.gstin,
        pan: formData.pan,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pinCode: formData.pinCode,
        timeZone: formData.timeZone,
        dateFormat: formData.dateFormat,
        status: formData.status,
        goLiveDate: formData.goLiveDate,
        notes: formData.notes,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        addressLine2: formData.addressLine2,
        supportedModalities: formData.supportedModalities,
        accountType: formData.accountType,
        settings,
        subscription,
        reportingWorkflow,
        branding,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newCompanyId = `comp_${Date.now()}`;
      addSite({
        id: newCompanyId,
        name: formData.name,
        code: formData.code,
        organizationType: formData.organizationType,
        legalName: formData.legalName,
        gstin: formData.gstin,
        pan: formData.pan,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pinCode: formData.pinCode,
        timeZone: formData.timeZone,
        dateFormat: formData.dateFormat,
        status: formData.status,
        goLiveDate: formData.goLiveDate,
        notes: formData.notes,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        addressLine2: formData.addressLine2,
        supportedModalities: formData.supportedModalities,
        accountType: formData.accountType,
        settings,
        subscription,
        reportingWorkflow,
        branding,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (formData.adminEmail || formData.adminFullName) {
        addUser({
          id: `u_${Date.now()}`,
          name: formData.adminFullName || `${formData.name} Admin`,
          email:
            formData.adminEmail ||
            `${formData.name.replace(/\s+/g, "").toLowerCase()}@telerad.com`,
          phone: formData.adminMobile || formData.phone,
          role: formData.adminRole,
          siteId: newCompanyId,
          status: formData.accountStatus,
          loginMode: formData.loginMode,
          password: formData.temporaryPassword,
          mfaEnabled: formData.mfaEnabled,
          allowedCentres: [formData.allowedCentres],
          createdAt: new Date().toISOString(),
        });
      }
    }
    onClose();
  };

  const CheckboxItem = ({ name, label }) => (
    <label className="flex items-center space-x-2.5 cursor-pointer group">
      <div className="relative flex items-center justify-center w-4 h-4">
        <input
          type="checkbox"
          name={name}
          checked={formData[name]}
          onChange={handleChange}
          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-sm bg-white checked:bg-[#2C4A6B] checked:border-[#2C4A6B] transition-all cursor-pointer"
        />

        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-[1px]">
          <svg
            width="10"
            height="8"
            viewBox="0 0 12 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <span className="text-[13px] text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#384b61] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-white text-base font-bold tracking-wide">
            {initialData ? "Edit Site" : "Create Site"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scroll */}
        <form
          id="site-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {/* Section: BASIC INFORMATION */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Organization Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ABC Teleradiology Pvt Ltd"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Organization Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="ABC-TEL"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Organization Type <span className="text-rose-500">*</span>
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option>Teleradiology Company</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Legal Entity Name
                </label>
                <Input
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder="For invoices/contracts"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  GSTIN / Tax ID
                </label>
                <Input
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="29ABCDE1234F1Z5"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  PAN / Registration No.
                </label>
                <Input
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Commercial records"
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Section: CONTACT & LOCATION */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Contact & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Primary Contact Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Dr / Mr / Ms Name"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Primary Contact Mobile{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex h-9">
                  <div className="bg-slate-100 border border-r-0 border-slate-300 px-3 flex items-center justify-center rounded-l-md text-[13px] text-slate-600 font-medium">
                    +91
                  </div>
                  <Input
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Mobile No"
                    className="h-9 text-[13px] rounded-l-none border-l-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Primary Contact Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@abc.com"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[12px] font-bold text-slate-700">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Registered/business address"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Address Line 2
                </label>
                <Input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mysuru"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="">Select State</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  PIN / Postal Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="pinCode"
                  required
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="570005"
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Section: CONFIGURATION & SETUP */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Configuration & Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Time Zone <span className="text-rose-500">*</span>
                </label>
                <select
                  name="timeZone"
                  required
                  value={formData.timeZone}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Date Format <span className="text-rose-500">*</span>
                </label>
                <select
                  name="dateFormat"
                  required
                  value={formData.dateFormat}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Go-Live Date
                </label>
                <Input
                  name="goLiveDate"
                  type="date"
                  value={formData.goLiveDate}
                  onChange={handleChange}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5 col-span-full">
                <label className="text-[12px] font-bold text-slate-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Internal Super Admin notes only."
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B] custom-scrollbar"
                ></textarea>
              </div>

              <div className="space-y-1.5 col-span-full mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Organization Admin Account
                </h4>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Admin Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="adminFullName"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.adminFullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Admin Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="adminEmail"
                  required
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="unique.admin@domain.com"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Admin Mobile
                </label>
                <div className="flex h-9">
                  <div className="bg-slate-100 border border-r-0 border-slate-300 px-3 flex items-center justify-center rounded-l-md text-[13px] text-slate-600 font-medium">
                    +91
                  </div>
                  <Input
                    name="adminMobile"
                    value={formData.adminMobile}
                    onChange={handleChange}
                    placeholder="Mobile No"
                    className="h-9 text-[13px] rounded-l-none border-l-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  name="adminRole"
                  required
                  value={formData.adminRole}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="SITE_ADMIN">Organization Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">
                  Login Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  name="loginMode"
                  required
                  value={formData.loginMode}
                  onChange={handleChange}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                >
                  <option value="Password">Password</option>
                </select>
              </div>

              {formData.loginMode === "OTP" && (
                <div className="space-y-1.5 col-span-full bg-indigo-50/50 p-4 rounded-md border border-indigo-100">
                  <label className="text-[12px] font-bold text-slate-700">
                    Verify Admin Mobile (OTP){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  {!otpSent ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-[11px] text-slate-500">
                        An OTP will be sent to the admin mobile number to verify
                        the account.
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpSent(true)}
                        className="bg-[#2C4A6B] text-white text-[12px] px-4 py-1.5 rounded-md hover:bg-[#1A314C] transition-colors w-max"
                      >
                        Send OTP
                      </button>
                    </div>
                  ) : !otpVerified ? (
                    <div className="flex flex-col space-y-2 mt-2">
                      <p className="text-[11px] text-slate-500">
                        OTP has been sent to +91 {formData.adminMobile || "..."}
                        . Enter the 6-digit code below.
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="000000"
                          className="h-9 text-[13px] w-32 tracking-widest text-center"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (otpInput.length > 3) setOtpVerified(true);
                          }}
                          className="bg-[#00A8CC] text-white text-[12px] px-4 py-1.5 rounded-md hover:bg-[#008ba8] transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mt-2 text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="text-[12px] font-bold">
                        Mobile number successfully verified!
                      </span>
                    </div>
                  )}
                </div>
              )}
              {formData.loginMode === "Password" && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="temporaryPassword"
                    required
                    type="password"
                    value={formData.temporaryPassword}
                    onChange={handleChange}
                    placeholder="Temporary Password"
                    className="h-9 text-[13px]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Force change on first login.
                  </p>
                </div>
              )}

              <div className="space-y-1.5 col-span-full mt-4 border-t border-slate-100 pt-4">
                <label className="text-[12px] font-bold text-slate-700">
                  Header Space
                </label>
                <Input
                  name="headerSpace"
                  type="number"
                  value={formData.headerSpace}
                  onChange={handleChange}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5 col-span-full">
                <label className="text-[12px] font-bold text-slate-700">
                  Supported Modalities
                </label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {["CT", "MRI", "X-Ray", "Ultrasound", "PET"].map((mod) => (
                    <label
                      key={mod}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={formData.supportedModalities.includes(mod)}
                          onChange={() => handleModalityToggle(mod)}
                          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-sm bg-white checked:bg-[#2C4A6B] checked:border-[#2C4A6B] transition-all cursor-pointer"
                        />

                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-[1px]">
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 5L4.5 8.5L11 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[13px] text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                        {mod}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {user?.role === "SUPER_ADMIN" && (
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-[#00A8CC] uppercase tracking-widest mb-4">
                Billing Strategy & Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Account Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="accountType"
                    required
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:ring-[#2C4A6B]/20 focus:border-[#2C4A6B]"
                  >
                    <option value="Prepaid">Prepaid</option>
                    <option value="Postpaid">Postpaid</option>
                  </select>
                </div>

                {formData.accountType === "Postpaid" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Tax % (Include option)
                      </label>
                      <Input
                        type="number"
                        name="taxPercent"
                        value={formData.taxPercent}
                        onChange={handleChange}
                        className="h-9 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Credit Limit (₹)
                      </label>
                      <Input
                        type="number"
                        name="creditLimit"
                        value={formData.creditLimit}
                        onChange={handleChange}
                        className="h-9 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Grace Period (Days)
                      </label>
                      <Input
                        type="number"
                        name="gracePeriod"
                        value={formData.gracePeriod}
                        onChange={handleChange}
                        className="h-9 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1.5 flex items-end pb-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoSuspend"
                          checked={formData.autoSuspend}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[13px] font-bold text-slate-700">
                          Auto Suspend Enabled
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Section: FILE UPLOADS */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
              File Uploads
            </h3>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center space-x-2 px-6 py-2 border border-slate-300 border-dashed rounded-md text-slate-500 hover:text-[#2C4A6B] hover:border-[#2C4A6B] hover:bg-slate-50 transition-colors text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{formData.headerUrl ? "Change Header" : "Header"}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "headerUrl")}
                />
              </label>
              <label className="flex items-center space-x-2 px-6 py-2 border border-slate-300 border-dashed rounded-md text-slate-500 hover:text-[#2C4A6B] hover:border-[#2C4A6B] hover:bg-slate-50 transition-colors text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{formData.footerUrl ? "Change Footer" : "Footer"}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "footerUrl")}
                />
              </label>
              <div className="pl-4">
                <CheckboxItem
                  name="brochureForNewStudy"
                  label="Brochure for New Study"
                />
              </div>
            </div>
          </div>

          {/* Hidden submit button to allow enter to submit form */}
          <button type="submit" className="hidden">
            Submit
          </button>
        </form>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-md h-9 px-6 text-sm font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="site-form"
            className="bg-[#465f7b] hover:bg-[#2C4A6B] text-white rounded-md shadow-sm h-9 px-8 text-sm font-bold"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
