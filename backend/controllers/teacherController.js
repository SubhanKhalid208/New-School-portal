import pool from '../config/db.js';

// 1. Teacher Dashboard Stats Fix
export const getStats = async (req, res) => {
    // Frontend ?teacherId=... bhej raha hai
    const { teacherId } = req.query; 
    
    try {
        if (!teacherId) {
            return res.status(400).json({ error: "Teacher ID missing hai." });
        }

        // Lahore Portal stats logic
        // Poore school ke total students count karein
        const studentRes = await pool.query("SELECT COUNT(*) FROM users WHERE LOWER(role) = 'student'");
        
        // COLUMN FIX: created_by ki jagah teacher_id use kiya hai
        const subjectRes = await pool.query("SELECT COUNT(*) FROM courses WHERE teacher_id = $1", [teacherId]);

        res.json({ 
            success: true, 
            totalStudents: parseInt(studentRes.rows[0].count) || 0,
            totalSubjects: parseInt(subjectRes.rows[0].count) || 0 
        });
    } catch (err) {
        console.error("Stats Error:", err.message); // Terminal pe error print hoga
        res.status(500).json({ error: "Stats load nahi ho sakay: " + err.message });
    }
};

// 2. Attendance Mark Logic
export const markAttendance = async (req, res) => {
    const { studentId, courseId, status, date, teacherId } = req.body;
    const attDate = date || new Date().toISOString().split('T')[0];

    try {
        // Pehle check karein ke kya attendance pehle se lagi hui hai
        const existing = await pool.query(
            "SELECT id FROM attendance WHERE student_id = $1 AND course_id = $2 AND date = $3",
            [studentId, courseId, attDate]
        );

        if (existing.rows.length > 0) {
            // Update purani attendance
            await pool.query("UPDATE attendance SET status = $1 WHERE id = $2", [status, existing.rows[0].id]);
        } else {
            // Nayi attendance insert karein
            await pool.query(
                "INSERT INTO attendance (student_id, course_id, status, date, teacher_id) VALUES ($1, $2, $3, $4, $5)",
                [studentId, courseId, status, attDate, teacherId]
            );
        }
        res.json({ success: true, message: "Attendance record updated!" });
    } catch (err) {
        console.error("Attendance Mark Error:", err.message);
        res.status(500).json({ error: "Attendance save nahi ho saki." });
    }
};