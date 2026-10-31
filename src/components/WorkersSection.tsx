import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  UserPlus,
  Lock,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  UserX,
  Briefcase,
  Phone,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Calculator,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Worker, Gender, WorkerStatus } from '../types/inventory';

export const WorkersSection: React.FC = () => {
  const {
    currentUser,
    workers,
    addWorker,
    updateWorker,
    deleteWorker,
    todayDate,
    setTodayDate,
    getWorkerStatusForDate,
    setWorkerDailyStatus,
  } = useInventory();

  const isAdmin = currentUser?.role === 'admin';

  // Date management state
  const [dateInput, setDateInput] = useState(todayDate);

  useEffect(() => {
    setDateInput(todayDate);
  }, [todayDate]);

  // Extract date details for analysis
  const [yearStr, monthStr, dayStr] = todayDate.split('-');
  const selectedYear = parseInt(yearStr, 10) || 2026;
  const selectedMonth = parseInt(monthStr, 10) || 10;
  const selectedDay = parseInt(dayStr, 10) || 2;
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('en-US', {
    month: 'long',
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal State for Add/Edit Worker
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form Fields for Worker
  const [workerName, setWorkerName] = useState('');
  const [workerAge, setWorkerAge] = useState<number | ''>(30);
  const [workerGender, setWorkerGender] = useState<Gender>('Male');
  const [workerRole, setWorkerRole] = useState('Machine Operator');
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>('Active');
  const [workerSalary, setWorkerSalary] = useState<number | ''>(25000);
  const [workerJoinedDate, setWorkerJoinedDate] = useState(todayDate);
  const [workerContact, setWorkerContact] = useState('');

  // Delete Confirmation & Notification State
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Daily Breakdown & Month Compensation Modal State (Admin only)
  const [breakdownWorker, setBreakdownWorker] = useState<Worker | null>(null);

  // Quick Date Navigation Handlers
  const handleUpdateDateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dateInput) return;
    setTodayDate(dateInput);
    setNotificationMessage(`Operations date set to ${dateInput}`);
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedYear, selectedMonth - 1, selectedDay - 1);
    const prevDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    setTodayDate(prevDateStr);
  };

  const handleNextDay = () => {
    const d = new Date(selectedYear, selectedMonth - 1, selectedDay + 1);
    const nextDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    setTodayDate(nextDateStr);
  };

  const handleSetTodaySystem = () => {
    const now = new Date();
    const systemTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    setTodayDate(systemTodayStr);
    setDateInput(systemTodayStr);
  };

  // Helper: compute monthly compensation, per-day rate, and active/inactive days for a worker
  const calculateWorkerMonthlyStats = (w: Worker) => {
    let activeDays = 0;
    let inactiveDays = 0;
    const dailyStatuses: { day: number; dateStr: string; status: 'Active' | 'Inactive' }[] = [];

    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(
        2,
        '0'
      )}`;
      const status = getWorkerStatusForDate(w.id, dateStr);
      dailyStatuses.push({ day: d, dateStr, status });
      if (status === 'Active') {
        activeDays++;
      } else {
        inactiveDays++;
      }
    }

    const perDayRate =
      w.salary > 0 && daysInSelectedMonth > 0 ? w.salary / daysInSelectedMonth : 0;
    const calculatedMonthlyCompensation = Math.round(activeDays * perDayRate);
    const deduction = Math.max(0, w.salary - calculatedMonthlyCompensation);

    return {
      daysInMonth: daysInSelectedMonth,
      activeDays,
      inactiveDays,
      perDayRate,
      calculatedMonthlyCompensation,
      deduction,
      dailyStatuses,
    };
  };

  // Summary KPI Calculations
  const totalEmployees = workers.length;
  const activeTodayEmployees = workers.filter(
    (w) => getWorkerStatusForDate(w.id, todayDate) === 'Active'
  ).length;
  const inactiveTodayEmployees = totalEmployees - activeTodayEmployees;

  // Monthly total calculated compensation across all workers (Admin only)
  const totalCalculatedPayroll = workers.reduce((sum, w) => {
    const stats = calculateWorkerMonthlyStats(w);
    return sum + stats.calculatedMonthlyCompensation;
  }, 0);

  // Filtered workers
  const filteredWorkers = workers.filter((w) => {
    const todayStatus = getWorkerStatusForDate(w.id, todayDate);
    const matchesSearch =
  (w.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
  (w.role ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || todayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open modal for new worker
  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setWorkerName('');
    setWorkerAge(28);
    setWorkerGender('Male');
    setWorkerRole('Fragrance Blender');
    setWorkerStatus('Active');
    setWorkerSalary(24000);
    setWorkerJoinedDate(todayDate);
    setWorkerContact('');
    setIsModalOpen(true);
  };

  // Open modal for editing worker
  const handleOpenEditModal = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name);
    setWorkerAge(w.age);
    setWorkerGender(w.gender);
    setWorkerRole(w.role);
    setWorkerStatus(w.status);
    setWorkerSalary(w.salary);
    setWorkerJoinedDate(w.joinedDate || todayDate);
    setWorkerContact(w.contact || '');
    setIsModalOpen(true);
  };

  const handleDeleteWorkerConfirmed = () => {
    if (!workerToDelete) return;
    const name = workerToDelete.name;
    deleteWorker(workerToDelete.id);
    setWorkerToDelete(null);
    setIsModalOpen(false);
    setNotificationMessage(`Successfully removed employee "${name}" from workforce.`);
    setTimeout(() => {
      setNotificationMessage(null), 4000;
    }, 4000);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim()) return;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        name: workerName.trim(),
        age: Number(workerAge) || 25,
        gender: workerGender,
        role: workerRole,
        status: workerStatus,
        salary: isAdmin ? Number(workerSalary) || editingWorker.salary : editingWorker.salary,
        joinedDate: workerJoinedDate || editingWorker.joinedDate || todayDate,
        contact: workerContact.trim(),
      });
      // Also sync selected date's daily status
      setWorkerDailyStatus(editingWorker.id, todayDate, workerStatus);
      setNotificationMessage(`Worker profile for "${workerName.trim()}" updated successfully.`);
    } else {
      addWorker({
        name: workerName.trim(),
        age: Number(workerAge) || 25,
        gender: workerGender,
        role: workerRole,
        status: workerStatus,
        salary: isAdmin ? Number(workerSalary) || 22000 : 22000,
        joinedDate: workerJoinedDate || todayDate,
        contact: workerContact.trim(),
      });
      setNotificationMessage(`New worker "${workerName.trim()}" registered successfully.`);
    }
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
    setIsModalOpen(false);
  };

  // One-click toggle status for the selected date (Admin Only)
  const handleToggleTodayStatus = (wId: string) => {
    if (!isAdmin) return;
    const current = getWorkerStatusForDate(wId, todayDate);
    const next = current === 'Active' ? 'Inactive' : 'Active';
    setWorkerDailyStatus(wId, todayDate, next);
    setNotificationMessage(`Status for ${todayDate} updated to ${next}.`);
    setTimeout(() => setNotificationMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. DATE MANAGEMENT & OPERATIONS SELECTOR with transparent blurred glass */}
      <div className="glass-block rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2D1452]/70 border border-[#D8B4FE]/40 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#FFFDF5] font-mono-numbers">
                {todayDate}
              </h2>
            </div>
          </div>

          {/* Date Picker Form & Quick Nav */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center glass-block-subtle rounded-xl p-1 shadow-inner">
              <button
                type="button"
                onClick={handlePrevDay}
                title="Previous Day"
                className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="bg-transparent text-xs text-[#FFFDF5] font-mono-numbers px-2 py-1 focus:outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={handleNextDay}
                title="Next Day"
                className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleUpdateDateSubmit()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_10px_rgba(255,255,255,0.2)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#19092F]" />
              <span>Update Date</span>
            </button>

            <button
              type="button"
              onClick={handleSetTodaySystem}
              title="Set to Current Real Date"
              className="px-2.5 py-2 rounded-xl text-xs font-medium text-[#D8B4FE]/80 hover:text-white bg-[#22103E]/70 hover:bg-[#2C154E] border border-purple-800/50 transition-colors cursor-pointer backdrop-blur-sm"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* 2. QUICK KPI METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Registered Staff</p>
            <h3 className="text-2xl font-bold text-[#FFFDF5] font-mono-numbers mt-1">
              {totalEmployees}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between border-white/20">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Active Workers</p>
            <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
              {activeTodayEmployees}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D8B4FE]/75 font-medium">Inactive Workers</p>
            <h3 className="text-2xl font-bold text-[#E9D5FF] font-mono-numbers mt-1">
              {inactiveTodayEmployees}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#22103E]/70 border border-purple-800/50 flex items-center justify-center text-[#D8B4FE] backdrop-blur-sm">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Monthly Compensation KPI (Admin Only) */}
        <div className="glass-block rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
          {isAdmin ? (
            <>
              <div>
                <p className="text-xs text-white font-medium flex items-center gap-1">
                  <span>Compensation</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D1452] border border-[#D8B4FE]/30 text-[#FFFDF5]">
                    Admin
                  </span>
                </p>
                <h3 className="text-2xl font-bold text-white font-mono-numbers mt-1">
                  ₹{totalCalculatedPayroll.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Briefcase className="w-5 h-5" />
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between py-1">
              <div>
                <p className="text-xs text-[#D8B4FE]/80 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>Compensation</span>
                </p>
                <h3 className="text-sm font-semibold text-[#E9D5FF] mt-1">Restricted to Admin</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#22103E]/70 border border-purple-800/50 flex items-center justify-center text-[#D8B4FE] backdrop-blur-sm">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. WORKFORCE ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#FFFDF5] flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span>Worker Directory</span>
          </h2>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.2)] cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#19092F]" />
          <span>Add New Worker</span>
        </button>
      </div>

      {/* 4. WORKFORCE ROSTER TABLE WITH PER-DAY & MONTHLY COMPENSATION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#D8B4FE]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search worker by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#160B29]/60 backdrop-blur-md border border-purple-900/50 rounded-lg pl-9 pr-3 py-2 text-xs text-[#FFFDF5] placeholder-[#D8B4FE]/40 focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#D8B4FE]/70">Status on {todayDate}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive')}
              className="bg-[#160B29]/60 backdrop-blur-md border border-purple-900/50 rounded-lg px-3 py-1.5 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
            >
              <option value="all">All Statuses ({totalEmployees})</option>
              <option value="Active">Active ({activeTodayEmployees})</option>
              <option value="Inactive">Inactive ({inactiveTodayEmployees})</option>
            </select>
          </div>
        </div>

        {/* Workforce Table with transparent blurred glass */}
        <div className="glass-block rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A0B33]/70 backdrop-blur-md border-b border-purple-900/50 text-[#D8B4FE]/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Employee Details</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Role / Department</th>
                  <th className="py-3 px-4">Status ({todayDate})</th>
                  {isAdmin ? (
                    <>
                      <th className="py-3 px-4 text-right">Per Day</th>
                      <th className="py-3 px-4 text-right">Monthly Compensation</th>
                    </>
                  ) : (
                    <th className="py-3 px-4 text-right">Salary Access</th>
                  )}
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-[#E9D5FF]">
                {filteredWorkers.map((w) => {
                  const todayStatus = getWorkerStatusForDate(w.id, todayDate);
                  const stats = calculateWorkerMonthlyStats(w);

                  return (
                    <tr key={w.id} className="hover:bg-[#1E0D36]/60 transition-colors">
                      {/* Employee Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#271348] border border-purple-800/60 flex items-center justify-center font-bold text-xs text-white">
                            {(w.name ?? '?').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#FFFDF5]">{w.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3 px-4 text-[#D8B4FE]/90">
                        {w.age} yrs · <span className="text-white">{w.gender}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{w.role}</span>
                      </td>

                      {/* Status for Selected Date with One-Click Toggle for Admin */}
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleToggleTodayStatus(w.id)}
                            title={`Click to toggle status for ${todayDate} (${
                              todayStatus === 'Active' ? 'Mark Inactive' : 'Mark Active'
                            })`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                              todayStatus === 'Active'
                                ? 'bg-white/15 text-white border-white/40 hover:bg-white/25 shadow-sm'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/50 hover:bg-rose-900/80 shadow-sm'
                            }`}
                          >
                            {todayStatus === 'Active' ? (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 text-rose-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              todayStatus === 'Active'
                                ? 'bg-white/10 text-white border-white/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-700/60'
                            }`}
                          >
                            {todayStatus}
                          </span>
                        )}
                      </td>

                      {/* Per Day & Monthly Compensation (Admin Only) */}
                      {isAdmin ? (
                        <>
                          {/* Section: Per Day Rate */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-mono-numbers font-semibold text-white">
                              ₹{Math.round(stats.perDayRate).toLocaleString('en-IN')}
                            </div>
                          </td>

                          {/* Section: Monthly Compensation */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-mono-numbers font-bold text-white">
                              ₹{stats.calculatedMonthlyCompensation.toLocaleString('en-IN')}
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#D8B4FE]/70 bg-[#1A0B33] px-2 py-0.5 rounded border border-purple-900/50">
                            <Lock className="w-3 h-3 text-white" />
                            Restricted
                          </span>
                        </td>
                      )}

                      {/* Contact Phone */}
                      <td className="py-3 px-4 font-mono-numbers text-[#D8B4FE]/80">
                        {w.contact ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#D8B4FE]/50" />
                            <span>{w.contact}</span>
                          </span>
                        ) : (
                          <span className="text-[#D8B4FE]/40 italic">Not provided</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Admin: View and toggle days in month */}
                          {isAdmin && (
                            <button
                              onClick={() => setBreakdownWorker(w)}
                              title={`Analyze active/inactive days of ${monthName} for ${w.name}`}
                              className="px-2 py-1 rounded-lg text-white bg-[#271348] hover:bg-[#3B1968] border border-[#D8B4FE]/30 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            >
                              <CalendarDays className="w-3.5 h-3.5 text-white" />
                              <span className="hidden md:inline">Days</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(w)}
                            title="Edit Worker Profile"
                            className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-[#FFFDF5] hover:bg-[#261245] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setWorkerToDelete(w)}
                            title="Delete Worker"
                            className="p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-red-300 hover:bg-[#261245] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-[#D8B4FE]/50 text-xs">
                      No workers match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* 5. ADMIN MODAL: MONTHLY ACTIVE / INACTIVE DAYS ANALYZER & COMPENSATION */}
      {isAdmin && breakdownWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-[#160B29] border border-[#D8B4FE]/35 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2D1452] border border-[#D8B4FE]/40 flex items-center justify-center text-white">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#FFFDF5]">
                    {breakdownWorker.name} — Monthly Compensation
                  </h3>
                  <p className="text-xs text-[#D8B4FE]/70 font-mono-numbers">
                    {breakdownWorker.role} · ID: {breakdownWorker.id} · {monthName} {selectedYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBreakdownWorker(null)}
                className="text-[#D8B4FE]/70 hover:text-white text-base cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Calculations Breakdown Card */}
            {(() => {
              const stats = calculateWorkerMonthlyStats(breakdownWorker);
              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0F051D] border border-purple-900/60 rounded-xl p-3.5 text-xs">
                    <div>
                      <span className="text-[#D8B4FE]/60 text-[11px] block">Base Monthly Salary</span>
                      <span className="font-mono-numbers font-bold text-[#FFFDF5] text-sm">
                        ₹{breakdownWorker.salary.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#D8B4FE]/60 text-[11px] block">Per Day</span>
                      <span className="font-mono-numbers font-bold text-white text-sm">
                        ₹{stats.perDayRate.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#D8B4FE]/60 text-[11px] block">Active Days</span>
                      <span className="font-mono-numbers font-bold text-white text-sm">
                        {stats.activeDays}{' '}
                        <span className="text-[10px] text-[#D8B4FE]/50 font-sans">
                          / {stats.daysInMonth} ({((stats.activeDays / stats.daysInMonth) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[#D8B4FE]/60 text-[11px] block">Final Compensation</span>
                      <span className="font-mono-numbers font-extrabold text-white text-sm">
                        ₹{stats.calculatedMonthlyCompensation.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {stats.inactiveDays > 0 ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center justify-between">
                      <span>
                        Deduction for {stats.inactiveDays} Inactive day{stats.inactiveDays > 1 ? 's' : ''}:
                      </span>
                      <span className="font-mono-numbers font-bold">
                        -₹{stats.deduction.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white flex items-center justify-between">
                      <span>Full Attendance: 100% compensation earned for this month.</span>
                      <span className="font-mono-numbers font-bold">₹0 Deduction</span>
                    </div>
                  )}

                  {/* Day by Day Calendar Grid */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#FFFDF5] flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-white" />
                        <span>Daily Status in {monthName} (Click to toggle Active / Inactive)</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            for (let d = 1; d <= stats.daysInMonth; d++) {
                              const dateStr = `${selectedYear}-${String(selectedMonth).padStart(
                                2,
                                '0'
                              )}-${String(d).padStart(2, '0')}`;
                              setWorkerDailyStatus(breakdownWorker.id, dateStr, 'Active');
                            }
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-white/15 border border-white/40 text-white hover:bg-white/25 cursor-pointer"
                        >
                          Mark All Active
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-56 overflow-y-auto p-1">
                      {stats.dailyStatuses.map(({ day, dateStr, status }) => {
                        const isCurrentSelected = dateStr === todayDate;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              const next = status === 'Active' ? 'Inactive' : 'Active';
                              setWorkerDailyStatus(breakdownWorker.id, dateStr, next);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              status === 'Active'
                                ? 'bg-white/15 border-white/40 hover:bg-white/25 text-white'
                                : 'bg-rose-950/30 border-rose-500/40 hover:bg-rose-900/50 text-rose-300'
                            } ${isCurrentSelected ? 'ring-2 ring-white' : ''}`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                              <span className="font-bold text-[#FFFDF5]">Day {day}</span>
                              {status === 'Active' ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <X className="w-3 h-3 text-rose-400" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-medium mt-1 ${
                                status === 'Active' ? 'text-white' : 'text-rose-400'
                              }`}
                            >
                              {status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="flex items-center justify-end pt-3 border-t border-purple-900/50">
              <button
                type="button"
                onClick={() => setBreakdownWorker(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. MODAL: ADD / EDIT WORKER (Includes Joined Date update) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#160B29] border border-[#D8B4FE]/35 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <h3 className="font-semibold text-base text-[#FFFDF5] flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                {editingWorker ? 'Edit Worker Profile' : 'Add New Worker'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#D8B4FE]/70 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Worker Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    required
                    value={workerAge}
                    onChange={(e) => setWorkerAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Gender *
                  </label>
                  <select
                    value={workerGender}
                    onChange={(e) => setWorkerGender(e.target.value as Gender)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Role / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agarbatti Rolling Operator"
                    value={workerRole}
                    onChange={(e) => setWorkerRole(e.target.value)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                    Base Employment Status
                  </label>
                  <select
                    value={workerStatus}
                    onChange={(e) => setWorkerStatus(e.target.value as WorkerStatus)}
                    className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Joining Date Field (Allows updating employee joined date) */}
              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1 flex items-center justify-between">
                  <span>Joining Date (YYYY-MM-DD) *</span>
                  <span className="text-[10px] text-[#D8B4FE]/60">Date employee joined</span>
                </label>
                <input
                  type="date"
                  required
                  value={workerJoinedDate}
                  onChange={(e) => setWorkerJoinedDate(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers cursor-pointer"
                />
              </div>

              {/* Salary: Admin Restricted Field */}
              {isAdmin ? (
                <div>
                  <label className="block text-xs font-medium text-white mb-1 flex items-center justify-between">
                    <span>Monthly Salary (₹) *</span>
                    <span className="text-[10px] text-[#D8B4FE]/70">Admin Managed</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={workerSalary}
                    onChange={(e) => setWorkerSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0E061A] border border-[#D8B4FE]/40 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              ) : (
                <div className="p-3 bg-[#1C0D34] border border-purple-900/60 rounded-lg text-xs text-[#D8B4FE]/70 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-white" />
                  <span>Salary field is locked. Only administrators can alter compensation.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#FDFBF7] mb-1">
                  Contact Phone / Emergency
                </label>
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={workerContact}
                  onChange={(e) => setWorkerContact(e.target.value)}
                  className="w-full bg-[#0E061A] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-[#FFFDF5] focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-purple-900/50">
                {editingWorker ? (
                  <button
                    type="button"
                    onClick={() => setWorkerToDelete(editingWorker)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Employee</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#D8B4FE]/70 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-[#19092F] bg-white hover:bg-zinc-100 cursor-pointer shadow-md"
                  >
                    {editingWorker ? 'Update Worker' : 'Register Worker'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 7. CONFIRM DELETE WORKER MODAL */}
      {workerToDelete && (
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
                <h3 className="text-base font-bold text-[#FFFDF5]">Delete Employee</h3>
                <p className="text-xs text-[#D8B4FE]/70">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F051D] border border-purple-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Employee Name:</span>
                <span className="font-semibold text-[#FFFDF5]">{workerToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Role / Designation:</span>
                <span className="text-white">{workerToDelete.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8B4FE]/70">Status for {todayDate}:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    getWorkerStatusForDate(workerToDelete.id, todayDate) === 'Active'
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {getWorkerStatusForDate(workerToDelete.id, todayDate)}
                </span>
              </div>
              {isAdmin && (
                <div className="flex justify-between items-center">
                  <span className="text-[#D8B4FE]/70">Base Monthly Salary:</span>
                  <span className="font-mono-numbers text-white">
                    ₹{workerToDelete.salary?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#D8B4FE]/80 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{workerToDelete.name}</strong> from
              the workforce roster?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#D8B4FE]/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkerConfirmed}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Employee</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 8. TOAST NOTIFICATION */}
      {notificationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 right-6 z-50 bg-[#170B2C] border border-white/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{notificationMessage}</span>
          <button
            onClick={() => setNotificationMessage(null)}
            className="ml-2 text-white/70 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}
    </div>
  );
};
