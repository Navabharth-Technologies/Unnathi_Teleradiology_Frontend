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
              size: A4;
              margin: 0mm;
            }
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page-container {
                min-height: 297mm !important;
                max-height: 297mm !important;
                box-sizing: border-box;
                padding: 16mm 18mm 16mm 18mm !important;
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
            }
            .page-container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 100vh;
              padding: 16mm 18mm;
              box-sizing: border-box;
            }
            .header-bar {
              border-bottom: 2px solid #0D2461;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 900;
              color: #0D2461;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .brand-sub {
              font-size: 9px;
              font-weight: 700;
              color: #00A8CC;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .hosp-meta {
              text-align: right;
              font-size: 11px;
              color: #475569;
              font-weight: 600;
            }
            .patient-card {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              background-color: #f8fafc;
              padding: 10px 14px;
              margin-bottom: 18px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
              font-size: 12px;
            }
            .patient-row {
              display: flex;
            }
            .patient-label {
              width: 100px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .patient-val {
              font-weight: 700;
              color: #0f172a;
            }
            .study-title {
              text-align: center;
              font-size: 14.5px;
              font-weight: 900;
              color: #0D2461;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 14px 0 16px 0;
              padding-bottom: 6px;
              border-bottom: 1.5px solid #00A8CC;
            }
            .report-body {
              color: #0f172a;
              flex: 1;
              line-height: 1.6;
            }
            .report-body h3, .report-body strong {
              color: #0D2461;
            }
            .footer-sign {
              margin-top: auto;
              padding-top: 28px;
              display: flex;
              justify-content: flex-end;
              page-break-inside: avoid;
            }
            .sign-box {
              text-align: center;
              min-width: 220px;
              border-top: 2px solid #0D2461;
              padding-top: 8px;
              font-size: 11px;
              font-weight: 800;
              color: #0D2461;
              text-transform: uppercase;
            }
            .sign-meta {
              font-size: 9.5px;
              color: #64748b;
              font-weight: 600;
              margin-top: 3px;
              letter-spacing: 0.5px;
            }
            .doc-end {
              border-top: 1px solid #e2e8f0;
              margin-top: 16px;
              padding-top: 6px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              font-weight: 600;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div>
              <div class="header-bar">
                <div>
                  <h1 class="brand-name">UNNATHI</h1>
                  <div class="brand-sub">Diagnostic Imaging &amp; Teleradiology</div>
                </div>
                <div class="hosp-meta">
                  ${hospName && hospName !== "Hospital" && hospName !== "Abc" && hospName !== "-" ? `<div>${hospName}</div>` : ""}
                  <div>Report Date: ${studyDate}</div>
                </div>
              </div>

              <div class="patient-card">
                <div class="patient-row"><span class="patient-label">Patient Name:</span><span class="patient-val">${patientName}</span></div>
                <div class="patient-row"><span class="patient-label">Study Date:</span><span class="patient-val">${studyDate}</span></div>
                <div class="patient-row"><span class="patient-label">UHID:</span><span class="patient-val">${uhid}</span></div>
                <div class="patient-row"><span class="patient-label">Modality:</span><span class="patient-val">${modality}</span></div>
                <div class="patient-row"><span class="patient-label">Age / Gender:</span><span class="patient-val">${ageGender}</span></div>
                <div class="patient-row"><span class="patient-label">Ref Doctor:</span><span class="patient-val">${refDoctor}</span></div>
              </div>

              <div class="study-title">${studyDesc}</div>

              <div class="report-body">
                ${reportHtml}
              </div>
            </div>

            <div>
              <div class="footer-sign">
                <div class="sign-box">
                  <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 22px; color: #0D2461; text-transform: none; margin-bottom: 4px; font-weight: normal;">Dr. Verified</div>
                  <div>Consultant Radiologist</div>
                  <div class="sign-meta">Electronically Verified &amp; Signed</div>
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
