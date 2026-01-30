'use client'
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';

export default function SidebarWrapper() {
  const pathname = usePathname();
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = Cookies.get('role');
    if (userRole) setRole(userRole);
  }, [pathname]);

  if (pathname === '/login' || !role) return null;

  return <Sidebar role={role} />;
}