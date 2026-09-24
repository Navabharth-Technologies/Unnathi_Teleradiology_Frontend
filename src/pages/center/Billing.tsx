import React, { useState } from 'react';
import { IndianRupee, Search, Download, Plus, Receipt } from 'lucide-react';
import { useToastStore } from '../../app/store/useToastStore';

const mockInvoices = [
  { id: 'INV-2026-1001', patient: 'Ravi Kumar', date: '01 Sep 2026', amount: 8500, status: 'Paid', method: 'UPI' },
  { id: 'INV-2026-1002', patient: 'Anita Desai', date: '01 Sep 2026', amount: 4200, status: 'Pending', method: '-' },
  { id: 'INV-2026-1003', patient: 'Vikram Singh', date: '31 Aug 2026', amount: 1250, status: 'Paid', method: 'Card' },
  { id: 'INV-2026-1004', patient: 'Priya Patel', date: '31 Aug 2026', amount: 8500, status: 'Overdue', method: '-' },
  { id: 'INV-2026-1005', patient: 'Rahul Verma', date: '30 Aug 2026', amount: 3000, status: 'Paid', method: 'Cash' },
];

const Billing = () => {
  const { showToast } = useToastStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing & Invoices</h1>
        <div className="flex gap-3">
          <button onClick={() => showToast('Exporting data as CSV...', 'info')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center hover:bg-gray-50 shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button onClick={() => showToast('New invoice modal opened', 'info')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm border-l-4 border-l-teal-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Today's Collections</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-5 h-5 mr-1 text-gray-400" /> 45,500
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm border-l-4 border-l-yellow-400">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Dues</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-5 h-5 mr-1 text-gray-400" /> 12,200
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Overdue (30+ Days)</p>
          <p className="text-2xl font-bold text-red-600 flex items-center">
            <IndianRupee className="w-5 h-5 mr-1 text-red-400" /> 8,500
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search by invoice ID or patient..."
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-md text-sm p-2 bg-white">
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-gray-400" />
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 font-medium">{inv.patient}</td>
                  <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{inv.method}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-teal-600 hover:text-teal-900 font-medium text-sm">View</button>
                    {inv.status !== 'Paid' && (
                      <button onClick={() => showToast(`Payment processed for ${inv.id}`, 'success')} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm ml-4">Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
