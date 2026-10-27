import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Eraser,
  Printer,
} from "lucide-react";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  patient,
  study,
  hospital,
  onPrint,
}) {
  const editorRef = useRef(null);
  // Sync content whenever value changes externally (e.g. template loaded)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePrintReport = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    const reportHtml = editorRef.current ? editorRef.current.innerHTML : (value || "");
    const patientName = patient?.name || study?.patientName || study?.patient || "Patient";
    const uhid = patient?.uhid || study?.patientUHID || study?.accessionNumber || "-";
    const ageGender = `${patient?.age || study?.age || "-"} Y / ${patient?.gender || study?.gender || "-"}`;
    const studyDate = (study?.studyDate || study?.createdAt || new Date().toISOString()).split("T")[0];
    const modality = study?.modality || "CT / MRI";
    const studyDesc = study?.studyDescription || study?.bodyPart || "DIAGNOSTIC REPORT";
    const refDoctor = patient?.referringDoctor || study?.referringDoctor || "Self";
    const hospName = hospital?.name || study?.hospitalName || "UNNATHI TELERADIOLOGY";

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 18mm 15mm 18mm;
            }
            @media print {
              html, body {
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .report-wrapper {
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
              }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.6;
              background: #fff;
              width: 100%;
            }
            .report-wrapper {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: calc(100vh - 30mm);
              width: 100%;
              box-sizing: border-box;
            }
            .header-bar {
              border-bottom: 2.5px solid #0D2461;
              padding-bottom: 12px;
              margin-bottom: 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
            }
            .brand-name {
              font-size: 26px;
              font-weight: 900;
              color: #0D2461;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
              line-height: 1.1;
            }
            .brand-sub {
              font-size: 9.5px;
              font-weight: 700;
              color: #00A8CC;
              letter-spacing: 1.2px;
              text-transform: uppercase;
              margin-top: 3px;
            }
            .hosp-meta {
              text-align: right;
              font-size: 11px;
              color: #475569;
              line-height: 1.4;
            }
            .hosp-name {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .patient-card {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              background-color: #f8fafc;
              padding: 10px 14px;
              margin-bottom: 18px;
              width: 100%;
            }
            .patient-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
              table-layout: fixed;
            }
            .patient-table td {
              padding: 3.5px 4px;
              vertical-align: middle;
            }
            .patient-label {
              width: 18%;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              font-size: 9.5px;
              letter-spacing: 0.5px;
            }
            .patient-val {
              width: 32%;
              font-weight: 700;
              color: #0f172a;
              word-break: break-word;
            }
            .study-title-wrap {
              text-align: center;
              margin: 14px 0 18px 0;
              width: 100%;
            }
            .study-title {
              display: inline-block;
              font-size: 14px;
              font-weight: 900;
              color: #0D2461;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              padding-bottom: 4px;
              border-bottom: 2px solid #00A8CC;
            }
            .report-body {
              color: #0f172a;
              font-size: 12.5px;
              line-height: 1.6;
              width: 100%;
              word-break: normal;
              overflow-wrap: break-word;
            }
            .report-body h3 {
              color: #0f172a;
              font-size: 13px;
              font-weight: 800;
              margin-top: 14px;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .report-body p {
              margin: 0 0 8px 0;
            }
            .footer-sign-wrapper {
              margin-top: auto;
              padding-top: 32px;
              width: 100%;
              page-break-inside: avoid;
            }
            .footer-sign-row {
              display: flex;
              justify-content: flex-end;
              width: 100%;
              margin-bottom: 14px;
            }
            .sign-box {
              text-align: center;
              width: 230px;
              padding-top: 6px;
            }
            .sign-cursive {
              font-family: 'Brush Script MT', cursive, sans-serif;
              font-size: 26px;
              color: #0D2461;
              line-height: 1;
              margin-bottom: 6px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .sign-line {
              border-top: 2px solid #0D2461;
              padding-top: 6px;
              width: 100%;
            }
            .sign-title {
              font-size: 11.5px;
              font-weight: 800;
              color: #0D2461;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .sign-meta {
              font-size: 9px;
              color: #64748b;
              font-weight: 700;
              margin-top: 3px;
              letter-spacing: 0.6px;
              text-transform: uppercase;
            }
            .doc-end {
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              text-align: center;
              font-size: 8.5px;
              color: #94a3b8;
              font-weight: 700;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="report-wrapper">
            <div style="width: 100%;">
              <div class="header-bar">
                <div>
                  <h1 class="brand-name">UNNATHI</h1>
                  <div class="brand-sub">Diagnostic Imaging &amp; Teleradiology</div>
                </div>
                <div class="hosp-meta">
                  ${hospName && hospName !== "Hospital" && hospName !== "Abc" && hospName !== "-" ? `<div class="hosp-name">${hospName}</div>` : ""}
                  <div>Report Date: ${studyDate}</div>
                </div>
              </div>

              <div class="patient-card">
                <table class="patient-table">
                  <tr>
                    <td class="patient-label">Patient Name:</td>
                    <td class="patient-val">${patientName}</td>
                    <td class="patient-label">Study Date:</td>
                    <td class="patient-val">${studyDate}</td>
                  </tr>
                  <tr>
                    <td class="patient-label">UHID:</td>
                    <td class="patient-val">${uhid}</td>
                    <td class="patient-label">Modality:</td>
                    <td class="patient-val">${modality}</td>
                  </tr>
                  <tr>
                    <td class="patient-label">Age / Gender:</td>
                    <td class="patient-val">${ageGender}</td>
                    <td class="patient-label">Ref Doctor:</td>
                    <td class="patient-val">${refDoctor}</td>
                  </tr>
                </table>
              </div>

              <div class="study-title-wrap">
                <span class="study-title">${studyDesc}</span>
              </div>

              <div class="report-body">
                ${reportHtml}
              </div>
            </div>

            <div class="footer-sign-wrapper">
              <div class="footer-sign-row">
                <div class="sign-box">
                  <div class="sign-cursive">Dr. Verified</div>
                  <div class="sign-line">
                    <div class="sign-title">Consultant Radiologist</div>
                    <div class="sign-meta">Electronically Verified &amp; Signed</div>
                  </div>
                </div>
              </div>
              <div class="doc-end">*** End of Report ***</div>
            </div>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 250);
  };

  const executeCommand = (command, arg) => {
    if (command === "print") {
      handlePrintReport();
      return;
    }
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title, onClick }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          onClick();
        } else {
          executeCommand(command, arg);
        }
      }}
      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div
      className={`flex flex-col border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <select
          className="text-xs border-slate-200 rounded p-1 text-slate-600 bg-white mr-2 hover:bg-slate-50"
          onChange={(e) => executeCommand("fontName", e.target.value)}
          defaultValue="Arial"
        >
          <option value="Arial">Font Name</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
        </select>

        <select
          className="text-xs border-slate-200 rounded p-1 text-slate-600 bg-white mr-2 hover:bg-slate-50"
          onChange={(e) => executeCommand("fontSize", e.target.value)}
          defaultValue="3"
        >
          <option value="3">Font Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
        <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />
        <ToolbarButton
          icon={Underline}
          command="underline"
          title="Underline (Ctrl+U)"
        />

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <ToolbarButton
          icon={AlignLeft}
          command="justifyLeft"
          title="Align Left"
        />
        <ToolbarButton
          icon={AlignCenter}
          command="justifyCenter"
          title="Align Center"
        />
        <ToolbarButton
          icon={AlignRight}
          command="justifyRight"
          title="Align Right"
        />
        <ToolbarButton
          icon={AlignJustify}
          command="justifyFull"
          title="Justify"
        />

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <ToolbarButton
          icon={ListOrdered}
          command="insertOrderedList"
          title="Numbered List"
        />
        <ToolbarButton
          icon={List}
          command="insertUnorderedList"
          title="Bulleted List"
        />

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <ToolbarButton
          icon={Eraser}
          command="removeFormat"
          title="Clear Formatting"
        />
        <ToolbarButton icon={Undo} command="undo" title="Undo (Ctrl+Z)" />
        <ToolbarButton icon={Redo} command="redo" title="Redo (Ctrl+Y)" />
        <ToolbarButton icon={Printer} command="print" title="Print" />
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 min-h-[400px]">
        {!value && (
          <div className="absolute top-6 left-6 text-slate-400 pointer-events-none select-none text-sm leading-relaxed">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="w-full h-full p-6 text-sm text-slate-800 focus:outline-none overflow-y-auto"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight: "400px", lineHeight: "1.6" }}
        />
      </div>
    </div>
  );
}
