'use client'
import { handleLogin } from '../actions/auth';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie'; 

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ FIXED: Using Environment Variable instead of hardcoded localhost
  const handleGoogleLogin = () => {
    const backendURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // Server action ko call kar rahe hain
      const result = await handleLogin(formData);
      
      // Debugging ke liye: Browser console mein check karein
      console.log("🔐 Login Result:", result);

      if (result?.error) {
        toast.error(result.error || "Login fail ho gaya!");
        setLoading(false);
      } else if (result) {
        toast.success("✅ Login Successful! Redirect ho rahe hain...");

        // --- FIXED & FORCED SAVING ---
        // 1. Token check aur saving
        const tokenToSave = result.token;
        if (tokenToSave) {
          // Cookie mein save karein (poori domain ke liye)
          Cookies.set('token', tokenToSave, { expires: 1, path: '/' });
          // LocalStorage mein backup save karein
          localStorage.setItem('token', tokenToSave);
          console.log("✅ Token saved successfully!");
        } else {
          console.warn("⚠️ Warning: No token received from backend!");
        }
        
        // 2. Role aur UserID saving
        Cookies.set('role', result.role || 'student', { expires: 1, path: '/' });
        if (result.userId) {
          Cookies.set('userId', result.userId, { expires: 1, path: '/' });
        }

        // --- REDIRECT LOGIC ---
        // Thora delay taake cookies set ho jayein
        setTimeout(() => {
          if (result.role === 'student') {
            router.push(result.userId ? `/dashboard/student/${result.userId}` : '/dashboard/student');
          } else if (result.role === 'teacher') {
            router.push('/teacher');
          } else if (result.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 500);

      }
    } catch (err) {
      console.error("❌ Critical Login Error:", err);
      toast.error("Server se rabta nahi ho saka! Browser console check karein.");
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="bg-[#161d2f] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Lahore Portal</h2>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none"
              placeholder="subhan@example.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Logging in...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-700 w-full"></div>
            <span className="bg-[#161d2f] px-3 text-gray-500 text-sm absolute">OR</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ابھی account nahi hai?{' '}
            <Link href="/register" className="text-green-500 hover:text-green-400 font-bold">
              Register karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}