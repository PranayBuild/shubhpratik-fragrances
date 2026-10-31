import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  BadgeIndianRupee,
  Plus,
  Calendar,
  Calculator,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  PackageCheck,
  TrendingDown,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PurchaseRecord, SellRecord } from '../types/inventory';

export const PurchaseSellsSection: React.FC = () => {
  const {
    currentUser,
    purchases,
    addPurchase,
    deletePurchase,
    calculatePurchaseByDate,
    calculatePurchaseDateRange,
    sells,
    addSell,
    deleteSell,
    calculateSellByDate,
    calculateSellDateRange,
    todayDate,
  } = useInventory();

  const isAdmin = currentUser?.role === 'admin';

  // Delete Modals
  const [purchaseToDelete, setPurchaseToDelete] = useState<PurchaseRecord | null>(null);
  const [sellToDelete, setSellToDelete] = useState<SellRecord | null>(null);

  // Sub Tab: 'purchase' or 'sells'
  const [activeTab, setActiveTab] = useState<'purchase' | 'sells'>('purchase');

  // Purchase Calculation Mode: 'single' or 'range'
  const [purCalcMode, setPurCalcMode] = useState<'single' | 'range'>('single');
  const [purSingleDate, setPurSingleDate] = useState('2026-09-20');
  const [purStartDate, setPurStartDate] = useState('2026-09-15');
  const [purEndDate, setPurEndDate] = useState(todayDate);

  // Sells Calculation Mode: 'single' or 'range'
  const [sellCalcMode, setSellCalcMode] = useState<'single' | 'range'>('single');
  const [sellSingleDate, setSellSingleDate] = useState(todayDate);
  const [sellStartDate, setSellStartDate] = useState('2026-09-28');
  const [sellEndDate, setSellEndDate] = useState(todayDate);

  // Add Purchase Modal
  const [isAddPurModalOpen, setIsAddPurModalOpen] = useState(false);
  const [purCompanyName, setPurCompanyName] = useState('');
  const [purMaterialName, setPurMaterialName] = useState('');
  const [purQuantity, setPurQuantity] = useState<number | ''>(500);
  const [purUnit, setPurUnit] = useState('kg');
  const [purTotalCost, setPurTotalCost] = useState<number | ''>(25000);
  const [purDate, setPurDate] = useState(todayDate);
  const [purInvoice, setPurInvoice] = useState('');

  // Add Sell Modal
  const [isAddSellModalOpen, setIsAddSellModalOpen] = useState(false);
  const [sellCompanyName, setSellCompanyName] = useState('');
  const [sellProductName, setSellProductName] = useState('');
  const [sellQuantity, setSellQuantity] = useState<number | ''>(200);
  const [sellUnit, setSellUnit] = useState('kg');
  const [sellMoneyEarned, setSellMoneyEarned] = useState<number | ''>(180000);
  const [sellDate, setSellDate] = useState(todayDate);
  const [sellInvoice, setSellInvoice] = useState('');

  const [notificationMsg, setNotificationMsg] = useState('');

  // Calculations for Purchase
  const purSingleResult = calculatePurchaseByDate(purSingleDate);
  const purRangeResult = calculatePurchaseDateRange(purStartDate, purEndDate);

  // Calculations for Sells
  const sellSingleResult = calculateSellByDate(sellSingleDate);
  const sellRangeResult = calculateSellDateRange(sellStartDate, sellEndDate);

  // All time totals
  const allTimePurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const allTimeSells = sells.reduce((sum, s) => sum + s.moneyEarned, 0);
  const grossTradeMargin = allTimeSells - allTimePurchases;

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purCompanyName.trim() || !purMaterialName.trim() || !purTotalCost) return;

    addPurchase({
      companyName: purCompanyName.trim(),
      materialName: purMaterialName.trim(),
      quantity: Number(purQuantity) || 1,
      unit: purUnit,
      totalCost: Number(purTotalCost),
      date: purDate,
      invoiceNumber: purInvoice.trim() || `PUR-${Date.now().toString().slice(-4)}`,
    });

    setIsAddPurModalOpen(false);
    setNotificationMsg(`Purchase order for ${purMaterialName} added successfully.`);
    setTimeout(() => setNotificationMsg(''), 4000);

    setPurCompanyName('');
    setPurMaterialName('');
    setPurInvoice('');
  };

  const handleSaveSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCompanyName.trim() || !sellProductName.trim() || !sellMoneyEarned) return;

    addSell({
      companyName: sellCompanyName.trim(),
      productName: sellProductName.trim(),
      quantity: Number(sellQuantity) || 1,
      unit: sellUnit,
      moneyEarned: Number(sellMoneyEarned),
      date: sellDate,
      invoiceNumber: sellInvoice.trim() || `SEL-${Date.now().toString().slice(-4)}`,
    });

    setIsAddSellModalOpen(false);
    setNotificationMsg(`Sales dispatch to ${sellCompanyName} recorded successfully.`);
    setTimeout(() => setNotificationMsg(''), 4000);

    setSellCompanyName('');
    setSellProductName('');
    setSellInvoice('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/10 border border-white/30 text-white rounded-xl text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            {notificationMsg}
          </span>
          <button onClick={() => setNotificationMsg('')} className="text-white hover:text-white/80">✕</button>
        </motion.div>
      )}

      {/* Top Banner & High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Total Purchases</p>
            <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
              ₹{allTimePurchases.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#241142]/70 border border-[#D8B4FE]/20 flex items-center justify-center text-white backdrop-blur-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white font-medium">Total Sales Revenue</p>
            <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
              ₹{allTimeSells.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <BadgeIndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between border-white/20">
          <div>
            <p className="text-xs text-white font-medium">Net Surplus</p>
            <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
              ₹{grossTradeMargin.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two Sections Switcher: "Purchase" and "Sells" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-1.5 p-1 glass-block-subtle rounded-xl">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'purchase'
                ? 'bg-white text-[#19092F] font-bold shadow-md'
                : 'text-[#D8B4FE]/80 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Purchase</span>
          </button>
          <button
            onClick={() => setActiveTab('sells')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'sells'
                ? 'bg-white text-[#19092F] font-bold shadow-md'
                : 'text-[#D8B4FE]/80 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sells</span>
          </button>
        </div>

        {activeTab === 'purchase' ? (
          <button
            onClick={() => setIsAddPurModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#19092F]" />
            <span>Add New Purchase</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddSellModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#19092F]" />
            <span>Add New Sale</span>
          </button>
        )}
      </div>

      {/* SECTION 1: PURCHASE */}
      {activeTab === 'purchase' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Purchase Cost Calculator Box with transparent blurred glass */}
          <div className="glass-block rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-white" />
                  Calculate Purchase Cost
                </h3>
              </div>

              {/* Mode switch: Single Date vs Date Range */}
              <div className="flex items-center gap-1 p-1 glass-block-subtle rounded-lg">
                <button
                  onClick={() => setPurCalcMode('single')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    purCalcMode === 'single'
                      ? 'bg-white text-[#19092F] font-bold'
                      : 'text-[#D8B4FE]/80 hover:text-white'
                  }`}
                >
                  Particular Single Date
                </button>
                <button
                  onClick={() => setPurCalcMode('range')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    purCalcMode === 'range'
                      ? 'bg-white text-[#19092F] font-bold'
                      : 'text-[#D8B4FE]/80 hover:text-white'
                  }`}
                >
                  Between Two Dates (Range)
                </button>
              </div>
            </div>

            {/* Mode A: Single Date Input & Result */}
            {purCalcMode === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Select Particular Purchase Date:
                  </label>
                  <input
                    type="date"
                    value={purSingleDate}
                    onChange={(e) => setPurSingleDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div className="md:col-span-2 glass-block-subtle rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#D8B4FE]/80">
                      Total Purchase Cost on <span className="text-white font-mono-numbers">{purSingleDate}</span>:
                    </span>
                    <h4 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                      ₹{purSingleResult.total.toLocaleString('en-IN')}
                    </h4>
                    <span className="text-[11px] text-[#D8B4FE]/60">
                      {purSingleResult.records.length} purchase consignment(s) found
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <BadgeIndianRupee className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Between Two Dates */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    From (Start Date):
                  </label>
                  <input
                    type="date"
                    value={purStartDate}
                    onChange={(e) => setPurStartDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    To (End Date):
                  </label>
                  <input
                    type="date"
                    value={purEndDate}
                    onChange={(e) => setPurEndDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div className="md:col-span-2 glass-block-subtle rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#D8B4FE]/80">
                      Purchased Cost Between {purStartDate} → {purEndDate}:
                    </span>
                    <h4 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                      ₹{purRangeResult.total.toLocaleString('en-IN')}
                    </h4>
                    <span className="text-[11px] text-[#D8B4FE]/60">
                      {purRangeResult.records.length} purchase consignment(s) in selected timeframe
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <BadgeIndianRupee className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purchases Table with transparent blurred glass */}
          <div className="glass-block rounded-2xl overflow-hidden">
            <div className="px-4 py-3 glass-header flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FFFDF5]">
                Purchases
              </span>
              <span className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
                Total Orders: {purchases.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Supplier Company</th>
                    <th className="py-3 px-4">Material Purchased</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Purchase Date</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4 text-right text-white">Total Money Required (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                  {purchases.map((pur) => (
                    <tr key={pur.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-white" />
                          <span>{pur.companyName}</span>
                        </div>
                        {pur.notes && <div className="text-[11px] text-[#D8B4FE]/50">{pur.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#E9D5FF]">
                        {pur.materialName}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers">
                        <span className="text-white font-semibold">{pur.quantity.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-[#D8B4FE]/60 uppercase text-[11px]">{pur.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                        {pur.date}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                        {pur.invoiceNumber || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white text-sm">
                        ₹{pur.totalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setPurchaseToDelete(pur)}
                          title="Delete Purchased Product & Record"
                          className="p-1.5 rounded-lg text-[#D8B4FE]/60 hover:text-red-300 hover:bg-[#2A134E] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {purchases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#D8B4FE]/50 text-xs">
                        No purchase orders recorded yet. Click &quot;+ Add New Purchase&quot; to log a procurement order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: SELLS */}
      {activeTab === 'sells' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Sells Earning Calculator Box with transparent blurred glass */}
          <div className="glass-block rounded-2xl p-5 space-y-4 border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-white" />
                  Calculate Sales Revenue
                </h3>
              </div>

              {/* Mode switch: Single Date vs Date Range */}
              <div className="flex items-center gap-1 p-1 glass-block-subtle rounded-lg">
                <button
                  onClick={() => setSellCalcMode('single')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    sellCalcMode === 'single'
                      ? 'bg-white text-[#19092F] font-bold'
                      : 'text-[#D8B4FE]/80 hover:text-white'
                  }`}
                >
                  Particular Single Date
                </button>
                <button
                  onClick={() => setSellCalcMode('range')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    sellCalcMode === 'range'
                      ? 'bg-white text-[#19092F] font-bold'
                      : 'text-[#D8B4FE]/80 hover:text-white'
                  }`}
                >
                  Between Two Dates (Range)
                </button>
              </div>
            </div>

            {/* Mode A: Single Date Input & Result */}
            {sellCalcMode === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Select Particular Sell Date:
                  </label>
                  <input
                    type="date"
                    value={sellSingleDate}
                    onChange={(e) => setSellSingleDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div className="md:col-span-2 glass-block-subtle rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#D8B4FE]/80">
                      Total Revenue Earned on <span className="text-white font-mono-numbers">{sellSingleDate}</span>:
                    </span>
                    <h4 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                      ₹{sellSingleResult.total.toLocaleString('en-IN')}
                    </h4>
                    <span className="text-[11px] text-[#D8B4FE]/60">
                      {sellSingleResult.records.length} client consignment(s) sold
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Between Two Dates */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    From (Start Date):
                  </label>
                  <input
                    type="date"
                    value={sellStartDate}
                    onChange={(e) => setSellStartDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    To (End Date):
                  </label>
                  <input
                    type="date"
                    value={sellEndDate}
                    onChange={(e) => setSellEndDate(e.target.value)}
                    className="w-full bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div className="md:col-span-2 glass-block-subtle rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#D8B4FE]/80">
                      Revenue Earned Between {sellStartDate} → {sellEndDate}:
                    </span>
                    <h4 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                      ₹{sellRangeResult.total.toLocaleString('en-IN')}
                    </h4>
                    <span className="text-[11px] text-[#D8B4FE]/60">
                      {sellRangeResult.records.length} client sales consignments dispatched
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sells Table with transparent blurred glass */}
          <div className="glass-block rounded-2xl overflow-hidden">
            <div className="px-4 py-3 glass-header flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Sells
              </span>
              <span className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
                Total Dispatches: {sells.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Client / Distributor Company</th>
                    <th className="py-3 px-4">Product Scent Stick Sold</th>
                    <th className="py-3 px-4">Quantity Sold</th>
                    <th className="py-3 px-4">Sale Date</th>
                    <th className="py-3 px-4">Challan / Invoice #</th>
                    <th className="py-3 px-4 text-right text-white">Money Earned (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                  {sells.map((sell) => (
                    <tr key={sell.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-white" />
                          <span>{sell.companyName}</span>
                        </div>
                        {sell.notes && <div className="text-[11px] text-[#D8B4FE]/50">{sell.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#E9D5FF]">
                        {sell.productName}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers">
                        <span className="text-white font-semibold">{sell.quantity.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-[#D8B4FE]/60 uppercase text-[11px]">{sell.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                        {sell.date}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                        {sell.invoiceNumber || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white text-sm">
                        ₹{sell.moneyEarned.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSellToDelete(sell)}
                          title="Delete Sales Record"
                          className="p-1.5 rounded-lg text-[#D8B4FE]/60 hover:text-red-300 hover:bg-[#2A134E] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {sells.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#D8B4FE]/50 text-xs">
                        No sales consignments recorded yet. Click &quot;+ Add Sales Entry&quot; to log client dispatches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: ADD NEW PURCHASE */}
      {isAddPurModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-white" />
                Add New Raw Material Purchase
              </h3>
              <button
                onClick={() => setIsAddPurModalOpen(false)}
                className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Supplier Company Name (From which company bought) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kannauj Aromatic Extracts Ltd"
                  value={purCompanyName}
                  onChange={(e) => setPurCompanyName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Name of Material Purchased *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mysore Chandan Concentrated Dipping Oil"
                  value={purMaterialName}
                  onChange={(e) => setPurMaterialName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Quantity of Material *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={purQuantity}
                    onChange={(e) => setPurQuantity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Unit
                  </label>
                  <select
                    value={purUnit}
                    onChange={(e) => setPurUnit(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="litres">litres (Litres)</option>
                    <option value="units">units (Pieces)</option>
                    <option value="bags">bags (Bags)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Money Required / Total Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={purTotalCost}
                    onChange={(e) => setPurTotalCost(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-[#D8B4FE]/40 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={purDate}
                    onChange={(e) => setPurDate(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Supplier Invoice / PO Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. PUR-2026-099"
                  value={purInvoice}
                  onChange={(e) => setPurInvoice(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                <button
                  type="button"
                  onClick={() => setIsAddPurModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                >
                  Save Purchase Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD NEW SALE */}
      {isAddSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#160B29] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                Add New Sales Consignment
              </h3>
              <button
                onClick={() => setIsAddSellModalOpen(false)}
                className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSell} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Buyer Company Name (To which company sold) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahalakshmi Spiritual Emporium"
                  value={sellCompanyName}
                  onChange={(e) => setSellCompanyName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Product / Fragrance Stick Name Sold *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Chandan Master Pack (20 Sticks)"
                  value={sellProductName}
                  onChange={(e) => setSellProductName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Quantity Sold *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Unit
                  </label>
                  <select
                    value={sellUnit}
                    onChange={(e) => setSellUnit(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  >
                    <option value="units">units (Packs/Boxes)</option>
                    <option value="kg">kg (Kilograms Bulk)</option>
                    <option value="cartons">cartons (Master Cartons)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Money Earned / Total Revenue (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sellMoneyEarned}
                    onChange={(e) => setSellMoneyEarned(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={sellDate}
                    onChange={(e) => setSellDate(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Sales Invoice / Delivery Challan Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. SEL-2026-150"
                  value={sellInvoice}
                  onChange={(e) => setSellInvoice(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                <button
                  type="button"
                  onClick={() => setIsAddSellModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                >
                  Save Sales Dispatch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: DELETE PURCHASE CONFIRMATION */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#160B29] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-red-400 border-b border-red-900/30 pb-3">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#FFFDF5]">Delete Purchase Order?</h3>
                <p className="text-xs text-red-300/70">Permanently delete this procurement record</p>
              </div>
            </div>

            <div className="bg-[#0E061A] border border-purple-900/40 rounded-xl p-3.5 text-xs text-[#E9D5FF] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Supplier Company:</span>
                <span className="font-semibold text-[#FFFDF5]">{purchaseToDelete.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Material Purchased:</span>
                <span className="font-semibold text-[#FFFDF5]">{purchaseToDelete.materialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Quantity:</span>
                <span className="font-mono-numbers">{purchaseToDelete.quantity.toLocaleString('en-IN')} {purchaseToDelete.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Total Cost:</span>
                <span className="font-mono-numbers font-bold text-white">₹{purchaseToDelete.totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Date:</span>
                <span className="font-mono-numbers">{purchaseToDelete.date}</span>
              </div>
              {purchaseToDelete.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-[#D8B4FE]/60">Invoice #:</span>
                  <span className="font-mono-numbers">{purchaseToDelete.invoiceNumber}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#D8B4FE]/70">
              Are you sure you want to delete this purchase entry? This record will be removed from your procurement orders and calculations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePurchase(purchaseToDelete.id);
                  setNotificationMsg(`Purchase order for "${purchaseToDelete.materialName}" was deleted successfully.`);
                  setTimeout(() => setNotificationMsg(''), 4000);
                  setPurchaseToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: DELETE SELL CONFIRMATION */}
      {sellToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#160B29] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-red-400 border-b border-red-900/30 pb-3">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#FFFDF5]">Delete Sales Record?</h3>
                <p className="text-xs text-red-300/70">Permanently delete this finished goods sales entry</p>
              </div>
            </div>

            <div className="bg-[#0E061A] border border-purple-900/40 rounded-xl p-3.5 text-xs text-[#E9D5FF] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Client / Company:</span>
                <span className="font-semibold text-[#FFFDF5]">{sellToDelete.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Product Sold:</span>
                <span className="font-semibold text-[#FFFDF5]">{sellToDelete.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Quantity:</span>
                <span className="font-mono-numbers">{sellToDelete.quantity.toLocaleString('en-IN')} {sellToDelete.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Money Earned:</span>
                <span className="font-mono-numbers font-bold text-white">₹{sellToDelete.moneyEarned.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8B4FE]/60">Date:</span>
                <span className="font-mono-numbers">{sellToDelete.date}</span>
              </div>
              {sellToDelete.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-[#D8B4FE]/60">Challan / Invoice #:</span>
                  <span className="font-mono-numbers">{sellToDelete.invoiceNumber}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#D8B4FE]/70">
              Are you sure you want to delete this sales dispatch? This record will be removed from your sales ledger and calculations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => setSellToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSell(sellToDelete.id);
                  setNotificationMsg(`Sales record for "${sellToDelete.productName}" was deleted successfully.`);
                  setTimeout(() => setNotificationMsg(''), 4000);
                  setSellToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Sales Record</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
