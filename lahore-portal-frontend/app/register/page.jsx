'use client'
import { handleSignup } from '../actions/auth';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const dob = formData.get('dob');
    
    try {
      const result = await handleSignup(formData);
      
      console.log("Registration Result:", result);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else if (result?.success) {
        toast.success(result.message || "Registration successful! Email check karein.");
        console.log(`✅ ${email} successfully registered as student`);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error("Critical Registration Error:", err);
      toast.error("Server se rabta nahi ho saka! Phir se try karein.");
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="bg-[#161d2f] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Student Registration</h2>
        <p className="text-gray-400 text-center mb-6">Lahore Education Portal par register ho jayein</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none transition"
              placeholder="Ahmed Ali"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none transition"
              placeholder="ahmed@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Date of Birth</label>
            <input 
              name="dob" 
              type="date" 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none transition"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Pehle se account hai?{' '}
            <Link href="/login" className="text-green-500 hover:text-green-400 font-bold">
              Login karein
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="text-gray-500 text-sm text-center">
            <p>ℹ️ Registration ke baad aapko email pe password set karne ke liye link milega</p>
          </div>
        </div>
      </div>
    </div>
  );
}
