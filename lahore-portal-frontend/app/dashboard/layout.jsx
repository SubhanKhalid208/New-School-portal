'use client'
import { useState } from 'react';
import Sidebar from '@/components/Sidebar'; 
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const role = Cookies.get('role') || 'student';

  return (
    <div className="flex min-h-screen bg-[#0a0f1c]">
      {/* Sidebar handles toggle state */}
      <Sidebar 
        role={role} 
        onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} 
      />

      {/* Main Content Area: Yeh margin khud adjust karega */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}