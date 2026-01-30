'use client'
import { useState } from 'react';
import Sidebar from '@/components/Sidebar'; 
import Cookies from 'js-cookie';

export default function TeacherLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const role = Cookies.get('role') || 'teacher';

  return (
    <div className="flex min-h-screen bg-[#0a0f1c]">
      {/* Sidebar yahan teacher role ke saath aayega */}
      <Sidebar 
        role={role} 
        onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} 
      />

      {/* Content area jo sidebar ke mutabiq jagah chorega */}
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