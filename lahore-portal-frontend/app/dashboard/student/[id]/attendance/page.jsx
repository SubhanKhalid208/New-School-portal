'use client'
import { useEffect, useState, use } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl, fetchWithRetry } from '@/app/utils/api';

export default function AttendanceReportPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetchAttendance() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Use centralized API URL helper
        const url = getApiUrl(`/student/attendance/student/${studentId}`);
        console.log(`📡 Fetching attendance from: ${url}`);

        const res = await fetchWithRetry(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }, 1); // 1 retry

        if (res.status === 401 || res.status === 403) {
          toast.error("Session expire ho gaya ya access denied hai.");
          return;
        }

        const result = await res.json();
        console.log("✅ Attendance response:", result);
        
        if (result.success) {
          if (result.history && result.history.length > 0) {
            const sortedHistory = result.history.sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistory(sortedHistory);
          } else {
            setHistory([]);
            console.log("ℹ️ No attendance records for student yet.");
          }
        } else {
          console.error("❌ API returned error:", result.error);
          toast.error(result.error || "Data fetch karne mein masla hua.");
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        toast.error("Lahore Portal: Server se rabta nahi ho saka!");
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="text-green-500 text-xl font-semibold animate-pulse italic">
        Fetching Lahore Portal Attendance History...
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="text-green-500" /> Attendance Report
          </h1>
          <p className="text-gray-400 mt-1">Detailed history for Student ID: {studentId}</p>
        </div>
        <Link 
          href={`/dashboard/student/${studentId}`}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all text-sm"
        >
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>
      </div>

      {/* Attendance Table */}
      <div className="bg-[#161d2f] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 uppercase text-xs tracking-widest font-bold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {history.length > 0 ? (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-5 font-medium">
                      {new Date(record.date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {record.subject_name || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {record.status?.toLowerCase() === 'present' ? (
                        <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                          <CheckCircle size={14} /> PRESENT
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                          <XCircle size={14} /> ABSENT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={14} /> 
                        {record.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Info className="text-blue-400 w-10 h-10" />
                      <p className="text-gray-400 text-lg italic">Khushamdeed!</p>
                      <p className="text-gray-500 text-sm">Abhi tak Lahore Portal par aapka koi attendance record nahi mila.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}