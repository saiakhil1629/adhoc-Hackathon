import React, { useState, useMemo } from 'react';
import { FiDownload, FiPrinter, FiGrid, FiUsers, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';

const Reports = () => {
  const { hackathons, trainers, transactions } = useApp();
  const [activeTab, setActiveTab] = useState('campus');

  // Compute Campus Report
  const campusReportData = useMemo(() => {
    return hackathons.map(h => {
      // Find list of allocated trainers for this hackathon
      // Note: we can query the transactions or allocations
      // We will summarize trainers count and status
      return {
        campus_name: h.campus_name,
        location: h.location,
        total_sections: h.total_sections || 0,
        allocated_sections: h.allocated_sections || 0,
        trainer_count: h.trainer_count || 0,
        status: h.status,
        date: h.hackathon_date
      };
    });
  }, [hackathons]);

  // Compute Trainer Report
  const trainerReportData = useMemo(() => {
    return trainers.map(t => ({
      name: t.name,
      email: t.email,
      phone: t.phone,
      status: t.status,
      workload: t.workload_count || 0,
      total_paid: t.total_money_given || 0,
      remaining_balance: t.remaining_balance || 0
    }));
  }, [trainers]);

  // Compute Money Report
  const moneyReportData = useMemo(() => {
    // Sort transactions oldest first to calculate running total chronologically
    const chron = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    
    const mapped = chron.map(tx => {
      running += parseFloat(tx.amount || 0);
      return {
        date: tx.date,
        trainer_name: tx.trainer?.name || 'Unknown Trainer',
        purpose: tx.purpose,
        remarks: tx.remarks || 'None',
        given_by: tx.given_by,
        amount: tx.amount,
        running_total: running
      };
    });

    return mapped.reverse(); // Show latest first in the report view
  }, [transactions]);

  // Compute Pending Hackathons
  const pendingReportData = useMemo(() => {
    return hackathons.filter(h => h.status !== 'Completed').map(h => ({
      campus_name: h.campus_name,
      contact: h.contact_person,
      phone: h.contact_phone,
      date: h.hackathon_date,
      status: h.status,
      total_sections: h.total_sections || 0,
      allocated_sections: h.allocated_sections || 0
    }));
  }, [hackathons]);

  // Compute Completed Hackathons
  const completedReportData = useMemo(() => {
    return hackathons.filter(h => h.status === 'Completed').map(h => ({
      campus_name: h.campus_name,
      contact: h.contact_person,
      phone: h.contact_phone,
      date: h.hackathon_date,
      total_sections: h.total_sections || 0,
      trainer_count: h.trainer_count || 0
    }));
  }, [hackathons]);

  // Handle Export CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'campus') {
      filename = 'Campus_Report.csv';
      headers = ['Campus Name', 'Location', 'Date', 'Status', 'Total Sections', 'Allocated Sections', 'Trainers Assigned'];
      rows = campusReportData.map(r => [
        r.campus_name, r.location, r.date, r.status, r.total_sections, r.allocated_sections, r.trainer_count
      ]);
    } else if (activeTab === 'trainer') {
      filename = 'Trainer_Report.csv';
      headers = ['Trainer Name', 'Email', 'Phone', 'Availability Status', 'Sections Allocated', 'Total Paid (₹)', 'Remaining Balance (₹)'];
      rows = trainerReportData.map(r => [
        r.name, r.email, r.phone, r.status, r.workload, r.total_paid, r.remaining_balance
      ]);
    } else if (activeTab === 'money') {
      filename = 'Money_Report.csv';
      headers = ['Date', 'Trainer Name', 'Purpose', 'Remarks', 'HR Disburser', 'Amount Paid (₹)', 'Running Total (₹)'];
      rows = moneyReportData.map(r => [
        r.date, r.trainer_name, r.purpose, r.remarks, r.given_by, r.amount, r.running_total
      ]);
    } else if (activeTab === 'pending') {
      filename = 'Pending_Hackathons_Report.csv';
      headers = ['Campus Name', 'POC Name', 'POC Phone', 'Scheduled Date', 'Status', 'Total Sections', 'Allocated Sections'];
      rows = pendingReportData.map(r => [
        r.campus_name, r.contact, r.phone, r.date, r.status, r.total_sections, r.allocated_sections
      ]);
    } else if (activeTab === 'completed') {
      filename = 'Completed_Hackathons_Report.csv';
      headers = ['Campus Name', 'POC Name', 'POC Phone', 'Date Completed', 'Total Sections', 'Trainers Deployed'];
      rows = completedReportData.map(r => [
        r.campus_name, r.contact, r.phone, r.date, r.total_sections, r.trainer_count
      ]);
    }

    // Build CSV Content Safely
    const csvContent = [headers.join(','), ...rows.map(row => 
      row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    )].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabItems = [
    { id: 'campus', name: 'Campus Summary', icon: FiGrid },
    { id: 'trainer', name: 'Trainer Directory', icon: FiUsers },
    { id: 'money', name: 'Disbursement Ledger', icon: FiDollarSign },
    { id: 'pending', name: 'Pending Hackathons', icon: FiClock },
    { id: 'completed', name: 'Completed Hackathons', icon: FiCheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Print-only CSS style injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, select, .no-print {
            display: none !important;
          }
          .glass-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-container {
            display: block !important;
          }
        }
      `}</style>

      {/* Main header block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">Generate, customize, and export records in PDF or CSV formats.</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FiPrinter />
            <span>Print Report (PDF)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-205 dark:border-slate-800 overflow-x-auto no-print">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Reports Table Cards */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 print-container">
        
        {/* Printable Title Block */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Adhoc Network Management Portal Report</h2>
          <p className="text-sm text-slate-500 mt-1">Generated Date: {new Date().toLocaleString('en-IN')}</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Category: {tabItems.find(t => t.id === activeTab)?.name}</p>
        </div>

        {/* 1. CAMPUS REPORT VIEW */}
        {activeTab === 'campus' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date Scheduled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Sections</th>
                  <th className="py-3 px-4 text-right">Allocated</th>
                  <th className="py-3 px-4 text-right">Trainers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                {campusReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-bold">{r.campus_name}</td>
                    <td className="py-3.5 px-4">{r.location}</td>
                    <td className="py-3.5 px-4">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs">{r.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">{r.total_sections}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-primary-500">{r.allocated_sections}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-indigo-500">{r.trainer_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TRAINER REPORT VIEW */}
        {activeTab === 'trainer' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Trainer Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Active Allocations</th>
                  <th className="py-3 px-4 text-right">Total Money Paid</th>
                  <th className="py-3 px-4 text-right">Due Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                {trainerReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-bold">{r.name}</td>
                    <td className="py-3.5 px-4">{r.email}</td>
                    <td className="py-3.5 px-4">{r.phone}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.status}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-205">{r.workload} sections</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-500">₹{r.total_paid.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-primary-500">₹{r.remaining_balance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. MONEY DISBURSEMENT LEDGER REPORT VIEW */}
        {activeTab === 'money' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Trainer Name</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4">Disbursed By (HR)</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Running Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                {moneyReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold">{r.trainer_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs">{r.purpose}</span>
                    </td>
                    <td className="py-3.5 px-4 italic text-xs text-slate-400">{r.remarks}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.given_by}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-500">-₹{r.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-205">₹{r.running_total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. PENDING HACKATHONS REPORT VIEW */}
        {activeTab === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">Point of Contact</th>
                  <th className="py-3 px-4">POC Phone</th>
                  <th className="py-3 px-4">Date Scheduled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Allocated Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                {pendingReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-bold">{r.campus_name}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.contact}</td>
                    <td className="py-3.5 px-4">{r.phone}</td>
                    <td className="py-3.5 px-4">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">{r.status}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-primary-500">{r.allocated_sections} / {r.total_sections} sections</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. COMPLETED HACKATHONS REPORT VIEW */}
        {activeTab === 'completed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">POC Name</th>
                  <th className="py-3 px-4">POC Phone</th>
                  <th className="py-3 px-4">Date Completed</th>
                  <th className="py-3 px-4 text-right">Total sections</th>
                  <th className="py-3 px-4 text-right">Trainers Deployed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                {completedReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-bold">{r.campus_name}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.contact}</td>
                    <td className="py-3.5 px-4">{r.phone}</td>
                    <td className="py-3.5 px-4">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-bold">{r.total_sections}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-500">{r.trainer_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
