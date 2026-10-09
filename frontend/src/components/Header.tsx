import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { NavView } from '../types';

interface HeaderProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const viewTitles: Record<NavView, { title: string; breadcrumb: string }> = {
    overview: { title: 'Executive Overview', breadcrumb: 'Dashboard / Overview' },
    inspect: { title: 'Inspect Packaging', breadcrumb: 'Packaging / Inspection' },
    inventory: { title: 'Package Inventory', breadcrumb: 'Management / Inventory' },
    passport: { title: 'Smart Reuse Passport', breadcrumb: 'Traceability / Passport' },
    recovery: { title: 'Eco-First Recovery Advisor', breadcrumb: 'Circularity / Advisor' },
    'recycling-guide': { title: 'Polymer Recycling Guide', breadcrumb: 'Resources / Recycling' },
    impact: { title: 'Environmental Impact', breadcrumb: 'Analytics / Impact' },
    history: { title: 'Inspection History', breadcrumb: 'Audit Logs / History' },
    settings: { title: 'System & Engine Settings', breadcrumb: 'Administration / Settings' },
  };

  const currentMeta = viewTitles[currentView] || { title: 'Dashboard', breadcrumb: 'EcoTrack AI' };

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const sampleNotifications = [
    {
      id: 1,
      type: 'recovery',
      title: 'Packaging Recovery Completed',
      desc: 'Package PKG-PP-3088 diverted to verified PP flake mechanical recycling.',
      time: '18m ago',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Specialist Review Flagged',
      desc: 'Bulk Film Liner PKG-LDP-5120 has heavy puncture tears. Awaiting recovery sign-off.',
      time: '1h ago',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 3,
      type: 'info',
      title: 'Demonstration Mode Active',
      desc: 'Default demonstration benchmark figures displayed. Clear sample data anytime in Settings.',
      time: 'System',
      icon: Info,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-4">
        {/* Left: Mobile trigger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-[#14532D] hover:bg-emerald-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span>EcoTrack AI</span>
              <span>/</span>
              <span className="text-slate-500 font-medium">{currentMeta.breadcrumb}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#17251D]">
              {currentMeta.title}
            </h2>
          </div>
        </div>

        {/* Center / Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Package ID, resin, or serial..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#17251D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Date, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs font-medium text-[#166534]">
            <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{today}</span>
          </div>

          {/* New Inspection Action Button */}
          <button
            onClick={() => onNavigate('inspect')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-subtle transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Inspection</span>
            <span className="sm:hidden">Inspect</span>
          </button>

          {/* Notification dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#14532D] hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10B981] rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#17251D]">Activity Notifications</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      3 new
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {sampleNotifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-semibold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{notif.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('history');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-[#166534] hover:text-[#14532D]"
                  >
                    View Full Audit History →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User profile avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-[#14532D] text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-100">
              P
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-800">Inspector Pravas</div>
              <div className="text-[10px] text-slate-500">Packaging Quality Ops</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
