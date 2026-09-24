import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo, Redo, Eraser, Printer } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Type here...", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Set initial content once if provided
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: { icon: any, command: string, arg?: string, title: string }) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); executeCommand(command, arg); }}
      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`flex flex-col border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <select 
          className="text-xs border-slate-200 rounded p-1 text-slate-600 bg-white mr-2 hover:bg-slate-50"
          onChange={(e) => executeCommand('fontName', e.target.value)}
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
          onChange={(e) => executeCommand('fontSize', e.target.value)}
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
        <ToolbarButton icon={Underline} command="underline" title="Underline (Ctrl+U)" />
        
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        <ToolbarButton icon={AlignJustify} command="justifyFull" title="Justify" />
        
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bulleted List" />
        
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        
        <ToolbarButton icon={Eraser} command="removeFormat" title="Clear Formatting" />
        <ToolbarButton icon={Undo} command="undo" title="Undo (Ctrl+Z)" />
        <ToolbarButton icon={Redo} command="redo" title="Redo (Ctrl+Y)" />
        <ToolbarButton icon={Printer} command="print" title="Print" />
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorRef}
        className="flex-1 p-6 text-sm text-slate-800 focus:outline-none min-h-[400px] overflow-y-auto"
        contentEditable
        onInput={handleInput}
        style={{ minHeight: '100%', lineHeight: '1.6' }}
      >
        {!value && <span className="text-slate-400 pointer-events-none absolute">{placeholder}</span>}
      </div>
    </div>
  );
}
