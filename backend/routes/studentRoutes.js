import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

// Route: http://localhost:5000/api/student/attendance/student/:studentId
router.get('/attendance/student/:studentId', async (req, res) => {
    const { studentId } = req.params;

    if (!studentId || studentId === 'undefined') {
        return res.status(400).json({ success: false, error: "Student ID missing hai." });
    }

    try {
        // Stats Query
        const statsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE LOWER(status) = 'present') as present_days,
                COUNT(*) as total_days
            FROM attendance 
            WHERE student_id = $1
        `;
        const statsResult = await pool.query(statsQuery, [studentId]);
        
        const present = parseInt(statsResult.rows[0].present_days) || 0;
        const total = parseInt(statsResult.rows[0].total_days) || 0;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        // History Query with Course Title
        const historyQuery = `
            SELECT a.date, a.status, c.title as subject_name 
            FROM attendance a
            LEFT JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = $1
            ORDER BY a.date DESC LIMIT 10
        `;
        const historyResult = await pool.query(historyQuery, [studentId]);

        res.json({
            success: true,
            attendancePercentage: percentage,
            totalPresent: present,
            totalDays: total,
            history: historyResult.rows || []
        });

    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ success: false, error: "Database error: " + err.message });
    }
});

export default router;