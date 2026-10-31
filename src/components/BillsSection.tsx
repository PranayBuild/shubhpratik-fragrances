import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ReceiptText,
  Plus,
  Lock,
  Filter,
  Trash2,
  Zap,
  Package,
  Layers,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { BillCategory, BillRecord } from '../types/inventory';

export const BillsSection: React.FC = () => {
  const { currentUser, bills, addBill, deleteBill, todayDate } = useInventory();
  const isAdmin = currentUser?.role === 'admin';

  // Sub filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Add bill modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState<BillCategory>('Investment on Raw Material');
  const [billDate, setBillDate] = useState(todayDate);
  const [amount, setAmount] = useState<number | ''>(15000);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [billToDelete, setBillToDelete] = useState<BillRecord | null>(null);

  // Visible bills based on role
  // If employee: confidential employee salary bills are omitted or masked
  const visibleBills = bills.filter((b) => {
    if (!isAdmin && (b.category === 'Employee Salary' || b.isSalaryConfidential)) {
      return false;
    }
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesDate = !dateFilter || b.date === dateFilter;
    return matchesCategory && matchesDate;
  });

  // Aggregates (calculated from visible bills)
  const totalBillsAmount = visibleBills.reduce((sum, b) => sum + b.amount, 0);

  const rawMaterialTotal = bills
    .filter((b) => b.category === 'Investment on Raw Material')
    .reduce((sum, b) => sum + b.amount, 0);

  const electricityTotal = bills
    .filter((b) => b.category === 'Electricity Bill')
    .reduce((sum, b) => sum + b.amount, 0);

  const packagingTotal = bills
    .filter((b) => b.category === 'Packaging Bills')
    .reduce((sum, b) => sum + b.amount, 0);

  const salaryTotal = bills
    .filter((b) => b.category === 'Employee Salary')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || !amount) return;

    addBill({
      expenseName: expenseName.trim(),
      category,
      date: billDate,
      amount: Number(amount),
      paymentStatus,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      notes: billNotes.trim(),
      isSalaryConfidential: category === 'Employee Salary',
    });

    setIsModalOpen(false);
    setSuccessMessage(`Expense bill "${expenseName}" recorded successfully.`);
    setTimeout(() => setSuccessMessage(''), 4000);

    // Reset
    setExpenseName('');
    setInvoiceNumber('');
    setBillNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/10 border border-white/30 text-white rounded-xl text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage('')} className="text-white hover:text-white/80">✕</button>
        </motion.div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-white">
            <ReceiptText className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-white text-lg">
            Bills
          </h2>
        </div>

        <button
          onClick={() => {
            setExpenseName('');
            setCategory('Investment on Raw Material');
            setBillDate(todayDate);
            setAmount(15000);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#19092F]" />
          <span>Add Expense Bill</span>
        </button>
      </div>

      {/* Expense KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Raw Material Investment */}
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Raw Material Investment</p>
            <h3 className="text-xl font-bold text-white font-mono-numbers mt-1">
              ₹{rawMaterialTotal.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Electricity Bills */}
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Electricity & Power</p>
            <h3 className="text-xl font-bold text-[#E9D5FF] font-mono-numbers mt-1">
              ₹{electricityTotal.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#241142]/70 border border-[#D8B4FE]/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Packaging Bills */}
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Packaging Bills</p>
            <h3 className="text-xl font-bold text-[#E9D5FF] font-mono-numbers mt-1">
              ₹{packagingTotal.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#241142]/70 border border-[#D8B4FE]/20 flex items-center justify-center text-purple-300 backdrop-blur-sm">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Employee Salary (Role Restricted) */}
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          {isAdmin ? (
            <>
              <div>
                <p className="text-xs text-white font-medium flex items-center gap-1">
                  <span>Employee Salary</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D1452] border border-[#D8B4FE]/30 text-white">
                    Admin
                  </span>
                </p>
                <h3 className="text-xl font-bold text-white font-mono-numbers mt-1">
                  ₹{salaryTotal.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-xs text-[#D8B4FE]/80 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>Employee Salary</span>
                </p>
                <h3 className="text-xs font-semibold text-[#E9D5FF] mt-1">Restricted to Admin</h3>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#241142]/70 border border-purple-800/50 flex items-center justify-center text-[#D8B4FE] backdrop-blur-sm">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Date Bar with transparent blurred glass */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-block-subtle rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#D8B4FE]/80 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-white" /> Filter Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          >
            <option value="all">All Expense Categories</option>
            <option value="Investment on Raw Material">Investment on Raw Material</option>
            <option value="Electricity Bill">Electricity Bill</option>
            <option value="Packaging Bills">Packaging Bills</option>
            {isAdmin && <option value="Employee Salary">Employee Salary (Admin)</option>}
            <option value="Machine Maintenance">Machine Maintenance</option>
            <option value="Other Custom Expense">Other Custom Expense</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#D8B4FE]/80 whitespace-nowrap">Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#0E061A]/60 backdrop-blur-md border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-[#D8B4FE]/80 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bills Table with transparent blurred glass */}
      <div className="glass-block rounded-2xl overflow-hidden">
        <div className="px-4 py-3 glass-header flex items-center justify-between">
          <span className="text-xs font-semibold text-[#FFFDF5]">Bills</span>
          <span className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
            Displaying: {visibleBills.length} bills · Total: ₹{totalBillsAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#180A2D]/70 backdrop-blur-md border-b border-purple-900/40 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Invoice / Ref #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right text-white">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
              {visibleBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-sm">{bill.expenseName}</div>
                    {bill.notes && <div className="text-[11px] text-[#D8B4FE]/50">{bill.notes}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#E9D5FF] font-medium">{bill.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                    {bill.date}
                  </td>
                  <td className="py-3.5 px-4 font-mono-numbers text-[#D8B4FE]/70">
                    {bill.invoiceNumber || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        bill.paymentStatus === 'Paid'
                          ? 'bg-white/15 text-white border-white/30'
                          : 'bg-white/10 text-white/80 border-white/20'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white text-sm">
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setBillToDelete(bill)}
                      title="Delete Bill"
                      className="p-1.5 rounded-lg text-[#D8B4FE]/60 hover:text-red-300 hover:bg-[#2A134E] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {visibleBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#D8B4FE]/50 text-xs">
                    No expense bills found for the selected category or date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD BILL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#160B29] border border-[#D8B4FE]/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-white" />
                Record New Expense Bill
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as BillCategory;
                    setCategory(newCat);
                    if (!expenseName || expenseName.startsWith('Payment for')) {
                      setExpenseName(`Payment for ${newCat}`);
                    }
                  }}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                >
                  <option value="Investment on Raw Material">Investment on Raw Material</option>
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Packaging Bills">Packaging Bills</option>
                  {isAdmin && <option value="Employee Salary">Employee Salary (Confidential)</option>}
                  <option value="Machine Maintenance">Machine Maintenance</option>
                  <option value="Factory Rent">Factory Rent</option>
                  <option value="Logistics & Transport">Logistics & Transport</option>
                  <option value="Other Custom Expense">Other Custom Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Name of Expense / Bill Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulk Kannauj Chandan Oil Invoice #4402"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Bill / Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending / Due</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Invoice / Receipt #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9042"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Payment Mode / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. RTGS transfer from HDFC account"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/80 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                >
                  Save Bill Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CONFIRM DELETE BILL MODAL */}
      {billToDelete && (
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
                <h3 className="text-base font-bold text-[#FFFDF5]">Delete Bill Record</h3>
                <p className="text-xs text-[#D8B4FE]/70">This transaction will be removed</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F051D] border border-purple-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Expense:</span>
                <span className="font-semibold text-[#FFFDF5]">{billToDelete.expenseName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Category:</span>
                <span className="text-white">{billToDelete.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Amount:</span>
                <span className="font-mono-numbers font-bold text-white">₹{billToDelete.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#D8B4FE]/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBill(billToDelete.id);
                  setBillToDelete(null);
                  setSuccessMessage('Bill record deleted successfully.');
                  setTimeout(() => setSuccessMessage(''), 3000);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Bill</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
