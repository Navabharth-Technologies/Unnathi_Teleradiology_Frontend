import { useParams, useNavigate } from "react-router-dom";
import { useMockDb } from "../../store/useMockDb";
import { Button } from "../../components/ui/button";
import {
  Printer,
  CheckCircle2,
  ArrowLeft,
  Download,
  Loader2,
  Send,
  FileText,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ShareModal } from "../../components/modals/ShareModal";
import { Share2 } from "lucide-react";
import {
  downloadStandardReportPDF,
  downloadStandardReportWord,
  getReportBranding,
  resolveStudyReportContent,
} from "../../utils/reportDownloader";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../components/ui/dialog";

import { useSearchParams } from "react-router-dom";
import { decodeStudyPayload } from "../../utils/shareUtils";

export default function ReportPreview() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    studies,
    patients,
    hospitals,
    radiologists,
    templates,
    sites,
    updateStudy,
    addInvoice,
  } = useMockDb();
  const [downloading, setDownloading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Decode payload from URL if shared via WhatsApp
  const urlPayload = decodeStudyPayload(searchParams.get("p"));

  const dbStudy = studies.find((s) => s.id === id);
  const study = dbStudy || (urlPayload ? {
    id: id || urlPayload.id,
    patientName: urlPayload.patientName,
    age: urlPayload.age,
    gender: urlPayload.gender,
    patientUHID: urlPayload.uhid,
    caseNumber: urlPayload.caseNumber,
    referringDoctor: urlPayload.referringDoctor,
    hospitalName: urlPayload.hospitalName,
    modality: urlPayload.modality,
    studyDescription: urlPayload.studyDescription,
    bodyPart: urlPayload.bodyPart,
    studyDate: urlPayload.studyDate,
    reportingStatus: urlPayload.reportingStatus || "Final",
    priority: urlPayload.priority || "Normal",
    orthancStudyId: urlPayload.orthancStudyId,
    reportText: urlPayload.reportText,
  } : {
    id: id,
    modality: "MRI",
    studyDescription: "MRI - LUMBAR SPINE",
    caseNumber: id || "CASE-001",
    studyDate: new Date().toISOString(),
    reportingStatus: "Final",
  });

  const patient = patients.find((p) => p.id === study?.patientId) || {
    name: urlPayload?.patientName || study?.patientName || study?.patient || "Patient",
    age: urlPayload?.age || study?.age || "45",
    gender: urlPayload?.gender || study?.gender || "M",
    uhid: urlPayload?.uhid || study?.patientUHID || study?.caseNumber || "UHID-001",
    referringDoctor: urlPayload?.referringDoctor || study?.referringDoctor || "Self",
  };

  const hospital = hospitals.find((h) => h.id === study?.hospitalId) || {
    name: urlPayload?.hospitalName || study?.hospitalName || "Diagnostic Imaging & Teleradiology",
  };
  const site = sites.find((s) => s.id === hospital?.parentSiteId);
  const radiologist = radiologists.find(
    (r) => r.id === study?.assignedRadiologistId,
  ) || {
    name: "Dr. Radhika Sharma, MD",
    qualification: "Consultant Radiologist",
    registrationId: "DMC-48291",
  };

  const headerUrl = hospital?.settings?.headerUrl || site?.settings?.headerUrl;
  const footerUrl = hospital?.settings?.footerUrl || site?.settings?.footerUrl;

  const viewerLinkWithParam = searchParams.get("p")
    ? `/viewer/${study?.id}?p=${encodeURIComponent(searchParams.get("p"))}`
    : `/viewer/${study?.id}`;

  const handleVerify = () => {
    updateStudy(study.id, { reportingStatus: "Verified" });
    // Generate Invoice based on UtilityTemplate Pricing
    const template = templates.find(
      (t) =>
        t.hospitalId === study.hospitalId &&
        t.modality === study.modality &&
        (t.studyName === study.bodyPart ||
          t.studyName === study.studyDescription),
    );
    const invoiceAmount = template?.price || 500; // Fallback to 500 if no template is configured
    addInvoice({
      id: "INV-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      studyId: study.id,
      patientId: study.patientId,
      hospitalId: study.hospitalId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: invoiceAmount,
      status: "Unpaid",
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Net 30
    });

    navigate("/verification");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadStandardReportPDF({
        study,
        patient,
        hospitals,
        sites,
        radiologists,
        templates,
      });
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadWord = () => {
    try {
      downloadStandardReportWord({
        study,
        patient,
        hospitals,
        sites,
        radiologists,
        templates,
      });
    } catch (err) {
      console.error("Failed to generate Word document", err);
      alert("Failed to generate Word document. Please try again.");
    }
  };

  const reportContentHtml = resolveStudyReportContent(study, templates);
  const reportBranding = getReportBranding(study, hospitals, sites);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-unnathi-fade-in pb-12 print:p-0 print:m-0 print:max-w-none">
      {/* Action Header - Hidden during printing */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <div className="flex items-center space-x-2">
          {window.history.length > 1 ? (
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-[#0D2461] hover:bg-slate-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate(viewerLinkWithParam)}
              className="text-[#0D2461] hover:bg-slate-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> View Images
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(viewerLinkWithParam)}
            className="border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50"
            title="View Scanned DICOM Images"
          >
            <Eye className="mr-2 h-4 w-4" /> View Scanned Images
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-[#0D2461]"
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="border-[#00A8CC] text-[#00A8CC] font-bold hover:bg-cyan-50"
            title="Download Standardized PDF Report"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadWord}
            className="border-blue-200 text-blue-600 font-bold hover:bg-blue-50"
            title="Download Standardized Word Report"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download Word
          </Button>
          {!["Verified", "Dispatched"].includes(study.reportingStatus) ? (
            <Button
              className="bg-[#0D2461] hover:bg-[#081840] text-white font-bold px-6 shadow-md"
              onClick={handleVerify}
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Verify
              & Dispatch
            </Button>
          ) : (
            <>
              <Button
                className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-bold px-4 shadow-sm"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share Options
              </Button>

              {study.reportingStatus === "Verified" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md"
                      onClick={() =>
                        updateStudy(study.id, { reportingStatus: "Dispatched" })
                      }
                    >
                      <Send className="mr-2 h-4 w-4 text-white" /> Dispatch to
                      Hospital
                    </Button>
                  </DialogTrigger>
                  <DialogPortal>
                    <DialogOverlay />
                    <DialogContent className="sm:max-w-md bg-white border border-slate-100 shadow-xl rounded-2xl p-6">
                      <DialogHeader>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <DialogTitle className="text-xl font-black text-slate-800">
                            Dispatch Successful
                          </DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-500 font-medium leading-relaxed pl-13">
                          Report securely dispatched to{" "}
                          <span className="text-slate-800 font-bold">
                            {hospital?.name || "Referring Doctor"}
                          </span>
                          ! The status has been updated to{" "}
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                            Dispatched
                          </span>
                          .
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className="border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                          >
                            Stay Here
                          </Button>
                        </DialogClose>
                        <Button
                          className="bg-[#0D2461] hover:bg-[#081840] text-white font-bold px-6 shadow-md"
                          onClick={() => navigate("/verification")}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                          Worklist
                        </Button>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              ) : (
                <Button
                  disabled
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-6 opacity-100"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />{" "}
                  Dispatched
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        study={study}
        patient={patient}
        hospital={hospital}
      />

      {/* Report Document Wrapper */}
      <div className="flex justify-center print:block">
        {/* A4 Document styling */}
        <div
          id="report-content"
          className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] print:shadow-none w-[210mm] min-h-[297mm] p-[20mm] relative overflow-hidden"
          style={{ boxSizing: "border-box" }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
            <h1 className="text-9xl font-black text-[#0D2461] -rotate-45 tracking-widest uppercase">
              UNNATHI
            </h1>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            {headerUrl ? (
              <div className="mb-8 border-b-2 border-[#0D2461] pb-4">
                <img
                  src={headerUrl}
                  alt="Report Header"
                  className="w-full max-h-32 object-contain"
                />
              </div>
            ) : (
              <div className="flex justify-between items-center border-b-2 border-[#0D2461] pb-6 mb-8">
                <div>
                  {reportBranding.logo ? (
                    <img
                      src={reportBranding.logo}
                      alt="Logo"
                      className="max-h-16 max-w-[220px] object-contain"
                    />
                  ) : (
                    <div>
                      <h1 className="text-4xl font-black text-[#0D2461] tracking-tight uppercase">
                        UNNATHI
                      </h1>
                      <p className="text-[10px] font-bold tracking-widest text-[#00A8CC] uppercase mt-1">
                        Diagnostic Imaging & Teleradiology
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs">
                  <p className="font-black text-slate-800 text-sm uppercase mb-1">
                    {reportBranding.hospitalName}
                  </p>
                  {reportBranding.address && (
                    <p className="text-slate-500 font-medium">
                      {reportBranding.address}
                    </p>
                  )}
                  {reportBranding.phone && (
                    <p className="text-slate-500 font-medium">
                      Ph: {reportBranding.phone}
                    </p>
                  )}
                  {reportBranding.email && (
                    <p className="text-slate-500 font-medium">
                      Email: {reportBranding.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Patient Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-10 text-sm border-2 border-slate-100 rounded-lg p-5 bg-slate-50/50">
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  Patient Name
                </span>
                <span className="font-black text-slate-800 uppercase">
                  {patient.name}
                </span>
              </div>
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  Study Date
                </span>
                <span className="font-bold text-slate-800">
                  {format(new Date(study.studyDate || study.createdAt || new Date()), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  UHID
                </span>
                <span className="font-bold text-slate-800">{patient.uhid}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  Case No
                </span>
                <span className="font-bold text-slate-800">
                  {study.caseNumber}
                </span>
              </div>
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  Age / Gender
                </span>
                <span className="font-bold text-slate-800">
                  {patient.age} Y / {patient.gender}
                </span>
              </div>
              <div className="flex">
                <span className="font-bold text-slate-500 w-28 uppercase text-[11px] tracking-wider">
                  Ref Doctor
                </span>
                <span className="font-bold text-slate-800">
                  {patient.referringDoctor || "Self"}
                </span>
              </div>
            </div>

            {/* Report Title */}
            <div className="text-center mb-8">
              <h2 className="text-lg font-black text-slate-800 underline underline-offset-4 decoration-2 decoration-[#00A8CC] uppercase inline-block">
                {study.modality} - {study.studyDescription || "REPORT"}
              </h2>
            </div>

            {/* Report Body */}
            <div
              className="space-y-4 text-sm text-slate-800 leading-relaxed flex-1 report-rendered-content"
              dangerouslySetInnerHTML={{ __html: reportContentHtml }}
            />

            {/* Electronic Signature */}
            <div className="mt-12 flex justify-end">
              <div className="text-center min-w-[200px]">
                <div className="mb-2">
                  <div className="h-12 flex items-center justify-center">
                    {radiologist?.signatureUrl && radiologist.signatureUrl.startsWith("data:image") ? (
                      <img
                        src={radiologist.signatureUrl}
                        alt="Signature"
                        className="max-h-11 max-w-[150px] object-contain"
                      />
                    ) : (
                      <span className="font-[cursive] text-2xl text-[#0D2461]">
                        {radiologist?.name?.split(" ")[1] || "Dr. Verified"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t-2 border-[#0D2461] w-56 pt-2">
                  <p className="font-black text-slate-800 uppercase text-sm">
                    {radiologist?.name || "Consultant Radiologist"}
                  </p>
                  <p className="text-xs font-bold text-[#00A8CC] uppercase tracking-wider mt-0.5">
                    {radiologist?.qualification || "Consultant Radiologist"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Reg No: {radiologist?.registrationId || "12345-MC"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            {footerUrl ? (
              <div className="mt-12 pt-4 border-t border-slate-200 text-center">
                <img
                  src={footerUrl}
                  alt="Report Footer"
                  className="w-full max-h-24 object-contain"
                />
              </div>
            ) : (
              <div className="mt-12 pt-4 border-t border-slate-200 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  *** End of Report ***
                </p>
                <p className="text-[8px] font-medium text-slate-400 mt-2">
                  This report is electronically verified. Generated by Unnathi
                  Teleradiology Platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for viewer and print mode */}
      <style>{`
        .report-rendered-content {
          text-align: justify;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.65;
          color: #1e293b;
        }
        .report-rendered-content h3 {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 14px;
          margin-bottom: 6px;
          padding-bottom: 2px;
          border-bottom: 1px solid #e2e8f0;
        }
        .report-rendered-content p {
          margin-bottom: 6px;
        }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; background: white; }
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 210mm; padding: 15mm; box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
}
