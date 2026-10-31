export type UserRole = 'admin' | 'employee';

export interface UserSession {
  role: UserRole;
  name: string;
  email?: string;
  picture?: string;
  authProvider?: 'google' | 'password';
  department: string;
  loginTime: string;
}

export type Gender = 'Male' | 'Female' | 'Other';
export type WorkerStatus = 'Active' | 'Inactive';
export type AttendanceStatus = 'Present' | 'On Leave' | 'Half Day' | 'Absent';

export interface Worker {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  role: string; // e.g. "Rolling Machine Operator", "Fragrance Blender", "Packaging Specialist", "Inventory Supervisor"
  status: WorkerStatus;
  salary: number; // Confidential: Only Admin can view/edit
  joinedDate: string; // YYYY-MM-DD
  contact?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  reportingTime: string; // e.g. "08:30 AM"
  leavingReportingTime: string; // e.g. "05:30 PM"
  notes?: string;
}

export type ProductionUnit = 'kg' | 'units'; // units = individual incense sticks / retail packs

export interface FragranceScent {
  id: string;
  name: string;
  category: 'Flora' | 'Woody' | 'Traditional' | 'Fruity' | 'Spiritual';
  addedDate: string;
  description?: string;
}

export interface ProductionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  scentName: string;
  quantity: number;
  unit: ProductionUnit;
  operatorName?: string;
  batchNumber: string;
  notes?: string;
}

export type StockUnit = 'kg' | 'units' | 'litres' | 'bags' | 'boxes' | 'rolls' | 'grams' | string;

export interface StockMaterial {
  id: string;
  materialName: string;
  boughtDate: string; // YYYY-MM-DD
  boughtQuantity: number;
  unit: StockUnit;
  supplier: string;
  costPerUnit: number;
  minimumThreshold: number;
  consumptionFactorPerKgProduction: number; // How much of this material is used per 1 kg of agarbatti
  notes?: string;
  manualAdjustment?: number;
}

export type BillCategory =
  | 'Investment on Raw Material'
  | 'Employee Salary'
  | 'Electricity Bill'
  | 'Packaging Bills'
  | 'Machine Maintenance'
  | 'Factory Rent'
  | 'Logistics & Transport'
  | 'Other Custom Expense';

export interface BillRecord {
  id: string;
  expenseName: string;
  category: BillCategory;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentStatus: 'Paid' | 'Pending';
  invoiceNumber?: string;
  notes?: string;
  isSalaryConfidential?: boolean; // True for salary bills, hidden from employee
}

export interface PurchaseRecord {
  id: string;
  companyName: string; // Supplier company
  materialName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  date: string; // YYYY-MM-DD
  invoiceNumber?: string;
  notes?: string;
}

export interface SellRecord {
  id: string;
  companyName: string; // Buyer company / Distributor
  productName: string; // Fragrance name / stick batch
  quantity: number;
  unit: string;
  moneyEarned: number;
  date: string; // YYYY-MM-DD
  invoiceNumber?: string;
  notes?: string;
}

export type NavigationSection =
  | 'workers'
  | 'production'
  | 'stocks'
  | 'bills'
  | 'purchase_sells'
  | 'report';
