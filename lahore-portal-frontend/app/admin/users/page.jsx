'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getApiUrl, fetchWithRetry } from '@/app/utils/api';

export default function AdminUsers() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = getApiUrl('/auth/register');
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }, 1);

      if (res.ok) {
        toast.success(`✅ ${formData.name} ko kamyabi se add kar diya gaya!`);
        setFormData({ name: '', email: '', password: '', role: 'student' });
      } else {
        const error = await res.json();
        toast.error(error.error || "User add nahi ho saka.");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Server connection ka masla hai.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
      <p className="text-gray-400 mb-8">Lahore Portal mein naye Students ya Teachers add karein.</p>

      <div className="bg-[#161d2f] p-8 rounded-2xl border border-gray-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Assign Role</label>
              <select 
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20"
          >
            Create User Account
          </button>
        </form>
      </div>
    </div>
  );
}