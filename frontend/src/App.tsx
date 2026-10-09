import React, { useState, useEffect } from 'react';
import { NavView } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { InspectPackaging } from './pages/InspectPackaging';
import { PackageInventory } from './pages/PackageInventory';
import { ReusePassport } from './pages/ReusePassport';
import { EcoFirstRecovery } from './pages/EcoFirstRecovery';
import { RecyclingGuide } from './pages/RecyclingGuide';
import { EnvironmentalImpact } from './pages/EnvironmentalImpact';
import { InspectionHistory } from './pages/InspectionHistory';
import { Settings } from './pages/Settings';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [targetPackageId, setTargetPackageId] = useState<string>('');
  const [inventoryInitialFilter, setInventoryInitialFilter] = useState<string>('All Packages');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Parse URL query on initial load to support direct QR code links (e.g. ?view=passport&id=PKG-...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as NavView;
    const idParam = params.get('id');

    if (viewParam) {
      setCurrentView(viewParam);
    }
    if (idParam) {
      setTargetPackageId(idParam);
    }
  }, []);

  const handleNavigate = (view: NavView, param?: string) => {
    setCurrentView(view);
    if (param) {
      if (view === 'inventory') {
        setInventoryInitialFilter(param);
      } else {
        setTargetPackageId(param);
      }
    }
    // Update browser URL query without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    if (param && view !== 'inventory') {
      url.searchParams.set('id', param);
    } else {
      url.searchParams.delete('id');
    }
    window.history.pushState({}, '', url.toString());

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview onNavigate={handleNavigate} />;
      case 'inspect':
        return (
          <InspectPackaging
            onNavigate={handleNavigate}
            onInspectionSaved={(pkgId) => setTargetPackageId(pkgId)}
          />
        );
      case 'inventory':
        return (
          <PackageInventory
            initialFilter={inventoryInitialFilter}
            onNavigate={handleNavigate}
          />
        );
      case 'passport':
        return (
          <ReusePassport
            initialPackageId={targetPackageId}
            onNavigate={handleNavigate}
          />
        );
      case 'recovery':
        return (
          <EcoFirstRecovery
            initialPackageId={targetPackageId}
            onNavigate={handleNavigate}
          />
        );
      case 'recycling-guide':
        return <RecyclingGuide />;
      case 'impact':
        return <EnvironmentalImpact />;
      case 'history':
        return <InspectionHistory onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white py-4 px-6 text-center text-xs text-[#64748B]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#14532D]">EcoTrack AI</span>
              <span>— Smart Reusable Packaging Life Predictor</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Eco-First Plastic Recovery Advisor</span>
              <span>•</span>
              <span>Computer-Vision Heuristics & Audit Traceability</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
