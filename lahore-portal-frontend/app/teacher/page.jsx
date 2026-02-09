'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';import { getApiUrl, fetchWithRetry } from '@/app/utils/api';
export default function TeacherDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalSubjects: 0, teacherName: '' });
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const teacherId = Cookies.get('userId');
  const backupName = Cookies.get('userName') || 'Teacher';

  const fetchDashboardData = async () => {
    try {
      const courseUrl = getApiUrl(`/teacher/my-courses?teacherId=${teacherId}`);
      const statsUrl = getApiUrl(`/teacher/stats?teacherId=${teacherId}`);
      
      const [courseRes, statsRes] = await Promise.all([
        fetchWithRetry(courseUrl, { method: 'GET' }, 1),
        fetchWithRetry(statsUrl, { method: 'GET' }, 1)
      ]);

      const courses = await courseRes.json();
      const statistics = await statsRes.json();
      
      setMyCourses(Array.isArray(courses) ? courses : []);
      
      setStats({
        totalStudents: statistics.totalStudents || 0,
        totalSubjects: statistics.totalSubjects || 0,
        teacherName: statistics.teacherName || '' 
      }); 
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { 
    if(teacherId) {
      fetchDashboardData(); 
    }
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingCourse ? 'PUT' : 'POST';
    const endpoint = editingCourse 
      ? `/teacher/courses/${editingCourse.id}` 
      : `/teacher/courses/add`;

    try {
      const url = getApiUrl(endpoint);
      const res = await fetchWithRetry(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, teacher_id: teacherId })
      }, 1);

      if (res.ok) {
        toast.success(editingCourse ? "✅ Subject update ho gaya!" : "✅ Naya subject ban gaya!");
        setShowModal(false);
        setEditingCourse(null);
        setFormData({ title: '', description: '' });
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Process fail ho gaya.");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Server connection error.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap waqai delete karna chahte hain?")) return;
    try {
      const url = getApiUrl(`/teacher/courses/${id}`);
      const res = await fetchWithRetry(url, {
        method: 'DELETE'
      }, 1);
      
      if (res.ok) {
        toast.success("✅ Subject delete ho gaya.");
        fetchDashboardData();
      } else {
        toast.error("❌ Delete fail.");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Delete command fail ho gayi.");
    }
  };

  if (loading) return <div className="p-10 text-blue-500 text-center animate-pulse">Loading Lahore Portal Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-sm">Teacher Name</p>
          <h3 className="font-bold text-lg text-blue-400">
            {/* Database Name > Cookie Name */}
            {stats.teacherName || backupName}
          </h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-sm">Total Subjects</p>
          <h3 className="font-bold text-2xl text-purple-400">{stats.totalSubjects}</h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-sm">Total Students</p>
          <h3 className="font-bold text-2xl text-green-400">{stats.totalStudents}</h3>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setFormData({title:'', description:''}); setShowModal(true); }}
          className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 border-dashed border-orange-500/50 flex items-center justify-center text-orange-400 font-bold hover:bg-orange-500/10"
        >
          + New Subject
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[#161d2f] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold">My Managed Subjects</h2></div>
        <table className="w-full text-left">
          <thead className="bg-[#1f2937] text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-5">Subject Name</th>
              <th className="p-5">Description</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myCourses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-800/20 transition-all">
                <td className="p-5 font-bold text-blue-300">{course.name || course.title}</td>
                <td className="p-5 text-gray-400 text-sm">{course.description || "N/A"}</td>
                <td className="p-5 text-right">
                   <button 
                    onClick={() => { setEditingCourse(course); setFormData({title: course.name || course.title, description: course.description}); setShowModal(true); }}
                    className="text-blue-400 mr-4 hover:underline"
                   >Edit</button>
                   <button onClick={() => handleDelete(course.id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161d2f] border border-gray-800 p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Subject Title</label>
                <input 
                  type="text" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg mt-1 outline-none focus:border-blue-500"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <textarea 
                  className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg mt-1 outline-none h-28 focus:border-blue-500"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 py-3 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-lg font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}