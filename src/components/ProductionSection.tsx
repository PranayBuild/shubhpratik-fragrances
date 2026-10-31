import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  PlusCircle,
  Calendar,
  Sparkles,
  Layers,
  Search,
  Package,
  Scale,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductionUnit, ProductionRecord, FragranceScent } from '../types/inventory';

export const ProductionSection: React.FC = () => {
  const {
    scents,
    addScent,
    deleteScent,
    productions,
    addProduction,
    deleteProduction,
    getProductionByDate,
    todayDate,
  } = useInventory();

  // Two main parts as requested: 'insert' or 'check'
  const [productionTab, setProductionTab] = useState<'insert' | 'check'>('insert');

  // New Scent modal / form state
  const [isNewScentModalOpen, setIsNewScentModalOpen] = useState(false);
  const [newScentName, setNewScentName] = useState('');
  const [newScentCategory, setNewScentCategory] = useState<'Flora' | 'Woody' | 'Traditional' | 'Fruity' | 'Spiritual'>('Flora');
  const [newScentDescription, setNewScentDescription] = useState('');

  // Daily Production Form State
  const [selectedScent, setSelectedScent] = useState(scents[0]?.name || 'Royal Chandan (Sandalwood)');
  const [prodQuantity, setProdQuantity] = useState<number | ''>(100);
  const [prodUnit, setProdUnit] = useState<ProductionUnit>('kg');
  const [prodDate, setProdDate] = useState(todayDate);
  const [operatorName, setOperatorName] = useState('Rajesh Sharma');
  const [batchNotes, setBatchNotes] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Check Production Date Query State
  const [checkDate, setCheckDate] = useState('2026-10-02');

  // Deletion confirmation states
  const [recordToDelete, setRecordToDelete] = useState<ProductionRecord | null>(null);
  const [scentToDelete, setScentToDelete] = useState<FragranceScent | null>(null);

  // Handle Confirm Delete Production Record
  const handleConfirmDeleteRecord = () => {
    if (!recordToDelete) return;
    const info = `${recordToDelete.quantity} ${recordToDelete.unit} of ${recordToDelete.scentName}`;
    deleteProduction(recordToDelete.id);
    setRecordToDelete(null);
    setNotificationMsg(`Successfully removed production batch: ${info}.`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Handle Confirm Delete Scent Formula
  const handleConfirmDeleteScent = () => {
    if (!scentToDelete) return;
    const name = scentToDelete.name;
    deleteScent(scentToDelete.id);
    if (selectedScent === name) {
      const remaining = scents.filter((s) => s.id !== scentToDelete.id);
      setSelectedScent(remaining[0]?.name || '');
    }
    setScentToDelete(null);
    setNotificationMsg(`Fragrance formula "${name}" deleted.`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Handle Add New Scent
  const handleAddNewScent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScentName.trim()) return;

    addScent(newScentName.trim(), newScentCategory, newScentDescription.trim());
    setSelectedScent(newScentName.trim());
    setNewScentName('');
    setNewScentDescription('');
    setIsNewScentModalOpen(false);
    setNotificationMsg(`Scent "${newScentName.trim()}" successfully registered into memory.`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Handle Add Daily Production Record
  const handleInsertProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodQuantity || Number(prodQuantity) <= 0) return;

    const batchCode = `SP-${prodDate.replace(/-/g, '')}-${selectedScent.slice(0, 2).toUpperCase()}`;

    addProduction({
      date: prodDate,
      scentName: selectedScent,
      quantity: Number(prodQuantity),
      unit: prodUnit,
      operatorName: operatorName.trim() || 'Floor Operator',
      batchNumber: batchCode,
      notes: batchNotes.trim(),
    });

    setNotificationMsg(`Successfully logged ${prodQuantity} ${prodUnit} of ${selectedScent} for ${prodDate}.`);
    setTimeout(() => setNotificationMsg(''), 4000);
    setBatchNotes('');
  };

  // Today's summary calculation
  const todaySummary = getProductionByDate(todayDate);

  // Check date query results
  const querySummary = getProductionByDate(checkDate);

  return (
    <div className="space-y-6">
      {/* Notification banner */}
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

      {/* Part Switcher: 1. Insert Production vs 2. Check Production */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-1.5 p-1 glass-block-subtle rounded-xl">
          <button
            onClick={() => setProductionTab('insert')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              productionTab === 'insert'
                ? 'bg-white text-[#19092F] font-bold shadow-md'
                : 'text-[#D8B4FE]/80 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Insert Production</span>
          </button>
          <button
            onClick={() => setProductionTab('check')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              productionTab === 'check'
                ? 'bg-white text-[#19092F] font-bold shadow-md'
                : 'text-[#D8B4FE]/80 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Check Production</span>
          </button>
        </div>
      </div>

      {/* PART 1: INSERT PRODUCTION */}
      {productionTab === 'insert' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Realtime KPI banner for Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#D8B4FE]/75 font-medium">Today's Production (KG)</p>
                <h3 className="text-2xl font-bold text-[#FFFDF5] font-mono-numbers mt-1">
                  {todaySummary.totalKg.toLocaleString('en-IN')} <span className="text-xs text-white">KG</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#D8B4FE]/75 font-medium">Today's Production (Units)</p>
                <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                  {todaySummary.totalUnits.toLocaleString('en-IN')} <span className="text-xs text-[#D8B4FE]/70">Packs/Units</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Daily Production Entry Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-block rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <h3 className="font-semibold text-[#FFFDF5] text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-white" />
                  Insert Production
                </h3>
              </div>

              <form onSubmit={handleInsertProduction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scent Selection */}
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5 flex items-center justify-between">
                      <span>Fragrance Scent Stick *</span>
                      <button
                        type="button"
                        onClick={() => setIsNewScentModalOpen(true)}
                        className="text-[11px] text-white hover:underline"
                      >
                        + New Scent
                      </button>
                    </label>
                    <select
                      value={selectedScent}
                      onChange={(e) => setSelectedScent(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2.5 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    >
                      {scents.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Production */}
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5">
                      Production Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={prodDate}
                      onChange={(e) => setProdDate(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5">
                      Production Quantity *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      required
                      value={prodQuantity}
                      onChange={(e) => setProdQuantity(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 150"
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers text-sm font-semibold"
                    />
                  </div>

                  {/* Unit Selection: kg or units */}
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5">
                      Unit Measurement *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProdUnit('kg')}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                          prodUnit === 'kg'
                            ? 'bg-white text-[#19092F] font-bold border-white'
                            : 'bg-[#0E061A] text-[#D8B4FE]/70 border-purple-900/60 hover:border-purple-700'
                        }`}
                      >
                        In Kilograms (KGs)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdUnit('units')}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                          prodUnit === 'units'
                            ? 'bg-white text-[#19092F] font-bold border-white'
                            : 'bg-[#0E061A] text-[#D8B4FE]/70 border-purple-900/60 hover:border-purple-700'
                        }`}
                      >
                        In Packets / Units
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5">
                      Machine Operator / Supervisor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1.5">
                      Batch Notes / Machine Line
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Line 2 dipping, 9-inch bamboo stick"
                      value={batchNotes}
                      onChange={(e) => setBatchNotes(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#19092F]" />
                  <span>Log Production Record</span>
                </button>
              </form>
            </div>

            {/* Scent stick formula catalog preview with transparent blurred glass */}
            <div className="glass-block rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <h4 className="font-semibold text-[#FFFDF5] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Fragrance Formulas
                </h4>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {scents.map((s) => (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-lg border text-left transition-colors flex items-start justify-between gap-2 backdrop-blur-sm ${
                      selectedScent === s.name
                        ? 'bg-[#241142]/80 border-[#D8B4FE] text-[#FFFDF5]'
                        : 'bg-[#110722]/50 border-purple-950/60 hover:border-purple-800 text-[#D8B4FE]/80'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedScent(s.name)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{s.name}</span>
                        <span className="text-[10px] text-[#D8B4FE]/60 font-mono-numbers">{s.category}</span>
                      </div>
                      {s.description && (
                        <p className="text-[11px] text-[#D8B4FE]/60 mt-1 line-clamp-1">{s.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScentToDelete(s);
                      }}
                      title={`Delete "${s.name}" formula`}
                      className="p-1 rounded text-[#D8B4FE]/50 hover:text-red-300 hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {scents.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#D8B4FE]/50">
                    No fragrance formulas saved. Click below to add one.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsNewScentModalOpen(true)}
                className="w-full py-2 rounded-lg text-xs font-medium border border-dashed border-[#D8B4FE]/40 text-white hover:bg-[#241142]/60 transition-colors cursor-pointer"
              >
                + Register Another Fragrance Formula
              </button>
            </div>
          </div>

          {/* Today's logged production list with glass effect */}
          <div className="glass-block rounded-2xl overflow-hidden">
            <div className="px-4 py-3 glass-header flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FFFDF5] flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-white" />
                Today's Production
              </span>
              <span className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
                Total Logs: {todaySummary.records.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Fragrance Scent</th>
                    <th className="py-3 px-4">Quantity Produced</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                  {todaySummary.records.map((r) => (
                    <tr key={r.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                      <td className="py-3 px-4 font-mono-numbers text-white">{r.batchNumber}</td>
                      <td className="py-3 px-4 font-semibold text-[#FFFDF5]">{r.scentName}</td>
                      <td className="py-3 px-4 font-mono-numbers">
                        <span className="text-[#FFFDF5] font-bold text-sm">{r.quantity.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-[#D8B4FE]/60">{r.unit.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-[#E9D5FF]">{r.operatorName || 'Standard Line'}</td>
                      <td className="py-3 px-4 text-[#D8B4FE]/60">{r.notes || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(r)}
                          title="Delete production batch"
                          className="p-1.5 rounded-lg text-[#D8B4FE]/60 hover:text-red-300 hover:bg-[#2A134E] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {todaySummary.records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[#D8B4FE]/50 text-xs">
                        No Data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* PART 2: CHECK PRODUCTION (HISTORY CHECK BY DATE/MONTH/YEAR) */}
      {productionTab === 'check' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Query Bar with transparent blurred glass */}
          <div className="glass-block rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[#FFFDF5] text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-white" />
                Check Production History by Date
              </h3>
              <p className="text-xs text-[#D8B4FE]/70 mt-1">
                Select Date / Month / Year to view total daily production volume and fragrance-wise breakdown.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-[#D8B4FE]/80 whitespace-nowrap">Production Date:</label>
              <input
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
              />
            </div>
          </div>

          {/* Results Summary if data available */}
          {querySummary.records.length > 0 ? (
            <div className="space-y-6">
              {/* Aggregate Totals on Selected Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-block rounded-2xl p-4 sm:p-5">
                  <p className="text-xs text-[#D8B4FE]/75">Total Production on {checkDate} (KG)</p>
                  <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                    {querySummary.totalKg.toLocaleString('en-IN')} <span className="text-xs text-white">KG</span>
                  </h3>
                  <span className="text-[11px] text-[#D8B4FE]/50">Weight-measured output</span>
                </div>

                <div className="glass-block rounded-2xl p-4 sm:p-5">
                  <p className="text-xs text-[#D8B4FE]/75">Total Production on {checkDate} (Units)</p>
                  <h3 className="text-2xl font-bold text-[#FFFDF5] font-mono-numbers mt-1">
                    {querySummary.totalUnits.toLocaleString('en-IN')} <span className="text-xs text-[#D8B4FE]/70">Units/Packs</span>
                  </h3>
                  <span className="text-[11px] text-[#D8B4FE]/50">Retail pack counts</span>
                </div>

                <div className="glass-block rounded-2xl p-4 sm:p-5">
                  <p className="text-xs text-[#D8B4FE]/75">Fragrance Varieties Run</p>
                  <h3 className="text-2xl font-bold text-[#FFFDF5] font-mono-numbers mt-1">
                    {Object.keys(querySummary.fragranceBreakdown).length}
                  </h3>
                  <span className="text-[11px] text-[#D8B4FE]/50">Distinct aromas formulated</span>
                </div>
              </div>

              {/* Fragrance-Wise Detailed Breakdown with glass effect */}
              <div className="glass-block rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                  <h4 className="font-semibold text-[#FFFDF5] text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white" />
                    Fragrance Breakdown ({checkDate})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(querySummary.fragranceBreakdown).map(([scentName, qty]) => {
                    const totalKgsForCalc = querySummary.totalKg || 1;
                    const percentOfKg = Math.round((qty.kg / totalKgsForCalc) * 100);

                    return (
                      <div
                        key={scentName}
                        className="glass-block-subtle rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-sm text-white">{scentName}</h5>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono-numbers text-[#FFFDF5] font-semibold">
                              {qty.kg > 0 ? `${qty.kg} KG` : ''} {qty.units > 0 ? `${qty.units} Units` : ''}
                            </span>
                          </div>
                        </div>

                        {qty.kg > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-[#D8B4FE]/70 mb-1">
                              <span>Share of daily KG output</span>
                              <span className="font-mono-numbers text-white font-semibold">{percentOfKg}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#100520] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#FFFDF5] to-[#D8B4FE] rounded-full"
                                style={{ width: `${percentOfKg}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* All individual batches on that date with glass effect */}
              <div className="glass-block rounded-2xl overflow-hidden">
                <div className="px-4 py-3 glass-header">
                  <span className="text-xs font-semibold text-[#FFFDF5]">
                    Production Batches ({checkDate})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Batch Number</th>
                        <th className="py-3 px-4">Fragrance Scent</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Unit</th>
                        <th className="py-3 px-4">Operator</th>
                        <th className="py-3 px-4">Remarks</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                      {querySummary.records.map((r) => (
                        <tr key={r.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                          <td className="py-3 px-4 font-mono-numbers text-white">{r.batchNumber}</td>
                          <td className="py-3 px-4 font-semibold text-[#FFFDF5]">{r.scentName}</td>
                          <td className="py-3 px-4 font-mono-numbers font-bold text-[#FFFDF5]">
                            {r.quantity.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-[#D8B4FE]/70 uppercase">{r.unit}</td>
                          <td className="py-3 px-4 text-[#E9D5FF]">{r.operatorName || '-'}</td>
                          <td className="py-3 px-4 text-[#D8B4FE]/60">{r.notes || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setRecordToDelete(r)}
                              title="Delete production batch"
                              className="p-1.5 rounded-lg text-[#D8B4FE]/60 hover:text-red-300 hover:bg-[#2A134E] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#160B29] border border-dashed border-purple-900/60 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#241142] flex items-center justify-center mx-auto mb-3 text-[#D8B4FE]">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-base font-semibold text-[#FFFDF5]">No production records found for {checkDate}</h4>
              <p className="text-xs text-[#D8B4FE]/70 mt-1 max-w-md mx-auto">
                No manufacturing runs or stick dipping batches were registered on this date. Try querying 2026-10-02, 2026-10-01, or 2026-09-30.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* MODAL: ADD NEW SCENT FORMULA */}
      {isNewScentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                Register New Fragrance Scent
              </h3>
              <button
                onClick={() => setIsNewScentModalOpen(false)}
                className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewScent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Scent / Fragrance Stick Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Oudh Supreme, Loban Special"
                  value={newScentName}
                  onChange={(e) => setNewScentName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Aromatic Classification / Category *
                </label>
                <select
                  value={newScentCategory}
                  onChange={(e) => setNewScentCategory(e.target.value as any)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                >
                  <option value="Flora">Flora (Floral: Rose, Mogra, Jasmine)</option>
                  <option value="Woody">Woody (Chandan, Cedarwood, Teak)</option>
                  <option value="Traditional">Traditional (Sambrani, Guggal, Loban)</option>
                  <option value="Spiritual">Spiritual (Kasturi, Temple Blend)</option>
                  <option value="Fruity">Fruity (Pineapple, Green Apple)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Formula & Scent Notes Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Concentrated 1:3 essential oil dipping ratio with natural binding resin..."
                  value={newScentDescription}
                  onChange={(e) => setNewScentDescription(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                <button
                  type="button"
                  onClick={() => setIsNewScentModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                >
                  Save Scent Formula
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CONFIRM DELETE PRODUCTION RECORD MODAL */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#160B29] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FFFDF5]">Delete Production Entry</h3>
                <p className="text-xs text-[#D8B4FE]/70">This production batch log will be removed</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F051D] border border-purple-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Batch Number:</span>
                <span className="font-mono-numbers text-white font-semibold">{recordToDelete.batchNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Fragrance Scent:</span>
                <span className="font-semibold text-[#FFFDF5]">{recordToDelete.scentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Quantity:</span>
                <span className="font-mono-numbers font-bold text-white text-sm">
                  {recordToDelete.quantity.toLocaleString('en-IN')} {recordToDelete.unit.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Production Date:</span>
                <span className="font-mono-numbers text-[#E9D5FF]">{recordToDelete.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Operator:</span>
                <span className="text-[#E9D5FF]">{recordToDelete.operatorName || 'Standard Line'}</span>
              </div>
            </div>

            <p className="text-xs text-[#D8B4FE]/80 leading-relaxed">
              Are you sure you want to delete this recorded production quantity? This will adjust your daily and total production metrics.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#D8B4FE]/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRecord}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Production Record</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CONFIRM DELETE SCENT FORMULA MODAL */}
      {scentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#160B29] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FFFDF5]">Delete Fragrance Formula</h3>
                <p className="text-xs text-[#D8B4FE]/70">Remove fragrance from active catalog</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F051D] border border-purple-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Formula Name:</span>
                <span className="font-semibold text-[#FFFDF5]">{scentToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Category:</span>
                <span className="text-white">{scentToDelete.category}</span>
              </div>
              {scentToDelete.description && (
                <div>
                  <span className="text-[#D8B4FE]/70 block mb-0.5">Description:</span>
                  <p className="text-[#E9D5FF] text-[11px] bg-[#160B29] p-2 rounded border border-purple-900/40">
                    {scentToDelete.description}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-[#D8B4FE]/80 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{scentToDelete.name}</strong> from the active fragrance formulas list?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setScentToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#D8B4FE]/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteScent}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Formula</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
