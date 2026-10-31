import React, { useState, useEffect, useRef } from 'react';
import {
  FileBarChart,
  Calendar,
  Printer,
  Download,
  Loader2,
  CheckCircle2,
  CheckSquare,
  Square,
  Users,
  Flame,
  Boxes,
  ReceiptText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useInventory } from '../context/InventoryContext';
import { BrandLogo } from './BrandLogo';

export const ReportSection: React.FC = () => {
  const {
    currentUser,
    todayDate,
    workers,
    attendance,
    getWorkerStatusForDate,
    calculateWorkerMonthlyStats,
    productions,
    getProductionByDate,
    stocks,
    getStockUsageStats,
    bills,
    purchases,
    calculatePurchaseByDate,
    sells,
    calculateSellByDate,
  } = useInventory();

  const isAdmin = currentUser?.role === 'admin';

  // Report Date Selection - synced with todayDate by default
  const [reportDate, setReportDate] = useState<string>(todayDate);

  // Keep reportDate in sync if todayDate changes (e.g. user updated date in Workers section)
  useEffect(() => {
    setReportDate(todayDate);
  }, [todayDate]);

  const [reportScope, setReportScope] = useState<'date' | 'all'>('date');

  // Modular Selection Checkboxes
  const [includeWorkers, setIncludeWorkers] = useState(true);
  const [includeProduction, setIncludeProduction] = useState(true);
  const [includeStocks, setIncludeStocks] = useState(true);
  const [includeBills, setIncludeBills] = useState(true);
  const [includePurchaseSells, setIncludePurchaseSells] = useState(true);

  // Helper date shift functions
  const getPrevDate = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getNextDate = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const yesterdayDate = getPrevDate(todayDate);
  const dayBeforeDate = getPrevDate(yesterdayDate);

  // 1. WORKERS & ATTENDANCE DATA (Dynamically derived from real workforce)
  const workerReportData = workers.map((w) => {
    const dailyStatus = getWorkerStatusForDate(w.id, reportDate);
    const attRecord = attendance.find((a) => a.workerId === w.id && a.date === reportDate);
    const monthlyStats = calculateWorkerMonthlyStats(w, reportDate);

    return {
      worker: w,
      status: dailyStatus,
      reportingTime:
        attRecord?.reportingTime || (dailyStatus === 'Active' ? '08:30 AM' : '-'),
      leavingReportingTime:
        attRecord?.leavingReportingTime || (dailyStatus === 'Active' ? '05:30 PM' : '-'),
      notes: attRecord?.notes || (dailyStatus === 'Active' ? 'Standard Shift' : 'Off duty / Leave'),
      perDayRate: monthlyStats.perDayRate,
      activeDays: monthlyStats.activeDays,
      inactiveDays: monthlyStats.inactiveDays,
      calculatedMonthlyCompensation: monthlyStats.calculatedMonthlyCompensation,
    };
  });

  const activeWorkersCount = workerReportData.filter((r) => r.status === 'Active').length;
  const inactiveWorkersCount = workerReportData.length - activeWorkersCount;
  const totalMonthlyPayroll = workerReportData.reduce(
    (sum, r) => sum + r.calculatedMonthlyCompensation,
    0
  );

  // 2. PRODUCTION DATA
  const productionSummary = getProductionByDate(reportDate);
  const targetProductions =
    reportScope === 'all' ? productions : productionSummary.records;

  const totalProdKg =
    reportScope === 'all'
      ? productions.reduce((sum, p) => sum + (p.unit === 'kg' ? p.quantity : 0), 0)
      : productionSummary.totalKg;

  const totalProdUnits =
    reportScope === 'all'
      ? productions.reduce((sum, p) => sum + (p.unit === 'units' ? p.quantity : 0), 0)
      : productionSummary.totalUnits;

  // 3. BILLS DATA (Filtered by role permissions & scope)
  const permittedBills = bills.filter((b) => {
    if (!isAdmin && (b.category === 'Employee Salary' || b.isSalaryConfidential)) {
      return false;
    }
    return true;
  });

  const reportBills =
    reportScope === 'all'
      ? permittedBills
      : permittedBills.filter((b) => b.date === reportDate);

  const totalBillsAmount = reportBills.reduce((sum, b) => sum + b.amount, 0);

  // 4. PURCHASES & SELLS DATA
  const reportPurchases =
    reportScope === 'all'
      ? { total: purchases.reduce((s, p) => s + p.totalCost, 0), records: purchases }
      : calculatePurchaseByDate(reportDate);

  const reportSells =
    reportScope === 'all'
      ? { total: sells.reduce((sum, item) => sum + item.moneyEarned, 0), records: sells }
      : calculateSellByDate(reportDate);

  const tradeGrossMargin = reportSells.total - reportPurchases.total;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportToast, setReportToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setReportToast(msg);
    setTimeout(() => {
      setReportToast(null);
    }, 4000);
  };

  // Direct Browser Printout handler
  const handlePrintPdf = () => {
    showToast('Opening print dialog. Select printer or "Save as PDF".');
    try {
      window.print();
    } catch (e) {
      console.warn('Native window.print failed, initiating direct PDF generation', e);
      handleDownloadPdf();
    }
  };

  // Direct Client-Side PDF Generation and Download
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Rendering high-resolution PDF document...');

    try {
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#0F071D',
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 10; // 5mm margin on sides
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const fileDate = reportScope === 'all' ? 'All_Records' : reportDate;
      const fileName = `Shubhpratik_Factory_Report_${fileDate}.pdf`;
      pdf.save(fileName);
      showToast(`Downloaded: ${fileName}`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Opening print preview dialog...');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toggleSelectAll = (select: boolean) => {
    setIncludeWorkers(select);
    setIncludeProduction(select);
    setIncludeStocks(select);
    setIncludeBills(select);
    setIncludePurchaseSells(select);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification for Print/PDF */}
      {reportToast && (
        <div className="no-print fixed top-20 right-6 z-50 bg-[#170B2C] border border-white/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{reportToast}</span>
          <button
            onClick={() => setReportToast(null)}
            className="ml-2 text-white/70 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Generation Controls (Hidden in Print) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-3">
          <div>
            <h2 className="font-semibold text-white text-lg flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-white" />
              Reports
            </h2>
          </div>

          {/* Fully Enabled Print & PDF Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_14px_rgba(255,255,255,0.25)] cursor-pointer transition-all disabled:opacity-60"
              title="Download standalone PDF document to laptop"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#19092F]" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#19092F]" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md cursor-pointer transition-all shadow-sm"
              title="Print out report on paper or Save as PDF via Browser"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Configuration Box with transparent blurred glass */}
        <div className="glass-block rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Date Selection */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white" />
                Select Audit Date *
              </label>
              <div className="flex items-center gap-1.5 glass-block-subtle rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setReportDate(getPrevDate(reportDate))}
                  title="Previous Day"
                  className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => {
                    setReportDate(e.target.value);
                    setReportScope('date');
                  }}
                  className="w-full bg-transparent text-xs text-white font-mono-numbers px-2 py-1 focus:outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setReportDate(getNextDate(reportDate))}
                  title="Next Day"
                  className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets & Report Scope */}
            <div className="lg:col-span-8 flex flex-wrap items-center gap-2 pt-1 lg:pt-5">
              <span className="text-xs text-[#D8B4FE]/70">Quick Select:</span>
              <button
                type="button"
                onClick={() => {
                  setReportDate(todayDate);
                  setReportScope('date');
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors backdrop-blur-sm ${
                  reportDate === todayDate && reportScope === 'date'
                    ? 'bg-white text-[#19092F] font-bold border-white'
                    : 'bg-[#241142]/60 border-purple-900/60 text-[#E9D5FF] hover:border-white'
                }`}
              >
                Today ({todayDate})
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportDate(yesterdayDate);
                  setReportScope('date');
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  reportDate === yesterdayDate && reportScope === 'date'
                    ? 'bg-white text-[#19092F] font-bold border-white'
                    : 'bg-[#241142] border-purple-900/60 text-[#E9D5FF] hover:border-white'
                }`}
              >
                Yesterday ({yesterdayDate})
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportDate(dayBeforeDate);
                  setReportScope('date');
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  reportDate === dayBeforeDate && reportScope === 'date'
                    ? 'bg-white text-[#19092F] font-bold border-white'
                    : 'bg-[#241142] border-purple-900/60 text-[#E9D5FF] hover:border-white'
                }`}
              >
                {dayBeforeDate}
              </button>
            </div>
          </div>

          {/* Module Checkbox Grid */}
          <div className="pt-3 border-t border-purple-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white">
                Include Sections:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleSelectAll(true)}
                  className="text-white hover:underline cursor-pointer font-medium"
                >
                  Select All
                </button>
                <span className="text-purple-800">·</span>
                <button
                  type="button"
                  onClick={() => toggleSelectAll(false)}
                  className="text-[#D8B4FE]/70 hover:text-white cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Checkbox: Workers */}
              <button
                type="button"
                onClick={() => setIncludeWorkers(!includeWorkers)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  includeWorkers
                    ? 'bg-[#241142] border-[#D8B4FE] text-white'
                    : 'bg-[#120723] border-purple-950/60 text-[#D8B4FE]/50'
                }`}
              >
                {includeWorkers ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#D8B4FE]/40 shrink-0" />
                )}
                <span className="font-semibold text-xs">Workers</span>
              </button>

              {/* Checkbox: Production */}
              <button
                type="button"
                onClick={() => setIncludeProduction(!includeProduction)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors backdrop-blur-sm ${
                  includeProduction
                    ? 'bg-[#241142]/80 border-[#D8B4FE] text-white'
                    : 'bg-[#120723]/50 border-purple-950/60 text-[#D8B4FE]/50'
                }`}
              >
                {includeProduction ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#D8B4FE]/40 shrink-0" />
                )}
                <span className="font-semibold text-xs">Production</span>
              </button>

              {/* Checkbox: Stocks */}
              <button
                type="button"
                onClick={() => setIncludeStocks(!includeStocks)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors backdrop-blur-sm ${
                  includeStocks
                    ? 'bg-[#241142]/80 border-[#D8B4FE] text-white'
                    : 'bg-[#120723]/50 border-purple-950/60 text-[#D8B4FE]/50'
                }`}
              >
                {includeStocks ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#D8B4FE]/40 shrink-0" />
                )}
                <span className="font-semibold text-xs">Stocks</span>
              </button>

              {/* Checkbox: Bills */}
              <button
                type="button"
                onClick={() => setIncludeBills(!includeBills)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors backdrop-blur-sm ${
                  includeBills
                    ? 'bg-[#241142]/80 border-[#D8B4FE] text-white'
                    : 'bg-[#120723]/50 border-purple-950/60 text-[#D8B4FE]/50'
                }`}
              >
                {includeBills ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#D8B4FE]/40 shrink-0" />
                )}
                <span className="font-semibold text-xs">Bills</span>
              </button>

              {/* Checkbox: Purchase & Sells */}
              <button
                type="button"
                onClick={() => setIncludePurchaseSells(!includePurchaseSells)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors backdrop-blur-sm ${
                  includePurchaseSells
                    ? 'bg-[#241142]/80 border-[#D8B4FE] text-white'
                    : 'bg-[#120723]/50 border-purple-950/60 text-[#D8B4FE]/50'
                }`}
              >
                {includePurchaseSells ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#D8B4FE]/40 shrink-0" />
                )}
                <span className="font-semibold text-xs">Purchase & Sells</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT PREVIEW / PRINTABLE DOCUMENT CONTAINER with transparent blurred glass */}
      <div
        ref={reportRef}
        className="print-surface glass-block rounded-2xl p-6 sm:p-10 space-y-8 text-[#E9D5FF] relative"
      >
        {/* Document In-View Quick Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-2 border-b border-purple-900/40 text-xs text-[#D8B4FE]/80">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready for Printout & PDF Export</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Formal Header / Letterhead */}
        <div className="border-b-2 border-[#D8B4FE]/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo size="lg" />
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="text-sm font-bold text-white font-mono-numbers">
              {reportScope === 'all' ? 'SCOPE: Complete Factory Records' : `DATE: ${reportDate}`}
            </div>
          </div>
        </div>

        {/* SECTION 1: WORKERS & ATTENDANCE (If checked) */}
        {includeWorkers && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                1. Workers
              </h3>
              <div className="text-xs text-[#D8B4FE]/80 font-mono-numbers flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Staff: <strong className="text-white">{workers.length}</strong></span>
                <span>·</span>
                <span className="text-white">Active: <strong>{activeWorkersCount}</strong></span>
                <span>·</span>
                <span className="text-[#D8B4FE]/60">Inactive: <strong>{inactiveWorkersCount}</strong></span>
                {isAdmin && (
                  <>
                    <span>·</span>
                    <span className="text-white">Payroll: <strong>₹{totalMonthlyPayroll.toLocaleString('en-IN')}</strong></span>
                  </>
                )}
              </div>
            </div>

            {workerReportData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                    <tr>
                      <th className="py-2.5 px-3">Worker Name</th>
                      <th className="py-2.5 px-3">Role / Department</th>
                      <th className="py-2.5 px-3">Status ({reportDate})</th>
                      <th className="py-2.5 px-3">Reporting Time</th>
                      <th className="py-2.5 px-3">Leaving Time</th>
                      {isAdmin && (
                        <>
                          <th className="py-2.5 px-3 text-right">Per Day</th>
                          <th className="py-2.5 px-3 text-right">Monthly Compensation</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {workerReportData.map((row) => (
                      <tr key={row.worker.id}>
                        <td className="py-2 px-3 font-semibold text-[#FFFDF5]">
                          {row.worker.name}
                        </td>
                        <td className="py-2 px-3 text-[#E9D5FF]">{row.worker.role}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              row.status === 'Active'
                                ? 'bg-white/10 text-white border border-white/30'
                                : 'bg-red-950/40 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono-numbers text-white">{row.reportingTime}</td>
                        <td className="py-2 px-3 font-mono-numbers text-[#E9D5FF]">{row.leavingReportingTime}</td>
                        {isAdmin && (
                          <>
                            <td className="py-2 px-3 text-right font-mono-numbers font-medium text-white">
                              ₹{Math.round(row.perDayRate).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono-numbers font-bold text-[#FFFDF5]">
                              ₹{row.calculatedMonthlyCompensation.toLocaleString('en-IN')}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-[#1C0D34]/50 border border-purple-900/40 rounded-lg text-xs text-[#D8B4FE]/50 italic">
                No active employees registered in workforce memory.
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: PRODUCTION (If checked) */}
        {includeProduction && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2">
              <h3 className="font-bold text-sm text-[#FFFDF5] flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                2. Production
              </h3>
              <span className="text-xs text-[#D8B4FE]/80 font-mono-numbers">
                Total Output: <strong className="text-[#FFFDF5]">{totalProdKg.toLocaleString('en-IN')} KG</strong> · <strong className="text-[#FFFDF5]">{totalProdUnits.toLocaleString('en-IN')} Units</strong>
              </span>
            </div>

            {targetProductions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                    <tr>
                      <th className="py-2.5 px-3">Batch Number</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Fragrance Scent</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {targetProductions.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono-numbers text-white font-medium">{p.batchNumber}</td>
                        <td className="py-2 px-3 font-mono-numbers text-[#D8B4FE]/70">{p.date}</td>
                        <td className="py-2 px-3 font-semibold text-[#FFFDF5]">{p.scentName}</td>
                        <td className="py-2 px-3 font-mono-numbers font-bold text-[#FFFDF5]">
                          {p.quantity.toLocaleString('en-IN')} <span className="uppercase text-[#D8B4FE]/60 text-[10px]">{p.unit}</span>
                        </td>
                        <td className="py-2 px-3 text-[#E9D5FF]">{p.operatorName || '-'}</td>
                        <td className="py-2 px-3 text-[#D8B4FE]/70">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-[#1C0D34]/50 border border-purple-900/40 rounded-lg text-xs text-[#D8B4FE]/70 flex items-center justify-between">
                <span>No manufacturing batches logged directly for date {reportDate}.</span>
                {productions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setReportScope('all')}
                    className="text-white hover:underline font-semibold cursor-pointer"
                  >
                    View All {productions.length} Logged Batches →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: STOCKS (If checked) */}
        {includeStocks && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2">
              <h3 className="font-bold text-sm text-[#FFFDF5] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-white" />
                3. Stocks
              </h3>
              <span className="text-xs text-[#D8B4FE]/80 font-mono-numbers">
                Tracked Materials: <strong className="text-[#FFFDF5]">{stocks.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                  <tr>
                    <th className="py-2.5 px-3">Material Name</th>
                    <th className="py-2.5 px-3">Bought Date</th>
                    <th className="py-2.5 px-3">Bought Qty</th>
                    <th className="py-2.5 px-3 text-white">Used on Date ({reportDate})</th>
                    <th className="py-2.5 px-3 text-[#FFFDF5]">Cumulative Used</th>
                    <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {stocks.map((mat) => {
                    const stats = getStockUsageStats(mat, reportDate);
                    return (
                      <tr key={mat.id}>
                        <td className="py-2 px-3 font-semibold text-[#FFFDF5]">
                          {mat.materialName}
                        </td>
                        <td className="py-2 px-3 font-mono-numbers text-[#D8B4FE]/70">{mat.boughtDate}</td>
                        <td className="py-2 px-3 font-mono-numbers text-[#E9D5FF]">
                          {mat.boughtQuantity.toLocaleString('en-IN')} <span className="uppercase text-[10px] text-[#D8B4FE]/60">{mat.unit}</span>
                        </td>
                        <td className="py-2 px-3 font-mono-numbers text-white font-medium">
                          {stats.usedToday} <span className="text-[10px] text-[#D8B4FE]/60">{mat.unit}</span>
                        </td>
                        <td className="py-2 px-3 font-mono-numbers text-[#FFFDF5] font-semibold">
                          {stats.cumulativeUsed} <span className="text-[10px] text-[#D8B4FE]/60">{mat.unit}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono-numbers font-bold text-[#FFFDF5]">
                          {stats.remainingStock.toLocaleString('en-IN')} <span className="text-[10px] text-[#D8B4FE]/70 uppercase">{mat.unit}</span> ({stats.percentageRemaining}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: BILLS (If checked) */}
        {includeBills && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2">
              <h3 className="font-bold text-sm text-[#FFFDF5] flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-white" />
                4. Bills
              </h3>
              <span className="text-xs text-[#D8B4FE]/80 font-mono-numbers">
                Total Expenses: <strong className="text-[#FFFDF5]">₹{totalBillsAmount.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {reportBills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                    <tr>
                      <th className="py-2.5 px-3">Expense Name</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {reportBills.map((b) => (
                      <tr key={b.id}>
                        <td className="py-2 px-3 font-semibold text-[#FFFDF5]">{b.expenseName}</td>
                        <td className="py-2 px-3 font-mono-numbers text-[#D8B4FE]/70">{b.date}</td>
                        <td className="py-2 px-3 text-[#E9D5FF]">{b.category}</td>
                        <td className="py-2 px-3 font-mono-numbers text-[#D8B4FE]/70">{b.invoiceNumber || '-'}</td>
                        <td className="py-2 px-3 font-medium text-white">{b.paymentStatus}</td>
                        <td className="py-2 px-3 text-right font-mono-numbers font-bold text-[#FFFDF5]">
                          ₹{b.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-[#1C0D34]/50 border border-purple-900/40 rounded-lg text-xs text-[#D8B4FE]/70 flex items-center justify-between">
                <span>No expense bills logged directly on date {reportDate}.</span>
                {permittedBills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setReportScope('all')}
                    className="text-white hover:underline font-semibold cursor-pointer"
                  >
                    View All {permittedBills.length} Factory Bills →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: PURCHASE & SELLS (If checked) */}
        {includePurchaseSells && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2">
              <h3 className="font-bold text-sm text-[#FFFDF5] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                5. Purchase & Sells
              </h3>
              <div className="text-xs text-[#D8B4FE]/80 font-mono-numbers flex flex-wrap items-center gap-2">
                <span>Purchases: <strong className="text-white">₹{reportPurchases.total.toLocaleString('en-IN')}</strong></span>
                <span>·</span>
                <span>Sales: <strong className="text-white">₹{reportSells.total.toLocaleString('en-IN')}</strong></span>
                <span>·</span>
                <span>Margin: <strong className={tradeGrossMargin >= 0 ? 'text-white' : 'text-rose-400'}>
                  ₹{tradeGrossMargin.toLocaleString('en-IN')}
                </strong></span>
              </div>
            </div>

            {/* Purchases breakdown */}
            <div>
              <div className="text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                <span>A. Purchases</span>
                <span className="font-mono-numbers text-[11px] text-[#D8B4FE]/70">
                  {reportPurchases.records.length} Transactions
                </span>
              </div>
              {reportPurchases.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                      <tr>
                        <th className="py-2 px-3">Supplier</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Material</th>
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3 text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/30">
                      {reportPurchases.records.map((p) => (
                        <tr key={p.id}>
                          <td className="py-1.5 px-3 font-medium text-[#FFFDF5]">{p.companyName}</td>
                          <td className="py-1.5 px-3 font-mono-numbers text-[#D8B4FE]/70">{p.date}</td>
                          <td className="py-1.5 px-3 text-[#E9D5FF]">{p.materialName}</td>
                          <td className="py-1.5 px-3 font-mono-numbers text-[#D8B4FE]/80">{p.quantity} {p.unit}</td>
                          <td className="py-1.5 px-3 text-right font-mono-numbers text-white font-semibold">
                            ₹{p.totalCost.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-[#1C0D34]/40 rounded text-[11px] text-[#D8B4FE]/50 italic">
                  No purchases recorded for this date.
                </div>
              )}
            </div>

            {/* Sells breakdown */}
            <div>
              <div className="text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                <span>B. Sells</span>
                <span className="font-mono-numbers text-[11px] text-[#D8B4FE]/70">
                  {reportSells.records.length} Transactions
                </span>
              </div>
              {reportSells.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A0B33] border-b border-purple-900/50 text-[#D8B4FE]/80">
                      <tr>
                        <th className="py-2 px-3">Client Company</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Product Sold</th>
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3 text-right">Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/30">
                      {reportSells.records.map((s) => (
                        <tr key={s.id}>
                          <td className="py-1.5 px-3 font-medium text-[#FFFDF5]">{s.companyName}</td>
                          <td className="py-1.5 px-3 font-mono-numbers text-[#D8B4FE]/70">{s.date}</td>
                          <td className="py-1.5 px-3 text-[#E9D5FF]">{s.productName}</td>
                          <td className="py-1.5 px-3 font-mono-numbers text-[#D8B4FE]/80">{s.quantity} {s.unit}</td>
                          <td className="py-1.5 px-3 text-right font-mono-numbers text-white font-semibold">
                            ₹{s.moneyEarned.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-[#1C0D34]/40 rounded text-[11px] text-[#D8B4FE]/50 italic">
                  No sales consignments dispatched on this date.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Signatures & Stamp block */}
        <div className="pt-8 border-t border-purple-900/40 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#D8B4FE]/60">
          <div>
            <div className="h-10 border-b border-dashed border-purple-900/60 mb-1" />
            <div className="font-semibold text-[#FFFDF5]">Floor Supervisor</div>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-purple-900/60 mb-1" />
            <div className="font-semibold text-[#FFFDF5]">Factory General Manager</div>
          </div>
          <div className="hidden sm:block">
            <div className="h-10 border-b border-dashed border-purple-900/60 mb-1" />
            <div className="font-semibold text-white">SHUBHPRATIK Corporate Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
