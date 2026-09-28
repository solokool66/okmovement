"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileSpreadsheet, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path || (path !== "/admin" && pathname.startsWith(path))
      ? "flex items-center gap-3 px-3 py-2.5 bg-green-600/20 text-green-400 rounded-lg transition-colors"
      : "flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider text-green-400">OK MOVEMENT</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
        </div>
        
        <div className="px-4 py-2 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              SA
            </div>
            <div>
              <p className="text-sm font-medium">Super Admin</p>
              <p className="text-xs text-slate-400">National Scope</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className={getLinkClass("/admin")}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/admin/agents" className={getLinkClass("/admin/agents")}>
            <Users className="h-5 w-5" />
            <span className="font-medium text-sm">Agents & Users</span>
          </Link>
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anti-Rigging</p>
          </div>
          <Link href="/admin/incidents" className={getLinkClass("/admin/incidents")}>
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="font-medium text-sm text-red-100">Incident Command</span>
          </Link>
          <Link href="/admin/collation" className={getLinkClass("/admin/collation")}>
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="font-medium text-sm text-indigo-100">Live Collation (PVT)</span>
          </Link>
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Management</p>
          </div>
          <Link href="/admin/broadcast" className={getLinkClass("/admin/broadcast")}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            <span className="font-medium text-sm">Broadcast System</span>
          </Link>
          <Link href="/admin/ward-links" className={getLinkClass("/admin/ward-links")}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <span className="font-medium text-sm">Ward Group Links</span>
          </Link>
          <a href="/api/export" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <FileSpreadsheet className="h-5 w-5" />
            <span className="font-medium text-sm">Data Exports</span>
          </a>
          <Link href="/admin/settings" className={getLinkClass("/admin/settings")}>
            <Settings className="h-5 w-5" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.href = "/admin/login";
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
