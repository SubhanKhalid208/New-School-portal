'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardCheck, LogOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import Cookies from 'js-cookie';

export default function Sidebar({ role, onCollapseChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userId, setUserId] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const id = Cookies.get('userId');
    if (id) setUserId(id);
  }, []);

  // Yeh part Layout ko batata hai ke sidebar band hai ya khula taake content adjust ho
  useEffect(() => {
    if (onCollapseChange) onCollapseChange(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20}/> },
      { name: 'User Management', path: '/admin/users', icon: <Users size={20}/> },
      // FIX: Yahan se Courses wala button remove kar diya gaya hai
    ],
    teacher: [
      { name: 'My Dashboard', path: '/teacher', icon: <LayoutDashboard size={20}/> },
      { name: 'Attendance', path: '/teacher/attendance', icon: <ClipboardCheck size={20}/> },
    ],
    student: [
      { 
        name: 'My Dashboard', 
        path: userId ? `/dashboard/student/${userId}` : '#', 
        icon: <LayoutDashboard size={20}/> 
      },
      { 
        name: 'Attendance Report', 
        path: userId ? `/dashboard/student/${userId}/attendance` : '#', 
        icon: <FileText size={20}/> 
      },
    ]
  };

  const currentMenu = menuItems[role] || [];

  const onLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('role');
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div 
      className={`h-screen bg-[#161d2f] border-r border-gray-800 flex flex-col p-4 fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-green-500 rounded-full p-1 text-black hover:scale-110 shadow-lg z-[60]"
      >
        {isCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
      </button>

      <div className={`mb-10 px-2 ${isCollapsed ? 'text-center' : ''}`}>
        <h1 className={`font-bold text-green-500 transition-all ${isCollapsed ? 'text-sm' : 'text-xl italic font-black'}`}>
          {isCollapsed ? 'LP' : 'Lahore Portal'}
        </h1>
        {!isCollapsed && <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{role} Panel</p>}
      </div>

      <nav className="flex-1 space-y-2">
        {currentMenu.map((item) => {
          const isActive = pathname === item.path;
          const isDisabled = item.path === '#';

          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'hover:bg-[#1f2937] text-gray-400'
              } ${isCollapsed ? 'justify-center' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              <div className={isActive ? 'text-white' : 'text-green-500/70'}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <button onClick={onLogout} className={`flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto w-full font-bold text-sm ${isCollapsed ? 'justify-center' : ''}`}>
        <LogOut size={20}/>
        {!isCollapsed && <span>Logout</span>}
      </button>
    </div>
  );
}