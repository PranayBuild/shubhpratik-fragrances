import React from 'react';
import {
  Boxes,
  Flame,
  TrendingUp,
  ReceiptText,
  FileBarChart,
  Users,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { BrandLogo } from './BrandLogo';
import { NavigationSection } from '../types/inventory';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { activeSection, setActiveSection, logout } = useInventory();

  // Arranged sequence: worker, production, stock, purchase and sells, bills, reports
  const navPoints: {
    id: NavigationSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'workers',
      label: 'Worker',
      icon: Users,
    },
    {
      id: 'production',
      label: 'Production',
      icon: Flame,
    },
    {
      id: 'stocks',
      label: 'Stock',
      icon: Boxes,
    },
    {
      id: 'purchase_sells',
      label: 'Purchase and Sells',
      icon: TrendingUp,
    },
    {
      id: 'bills',
      label: 'Bills',
      icon: ReceiptText,
    },
    {
      id: 'report',
      label: 'Reports',
      icon: FileBarChart,
    },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#0E061E] border-r border-[#D8B4FE]/15
        flex flex-col shadow-[8px_0_35px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:h-screen lg:shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Top Header & Brand Identity */}
      <div className="p-5 border-b border-[#D8B4FE]/15 bg-[#120826]/90 backdrop-blur-md flex items-center justify-between">
        <BrandLogo size="md" />

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#D8B4FE]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Vertical Navigation Points */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navPoints.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-3 relative ${
                isActive
                  ? 'bg-white text-[#140628] font-bold shadow-[0_4px_20px_rgba(255,255,255,0.25)] ring-1 ring-white/50'
                  : 'text-[#E9D5FF]/85 hover:text-white hover:bg-[#1E0C3F]/80 border border-transparent hover:border-[#D8B4FE]/15'
              }`}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#8B5CF6] rounded-r-full" />
              )}

              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'bg-[#180830] text-white shadow-inner'
                    : 'bg-[#180A30] text-[#D8B4FE] group-hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm tracking-wide leading-tight ${
                    isActive ? 'font-extrabold text-[#140628]' : 'font-semibold text-white'
                  }`}
                >
                  {item.label}
                </div>
              </div>

              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive
                    ? 'text-[#140628] translate-x-0.5'
                    : 'text-[#D8B4FE]/30 group-hover:text-[#D8B4FE]/80 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer in Left Panel */}
      <div className="p-3 border-t border-[#D8B4FE]/15 bg-[#100724] flex items-center justify-between">
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-red-950/40 text-red-300/80 hover:text-red-300 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Log Out</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-red-400/50" />
        </button>
      </div>
    </aside>
  );
};
