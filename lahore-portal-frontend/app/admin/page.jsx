'use client'
import { useEffect, useState, useCallback } from 'react';
import { Users, BookOpen, GraduationCap, Trash2, Edit, Search, X, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: 'student', 
    password: '',
    profile_pic: '' 
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleImageUpload = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("file", file); 

    try {
      setUploading(true);
      toast.loading("Processing image on Lahore server...");
      
      const res = await fetch(`${API_BASE}/admin/upload-image`, {
        method: "POST",
        body: data
      });
      
      const result = await res.json();
      toast.dismiss();

      if (result.url) {
        setFormData(prev => ({ ...prev, profile_pic: result.url }));
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchUsers = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/users?search=${query}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Lahore Portal sync error!");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      setStats({
        students: data.students || 0,
        teachers: data.teachers || 0,
        courses: data.subjects || 0
      });
    } catch (err) { console.error("Stats error"); }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchUsers(value); 
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (confirm("Delete this user?")) {
      try {
        const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success("User deleted!");
          fetchUsers(searchTerm); 
        }
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `${API_BASE}/admin/users/${editingUserId}` : `${API_BASE}/admin/users`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingUserId ? "Updated!" : "Success!");
        closeModal();
        fetchUsers(searchTerm);
        fetchStats();
      }
    } catch (err) { toast.error("Error saving user"); }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({ 
        name: user.name || '', 
        email: user.email || '', 
        role: user.role || 'student', 
        password: '',
        profile_pic: user.profile_pic || ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: 'student', password: '', profile_pic: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0f1c] text-white">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic text-green-500 tracking-tighter uppercase">Admin Control Panel</h1>
          <p className="text-gray-500 text-sm">Lahore Education Portal | Master Overview</p>
        </div>
        <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Users size={18}/> Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<GraduationCap/>} label="Total Students" value={stats.students} color="blue" />
        <StatCard icon={<Users/>} label="Total Teachers" value={stats.teachers} color="green" />
        <StatCard icon={<BookOpen/>} label="Active Subjects" value={stats.courses} color="purple" />
      </div>

      <div className="bg-[#161d2f] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
          <h2 className="font-bold text-lg italic text-gray-300">Registered Portal Users</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search user by name or email..." 
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-1.5 pl-9 pr-4 text-sm outline-none focus:border-green-500"
              onChange={handleSearch} 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Searching Lahore DB...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">User Details</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} className="w-10 h-10 rounded-full object-cover border border-gray-700" alt="profile" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[8px] text-gray-500">No Image</div>
                      )}
                      <div>
                        <div className="font-bold text-gray-200">{user.name}</div>
                        <div className="text-xs text-gray-400 italic">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(user)} className="text-gray-400 hover:text-green-500 transition-colors"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161d2f] border border-gray-800 w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
            <button onClick={closeModal} className="absolute right-4 top-4 text-gray-500 hover:text-white"><X size={22}/></button>
            <h2 className="text-2xl font-black mb-6 italic text-green-500 uppercase">{editingUserId ? "Edit User" : "Create User"}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Profile Image Section */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-4 bg-gray-900/30">
                {formData.profile_pic ? (
                  <div className="relative">
                    <img src={formData.profile_pic} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-green-500" alt="Preview" />
                    <CheckCircle className="absolute bottom-2 right-0 text-green-500 bg-black rounded-full" size={16} />
                  </div>
                ) : (
                  <Upload className="text-gray-600 mb-2" size={30} />
                )}
                <label className="cursor-pointer text-[10px] font-black uppercase text-green-500 hover:underline">
                  {uploading ? "Uploading..." : "Click to select picture"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                </label>
              </div>

              <InputField label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
              <InputField label="Email Address" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
              
              {!editingUserId && (
                <InputField label="Password" type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} />
              )}

              <select 
                value={formData.role} 
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-green-500 text-sm"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              <button type="submit" disabled={uploading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all">
                {editingUserId ? "Update Account" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subhan, niche wale components wese hi kaam karenge
function StatCard({icon, label, value, color}) {
  const colors = { blue: "bg-blue-500/10 text-blue-500", green: "bg-green-500/10 text-green-500", purple: "bg-purple-500/10 text-purple-500" };
  return (
    <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 flex items-center gap-5">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</p><h2 className="text-4xl font-black">{value}</h2></div>
    </div>
  );
}

function InputField({label, type="text", value, onChange}) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
      <input 
        required 
        type={type} 
        value={value || ''} 
        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-green-500 text-sm" 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}