import express from 'express';
import pool from '../config/db.js'; 

const router = express.Router();

// 1. Saare courses lene ke liye (Teacher Dashboard Dropdown ke liye)
// FIXED: 'title AS name' use kiya hai kyunki database mein 'name' column nahi mil raha
router.get('/', async (req, res) => {
    try {
        // Lahore Portal database fix: 'title' ko 'name' ka alias de diya
        const result = await pool.query("SELECT id, title AS name FROM courses ORDER BY title ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        // Agar error aaye toh terminal mein nazar aayega
        console.error("Courses Fetch Error:", err.message); 
        res.status(500).json({ success: false, error: "Courses load nahi ho sakay!" });
    }
});

// 2. Naya course add karne ke liye (Admin Panel ke liye)
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        // Yahan bhi 'title' use kiya hai taake database mismatch na ho
        const result = await pool.query(
            "INSERT INTO courses (title, description) VALUES ($1, $2) RETURNING *",
            [name, description]
        );
        res.status(201).json({ success: true, course: result.rows[0] });
    } catch (err) {
        console.error("Add Course Error:", err.message);
        res.status(500).json({ success: false, error: "Naya course add nahi ho saka." });
    }
});

export default router;