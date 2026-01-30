'use client'
import { handleLogin } from '../actions/auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Redirect ke liye zaroori hai

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData) {
    setLoading(true);
    try {
      const result = await handleLogin(formData);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success("Login Successful!");
        
        // ROLE BASED REDIRECTION:
        // Yahan hum check kar rahe hain ke user ka role kya hai
        if (result.role === 'student') {
          router.push('/dashboard/student'); // Student ko 2nd screen par bhejna
        } else if (result.role === 'teacher') {
          router.push('/teacher');
        } else if (result.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard'); // Default rasta
        }
      }
    } catch (err) {
      toast.error("Kuch masla hua hai!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="bg-[#161d2f] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Lahore Portal</h2>
        
        <form action={handleSubmit} className="space-y-5">
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Logging in...' : 'Login Now'}
          </button>
        </form>
      </div>
    </div>
  );
}