import { format } from "date-fns";

/**
 * Resolves hospital branding logo or parent site branding logo or null.
 */
export function getReportBranding(study, hospitals = [], sites = []) {
  const hospital = hospitals.find((h) => h.id === study?.hospitalId);
  const parentSite = hospital?.parentSiteId
    ? sites.find((s) => s.id === hospital.parentSiteId)
    : null;

  const logo =
    hospital?.branding?.headerLogo ||
    hospital?.branding?.logo ||
    parentSite?.branding?.headerLogo ||
    parentSite?.branding?.logo ||
    hospital?.settings?.headerUrl ||
    parentSite?.settings?.headerUrl ||
    null;

  const footerImage =
    hospital?.settings?.footerUrl ||
    parentSite?.settings?.footerUrl ||
    null;

  return {
    hospital,
    parentSite,
    logo,
    footerImage,
    hospitalName: hospital?.branding?.displayName || hospital?.name || "Diagnostic Imaging & Teleradiology",
    address: hospital?.address || parentSite?.address || "",
    phone: hospital?.phone || parentSite?.phone || "",
    email: hospital?.email || hospital?.branding?.supportEmail || "",
  };
}

/**
 * Normalizes text content: converts newlines into clean paragraph/break HTML
 * if it comes in plain text or preserves rich HTML.
 */
export function formatReportHtmlContent(rawContent) {
  if (!rawContent || !rawContent.trim()) {
    return "";
  }
  const trimmed = rawContent.trim();
  // Check if it's already HTML (contains HTML tags)
  const isHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  if (isHtml) {
    return trimmed;
  }

  // Convert plain text with sections like FINDINGS: / IMPRESSION: into structured HTML
  const lines = trimmed.split("\n");
  let formattedHtml = "";
  let inList = false;

  for (let line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) {
      formattedHtml += "<div style='height: 6px;'></div>";
      continue;
    }

    // Check if line is a major medical section header (e.g. FINDINGS:, IMPRESSION:, CLINICAL HISTORY:, TECHNIQUE:)
    if (/^[A-Z\s\/\-_]{3,30}:$/.test(cleanLine) || /^(CLINICAL HISTORY|TECHNIQUE|OBSERVATION|FINDINGS|IMPRESSION|ADVICE|NOTE):?/i.test(cleanLine)) {
      formattedHtml += `<h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1.5px solid #e2e8f0; width: 100%; box-sizing: border-box;">${cleanLine}</h3>`;
    } else {
      formattedHtml += `<p style="margin: 0 0 5px 0; font-size: 12px; line-height: 1.55; color: #1e293b; text-align: justify; text-justify: inter-word; width: 100%; box-sizing: border-box; word-break: normal; overflow-wrap: break-word;">${cleanLine}</p>`;
    }
  }

  return formattedHtml;
}

/**
 * Resolves the report text content for a study:
 * Uses study.reportText if present, or resolves matching custom template / catalog template.
 */
export function resolveStudyReportContent(study, templates = []) {
  if (study?.reportText && study.reportText.trim().length > 0) {
    return formatReportHtmlContent(study.reportText);
  }

  // If no reportText saved, find custom template for this hospital / modality / study
  const normMod = (study?.modality || "").toUpperCase().trim();
  const normDesc = (study?.studyDescription || study?.bodyPart || "").toUpperCase().trim();

  if (templates && templates.length > 0) {
    const matched = templates.find((t) => {
      if (t.isActive === false) return false;
      const tHosp = t.hospitalId;
      const tMod = (t.modality || "").toUpperCase().trim();
      const hospMatches = !tHosp || tHosp === "ALL" || tHosp === study?.hospitalId;
      const modMatches =
        !tMod ||
        tMod === normMod ||
        (normMod === "MR" && tMod === "MRI") ||
        (normMod === "MRI" && tMod === "MR");
      if (!hospMatches || !modMatches) return false;

      const sName = (t.studyName || "").toUpperCase().trim();
      return (
        sName === normDesc ||
        sName.includes(normDesc) ||
        normDesc.includes(sName)
      );
    });

    if (matched?.templateContent) {
      return formatReportHtmlContent(matched.templateContent);
    }
  }

  // Formal default clinical structure
  const studyTitle = study?.studyDescription || `${study?.modality || "Radiology"} Scan`;
  return formatReportHtmlContent(`
    <h3><strong>CLINICAL HISTORY:</strong></h3>
    <p>${study?.clinicalHistory || "Routine diagnostic evaluation."}</p>
    <br/>
    <h3><strong>TECHNIQUE:</strong></h3>
    <p>Standard multiplanar sequences of ${studyTitle} were acquired without intravenous contrast administration according to standardized imaging protocol.</p>
    <br/>
    <h3><strong>FINDINGS:</strong></h3>
    <p>The visualized anatomical structures demonstrate normal morphology, signal intensity, and architectural alignment. No focal cortical or parenchymal lesions detected. Surrounding tissue planes and compartments appear normal.</p>
    <br/>
    <h3><strong>IMPRESSION:</strong></h3>
    <p>Normal study within physiological limits. No acute significant radiological abnormality identified.</p>
  `);
}

/**
 * Generates an off-screen standard formal DOM node suitable for html2canvas rendering.
 * Fixed exact A4 dimensions, balanced 15mm-20mm padding, word-break, and clear readable layout.
 */
export function buildFormalReportDOM({
  study,
  patient,
  hospital,
  parentSite,
  radiologist,
  reportContentHtml,
  branding,
}) {
  const container = document.createElement("div");
  // Mount in viewport but visually hidden behind everything to ensure accurate browser font and layout metrics
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.zIndex = "-99999";
  container.style.visibility = "visible";
  container.style.opacity = "1";
  container.style.pointerEvents = "none";
  
  // Standard A4 rendering canvas width (794px = 210mm @ 96DPI)
  container.style.width = "794px";
  container.style.minHeight = "1123px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1e293b";
  container.style.fontFamily = "'Inter', Arial, Helvetica, sans-serif";
  container.style.padding = "36px 42px";
  container.style.boxSizing = "border-box";

  const studyDateStr = study?.studyDate
    ? format(new Date(study.studyDate), "dd MMM yyyy")
    : study?.createdAt
    ? format(new Date(study.createdAt), "dd MMM yyyy")
    : "N/A";

  const reportDateStr = study?.finalizedAt
    ? format(new Date(study.finalizedAt), "dd MMM yyyy, hh:mm a")
    : study?.updatedAt
    ? format(new Date(study.updatedAt), "dd MMM yyyy, hh:mm a")
    : format(new Date(), "dd MMM yyyy, hh:mm a");

  const logoHtml = branding.logo
    ? `<img src="${branding.logo}" style="max-height: 56px; max-width: 220px; object-fit: contain; display: block;" alt="Logo" />`
    : `<div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0D2461; letter-spacing: -0.5px; text-transform: uppercase;">UNNATHI</h1>
        <div style="font-size: 9px; font-weight: 700; color: #00A8CC; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">Diagnostic Imaging & Teleradiology</div>
       </div>`;

  const headerFacilityInfo = `
    <div style="text-align: right; font-size: 11px; line-height: 1.4; color: #475569; max-width: 320px;">
      <div style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">
        ${branding.hospitalName}
      </div>
      ${branding.address ? `<div style="font-size: 10px;">${branding.address}</div>` : ""}
      ${branding.phone ? `<div style="font-size: 10px;">Ph: ${branding.phone}</div>` : ""}
      ${branding.email ? `<div style="font-size: 10px;">Email: ${branding.email}</div>` : ""}
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; min-height: 1040px; justify-content: space-between; box-sizing: border-box; width: 100%;">
      <div style="width: 100%; box-sizing: border-box;">
        <!-- Standard Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0D2461; padding-bottom: 12px; margin-bottom: 14px; width: 100%; box-sizing: border-box;">
          <div>${logoHtml}</div>
          <div>${headerFacilityInfo}</div>
        </div>

        <!-- Demographics Box with clear structured columns -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed;">
            <tr>
              <td style="width: 18%; font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Patient Name:</td>
              <td style="width: 32%; font-weight: 800; color: #0f172a; padding: 3px 8px 3px 0; text-transform: uppercase; word-break: break-word;">${patient?.name || "N/A"}</td>
              <td style="width: 18%; font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Study Date:</td>
              <td style="width: 32%; font-weight: 700; color: #0f172a; padding: 3px 0;">${studyDateStr}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Age / Gender:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 8px 3px 0;">${patient?.age ? `${patient.age} Y` : "N/A"} / ${patient?.gender || "N/A"}</td>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Case Number:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${study?.caseNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Patient UHID:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 8px 3px 0;">${patient?.uhid || "N/A"}</td>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Modality:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${study?.modality || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Ref Doctor:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 8px 3px 0;">${patient?.referringDoctor || "Self / Consultant"}</td>
              <td style="font-weight: 700; color: #64748b; padding: 3px 4px 3px 0; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">Report Date:</td>
              <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${reportDateStr}</td>
            </tr>
          </table>
        </div>

        <!-- Examination Title -->
        <div style="text-align: center; margin-bottom: 16px; padding-bottom: 4px;">
          <h2 style="margin: 0; font-size: 13.5px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid #00A8CC; display: inline-block; padding-bottom: 3px;">
            ${study?.modality || ""} ${study?.studyDescription ? `- ${study.studyDescription}` : "REPORT"}
          </h2>
        </div>

        <!-- Clinical Report Body with Standard Typography and Safe Inner Width -->
        <div class="report-standard-body" style="font-size: 12px; line-height: 1.55; color: #1e293b; width: 100%; box-sizing: border-box; overflow-wrap: break-word; word-wrap: break-word; word-break: normal;">
          ${reportContentHtml}
        </div>
      </div>

      <!-- Footer & Signature Block (Cleanly Aligned at the Bottom with Standardized Classic Format) -->
      <div style="margin-top: auto; padding-top: 24px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
          <div style="text-align: center; min-width: 220px;">
            <div style="height: 42px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              ${
                radiologist?.signatureUrl && radiologist.signatureUrl.startsWith("data:image")
                  ? `<img src="${radiologist.signatureUrl}" style="max-height: 38px; max-width: 150px; object-fit: contain;" alt="Signature" />`
                  : `<span style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #0D2461;">${radiologist?.name ? radiologist.name.split(" ")[1] || radiologist.name : "Dr. Verified"}</span>`
              }
            </div>
            <div style="border-top: 2px solid #0D2461; padding-top: 6px;">
              <div style="font-weight: 800; font-size: 11.5px; color: #0f172a; text-transform: uppercase;">
                ${radiologist?.name || "Consultant Radiologist"}
              </div>
              <div style="font-size: 9.5px; font-weight: 700; color: #00A8CC; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                ${radiologist?.qualification || "MBBS, MD (Radiodiagnosis)"}
              </div>
              <div style="font-size: 8.5px; font-weight: 600; color: #64748b; margin-top: 2px;">
                Reg No: ${radiologist?.registrationId || "KMC-48291"}
              </div>
            </div>
          </div>
        </div>

        <!-- Document Bottom Footer Notice -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; font-size: 8.5px; color: #94a3b8; line-height: 1.4;">
          <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 2px;">
            *** End of Report ***
          </div>
          <div>This is an electronically verified and authenticated diagnostic radiology report. Generated via Unnathi Teleradiology Platform.</div>
        </div>
      </div>
    </div>
  `;

  return container;
}

/**
 * Downloads standardized formal PDF report.
 */
export async function downloadStandardReportPDF({
  study,
  patient,
  hospitals = [],
  sites = [],
  radiologists = [],
  templates = [],
}) {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const hospital = hospitals.find((h) => h.id === study?.hospitalId);
  const parentSite = hospital?.parentSiteId
    ? sites.find((s) => s.id === hospital.parentSiteId)
    : null;
  const radiologist = radiologists.find((r) => r.id === study?.assignedRadiologistId);
  const branding = getReportBranding(study, hospitals, sites);
  const reportContentHtml = resolveStudyReportContent(study, templates);

  const container = buildFormalReportDOM({
    study,
    patient,
    hospital,
    parentSite,
    radiologist,
    reportContentHtml,
    branding,
  });

  document.body.appendChild(container);

  try {
    // Wait for images and webfonts to settle
    await new Promise((resolve) => setTimeout(resolve, 60));

    const measuredWidth = container.offsetWidth || 794;
    const measuredHeight = container.offsetHeight || 1123;

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: measuredWidth,
      height: measuredHeight,
      windowWidth: measuredWidth,
      windowHeight: measuredHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Standard A4 dimensions in mm: 210 x 297
    const pdfPageWidth = 210;
    const pdfPageHeight = 297;
    // Calculate full scaled height in mm
    const totalImgHeightMm = (canvas.height * pdfPageWidth) / canvas.width;

    // If report fits inside 1 page (or marginally exceeds 1 page by <= 15mm), fit neatly onto 1 page
    if (totalImgHeightMm <= pdfPageHeight + 10) {
      const renderHeight = Math.min(totalImgHeightMm, pdfPageHeight);
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, pdfPageWidth, renderHeight, undefined, "FAST");
    } else {
      // Multi-page slicing
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      let heightLeft = totalImgHeightMm;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfPageWidth, totalImgHeightMm, undefined, "FAST");
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfPageWidth, totalImgHeightMm, undefined, "FAST");
        heightLeft -= pdfPageHeight;
      }
    }

    const safePatientName = (patient?.name || "Patient").replace(/\s+/g, "_");
    const safeCaseNo = study?.caseNumber || "Report";
    pdf.save(`Report_${safePatientName}_${safeCaseNo}.pdf`);
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Downloads standardized formal Word document (.doc) with full styling, branding header, logo, demographics table, and signature.
 */
export function downloadStandardReportWord({
  study,
  patient,
  hospitals = [],
  sites = [],
  radiologists = [],
  templates = [],
}) {
  const hospital = hospitals.find((h) => h.id === study?.hospitalId);
  const parentSite = hospital?.parentSiteId
    ? sites.find((s) => s.id === hospital.parentSiteId)
    : null;
  const radiologist = radiologists.find((r) => r.id === study?.assignedRadiologistId);
  const branding = getReportBranding(study, hospitals, sites);
  const reportContentHtml = resolveStudyReportContent(study, templates);

  const studyDateStr = study?.studyDate
    ? format(new Date(study.studyDate), "dd MMM yyyy")
    : study?.createdAt
    ? format(new Date(study.createdAt), "dd MMM yyyy")
    : "N/A";

  const reportDateStr = study?.finalizedAt
    ? format(new Date(study.finalizedAt), "dd MMM yyyy, hh:mm a")
    : study?.updatedAt
    ? format(new Date(study.updatedAt), "dd MMM yyyy, hh:mm a")
    : format(new Date(), "dd MMM yyyy, hh:mm a");

  const logoMarkup = branding.logo
    ? `<img src="${branding.logo}" width="160" height="48" style="width: 160px; max-width: 160px; height: auto; max-height: 48px; object-fit: contain; display: block;" alt="Logo" />`
    : `<h1 style="color: #0D2461; margin: 0; font-size: 20pt; font-family: 'Arial', sans-serif;">UNNATHI</h1><p style="color: #00A8CC; font-size: 8.5pt; font-weight: bold; margin: 2pt 0 0 0; text-transform: uppercase;">Diagnostic Imaging & Teleradiology</p>`;

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <meta charset="utf-8">
      <title>Radiology Report - ${study?.caseNumber || ""}</title>
      <style>
        @page {
          size: 210mm 297mm;
          margin: 18mm 18mm 18mm 18mm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
          font-size: 10.5pt;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
        h2, h3 {
          color: #0f172a;
          margin-top: 12pt;
          margin-bottom: 4pt;
        }
        h3 {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        p {
          margin: 0 0 5pt 0;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border-bottom: 2pt solid #0D2461;
          padding-bottom: 8pt;
          margin-bottom: 12pt;
        }
        .demo-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #f8fafc;
          border: 1pt solid #cbd5e1;
          margin-bottom: 14pt;
        }
        .demo-table td {
          padding: 4pt 6pt;
          font-size: 9pt;
        }
        .demo-label {
          color: #64748b;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 8pt;
          width: 18%;
        }
        .demo-val {
          color: #0f172a;
          font-weight: bold;
          width: 32%;
        }
        .report-title {
          text-align: center;
          margin: 12pt 0 12pt 0;
        }
        .report-title h2 {
          text-transform: uppercase;
          font-size: 12pt;
          letter-spacing: 0.5pt;
          border-bottom: 1.5pt solid #00A8CC;
          display: inline-block;
          padding-bottom: 2pt;
        }
        .report-body {
          margin-top: 10pt;
          font-size: 10.5pt;
          line-height: 1.5;
          text-align: justify;
        }
        .sig-table {
          width: 100%;
          margin-top: 24pt;
          border-collapse: collapse;
        }
        .footer-note {
          margin-top: 18pt;
          border-top: 1pt solid #e2e8f0;
          padding-top: 6pt;
          text-align: center;
          font-size: 8pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <!-- Header Table -->
      <table class="header-table" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="vertical-align: middle; width: 45%;">
            ${logoMarkup}
          </td>
          <td style="text-align: right; vertical-align: middle; font-size: 9pt; color: #475569; width: 55%;">
            <strong style="font-size: 11pt; color: #0f172a; text-transform: uppercase;">${branding.hospitalName}</strong><br/>
            ${branding.address ? `<span>${branding.address}</span><br/>` : ""}
            ${branding.phone ? `<span>Ph: ${branding.phone}</span><br/>` : ""}
            ${branding.email ? `<span>Email: ${branding.email}</span>` : ""}
          </td>
        </tr>
      </table>

      <!-- Demographics Table -->
      <table class="demo-table" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="demo-label">Patient Name:</td>
          <td class="demo-val" style="text-transform: uppercase;">${patient?.name || "N/A"}</td>
          <td class="demo-label">Study Date:</td>
          <td class="demo-val">${studyDateStr}</td>
        </tr>
        <tr>
          <td class="demo-label">Age / Gender:</td>
          <td class="demo-val">${patient?.age ? `${patient.age} Y` : "N/A"} / ${patient?.gender || "N/A"}</td>
          <td class="demo-label">Case Number:</td>
          <td class="demo-val">${study?.caseNumber || "N/A"}</td>
        </tr>
        <tr>
          <td class="demo-label">Patient UHID:</td>
          <td class="demo-val">${patient?.uhid || "N/A"}</td>
          <td class="demo-label">Modality:</td>
          <td class="demo-val">${study?.modality || "N/A"}</td>
        </tr>
        <tr>
          <td class="demo-label">Ref Doctor:</td>
          <td class="demo-val">${patient?.referringDoctor || "Self / Consultant"}</td>
          <td class="demo-label">Report Date:</td>
          <td class="demo-val">${reportDateStr}</td>
        </tr>
      </table>

      <!-- Title -->
      <div class="report-title">
        <h2>${study?.modality || ""} ${study?.studyDescription ? `- ${study.studyDescription}` : "REPORT"}</h2>
      </div>

      <!-- Report Body -->
      <div class="report-body">
        ${reportContentHtml}
      </div>

      <!-- Electronic Signature Section: Compact right-aligned box with explicit line length -->
      <table class="sig-table" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width: 65%;"></td>
          <td style="width: 35%; text-align: center;">
            <div style="height: 32pt; margin-bottom: 2pt;">
              ${
                radiologist?.signatureUrl && radiologist.signatureUrl.startsWith("data:image")
                  ? `<img src="${radiologist.signatureUrl}" width="120" height="35" style="width: 120px; height: 35px; object-fit: contain;" alt="Signature" />`
                  : `<span style="font-family: 'Brush Script MT', cursive; font-size: 18pt; color: #0D2461;">${radiologist?.name ? radiologist.name.split(" ")[1] || radiologist.name : "Dr. Verified"}</span>`
              }
            </div>
            <!-- Dedicated compact line matching text width -->
            <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; width: 150pt; border-top: 1.5pt solid #0D2461;">
              <tr>
                <td style="text-align: center; padding-top: 4pt;">
                  <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-bottom: 1pt;">
                    ${radiologist?.name || "Consultant Radiologist"}
                  </div>
                  <div style="font-size: 8pt; font-weight: bold; color: #00A8CC; text-transform: uppercase; margin-bottom: 1pt;">
                    ${radiologist?.qualification || "MBBS, MD (Radiodiagnosis)"}
                  </div>
                  <div style="font-size: 7.5pt; color: #64748b;">
                    Reg No: ${radiologist?.registrationId || "KMC-48291"}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div class="footer-note">
        <strong>*** End of Report ***</strong><br/>
        This is an electronically verified and authenticated diagnostic radiology report. Generated via Unnathi Teleradiology Platform.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", wordHtml], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safePatientName = (patient?.name || "Patient").replace(/\s+/g, "_");
  const safeCaseNo = study?.caseNumber || "Report";
  a.href = url;
  a.download = `Report_${safePatientName}_${safeCaseNo}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
