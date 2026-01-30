import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// 1. GET USERS WITH SEARCH (Naya function jo aapne manga)
export const getUsers = async (req, res) => {
    const { search } = req.query; // Frontend se ?search=... pakrein
    try {
        let queryText = "SELECT id, email, role, is_approved FROM users";
        let queryParams = [];

        // Agar search term mojood hai toh query filter karein
        if (search) {
            queryText += " WHERE email ILIKE $1 OR name ILIKE $1"; 
            queryParams.push(`%${search}%`); // % ka matlab hai 'shamil ho' (Anywhere in string)
        }

        queryText += " ORDER BY id DESC"; // Latest users upar dikhayein

        const usersRes = await pool.query(queryText, queryParams);
        res.json(usersRes.rows);
    } catch (err) {
        res.status(500).json({ error: "Backend search error: " + err.message });
    }
};

// --- Purana Code Jo Aapne Bheja ---

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userRes.rows[0];

        if (!user) return res.status(401).json({ error: "User nahi mila!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Password ghalat hai!" });

        if (!user.is_approved) return res.status(403).json({ error: "Aapka account pending hai!" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const signup = async (req, res) => {
    const { email, password, dob, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password, role, is_approved, dob) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, role || 'student', false, dob]
        );
        res.status(201).json({ success: true, message: "Request sent to Admin!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};