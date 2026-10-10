import React, { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function AddHospitalModal({ isOpen, onClose, initialData }) {
  const { addHospital, updateHospital, addUser, sites, users, hospitals } =
    useMockDb();
  const { user } = useAuthStore();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    contactPerson: "",
    email: "",
    phone: "",
    dicomAeTitle: "",
    dicomCallingAe: "",
    dicomIp: "",
    dicomPort: "",
    uploadMethods: ["Web upload"],
    defaultReportingProvider: "Own radiologist",
    defaultTatProfile: "Routine",
    reportBranding: "Organization default",
    billingProfile: "Inherited",
    status: "Active",
    adminFullName: "",
    adminEmail: "",
    adminMobile: "",
    adminRole: "HOSPITAL_ADMIN",
    loginMode: "Password",
    temporaryPassword: "",
    mfaEnabled: true,
    allowedCentres: "All Centres",
    accountStatus: "Invite Pending",
    organizationType:
      user?.role === "SUPER_ADMIN" ? "UNNATHI_MANAGED" : "COMPANY_MANAGED",
    parentSiteId: user?.siteId || "",
    supportedModalities: [],
    verifierId: "",
    headerSpace: 4,
    modalityCommissions: {},
    accountType: "Postpaid",
    walletBalance: 0,
    paymentFrequency: "Monthly",
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
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pinCode: initialData.pinCode || "",
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        dicomAeTitle: initialData.dicomAeTitle || "",
        dicomCallingAe: initialData.dicomCallingAe || "",
        dicomIp: initialData.dicomIp || "",
        dicomPort: initialData.dicomPort || "",
        uploadMethods: initialData.uploadMethods || ["Web upload"],
        defaultReportingProvider:
          initialData.defaultReportingProvider || "Own radiologist",
        defaultTatProfile: initialData.defaultTatProfile || "Routine",
        reportBranding: initialData.reportBranding || "Organization default",
        billingProfile: initialData.billingProfile || "Inherited",
        status: initialData.status || "Active",
        adminFullName: s.adminFullName || "",
        adminEmail: s.adminEmail || "",
        adminMobile: s.adminMobile || "",
        adminRole: s.adminRole || "HOSPITAL_ADMIN",
        loginMode: s.loginMode || "Password",
        temporaryPassword: s.temporaryPassword || "",
        mfaEnabled: s.mfaEnabled ?? true,
        allowedCentres: s.allowedCentres || "All Centres",
        accountStatus: s.accountStatus || "Invite Pending",
        organizationType:
          initialData.organizationType ||
          (user?.role === "SUPER_ADMIN"
            ? "UNNATHI_MANAGED"
            : "COMPANY_MANAGED"),
        parentSiteId: initialData.parentSiteId || user?.siteId || "",
        supportedModalities: initialData.supportedModalities || [],
        verifierId: initialData.verifierId || "",
        headerSpace: s.headerSpace ?? 4,
        modalityCommissions: initialData.modalityCommissions || {},

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
        address: "",
        city: "",
        state: "",
        pinCode: "",
        contactPerson: "",
        email: "",
        phone: "",
        dicomAeTitle: "",
        dicomCallingAe: "",
        dicomIp: "",
        dicomPort: "",
        uploadMethods: ["Web upload"],
        defaultReportingProvider: "Own radiologist",
        defaultTatProfile: "Routine",
        reportBranding: "Organization default",
        billingProfile: "Inherited",
        status: "Active",
        adminFullName: "",
        adminEmail: "",
        adminMobile: "",
        adminRole: "HOSPITAL_ADMIN",
        loginMode: "Password",
        temporaryPassword: "",
        mfaEnabled: true,
        allowedCentres: "All Centres",
        accountStatus: "Invite Pending",
        organizationType:
          user?.role === "SUPER_ADMIN" ? "UNNATHI_MANAGED" : "COMPANY_MANAGED",
        parentSiteId: user?.siteId || "",
        supportedModalities: [],
        verifierId: "",
        headerSpace: 4,
        modalityCommissions: {},
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
  }, [initialData, isOpen, user?.role, user?.siteId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const nextState = { ...prev, [name]: value };
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

  const handleRemoveFile = (field) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  const renderImageUploadPreview = (field, label, accept, required) => {
    const value = formData[field];
    return (
      <div className="space-y-1.5 w-full">
        <label className="text-[12px] font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value ? (
          <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-slate-50">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-slate-600 truncate font-medium max-w-[120px]">
                Image Uploaded
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <label
                className="p-1.5 text-slate-400 hover:text-[#00A8CC] hover:bg-[#00A8CC]/10 rounded cursor-pointer transition-colors"
                title="Change"
              >
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(e) => handleFileUpload(e, field)}
                />
              </label>
              <button
                type="button"
                onClick={() => handleRemoveFile(field)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-center space-x-2 px-4 py-2 border border-slate-300 border-dashed rounded-md text-slate-500 hover:bg-slate-50 text-xs font-medium w-full justify-center cursor-pointer group hover:border-[#2C4A6B] transition-colors">
            <Upload className="w-4 h-4 group-hover:text-[#2C4A6B] transition-colors" />
            <span className="group-hover:text-[#2C4A6B] transition-colors">
              Upload {label}
            </span>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => handleFileUpload(e, field)}
            />
          </label>
        )}
      </div>
    );
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

  const handleSubmit = async (e) => {
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
      await updateHospital(initialData.id, {
        name: formData.name,
        code: formData.code,
        organizationType: formData.organizationType,
        parentSiteId: formData.parentSiteId,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        dicomAeTitle: formData.dicomAeTitle,
        dicomCallingAe: formData.dicomCallingAe,
        dicomIp: formData.dicomIp,
        dicomPort: formData.dicomPort,
        uploadMethods: formData.uploadMethods,
        defaultReportingProvider: formData.defaultReportingProvider,
        defaultTatProfile: formData.defaultTatProfile,
        reportBranding: formData.reportBranding,
        billingProfile: formData.billingProfile,
        status: formData.status,
        supportedModalities: formData.supportedModalities,
        verifierId: formData.verifierId || null,
        settings,
        subscription,
        reportingWorkflow,
        branding,
        modalityCommissions: formData.modalityCommissions,
        accountType: formData.accountType,
        updatedAt: new Date().toISOString(),
      });

      if (formData.adminEmail || formData.adminFullName) {
        const existingAdmin = users.find(
          (u) => u.hospitalId === initialData.id && u.role === "HOSPITAL_ADMIN",
        );
        if (existingAdmin) {
          await updateUser(existingAdmin.id, {
            name: formData.adminFullName || existingAdmin.name,
            email: formData.adminEmail || existingAdmin.email,
            phone: formData.adminMobile || existingAdmin.phone,
            status: formData.accountStatus,
            loginMode: formData.loginMode,
            password: formData.temporaryPassword || existingAdmin.password,
          });
        } else {
          await addUser({
            id: `u_${Date.now()}`,
            name: formData.adminFullName || `${formData.name} Admin`,
            email:
              formData.adminEmail ||
              `${formData.name.replace(/\s+/g, "").toLowerCase()}@hospital.com`,
            phone: formData.adminMobile || formData.phone,
            role: formData.adminRole,
            hospitalId: initialData.id,
            status: formData.accountStatus,
            loginMode: formData.loginMode,
            password: formData.temporaryPassword,
            mfaEnabled: formData.mfaEnabled,
            allowedCentres: [formData.allowedCentres],
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else {
      const newHospitalId = `hosp_${Date.now()}`;
      await addHospital({
        id: newHospitalId,
        name: formData.name,
        code: formData.code,
        organizationType: formData.organizationType,
        parentSiteId: formData.parentSiteId,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        status: formData.status,
        dicomAeTitle: formData.dicomAeTitle,
        dicomCallingAe: formData.dicomCallingAe,
        dicomIp: formData.dicomIp,
        dicomPort: formData.dicomPort,
        uploadMethods: formData.uploadMethods,
        defaultReportingProvider: formData.defaultReportingProvider,
        defaultTatProfile: formData.defaultTatProfile,
        reportBranding: formData.reportBranding,
        billingProfile: formData.billingProfile,
        supportedModalities: formData.supportedModalities,
        verifierId: formData.verifierId || null,
        settings,
        subscription,
        reportingWorkflow,
        branding,
        modalityCommissions: formData.modalityCommissions,
        accountType: formData.accountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (formData.adminEmail || formData.adminFullName) {
        await addUser({
          id: `u_${Date.now()}`,
          name: formData.adminFullName || `${formData.name} Admin`,
          email:
            formData.adminEmail ||
            `${formData.name.replace(/\s+/g, "").toLowerCase()}@hospital.com`,
          phone: formData.adminMobile || formData.phone,
          role: formData.adminRole,
          hospitalId: newHospitalId,
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
      <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-[850px] max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#384b61] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-white text-base font-bold tracking-wide">
            Create Site
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
          id="hospital-form"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {user?.role === "SUPER_ADMIN" && (
              <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-6">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  Organization Settings
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="UNNATHI_MANAGED">
                        Independent Hospital
                      </option>
                      <option value="COMPANY_MANAGED">Site Sub-Hospital</option>
                    </select>
                  </div>
                  {formData.organizationType === "COMPANY_MANAGED" && (
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Select Site
                      </label>
                      <select
                        name="parentSiteId"
                        value={formData.parentSiteId}
                        onChange={handleChange}
                        className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Company...</option>
                        {sites.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section: BASIC INFORMATION */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Centre / Facility Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Centre Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Display name"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Centre Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Unique within org"
                    className="h-9 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[12px] font-bold text-slate-700">
                    Full Address <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street Address"
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
                    placeholder="City"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="pinCode"
                    required
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="PIN Code"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Operational contact"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Mobile No.
                  </label>
                  <div className="flex h-9">
                    <div className="bg-slate-100 border border-r-0 border-slate-300 px-3 flex items-center justify-center rounded-l-md text-[13px] text-slate-600 font-medium">
                      +91
                    </div>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Centre notifications"
                      className="h-9 text-[13px] rounded-l-none border-l-0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Centre notifications"
                    className="h-9 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5 col-span-full mt-4 border-t border-slate-100 pt-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    DICOM / PACS Routing
                  </h4>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    DICOM AE Title
                  </label>
                  <Input
                    name="dicomAeTitle"
                    value={formData.dicomAeTitle}
                    onChange={handleChange}
                    placeholder="For gateway/PACS routing"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    DICOM Calling AE
                  </label>
                  <Input
                    name="dicomCallingAe"
                    value={formData.dicomCallingAe}
                    onChange={handleChange}
                    placeholder="When direct DICOM send is used"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 space-y-1.5 m-0 p-0 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      IP
                    </label>
                    <Input
                      name="dicomIp"
                      value={formData.dicomIp}
                      onChange={handleChange}
                      placeholder="192.168.x.x"
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Port
                    </label>
                    <Input
                      name="dicomPort"
                      value={formData.dicomPort}
                      onChange={handleChange}
                      placeholder="104"
                      className="h-9 text-[13px]"
                    />
                  </div>
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
                    <option value="HOSPITAL_ADMIN">Organization Admin</option>
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
                          An OTP will be sent to the admin mobile number to
                          verify the account.
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
                          OTP has been sent to +91{" "}
                          {formData.adminMobile || "..."}. Enter the 6-digit
                          code below.
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
                      Temporary Password{" "}
                      <span className="text-rose-500">*</span>
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
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">
                    Assign Verifier (Optional)
                  </label>
                  <select
                    name="verifierId"
                    value={formData.verifierId}
                    onChange={handleChange}
                    className="w-full h-9 border border-slate-300 rounded-md text-[13px] px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">No Verifier (Skip Verification)</option>
                    {users
                      .filter((u) => {
                        if (u.role !== "VERIFIER") return false;
                        if (user?.role === "SUPER_ADMIN") {
                          // Hide independent hospital verifiers
                          const isIndependent =
                            u.hospitalId &&
                            hospitals.find((h) => h.id === u.hospitalId)
                              ?.organizationType === "UNNATHI_MANAGED";
                          return !isIndependent;
                        }
                        if (user?.role === "SITE_ADMIN") {
                          return u.siteId === user.siteId;
                        }
                        return false;
                      })
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
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
              </div>
            </div>

            {user?.role === "SUPER_ADMIN" &&
              formData.supportedModalities.length > 0 && (
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-[11px] font-black text-[#00A8CC] uppercase tracking-widest mb-4">
                    Superadmin Commissions Pricing (₹)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Set the agreed amount that this hospital pays to the
                    Superadmin per finalized scan.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.supportedModalities.map((mod) => (
                      <div key={mod} className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-700">
                          {mod} Scan
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">₹</span>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            value={formData.modalityCommissions[mod] || ""}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                modalityCommissions: {
                                  ...prev.modalityCommissions,
                                  [mod]: parseInt(e.target.value) || 0,
                                },
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

            {["SUPER_ADMIN", "SITE_ADMIN"].includes(user?.role || "") && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                {renderImageUploadPreview(
                  "headerUrl",
                  "Header Image",
                  "image/*",
                )}
                {renderImageUploadPreview(
                  "footerUrl",
                  "Footer Image",
                  "image/*",
                )}
                <div className="pl-2 pb-2">
                  <CheckboxItem
                    name="brochureForNewStudy"
                    label="Brochure for New Study"
                  />
                </div>
              </div>
            </div>

            {/* Section: WHITE-LABEL & BRANDING SETTINGS */}
            {!(
              user?.role === "SUPER_ADMIN" &&
              formData.organizationType === "COMPANY_MANAGED"
            ) && (
              <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                <h3 className="text-[11px] font-black text-[#0D2461] uppercase tracking-widest mb-4">
                  White-Label & Branding Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Display Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      name="brandDisplayName"
                      required
                      value={formData.brandDisplayName}
                      onChange={handleChange}
                      placeholder="e.g. ABC Teleradiology"
                      className="h-9 text-[13px]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Shown in portal and report header.
                    </p>
                  </div>
                  {renderImageUploadPreview(
                    "brandLogo",
                    "Logo",
                    ".png,.svg",
                    true,
                  )}
                  {renderImageUploadPreview(
                    "brandFavicon",
                    "Favicon",
                    ".ico,.png",
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Primary Colour
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          name="brandPrimaryColor"
                          value={formData.brandPrimaryColor}
                          onChange={handleChange}
                          className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                        />
                        <Input
                          name="brandPrimaryColor"
                          value={formData.brandPrimaryColor}
                          onChange={handleChange}
                          className="h-9 text-[13px] font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700">
                        Accent Colour
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          name="brandAccentColor"
                          value={formData.brandAccentColor}
                          onChange={handleChange}
                          className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                        />
                        <Input
                          name="brandAccentColor"
                          value={formData.brandAccentColor}
                          onChange={handleChange}
                          className="h-9 text-[13px] font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {renderImageUploadPreview(
                    "brandHeaderLogo",
                    "Report Header Logo",
                    "image/*",
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Email Sender Name
                    </label>
                    <Input
                      name="brandEmailSenderName"
                      value={formData.brandEmailSenderName}
                      onChange={handleChange}
                      placeholder="e.g. ABC Teleradiology"
                      className="h-9 text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[12px] font-bold text-slate-700">
                      Report Header Text
                    </label>
                    <textarea
                      name="brandReportHeaderText"
                      value={formData.brandReportHeaderText}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:border-[#2C4A6B] custom-scrollbar"
                    ></textarea>
                  </div>
                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[12px] font-bold text-slate-700">
                      Report Footer Text
                    </label>
                    <textarea
                      name="brandReportFooterText"
                      value={formData.brandReportFooterText}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-[13px] bg-slate-50 outline-none focus:ring-2 focus:border-[#2C4A6B] custom-scrollbar"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Support Email
                    </label>
                    <Input
                      type="email"
                      name="brandSupportEmail"
                      value={formData.brandSupportEmail}
                      onChange={handleChange}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Support Phone
                    </label>
                    <Input
                      type="tel"
                      name="brandSupportPhone"
                      value={formData.brandSupportPhone}
                      onChange={handleChange}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Portal Subdomain
                    </label>
                    <Input
                      name="brandPortalSubdomain"
                      value={formData.brandPortalSubdomain}
                      onChange={handleChange}
                      placeholder="abc.platformdomain.com"
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">
                      Custom Domain
                    </label>
                    <Input
                      name="brandCustomDomain"
                      value={formData.brandCustomDomain}
                      onChange={handleChange}
                      placeholder="pacs.abc.com"
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
              className="bg-[#465f7b] hover:bg-[#2C4A6B] text-white rounded-md shadow-sm h-9 px-8 text-sm font-bold"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
