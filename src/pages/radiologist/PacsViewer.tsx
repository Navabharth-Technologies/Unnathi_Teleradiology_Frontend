import React from 'react';
import { Maximize2, Layout, SlidersHorizontal, Image as ImageIcon, Ruler, Activity } from 'lucide-react';

const PacsViewer = () => {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-black rounded-xl overflow-hidden border-2 border-gray-800 shadow-2xl">
      {/* Viewer Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 h-14 flex items-center px-4 justify-between text-white">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-teal-400 mr-4">OHIF Viewer Layer</span>
          <div className="flex space-x-1">
            <button className="p-2 hover:bg-gray-700 rounded"><SlidersHorizontal className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-700 rounded"><ImageIcon className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-700 rounded"><Ruler className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-700 rounded"><Activity className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-400">Patient: </span><span className="font-bold">Ravi Kumar (P-1001)</span>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded"><Layout className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-700 rounded"><Maximize2 className="w-5 h-5" /></button>
        </div>
      </div>
      
      {/* Viewer Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Series Thumbnail Sidebar */}
        <div className="w-48 bg-gray-900 border-r border-gray-700 overflow-y-auto p-2 space-y-2">
          {[1, 2, 3, 4].map((series) => (
            <div key={series} className="bg-gray-800 border border-gray-700 rounded-lg p-2 cursor-pointer hover:border-teal-500">
              <div className="aspect-square bg-gray-950 rounded mb-2 flex items-center justify-center text-gray-600 text-xs">Thumbnail {series}</div>
              <p className="text-white text-xs truncate">Series {series} - T2 TRA</p>
              <p className="text-gray-500 text-xs">24 Images</p>
            </div>
          ))}
        </div>
        
        {/* Main Image Viewport (Mock) */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-gray-950">
          <div className="absolute top-4 left-4 text-gray-400 text-xs font-mono">
            <p>MR</p>
            <p>T2 TRA</p>
            <p>Thick: 5.0mm</p>
          </div>
          <div className="absolute bottom-4 right-4 text-gray-400 text-xs font-mono text-right">
            <p>W: 400 L: 40</p>
            <p>Zoom: 1.2x</p>
          </div>
          <ImageIcon className="w-32 h-32 text-gray-800 mb-4" />
          <p className="text-gray-600 font-medium">DICOM Viewport Integration Point</p>
          <p className="text-gray-700 text-sm mt-2">OHIF / Cornerstone.js will render here</p>
        </div>
      </div>
    </div>
  );
};

export default PacsViewer;
