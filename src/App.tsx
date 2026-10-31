/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { WorkersSection } from './components/WorkersSection';
import { ProductionSection } from './components/ProductionSection';
import { StocksSection } from './components/StocksSection';
import { BillsSection } from './components/BillsSection';
import { PurchaseSellsSection } from './components/PurchaseSellsSection';
import { ReportSection } from './components/ReportSection';
import {
  Menu,
  Calendar,
  ShieldCheck,
  UserCheck,
  Boxes,
  Flame,
  TrendingUp,
  ReceiptText,
  FileBarChart,
  Users,
  Printer,
} from 'lucide-react';

const sectionMeta: Record<
  string,
  { title: string; icon: React.ComponentType<{ className?: string }> }
> = {
  workers: {
    title: 'Worker',
    icon: Users,
  },
  production: {
    title: 'Production',
    icon: Flame,
  },
  stocks: {
    title: 'Stock',
    icon: Boxes,
  },
  purchase_sells: {
    title: 'Purchase and Sells',
    icon: TrendingUp,
  },
  bills: {
    title: 'Bills',
    icon: ReceiptText,
  },
  report: {
    title: 'Reports',
    icon: FileBarChart,
  },
};

const MainDashboard: React.FC = () => {
  const { currentUser, activeSection, todayDate } = useInventory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  const currentMeta = sectionMeta[activeSection] || sectionMeta.workers;
  const SectionIcon = currentMeta.icon;
  const isAdmin = currentUser.role === 'admin';

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'workers':
        return <WorkersSection />;
      case 'production':
        return <ProductionSection />;
      case 'stocks':
        return <StocksSection />;
      case 'purchase_sells':
        return <PurchaseSellsSection />;
      case 'bills':
        return <BillsSection />;
      case 'report':
        return <ReportSection />;
      default:
        return <WorkersSection />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#080411] text-[#FDFBF7] flex selection:bg-[#C084FC]/30 selection:text-[#FFFDF5]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* LEFT PART: Navigation Panel with all points stacked below each other */}
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* RIGHT PART: Main Workspace showing selected feature */}
      <div className="relative flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden bg-[#0A0415]">
        {/* Subtle Ambient Glowing Orbs behind the Glass Blocks for deep frosted glass refraction */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
          <div className="absolute top-[-5%] right-[5%] w-[550px] h-[550px] rounded-full bg-purple-700/15 blur-[120px]" />
          <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[30%] w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[140px]" />
          <div className="absolute top-[70%] left-[5%] w-[400px] h-[400px] rounded-full bg-fuchsia-800/10 blur-[110px]" />
        </div>

        {/* Top Header Bar for Right Workspace with transparent frosted glass */}
        <header className="sticky top-0 z-30 bg-[#0E061E]/65 backdrop-blur-xl border-b border-[#D8B4FE]/18 px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-4 relative z-10">
            {/* Left: Mobile hamburger & Active Section Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#1B0B38]/60 backdrop-blur-md border border-[#D8B4FE]/25 text-[#E9D5FF] hover:text-[#FFFDF5] cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-[#1B0B38]/60 backdrop-blur-md border border-[#D8B4FE]/20 items-center justify-center text-white shrink-0 shadow-sm">
                  <SectionIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold font-cinzel text-white truncate">
                    {currentMeta.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right: Quick Operational Indicators */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Date Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#180A30]/60 backdrop-blur-md border border-[#D8B4FE]/20 text-xs font-mono-numbers text-white shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] text-[#D8B4FE]/70 font-sans">Date:</span>
                <span className="font-semibold text-white text-[11px]">{todayDate}</span>
              </div>

              {/* Role Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border shadow-sm ${
                  isAdmin
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-purple-950/30 border-purple-400/30 text-purple-200'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-purple-300" />
                )}
                <span className="hidden sm:inline font-semibold">
                  {isAdmin ? 'Administrator' : 'Floor Staff'}
                </span>
              </div>

              {/* Print / Export Shortcut */}
              <button
                onClick={handlePrint}
                title="Print / Save PDF"
                className="no-print p-2 rounded-lg bg-[#180A30]/60 backdrop-blur-md border border-[#D8B4FE]/20 text-[#D8B4FE]/80 hover:text-white hover:bg-[#25104A]/80 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Selected Feature Content Container */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainDashboard />
    </InventoryProvider>
  );
}
