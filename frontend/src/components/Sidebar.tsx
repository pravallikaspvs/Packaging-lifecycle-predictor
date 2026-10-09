import React from 'react';
import {
  LayoutDashboard,
  ScanSearch,
  Boxes,
  QrCode,
  Recycle,
  BookOpen,
  Leaf,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import { NavView } from '../types';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: Array<{ id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inspect', label: 'Inspect Packaging', icon: ScanSearch },
    { id: 'inventory', label: 'Package Inventory', icon: Boxes },
    { id: 'passport', label: 'Reuse Passport', icon: QrCode },
    { id: 'recovery', label: 'Eco-First Recovery', icon: Recycle },
    { id: 'recycling-guide', label: 'Recycling Guide', icon: BookOpen },
    { id: 'impact', label: 'Environmental Impact', icon: Leaf },
    { id: 'history', label: 'Inspection History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: NavView) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#14532D] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#166534] shadow-xl ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-68'}`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-[#166534]/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0 shadow-sm text-white">
                <Leaf className="w-5 h-5 fill-white/20" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate text-left">
                  <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight">
                    EcoTrack AI
                  </h1>
                  <p className="text-[11px] font-medium text-emerald-200/80 truncate">
                    Smart Reusable Packaging
                  </p>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-forest-700 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors group relative ${
                    isActive
                      ? 'bg-[#D1FAE5] text-[#14532D] font-bold shadow-xs'
                      : 'text-emerald-100/90 hover:bg-[#166534] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#14532D]' : 'text-emerald-300'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate text-left">{item.label}</span>
                  )}
                  {isActive && (!isCollapsed || isMobileOpen) && (
                    <span className="ml-auto w-1.5 h-4 bg-[#10B981] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Collapse Toggle */}
        <div className="p-4 border-t border-[#166534]/60 bg-[#0f3d21]/50">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="mb-3 px-2 py-2 rounded-lg bg-[#166534]/50 border border-emerald-600/30 text-left">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                  Assessment Mode
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 leading-tight">
                Computer-vision heuristics + demo verification active.
              </p>
            </div>
          ) : null}

          {/* Collapse desktop toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#166534] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <div className="flex items-center gap-2 text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
