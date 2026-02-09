'use client'
import { useEffect, useState, use } from 'react'; 
import { toast } from 'react-hot-toast';
import { BookOpen, GraduationCap, TrendingUp, CheckCircle, Calendar, Info } from 'lucide-react';

export default function StudentDashboardPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [data, setData] = useState({ 
    attendancePercentage: 0, 
    totalPresent: 0, 
    totalDays: 0, 
    history: [] 
  });
  
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/attendance/student/${studentId}`, {
          method: 'GET',
          headers: headers,
          cache: 'no-store' 
        });

        if (statsRes.status === 401 || statsRes.status === 403) {
          toast.error("Access Denied! Token invalid.");
          return;
        }

        const statsResult = await statsRes.json();
        if (statsResult.success) {
          setData(statsResult);
        }

        const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/my-courses/${studentId}`, {
          method: 'GET',
          headers: headers,
          cache: 'no-store'
        });

        const coursesResult = await coursesRes.json();
        
        if (coursesResult.success) {
          setCourses(coursesResult.courses || []);
        } else {
          console.error("Course Fetch Error:", coursesResult.error);
        }

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        toast.error("Lahore Portal: Connection error!");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="text-green-500 text-xl font-semibold animate-pulse italic">
        Loading Lahore Portal Data for ID: {studentId}...
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-400 font-medium">Lahore Education Portal: Overview for ID {studentId}</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#161d2f] p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <TrendingUp className="absolute right-4 top-4 text-green-500/20 group-hover:scale-110 transition-transform" size={60} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Attendance</p>
          <h2 className="text-5xl font-extrabold text-green-500 mt-2">{data.attendancePercentage}%</h2>
          <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${data.attendancePercentage}%` }}></div>
          </div>
        </div>

        <div className="bg-[#161d2f] p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <CheckCircle className="absolute right-4 top-4 text-blue-500/20 group-hover:scale-110 transition-transform" size={60} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Present Days</p>
          <h2 className="text-5xl font-extrabold text-blue-500 mt-2">{data.totalPresent}</h2>
          <p className="text-xs text-gray-500 mt-4">Total sessions attended</p>
        </div>

        <div className="bg-[#161d2f] p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
          <Calendar className="absolute right-4 top-4 text-purple-500/20 group-hover:scale-110 transition-transform" size={60} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Days</p>
          <h2 className="text-5xl font-extrabold text-purple-500 mt-2">{data.totalDays}</h2>
          <p className="text-xs text-gray-500 mt-4">Working days in Lahore Portal</p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="text-green-500" size={28} />
          <h2 className="text-2xl font-bold">My Registered Courses</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div key={index} className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all hover:-translate-y-1 shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500/10 p-3 rounded-xl text-green-500">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{course.subject_name || "General Subject"}</h3>
                    <p className="text-xs text-gray-500">Course ID: LP-00{index + 1}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 px-6 text-center text-gray-400 border border-dashed border-gray-700 rounded-3xl bg-[#161d2f]/50">
              <Info className="mx-auto mb-3 text-blue-500" size={40} />
              <h3 className="text-xl font-semibold italic">No Courses Found</h3>
              <p className="mt-2">If you were added via CSV, please wait for admin approval or check your connection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}