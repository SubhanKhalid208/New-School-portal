'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getApiUrl, fetchWithRetry } from '@/app/utils/api';

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [markedStudents, setMarkedStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const teacherId = Cookies.get('userId');

  useEffect(() => {
    async function initData() {
      try {
        const stuUrl = getApiUrl('/teacher/students');
        const courseUrl = getApiUrl('/courses');
        
        const [stuRes, courseRes] = await Promise.all([
          fetchWithRetry(stuUrl, { method: 'GET' }, 1),
          fetchWithRetry(courseUrl, { method: 'GET' }, 1)
        ]);
        
        const studentsData = await stuRes.json();
        const coursesData = await courseRes.json();
        
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        toast.error("Lahore Portal ka data load nahi ho saka");
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/check-status?date=${today}&courseId=${selectedCourse}`)
        .then(res => res.json())
        .then(data => {
          setMarkedStudents(Array.isArray(data) ? data : []);
        })
        .catch(() => console.error("Attendance status check fail"));
    } else {
      setMarkedStudents([]);
    }
  }, [selectedCourse]);

  const markAttendance = async (studentId, status) => {
    if (!selectedCourse) {
      toast.error("Pehle Subject select karein!");
      return;
    }

    try {
      const url = getApiUrl('/attendance/mark');
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          courseId: selectedCourse,
          status,
          teacherId,
          date: new Date().toISOString().split('T')[0]
        })
      }, 1);

      if (res.ok) {
        toast.success(`✅ ${status === 'present' ? 'Present' : 'Absent'} mark ho gayi!`);
        setMarkedStudents(prev => [...prev, studentId]);
      } else {
        const error = await res.json();
        toast.error(error.error || "Attendance save nahi ho saki");
      }
    } catch (err) {
      console.error("❌ Attendance error:", err);
      toast.error("Attendance save nahi ho saki");
    }
  };

  if (loading) return <div className="p-8 text-green-500 font-bold animate-pulse text-center">Loading Lahore Portal Data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Attendance Panel</h1>
          <p className="text-gray-400 italic">Subhan, aaj ki attendance lagayein.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-green-500 font-bold uppercase ml-1">Select Subject</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[#161d2f] text-white border border-gray-700 p-3 rounded-xl focus:border-green-500 outline-none min-w-[200px] shadow-lg cursor-pointer"
          >
            <option value="">-- Choose Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name || course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#161d2f] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1f2937] text-gray-400 text-sm">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4 text-center">Action (Next 24 Hours)</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {students.length > 0 ? students.map((s) => {
              const isAlreadyMarked = markedStudents.includes(s.id);
              
              return (
                <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button 
                        disabled={isAlreadyMarked || !selectedCourse}
                        onClick={() => markAttendance(s.id, 'present')}
                        className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                          isAlreadyMarked 
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                            : 'bg-green-600/10 text-green-500 border border-green-500/30 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        {isAlreadyMarked ? 'MARKED' : 'PRESENT'}
                      </button>
                      <button 
                        disabled={isAlreadyMarked || !selectedCourse}
                        onClick={() => markAttendance(s.id, 'absent')}
                        className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                          isAlreadyMarked 
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                            : 'bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        {isAlreadyMarked ? 'MARKED' : 'ABSENT'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="2" className="p-10 text-center text-gray-500">Koi students nahi miley.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}