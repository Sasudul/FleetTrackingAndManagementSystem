import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './SideBar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/vehicles': 'Fleet Management',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Management',
};

const Layout: React.FC = () => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'FleetSys';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between bg-white px-6 border-b border-slate-200 z-10">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{pageTitle}</h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;