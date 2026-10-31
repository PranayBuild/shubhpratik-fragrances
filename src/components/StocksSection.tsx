import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  RotateCcw,
  PackagePlus,
  PackageMinus,
  Sparkles,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StockMaterial, StockUnit } from '../types/inventory';

// Common agarbatti industry presets for 1-click auto-fill
const PRESET_MATERIALS: {
  name: string;
  unit: StockUnit;
  defaultQty: number;
  cost: number;
  threshold: number;
  consumptionFactor: number;
  supplier: string;
}[] = [
  {
    name: 'Raw Bamboo Sticks (8 & 9 inch round)',
    unit: 'kg',
    defaultQty: 2500,
    cost: 115,
    threshold: 400,
    consumptionFactor: 0.28,
    supplier: 'Assam Bamboo Craft Corp',
  },
  {
    name: 'Jigat & Charcoal Powder Premix Blend',
    unit: 'kg',
    defaultQty: 3800,
    cost: 42,
    threshold: 600,
    consumptionFactor: 0.62,
    supplier: 'Venkateshwara Minerals & Powders',
  },
  {
    name: 'Royal Chandan Fragrance Essential Oil',
    unit: 'litres',
    defaultQty: 350,
    cost: 1450,
    threshold: 50,
    consumptionFactor: 0.08,
    supplier: 'Kannauj Aromatic Extracts Ltd',
  },
  {
    name: 'Di-Ethyl Phthalate (DEP) Aroma Carrier Solvent',
    unit: 'litres',
    defaultQty: 600,
    cost: 180,
    threshold: 120,
    consumptionFactor: 0.05,
    supplier: 'Navkar Solvents & Chemicals',
  },
  {
    name: 'Gulab / Rose Dipping Perfume Concentrate',
    unit: 'litres',
    defaultQty: 250,
    cost: 1200,
    threshold: 40,
    consumptionFactor: 0.08,
    supplier: 'Kannauj Aromatic Extracts Ltd',
  },
  {
    name: 'Printed Duplex Packaging Outer Boxes (100g pack)',
    unit: 'units',
    defaultQty: 45000,
    cost: 4.5,
    threshold: 5000,
    consumptionFactor: 10, // ~10 boxes per 1 kg production
    supplier: 'Shree Balaji Offset Packaging',
  },
  {
    name: 'Heavy-Duty 5-Ply Master Corrugated Shipping Cartons',
    unit: 'units',
    defaultQty: 1200,
    cost: 45,
    threshold: 150,
    consumptionFactor: 0.2, // ~1 master carton per 5 kg production
    supplier: 'Omega Corrugators & Packaging',
  },
  {
    name: 'Protective Butter Paper Internal Wrappers',
    unit: 'bags',
    defaultQty: 300,
    cost: 85,
    threshold: 40,
    consumptionFactor: 0.05,
    supplier: 'Hindustan Specialty Paper Mill',
  },
];

export const StocksSection: React.FC = () => {
  const {
    stocks,
    addStock,
    updateStock,
    deleteStock,
    adjustStockQuantity,
    resetStocksToDefault,
    getStockUsageStats,
    todayDate,
  } = useInventory();

  // Add stock modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [materialName, setMaterialName] = useState('');
  const [boughtDate, setBoughtDate] = useState(todayDate);
  const [boughtQuantity, setBoughtQuantity] = useState<number | ''>(1000);
  const [unit, setUnit] = useState<StockUnit>('kg');
  const [supplier, setSupplier] = useState('');
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(50);
  const [minimumThreshold, setMinimumThreshold] = useState<number | ''>(200);
  const [consumptionFactor, setConsumptionFactor] = useState<number | ''>(0.25);
  const [notes, setNotes] = useState('');

  // Edit stock modal state
  const [editingStock, setEditingStock] = useState<StockMaterial | null>(null);
  const [editMaterialName, setEditMaterialName] = useState('');
  const [editBoughtDate, setEditBoughtDate] = useState('');
  const [editBoughtQuantity, setEditBoughtQuantity] = useState<number | ''>(0);
  const [editUnit, setEditUnit] = useState<StockUnit>('kg');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCostPerUnit, setEditCostPerUnit] = useState<number | ''>(0);
  const [editMinimumThreshold, setEditMinimumThreshold] = useState<number | ''>(0);
  const [editConsumptionFactor, setEditConsumptionFactor] = useState<number | ''>(0);
  const [editNotes, setEditNotes] = useState('');

  // Adjust stock quantity modal state
  const [adjustingStock, setAdjustingStock] = useState<StockMaterial | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct' | 'set'>('add');
  const [adjustAmount, setAdjustAmount] = useState<number | ''>(100);
  const [adjustReason, setAdjustReason] = useState('');

  // Delete confirmation modal state
  const [stockToDelete, setStockToDelete] = useState<StockMaterial | null>(null);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Preset auto-fill helper
  const handleApplyPreset = (preset: typeof PRESET_MATERIALS[0]) => {
    setMaterialName(preset.name);
    setUnit(preset.unit);
    setBoughtQuantity(preset.defaultQty);
    setCostPerUnit(preset.cost);
    setMinimumThreshold(preset.threshold);
    setConsumptionFactor(preset.consumptionFactor);
    setSupplier(preset.supplier);
  };

  // Add stock submit
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim() || !boughtQuantity) return;

    addStock({
      materialName: materialName.trim(),
      boughtDate: boughtDate || todayDate,
      boughtQuantity: Number(boughtQuantity),
      unit: unit.trim() || 'kg',
      supplier: supplier.trim() || 'Direct Factory Supplier',
      costPerUnit: Number(costPerUnit) || 0,
      minimumThreshold: Number(minimumThreshold) || 100,
      consumptionFactorPerKgProduction: Number(consumptionFactor) || 0.1,
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    showToast(`Added "${materialName.trim()}" to raw materials stock.`, 'success');

    // Reset form
    setMaterialName('');
    setBoughtQuantity(1000);
    setSupplier('');
    setNotes('');
  };

  // Open Edit Modal
  const handleOpenEdit = (stock: StockMaterial) => {
    setEditingStock(stock);
    setEditMaterialName(stock.materialName);
    setEditBoughtDate(stock.boughtDate);
    setEditBoughtQuantity(stock.boughtQuantity);
    setEditUnit(stock.unit);
    setEditSupplier(stock.supplier);
    setEditCostPerUnit(stock.costPerUnit);
    setEditMinimumThreshold(stock.minimumThreshold);
    setEditConsumptionFactor(stock.consumptionFactorPerKgProduction);
    setEditNotes(stock.notes || '');
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock || !editMaterialName.trim() || !editBoughtQuantity) return;

    updateStock(editingStock.id, {
      materialName: editMaterialName.trim(),
      boughtDate: editBoughtDate || todayDate,
      boughtQuantity: Number(editBoughtQuantity),
      unit: editUnit.trim() || 'kg',
      supplier: editSupplier.trim() || 'Direct Factory Supplier',
      costPerUnit: Number(editCostPerUnit) || 0,
      minimumThreshold: Number(editMinimumThreshold) || 0,
      consumptionFactorPerKgProduction: Number(editConsumptionFactor) || 0.1,
      notes: editNotes.trim() || undefined,
    });

    setEditingStock(null);
    showToast(`Updated "${editMaterialName.trim()}" successfully.`, 'success');
  };

  // Open Adjust Modal
  const handleOpenAdjust = (stock: StockMaterial) => {
    setAdjustingStock(stock);
    setAdjustType('add');
    setAdjustAmount(100);
    setAdjustReason('Shipment replenishment');
  };

  // Submit Adjust
  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingStock || adjustAmount === '' || Number(adjustAmount) <= 0) return;

    const amount = Number(adjustAmount);
    if (adjustType === 'set') {
      // Direct set of bought quantity
      updateStock(adjustingStock.id, {
        boughtQuantity: amount,
        manualAdjustment: 0,
      });
      showToast(`Base quantity for "${adjustingStock.materialName}" set to ${amount} ${adjustingStock.unit}.`, 'info');
    } else {
      const delta = adjustType === 'add' ? amount : -amount;
      adjustStockQuantity(adjustingStock.id, delta);
      showToast(
        `${adjustType === 'add' ? 'Added' : 'Deducted'} ${amount} ${adjustingStock.unit} for "${adjustingStock.materialName}".`,
        adjustType === 'add' ? 'success' : 'warn'
      );
    }

    setAdjustingStock(null);
  };

  // Delete confirm
  const handleConfirmDelete = () => {
    if (!stockToDelete) return;
    deleteStock(stockToDelete.id);
    showToast(`Removed "${stockToDelete.materialName}" from stock records.`, 'info');
    setStockToDelete(null);
  };

  // Reset confirm
  const handleConfirmReset = () => {
    resetStocksToDefault();
    setIsResetConfirmOpen(false);
    showToast('Reset raw materials to original initial factory defaults.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl text-xs flex items-center justify-between border shadow-lg bg-white/10 border-white/30 text-white"
          >
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
              {toastMsg.text}
            </span>
            <button
              onClick={() => setToastMsg(null)}
              className="ml-3 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D1452] border border-[#D8B4FE]/30 flex items-center justify-center text-white shadow-inner">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-white text-lg">
            Stock
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#D8B4FE]/80 bg-[#1E0D36] hover:bg-[#2A134B] border border-purple-900/60 hover:text-white transition-colors cursor-pointer"
            title="Reset to default initial materials"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#19092F]" />
            <span>Add Raw Material</span>
          </button>
        </div>
      </div>

      {/* Main Stock Table with transparent blurred glass */}
      <div className="glass-block rounded-2xl overflow-hidden">
        <div className="px-4 py-3 glass-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Stock Inventory</span>
          </div>
          <span className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
            Operations Date: {todayDate}
          </span>
        </div>

        {stocks.length === 0 ? (
          <div className="p-12 text-center text-[#D8B4FE]/60 space-y-3">
            <Boxes className="w-10 h-10 mx-auto text-purple-400/40" />
            <p className="text-sm font-medium text-white">No stock materials registered yet.</p>
            <p className="text-xs text-[#D8B4FE]/50">
              Click &quot;Add Raw Material&quot; to register a new entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Raw Material & Supplier</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Base / Total Qty</th>
                  <th className="py-3 px-3 text-white">Used Today</th>
                  <th className="py-3 px-3 text-white">Used Till Today</th>
                  <th className="py-3 px-3 text-right">Remaining Stock</th>
                  <th className="py-3 px-3 min-w-[130px]">Stock Level</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                {stocks.map((material) => {
                  const stats = getStockUsageStats(material);
                  const isLow = stats.remainingStock <= material.minimumThreshold;
                  const hasAdjustment = material.manualAdjustment && material.manualAdjustment !== 0;

                  let progressColor = 'bg-white';
                  if (stats.percentageRemaining < 25) {
                    progressColor = 'bg-red-400';
                  } else if (stats.percentageRemaining < 50) {
                    progressColor = 'bg-white/70';
                  }

                  return (
                    <tr key={material.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                      {/* Material Name & Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{material.materialName}</span>
                        </div>
                        <div className="text-[11px] text-[#D8B4FE]/50 flex items-center gap-2 mt-0.5">
                          <span>Supplier: {material.supplier}</span>
                          {material.costPerUnit > 0 && (
                            <span>• ₹{material.costPerUnit}/{material.unit}</span>
                          )}
                        </div>
                        {material.notes && (
                          <div className="text-[10px] text-[#D8B4FE]/40 italic mt-0.5">
                            Note: {material.notes}
                          </div>
                        )}
                      </td>

                      {/* Bought Date */}
                      <td className="py-3.5 px-3 font-mono-numbers text-[#D8B4FE]/70 whitespace-nowrap">
                        {material.boughtDate}
                      </td>

                      {/* Bought / Total Available Quantity */}
                      <td className="py-3.5 px-3 font-mono-numbers whitespace-nowrap">
                        <span className="text-white font-medium">
                          {(material.boughtQuantity + (material.manualAdjustment || 0)).toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-[#D8B4FE]/60 uppercase text-[11px]">{material.unit}</span>
                        {hasAdjustment && (
                          <span className="block text-[10px] text-white font-medium">
                            ({material.manualAdjustment! > 0 ? '+' : ''}
                            {material.manualAdjustment} adj)
                          </span>
                        )}
                      </td>

                      {/* Raw Material Used Today */}
                      <td className="py-3.5 px-3 font-mono-numbers font-medium text-white whitespace-nowrap">
                        {stats.usedToday > 0 ? (
                          <span>
                            {stats.usedToday.toLocaleString('en-IN')}{' '}
                            <span className="text-[#D8B4FE]/60 text-[11px]">{material.unit}</span>
                          </span>
                        ) : (
                          <span className="text-[#D8B4FE]/40">0 {material.unit}</span>
                        )}
                      </td>

                      {/* Raw Material Used Till From Date of Buying to Today */}
                      <td className="py-3.5 px-3 font-mono-numbers font-semibold text-[#FFFDF5] whitespace-nowrap">
                        {stats.cumulativeUsed.toLocaleString('en-IN')}{' '}
                        <span className="text-[#D8B4FE]/60 font-normal text-[11px]">{material.unit}</span>
                      </td>

                      {/* Remaining Stock */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers whitespace-nowrap">
                        <span className="font-bold text-[#FFFDF5] text-sm">
                          {stats.remainingStock.toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-[#D8B4FE]/70 text-[11px] uppercase">{material.unit}</span>
                      </td>

                      {/* Visual Percentage Bar */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                            <span className="text-[#D8B4FE]/80">{stats.percentageRemaining}%</span>
                            <span className="text-[#D8B4FE]/50 text-[10px]">
                              Min: {material.minimumThreshold}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#0E061A] rounded-full overflow-hidden border border-purple-900/40">
                            <div
                              className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                              style={{ width: `${stats.percentageRemaining}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(material)}
                            title="Quick Adjust Stock (+ Restock / - Write-off)"
                            className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-white hover:text-[#19092F] text-white transition-colors cursor-pointer border border-purple-800/40"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(material)}
                            title="Edit Material Details"
                            className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-white hover:text-[#19092F] text-[#D8B4FE] transition-colors cursor-pointer border border-purple-800/40"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockToDelete(material)}
                            title="Delete Stock Material"
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 hover:text-white text-red-400 transition-colors cursor-pointer border border-red-900/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* MODAL 1: ADD RAW MATERIAL (With Quick Presets) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-white" />
                  Add User-Defined Raw Material to Stock
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Presets Bar */}
              <div className="space-y-1.5 bg-[#0E061A] p-3 rounded-xl border border-purple-900/50">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Agarbatti Industry Presets (Click to autofill):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_MATERIALS.slice(0, 5).map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[11px] px-2 py-1 rounded bg-[#241142] hover:bg-white hover:text-[#19092F] text-[#E9D5FF] transition-colors cursor-pointer border border-purple-800/60 truncate max-w-[200px]"
                      title={preset.name}
                    >
                      {preset.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddStock} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Raw Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bamboo Sticks 9-Inch Round, Rose Attar, etc."
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Bought / Purchase Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={boughtDate}
                      onChange={(e) => setBoughtDate(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Bought Quantity *
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step="any"
                      required
                      value={boughtQuantity}
                      onChange={(e) => setBoughtQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Unit of Measure *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="litres">Litres (litres)</option>
                        <option value="units">Units / Pieces (units)</option>
                        <option value="bags">Bags (bags)</option>
                        <option value="boxes">Boxes (boxes)</option>
                        <option value="rolls">Rolls (rolls)</option>
                        <option value="grams">Grams (grams)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Supplier / Vendor Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Assam Bamboo Crafts, Kannauj Aromatics"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Cost per Unit (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={costPerUnit}
                      onChange={(e) => setCostPerUnit(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 115"
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Safety Threshold
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={minimumThreshold}
                      onChange={(e) => setMinimumThreshold(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 200"
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Usage Rate (per 1kg prod)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min={0}
                      value={consumptionFactor}
                      onChange={(e) => setConsumptionFactor(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 0.28"
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Notes / Storage Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Warehouse Rack B, Drying Shed 2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                  >
                    Save Raw Material
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT RAW MATERIAL (Full Manipulation) */}
      <AnimatePresence>
        {editingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-white" />
                  Edit Stock Material: {editingStock.materialName}
                </h3>
                <button
                  onClick={() => setEditingStock(null)}
                  className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Raw Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMaterialName}
                    onChange={(e) => setEditMaterialName(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Bought / Purchase Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editBoughtDate}
                      onChange={(e) => setEditBoughtDate(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Base Bought Quantity *
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step="any"
                      required
                      value={editBoughtQuantity}
                      onChange={(e) => setEditBoughtQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Unit of Measure *
                    </label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="litres">Litres (litres)</option>
                      <option value="units">Units / Pieces (units)</option>
                      <option value="bags">Bags (bags)</option>
                      <option value="boxes">Boxes (boxes)</option>
                      <option value="rolls">Rolls (rolls)</option>
                      <option value="grams">Grams (grams)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Supplier / Vendor Name
                    </label>
                    <input
                      type="text"
                      value={editSupplier}
                      onChange={(e) => setEditSupplier(e.target.value)}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Cost per Unit (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={editCostPerUnit}
                      onChange={(e) => setEditCostPerUnit(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Safety Threshold
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={editMinimumThreshold}
                      onChange={(e) => setEditMinimumThreshold(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                      Consumption Factor
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min={0}
                      value={editConsumptionFactor}
                      onChange={(e) => setEditConsumptionFactor(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setEditingStock(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: QUICK ADJUST QUANTITY (+ Restock / - Write-Off / Direct Set) */}
      <AnimatePresence>
        {adjustingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                  Adjust Stock: {adjustingStock.materialName}
                </h3>
                <button
                  onClick={() => setAdjustingStock(null)}
                  className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Current Overview */}
              <div className="bg-[#0E061A] p-3 rounded-xl border border-purple-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#D8B4FE]/60">Current Total Base:</span>
                  <div className="font-bold text-[#FFFDF5] font-mono-numbers">
                    {(adjustingStock.boughtQuantity + (adjustingStock.manualAdjustment || 0)).toLocaleString()}{' '}
                    {adjustingStock.unit}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#D8B4FE]/60">Remaining Calculated:</span>
                  <div className="font-bold text-white font-mono-numbers">
                    {getStockUsageStats(adjustingStock).remainingStock.toLocaleString()}{' '}
                    {adjustingStock.unit}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveAdjust} className="space-y-4">
                {/* Adjust Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      adjustType === 'add'
                        ? 'bg-white/15 border-white/50 text-white shadow-sm'
                        : 'bg-[#0E061A] border-purple-900/60 text-[#D8B4FE]/70 hover:border-purple-600'
                    }`}
                  >
                    <PackagePlus className="w-4 h-4 text-white" />
                    <span>+ Restock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('deduct')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      adjustType === 'deduct'
                        ? 'bg-white/15 border-white/50 text-white shadow-sm'
                        : 'bg-[#0E061A] border-purple-900/60 text-[#D8B4FE]/70 hover:border-purple-600'
                    }`}
                  >
                    <PackageMinus className="w-4 h-4 text-white" />
                    <span>- Deduct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('set')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      adjustType === 'set'
                        ? 'bg-white/15 border-white/50 text-white shadow-sm'
                        : 'bg-[#0E061A] border-purple-900/60 text-[#D8B4FE]/70 hover:border-purple-600'
                    }`}
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                    <span>Set Exact</span>
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    {adjustType === 'add'
                      ? `Quantity to Add (${adjustingStock.unit}) *`
                      : adjustType === 'deduct'
                      ? `Quantity to Deduct / Write-Off (${adjustingStock.unit}) *`
                      : `New Total Quantity (${adjustingStock.unit}) *`}
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-sm text-[#FFFDF5] font-bold font-mono-numbers focus:outline-none focus:border-white"
                  />

                  {/* Quick increment buttons */}
                  {adjustType !== 'set' && (
                    <div className="flex gap-1.5 mt-2">
                      {[50, 100, 250, 500].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setAdjustAmount(inc)}
                          className="px-2 py-0.5 rounded bg-purple-900/30 text-[10px] text-[#D8B4FE] hover:bg-purple-900/70 hover:text-white cursor-pointer"
                        >
                          {adjustType === 'add' ? `+${inc}` : `-${inc}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Reason / Batch Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received new shipment from supplier, damaged during rains, audit adjustment"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setAdjustingStock(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                  >
                    Apply Stock Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DELETE CONFIRMATION */}
      <AnimatePresence>
        {stockToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#160B29] border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-800">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#FFFDF5]">Delete Stock Material</h3>
                  <p className="text-[11px] text-[#D8B4FE]/60">This action cannot be undone.</p>
                </div>
              </div>

              <div className="text-xs text-[#D8B4FE]/80 bg-[#0E061A] p-3 rounded-xl border border-purple-900/60">
                Are you sure you want to remove <strong>"{stockToDelete.materialName}"</strong>?
                <br />
                <span className="text-[11px] text-[#D8B4FE]/50 mt-1 block">
                  Remaining stock of {getStockUsageStats(stockToDelete).remainingStock} {stockToDelete.unit} will no longer be tracked.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockToDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md"
                >
                  Delete Material
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: RESET DEFAULTS CONFIRMATION */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#160B29] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#FFFDF5]">Reset Stocks to Default</h3>
                  <p className="text-[11px] text-[#D8B4FE]/60">Restore factory baseline</p>
                </div>
              </div>

              <div className="text-xs text-[#D8B4FE]/80 bg-[#0E061A] p-3 rounded-xl border border-purple-900/60">
                This will reset your raw materials inventory back to the initial factory stock materials (Bamboo Sticks, Premix, Oils, Packaging). Any custom materials you created will be replaced.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-[#19092F] cursor-pointer shadow-md"
                >
                  Reset Defaults
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
