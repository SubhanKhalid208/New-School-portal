'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const role = Cookies.get('role');

    if (userId && role === 'student') {
      router.push(`/dashboard/student/${userId}`);
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center text-green-500 italic">
      Redirecting to Lahore Portal...
    </div>
  );
}