'use client'
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-[#0a0f1c]">
      <Sidebar role="admin" onCollapseChange={setIsCollapsed} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}