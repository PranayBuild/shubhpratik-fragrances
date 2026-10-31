import React, { useState } from 'react';
import {
  Users,
  Flame,
  Boxes,
  ReceiptText,
  TrendingUp,
  FileBarChart,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { BrandLogo } from './BrandLogo';
import { NavigationSection } from '../types/inventory';

export const Navbar: React.FC = () => {
  const { currentUser, activeSection, setActiveSection, logout, login } = useInventory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems: { id: NavigationSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'production', label: 'Production', icon: Flame },
    { id: 'stocks', label: 'Stocks', icon: Boxes },
    { id: 'bills', label: "Bill's", icon: ReceiptText },
    { id: 'purchase_sells', label: 'Purchase & Sells', icon: TrendingUp },
    { id: 'report', label: 'Report', icon: FileBarChart },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const toggleRole = () => {
    if (currentUser?.role === 'admin') {
      login('employee', 'Pratik K. (Floor Operations Manager)');
    } else {
      login('admin', 'Shubham Patil (Administrator)');
    }
    setRoleMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E061B]/95 backdrop-blur-md border-b border-[#D8B4FE]/20 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Zone: Brand Logo */}
          <div className="flex items-center">
            <BrandLogo size="md" />
          </div>

          {/* Right Zone: Horizontal Menu List (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <nav className="flex items-center gap-1 bg-[#170A2D]/80 p-1 rounded-xl border border-[#D8B4FE]/20">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FFFDF5] to-[#FDF6E3] text-[#19092F] font-bold shadow-[0_2px_12px_rgba(253,246,227,0.3)]'
                        : 'text-[#E9D5FF]/80 hover:text-[#FFFDF5] hover:bg-[#251245]/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${isActive ? 'text-[#19092F]' : 'text-[#D8B4FE]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Role Badge & Switcher Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  currentUser?.role === 'admin'
                    ? 'bg-[#220F3E] border-[#D8B4FE]/40 text-[#FFFDF5]'
                    : 'bg-[#180A2E] border-purple-900/50 text-[#E9D5FF]'
                }`}
              >
                {currentUser?.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FDF6E3]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#D8B4FE]" />
                )}
                <div className="flex flex-col text-left">
                  <span className="leading-tight font-semibold">
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Floor Manager'}
                  </span>
                  <span className="text-[10px] text-[#D8B4FE]/70 leading-none">
                    {currentUser?.role === 'admin' ? 'All Data Visible' : 'Restricted Mode'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#D8B4FE]/70 ml-0.5" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1A0B33] border border-[#D8B4FE]/30 rounded-xl p-2.5 shadow-2xl z-50">
                  <div className="px-2 py-1.5 border-b border-purple-900/50 mb-1.5">
                    <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                    {currentUser?.email && (
                      <p className="text-[10px] text-amber-200/90 truncate font-mono">{currentUser.email}</p>
                    )}
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#D8B4FE]">
                      {currentUser?.authProvider === 'google' ? 'Google Account' : 'Password/PIN'}
                    </span>
                  </div>
                  <div className="px-2 py-1 text-[11px] text-[#D8B4FE]/70 font-medium">Switch View Context:</div>
                  <button
                    onClick={toggleRole}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[#2A134F] flex items-center justify-between text-[#FFFDF5] cursor-pointer"
                  >
                    <span>Switch to {currentUser?.role === 'admin' ? 'Floor Manager' : 'Administrator'}</span>
                  </button>
                  <div className="h-px bg-purple-900/50 my-1.5" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-red-950/40 text-red-300 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <span
              className={`text-[11px] px-2 py-1 rounded font-medium border ${
                currentUser?.role === 'admin'
                  ? 'border-[#D8B4FE]/40 text-[#FFFDF5] bg-[#220F3E]'
                  : 'border-purple-800 text-[#E9D5FF] bg-[#180A2E]'
              }`}
            >
              {currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#1A0B33] border border-purple-800/60 text-[#E9D5FF] hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-900/50 bg-[#120722] px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-[#FDF6E3] text-[#19092F] font-bold'
                      : 'bg-[#1A0B33]/90 text-[#E9D5FF] border border-purple-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-purple-900/50 flex items-center justify-between">
            <button
              onClick={toggleRole}
              className="text-xs text-[#FDF6E3] hover:underline flex items-center gap-1.5"
            >
              Switch Role ({currentUser?.role === 'admin' ? 'Admin' : 'Staff'})
            </button>
            <button
              onClick={logout}
              className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
