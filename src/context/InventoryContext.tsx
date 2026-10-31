import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase';
import {
  UserRole,
  UserSession,
  Worker,
  AttendanceRecord,
  FragranceScent,
  ProductionRecord,
  StockMaterial,
  BillRecord,
  PurchaseRecord,
  SellRecord,
  NavigationSection,
} from '../types/inventory';
import {
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_SCENTS,
  INITIAL_PRODUCTION,
  INITIAL_STOCKS,
  INITIAL_BILLS,
  INITIAL_PURCHASES,
  INITIAL_SELLS,
} from '../data/initialData';

interface StockUsageStats {
  usedToday: number;
  cumulativeUsed: number;
  remainingStock: number;
  percentageRemaining: number;
}

interface InventoryContextType {
  currentUser: UserSession | null;
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  login: (role: UserRole, customName?: string) => void;
  loginWithGoogle: (profile: { email: string; name: string; picture?: string; forcedRole?: UserRole }) => { role: UserRole; isFirstAdmin: boolean };
  adminEmail: string | null;
  logout: () => void;

  // Workers
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  addOrUpdateAttendance: (rec: Omit<AttendanceRecord, 'id'>) => void;
  getAttendanceByDate: (dateStr: string) => AttendanceRecord[];

  // Production & Scents
  scents: FragranceScent[];
  addScent: (name: string, category?: FragranceScent['category'], description?: string) => void;
  deleteScent: (id: string) => void;
  productions: ProductionRecord[];
  addProduction: (prod: Omit<ProductionRecord, 'id'>) => void;
  deleteProduction: (id: string) => void;
  getProductionByDate: (dateStr: string) => {
    records: ProductionRecord[];
    totalKg: number;
    totalUnits: number;
    fragranceBreakdown: { [scent: string]: { kg: number; units: number } };
  };

  // Stocks
  stocks: StockMaterial[];
  addStock: (stock: Omit<StockMaterial, 'id'>) => void;
  updateStock: (id: string, updated: Partial<StockMaterial>) => void;
  deleteStock: (id: string) => void;
  adjustStockQuantity: (id: string, delta: number) => void;
  resetStocksToDefault: () => void;
  getStockUsageStats: (stock: StockMaterial, targetDate?: string) => StockUsageStats;

  // Bills
  bills: BillRecord[];
  addBill: (bill: Omit<BillRecord, 'id'>) => void;
  deleteBill: (id: string) => void;

  // Purchases
  purchases: PurchaseRecord[];
  addPurchase: (p: Omit<PurchaseRecord, 'id'>) => void;
  deletePurchase: (id: string) => void;
  calculatePurchaseByDate: (dateStr: string) => { total: number; records: PurchaseRecord[] };
  calculatePurchaseDateRange: (startDate: string, endDate: string) => { total: number; records: PurchaseRecord[] };

  // Sells
  sells: SellRecord[];
  addSell: (s: Omit<SellRecord, 'id'>) => void;
  deleteSell: (id: string) => void;
  calculateSellByDate: (dateStr: string) => { total: number; records: SellRecord[] };
  calculateSellDateRange: (startDate: string, endDate: string) => { total: number; records: SellRecord[] };

  // Helpers & Date
  todayDate: string;
  setTodayDate: (newDate: string) => void;

  // Daily Worker Status & Monthly Tracking
  dailyWorkerStatuses: Record<string, 'Active' | 'Inactive'>;
  setWorkerDailyStatus: (workerId: string, dateStr: string, status: 'Active' | 'Inactive') => void;
  getWorkerStatusForDate: (workerId: string, dateStr: string) => 'Active' | 'Inactive';
  calculateWorkerMonthlyStats: (
    worker: Worker,
    targetDate?: string
  ) => {
    year: number;
    month: number;
    daysInMonth: number;
    activeDays: number;
    inactiveDays: number;
    perDayRate: number;
    calculatedMonthlyCompensation: number;
    deduction: number;
    dailyStatuses: { day: number; dateStr: string; status: 'Active' | 'Inactive' }[];
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'shubhpratik_user',
  WORKERS: 'shubhpratik_workers_v1',
  ATTENDANCE: 'shubhpratik_attendance_v1',
  SCENTS: 'shubhpratik_scents_v1',
  PRODUCTION: 'shubhpratik_production_v1',
  STOCKS: 'shubhpratik_stocks_v1',
  BILLS: 'shubhpratik_bills_v1',
  PURCHASES: 'shubhpratik_purchases_v1',
  SELLS: 'shubhpratik_sells_v1',
  TODAY_DATE: 'shubhpratik_today_date_v1',
  DAILY_STATUS: 'shubhpratik_worker_daily_status_v1',
  ADMIN_EMAIL: 'shubhpratik_admin_email_v1',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminEmail, setAdminEmailState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);
  });
  // Use today's system reference date with user update capability
  const [todayDate, setTodayDateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TODAY_DATE) || '2026-10-02';
  });

  const setTodayDate = (newDate: string) => {
    if (!newDate) return;
    setTodayDateState(newDate);
    localStorage.setItem(STORAGE_KEYS.TODAY_DATE, newDate);
  };

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Start with login screen as requested
  });

  const [activeSection, setActiveSection] = useState<NavigationSection>('workers');

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [scents, setScents] = useState<FragranceScent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCENTS);
    return saved ? JSON.parse(saved) : INITIAL_SCENTS;
  });

  const [productions, setProductions] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTION);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION;
  });

  const [stocks, setStocks] = useState<StockMaterial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCKS);
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [bills, setBills] = useState<BillRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [sells, setSells] = useState<SellRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELLS);
    return saved ? JSON.parse(saved) : INITIAL_SELLS;
  });

  const [dailyWorkerStatuses, setDailyWorkerStatuses] = useState<Record<string, 'Active' | 'Inactive'>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_STATUS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATUS, JSON.stringify(dailyWorkerStatuses));
  }, [dailyWorkerStatuses]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCENTS, JSON.stringify(scents));
  }, [scents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(productions));
  }, [productions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELLS, JSON.stringify(sells));
  }, [sells]);

  // Real-time Firestore synchronization and health check
  useEffect(() => {
    testFirestoreConnection();

    // 1. Sync Workers from Firestore
    const unsubWorkers = onSnapshot(
      collection(db, 'workers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Worker[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as Worker));
          setWorkers(loaded);
        } else {
          // Auto-seed initial workers on first initialization
          const batch = writeBatch(db);
          INITIAL_WORKERS.forEach((w) => {
            batch.set(doc(db, 'workers', w.id), w);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore workers sync notice:', err)
    );

    // 2. Sync Fragrance Scents from Firestore
    const unsubScents = onSnapshot(
      collection(db, 'scents'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: FragranceScent[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as FragranceScent));
          setScents(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_SCENTS.forEach((s) => {
            batch.set(doc(db, 'scents', s.id), s);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore scents sync notice:', err)
    );

    // 3. Sync Daily Production Batches from Firestore
    const unsubProductions = onSnapshot(
      collection(db, 'productions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ProductionRecord[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as ProductionRecord));
          loaded.sort((a, b) => b.date.localeCompare(a.date));
          setProductions(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_PRODUCTION.forEach((p) => {
            batch.set(doc(db, 'productions', p.id), p);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore productions sync notice:', err)
    );

    // 4. Sync Raw Material Stocks from Firestore
    const unsubStocks = onSnapshot(
      collection(db, 'stocks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: StockMaterial[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as StockMaterial));
          setStocks(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_STOCKS.forEach((stk) => {
            batch.set(doc(db, 'stocks', stk.id), stk);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore stocks sync notice:', err)
    );

    // 5. Sync Bills & Factory Expenses from Firestore
    const unsubBills = onSnapshot(
      collection(db, 'bills'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BillRecord[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as BillRecord));
          loaded.sort((a, b) => b.date.localeCompare(a.date));
          setBills(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_BILLS.forEach((b) => {
            batch.set(doc(db, 'bills', b.id), b);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore bills sync notice:', err)
    );

    // 6. Sync Vendor Purchases from Firestore
    const unsubPurchases = onSnapshot(
      collection(db, 'purchases'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: PurchaseRecord[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as PurchaseRecord));
          loaded.sort((a, b) => b.date.localeCompare(a.date));
          setPurchases(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_PURCHASES.forEach((p) => {
            batch.set(doc(db, 'purchases', p.id), p);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore purchases sync notice:', err)
    );

    // 7. Sync Distributor Sells from Firestore
    const unsubSells = onSnapshot(
      collection(db, 'sells'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SellRecord[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as SellRecord));
          loaded.sort((a, b) => b.date.localeCompare(a.date));
          setSells(loaded);
        } else {
          const batch = writeBatch(db);
          INITIAL_SELLS.forEach((s) => {
            batch.set(doc(db, 'sells', s.id), s);
          });
          batch.commit().catch(console.error);
        }
      },
      (err) => console.warn('Firestore sells sync notice:', err)
    );

    // 8. Sync Daily Worker Attendance Statuses from Firestore
    const unsubDailyStatus = onSnapshot(
      collection(db, 'workerDailyStatuses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const map: Record<string, 'Active' | 'Inactive'> = {};
          snapshot.forEach((d) => {
            const data = d.data() as { workerId: string; date: string; status: 'Active' | 'Inactive' };
            if (data.workerId && data.date) {
              map[`${data.workerId}_${data.date}`] = data.status;
            }
          });
          setDailyWorkerStatuses((prev) => ({ ...prev, ...map }));
        }
      },
      (err) => console.warn('Firestore daily status sync notice:', err)
    );

    return () => {
      unsubWorkers();
      unsubScents();
      unsubProductions();
      unsubStocks();
      unsubBills();
      unsubPurchases();
      unsubSells();
      unsubDailyStatus();
    };
  }, []);

  // Auth Handlers
  const login = (role: UserRole, customName?: string) => {
    const session: UserSession = {
      role,
      name: customName || (role === 'admin' ? 'Shubham Patil (Administrator)' : 'Pratik K. (Floor Operations Manager)'),
      department: role === 'admin' ? 'Executive Factory Administration' : 'Floor Operations & Stock Oversight',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authProvider: 'password',
    };
    setCurrentUser(session);
    setActiveSection('workers');
  };

  const loginWithGoogle = (profile: { email: string; name: string; picture?: string; forcedRole?: UserRole }): { role: UserRole; isFirstAdmin: boolean } => {
    const cleanEmail = profile.email.trim().toLowerCase();
    let assignedRole: UserRole;
    let isFirstAdmin = false;

    if (!adminEmail) {
      // First Google login ever becomes the primary Administrator!
      assignedRole = profile.forcedRole || 'admin';
      if (assignedRole === 'admin') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, cleanEmail);
        setAdminEmailState(cleanEmail);
        isFirstAdmin = true;
      }
    } else if (cleanEmail === adminEmail.toLowerCase()) {
      assignedRole = 'admin';
    } else {
      assignedRole = profile.forcedRole || 'employee';
    }

    const session: UserSession = {
      role: assignedRole,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      department: assignedRole === 'admin' ? 'Executive Factory Administration' : 'Floor Operations & Stock Oversight',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authProvider: 'google',
    };

    setCurrentUser(session);
    setActiveSection('workers');
    return { role: assignedRole, isFirstAdmin };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Workers CRUD with Firestore persistence
  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: `w-${Date.now().toString().slice(-4)}`,
    };
    setWorkers((prev) => [newWorker, ...prev]);
    try {
      await setDoc(doc(db, 'workers', newWorker.id), newWorker);
    } catch (err) {
      console.error('Error saving worker to Firestore:', err);
    }
  };

  const updateWorker = async (updated: Worker) => {
    setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    try {
      await setDoc(doc(db, 'workers', updated.id), updated);
    } catch (err) {
      console.error('Error updating worker in Firestore:', err);
    }
  };

  const deleteWorker = async (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteDoc(doc(db, 'workers', id));
    } catch (err) {
      console.error('Error deleting worker from Firestore:', err);
    }
  };

  const setWorkerDailyStatus = async (workerId: string, dateStr: string, status: 'Active' | 'Inactive') => {
    const key = `${workerId}_${dateStr}`;
    setDailyWorkerStatuses((prev) => ({
      ...prev,
      [key]: status,
    }));
    try {
      await setDoc(doc(db, 'workerDailyStatuses', key), {
        id: key,
        workerId,
        date: dateStr,
        status,
      });
    } catch (err) {
      console.error('Error saving daily status to Firestore:', err);
    }
  };

  const getWorkerStatusForDate = (workerId: string, dateStr: string): 'Active' | 'Inactive' => {
    const key = `${workerId}_${dateStr}`;
    if (dailyWorkerStatuses[key]) {
      return dailyWorkerStatuses[key];
    }
    // Check attendance record
    const attRecord = attendance.find((a) => a.workerId === workerId && a.date === dateStr);
    if (attRecord) {
      if (attRecord.status === 'Present' || attRecord.status === 'Half Day') {
        return 'Active';
      }
      if (attRecord.status === 'On Leave' || attRecord.status === 'Absent') {
        return 'Inactive';
      }
    }
    // Default to worker's base status
    const worker = workers.find((w) => w.id === workerId);
    return worker?.status === 'Active' ? 'Active' : 'Inactive';
  };

  // Attendance
  const addOrUpdateAttendance = (rec: Omit<AttendanceRecord, 'id'>) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.workerId === rec.workerId && a.date === rec.date
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...rec, id: copy[existingIndex].id };
        return copy;
      }
      return [{ ...rec, id: `att-${Date.now()}` }, ...prev];
    });
  };

  const getAttendanceByDate = (dateStr: string) => {
    return attendance.filter((a) => a.date === dateStr);
  };

  // Production & Scents CRUD with Firestore persistence
  const addScent = async (
    name: string,
    category: FragranceScent['category'] = 'Flora',
    description?: string
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (scents.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newScent: FragranceScent = {
      id: `sc-${Date.now()}`,
      name: trimmed,
      category,
      addedDate: todayDate,
      description: description || `Handcrafted ${trimmed} blend fragrance formula`,
    };
    setScents((prev) => [...prev, newScent]);
    try {
      await setDoc(doc(db, 'scents', newScent.id), newScent);
    } catch (err) {
      console.error('Error saving scent to Firestore:', err);
    }
  };

  const deleteScent = async (id: string) => {
    setScents((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'scents', id));
    } catch (err) {
      console.error('Error deleting scent from Firestore:', err);
    }
  };

  const addProduction = async (prod: Omit<ProductionRecord, 'id'>) => {
    const newProd: ProductionRecord = {
      ...prod,
      id: `prod-${Date.now()}`,
    };
    setProductions((prev) => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'productions', newProd.id), newProd);
    } catch (err) {
      console.error('Error saving production batch to Firestore:', err);
    }
  };

  const deleteProduction = async (id: string) => {
    setProductions((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'productions', id));
    } catch (err) {
      console.error('Error deleting production batch from Firestore:', err);
    }
  };

  const getProductionByDate = (dateStr: string) => {
    const records = productions.filter((p) => p.date === dateStr);
    let totalKg = 0;
    let totalUnits = 0;
    const fragranceBreakdown: { [scent: string]: { kg: number; units: number } } = {};

    records.forEach((r) => {
      if (r.unit === 'kg') {
        totalKg += r.quantity;
      } else {
        totalUnits += r.quantity;
      }

      if (!fragranceBreakdown[r.scentName]) {
        fragranceBreakdown[r.scentName] = { kg: 0, units: 0 };
      }
      if (r.unit === 'kg') {
        fragranceBreakdown[r.scentName].kg += r.quantity;
      } else {
        fragranceBreakdown[r.scentName].units += r.quantity;
      }
    });

    return { records, totalKg, totalUnits, fragranceBreakdown };
  };

  const calculateWorkerMonthlyStats = (worker: Worker, targetDate?: string) => {
    const refDate = targetDate || todayDate;
    const parts = refDate.split('-');
    const year = parseInt(parts[0], 10) || 2026;
    const month = parseInt(parts[1], 10) || 10;
    const daysInMonth = new Date(year, month, 0).getDate();

    let activeDays = 0;
    let inactiveDays = 0;
    const dailyStatuses: { day: number; dateStr: string; status: 'Active' | 'Inactive' }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = getWorkerStatusForDate(worker.id, dateStr);
      dailyStatuses.push({ day: d, dateStr, status });
      if (status === 'Active') {
        activeDays++;
      } else {
        inactiveDays++;
      }
    }

    const perDayRate = worker.salary > 0 && daysInMonth > 0 ? worker.salary / daysInMonth : 0;
    const calculatedMonthlyCompensation = Math.round(activeDays * perDayRate);
    const deduction = Math.max(0, worker.salary - calculatedMonthlyCompensation);

    return {
      year,
      month,
      daysInMonth,
      activeDays,
      inactiveDays,
      perDayRate,
      calculatedMonthlyCompensation,
      deduction,
      dailyStatuses,
    };
  };

  // Stocks CRUD with Firestore persistence
  const addStock = async (stock: Omit<StockMaterial, 'id'>) => {
    const newStock: StockMaterial = {
      ...stock,
      id: `stk-${Date.now().toString().slice(-4)}`,
    };
    setStocks((prev) => [newStock, ...prev]);
    try {
      await setDoc(doc(db, 'stocks', newStock.id), newStock);
    } catch (err) {
      console.error('Error saving stock to Firestore:', err);
    }
  };

  const updateStock = async (id: string, updated: Partial<StockMaterial>) => {
    setStocks((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          setDoc(doc(db, 'stocks', id), merged).catch(console.error);
          return merged;
        }
        return s;
      })
    );
  };

  const deleteStock = async (id: string) => {
    setStocks((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'stocks', id));
    } catch (err) {
      console.error('Error deleting stock from Firestore:', err);
    }
  };

  const adjustStockQuantity = async (id: string, delta: number) => {
    setStocks((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentAdj = s.manualAdjustment || 0;
          const updated = {
            ...s,
            manualAdjustment: parseFloat((currentAdj + delta).toFixed(2)),
          };
          setDoc(doc(db, 'stocks', id), updated).catch(console.error);
          return updated;
        }
        return s;
      })
    );
  };

  const resetStocksToDefault = async () => {
    setStocks(INITIAL_STOCKS);
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(INITIAL_STOCKS));
    try {
      const batch = writeBatch(db);
      INITIAL_STOCKS.forEach((stk) => {
        batch.set(doc(db, 'stocks', stk.id), stk);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error resetting stocks in Firestore:', err);
    }
  };

  const getStockUsageStats = (stock: StockMaterial, targetDate?: string): StockUsageStats => {
    // 1 unit pack typically contains 20-25 sticks, roughly 0.02 kg
    const UNIT_TO_KG_EQUIVALENT = 0.02;
    const effDate = targetDate || todayDate;

    // Calculate production on specified date in total effective KG
    const dateProds = productions.filter((p) => p.date === effDate);
    const dateTotalEffectiveKg = dateProds.reduce((sum, p) => {
      const kgValue = p.unit === 'kg' ? p.quantity : p.quantity * UNIT_TO_KG_EQUIVALENT;
      return sum + kgValue;
    }, 0);

    const usedToday = parseFloat(
      (dateTotalEffectiveKg * stock.consumptionFactorPerKgProduction).toFixed(2)
    );

    // Calculate production from boughtDate to effDate
    const cumulativeProds = productions.filter(
      (p) => p.date >= stock.boughtDate && p.date <= effDate
    );
    const effectiveProds =
      cumulativeProds.length > 0
        ? cumulativeProds
        : productions.filter((p) => p.date >= stock.boughtDate);

    const cumulativeTotalEffectiveKg = effectiveProds.reduce((sum, p) => {
      const kgValue = p.unit === 'kg' ? p.quantity : p.quantity * UNIT_TO_KG_EQUIVALENT;
      return sum + kgValue;
    }, 0);

    const cumulativeUsed = parseFloat(
      (cumulativeTotalEffectiveKg * stock.consumptionFactorPerKgProduction).toFixed(2)
    );

    const effectiveBaseQuantity = Math.max(
      0,
      parseFloat((stock.boughtQuantity + (stock.manualAdjustment || 0)).toFixed(2))
    );
    const remainingStock = Math.max(0, parseFloat((effectiveBaseQuantity - cumulativeUsed).toFixed(2)));
    const percentageRemaining =
      effectiveBaseQuantity > 0
        ? Math.max(0, Math.min(100, Math.round((remainingStock / effectiveBaseQuantity) * 100)))
        : 0;

    return {
      usedToday,
      cumulativeUsed,
      remainingStock,
      percentageRemaining,
    };
  };

  // Bills CRUD with Firestore persistence
  const addBill = async (bill: Omit<BillRecord, 'id'>) => {
    const newBill: BillRecord = {
      ...bill,
      id: `b-${Date.now()}`,
    };
    setBills((prev) => [newBill, ...prev]);
    try {
      await setDoc(doc(db, 'bills', newBill.id), newBill);
    } catch (err) {
      console.error('Error saving bill to Firestore:', err);
    }
  };

  const deleteBill = async (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'bills', id));
    } catch (err) {
      console.error('Error deleting bill from Firestore:', err);
    }
  };

  // Purchases CRUD with Firestore persistence
  const addPurchase = async (p: Omit<PurchaseRecord, 'id'>) => {
    const newPur: PurchaseRecord = {
      ...p,
      id: `pur-${Date.now()}`,
    };
    setPurchases((prev) => [newPur, ...prev]);
    try {
      await setDoc(doc(db, 'purchases', newPur.id), newPur);
    } catch (err) {
      console.error('Error saving purchase to Firestore:', err);
    }
  };

  const deletePurchase = async (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'purchases', id));
    } catch (err) {
      console.error('Error deleting purchase from Firestore:', err);
    }
  };

  const calculatePurchaseByDate = (dateStr: string) => {
    const records = purchases.filter((p) => p.date === dateStr);
    const total = records.reduce((sum, p) => sum + p.totalCost, 0);
    return { total, records };
  };

  const calculatePurchaseDateRange = (startDate: string, endDate: string) => {
    const records = purchases.filter((p) => p.date >= startDate && p.date <= endDate);
    const total = records.reduce((sum, p) => sum + p.totalCost, 0);
    return { total, records };
  };

  // Sells CRUD with Firestore persistence
  const addSell = async (s: Omit<SellRecord, 'id'>) => {
    const newSell: SellRecord = {
      ...s,
      id: `sel-${Date.now()}`,
    };
    setSells((prev) => [newSell, ...prev]);
    try {
      await setDoc(doc(db, 'sells', newSell.id), newSell);
    } catch (err) {
      console.error('Error saving sell to Firestore:', err);
    }
  };

  const deleteSell = async (id: string) => {
    setSells((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'sells', id));
    } catch (err) {
      console.error('Error deleting sell from Firestore:', err);
    }
  };

  const calculateSellByDate = (dateStr: string) => {
    const records = sells.filter((s) => s.date === dateStr);
    const total = records.reduce((sum, s) => sum + s.moneyEarned, 0);
    return { total, records };
  };

  const calculateSellDateRange = (startDate: string, endDate: string) => {
    const records = sells.filter((s) => s.date >= startDate && s.date <= endDate);
    const total = records.reduce((sum, s) => sum + s.moneyEarned, 0);
    return { total, records };
  };

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        activeSection,
        setActiveSection,
        login,
        loginWithGoogle,
        adminEmail,
        logout,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        attendance,
        addOrUpdateAttendance,
        getAttendanceByDate,
        scents,
        addScent,
        deleteScent,
        productions,
        addProduction,
        deleteProduction,
        getProductionByDate,
        stocks,
        addStock,
        updateStock,
        deleteStock,
        adjustStockQuantity,
        resetStocksToDefault,
        getStockUsageStats,
        bills,
        addBill,
        deleteBill,
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
        setTodayDate,
        dailyWorkerStatuses,
        setWorkerDailyStatus,
        getWorkerStatusForDate,
        calculateWorkerMonthlyStats,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
