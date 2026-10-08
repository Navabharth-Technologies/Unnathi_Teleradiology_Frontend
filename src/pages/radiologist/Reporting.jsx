import React from "react";
import { Save, Send, FileCheck2 } from "lucide-react";
import { useToastStore } from "../../app/store/useToastStore";

const Reporting = () => {
  const { showToast } = useToastStore();

  const handleSave = () => showToast("Draft saved successfully", "success");
  const handleSubmit = () =>
    showToast("Report submitted for verification", "success");

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-unnathi-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-primary">
          Radiology Report Editor
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-card border border-border text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4 mr-2 text-primary" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Verification
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 animate-unnathi-slide">
          {/* Study Context Panel */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300">
            <h3 className="font-bold text-primary border-b border-border pb-2 mb-3">
              Study Information
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500 font-semibold">Patient:</span>{" "}
                <span className="font-bold text-primary">
                  Ravi Kumar (45/M)
                </span>
              </p>
              <p>
                <span className="text-slate-500 font-semibold">Study:</span>{" "}
                <span className="font-bold text-primary">MRI Brain Plain</span>
              </p>
              <p>
                <span className="text-slate-500 font-semibold">Center:</span>{" "}
                <span className="font-bold text-primary">City Scan Center</span>
              </p>
              <p>
                <span className="text-slate-500 font-semibold">Date:</span>{" "}
                <span className="font-bold text-primary">01 Sep 2026</span>
              </p>
            </div>

            <h3 className="font-bold text-primary border-b border-border pb-2 mb-3 mt-6">
              Clinical History
            </h3>
            <p className="text-sm text-slate-700 font-medium">
              Headache since 2 weeks. H/o hypertension.
            </p>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 hover:shadow-md hover:-translate-y-[2px] transition-all duration-300">
            <h3 className="font-bold text-accent mb-2">Templates</h3>
            <select className="w-full border-border rounded-lg text-sm p-2.5 bg-background text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none font-medium">
              <option>Select Template...</option>
              <option>Normal MRI Brain</option>
              <option>MRI Brain with Contrast</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6 animate-unnathi-slide-up">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-4 flex items-center tracking-tight">
              <FileCheck2 className="w-5 h-5 mr-2 text-accent" />
              Findings
            </h3>
            <textarea
              className="w-full h-64 p-4 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none font-medium text-sm leading-relaxed outline-none transition-all duration-300 hover:shadow-sm"
              defaultValue={`Brain parenchyma appears normal in signal intensity.
No focal lesion seen in cerebral or cerebellar hemispheres.
Ventricles and basal cisterns are normal.
Midline structures are centrally placed.`}
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-4 tracking-tight">
              Impression
            </h3>
            <textarea
              className="w-full h-32 p-4 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none font-bold text-sm outline-none transition-all duration-300 hover:shadow-sm"
              defaultValue={`Normal MRI Brain.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
