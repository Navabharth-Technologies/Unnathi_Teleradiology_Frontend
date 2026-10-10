import React from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { HelpCircle, X } from "lucide-react";

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  itemName,
  confirmButtonText = "Confirm",
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] animate-in fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-blue-900 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
          {itemName && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
              <span className="font-bold text-slate-800 break-all">
                {itemName}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 py-4 px-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="font-bold border-slate-200 hover:bg-white text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
              onClose();
            }}
            className="bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
