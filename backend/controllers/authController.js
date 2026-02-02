import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const sendWelcomeEmail = async (userEmail, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'lahore_portal_secret', { expiresIn: '24h' });
    
    const setupLink = `http://localhost:3000/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS  
        }
    });

    const mailOptions = {
        from: `"Lahore Education Portal" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome! Complete Your Registration',
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #28a745;">Welcome to Lahore Education Portal!</h2>
                <p>Assalam-o-Alaikum,</p>
                <p>Aapko portal par register kar diya gaya hai. Apna password set karne ke liye niche diye gaye button par click karein:</p>
                <a href="${setupLink}" style="display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Set Your Password</a>
                <p>Yeh link 24 ghante mein expire ho jaye ga.</p>
                <hr />
                <p style="font-size: 12px; color: #777;">Agar aap ne ye request nahi ki, toh is email ko nazar-andaz karein.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

export const getUsers = async (req, res) => {
    const { search } = req.query;
    try {
        let queryText = "SELECT id, email, role, is_approved FROM users";
        let queryParams = [];

        if (search) {
            queryText += " WHERE email ILIKE $1 OR name ILIKE $1"; 
            queryParams.push(`%${search}%`);
        }

        queryText += " ORDER BY id DESC";
        const usersRes = await pool.query(queryText, queryParams);
        res.json(usersRes.rows);
    } catch (err) {
        res.status(500).json({ error: "Backend search error: " + err.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lahore_portal_secret');
        const userId = decoded.id;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, userId]
        );

        res.json({ success: true, message: "Password updated successfully!" });
    } catch (err) {
        console.error("Reset Error:", err);
        res.status(400).json({ error: "Invalid or expired token!" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userRes.rows[0];

        if (!user) return res.status(401).json({ error: "User nahi mila!" });

        if (!user.password) return res.status(401).json({ error: "Pehle apna password set karein (Email check karein)!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Password ghalat hai!" });

        if (!user.is_approved) return res.status(403).json({ error: "Aapka account pending hai!" });

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'lahore_portal_secret', 
            { expiresIn: '1d' }
        );

        res.json({ 
            message: "Login Successful!",
            token, 
            user: { id: user.id, email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const signup = async (req, res) => {
    const { email, dob, role } = req.body; 
    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email pehle se register hai!" }); 
        }

        const newUser = await pool.query(
            'INSERT INTO users (email, role, is_approved, dob) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, role || 'student', true, dob]
        );

        await sendWelcomeEmail(email, newUser.rows[0].id);

        res.status(201).json({ 
            success: true, 
            message: "Student created and Welcome Email sent!" 
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: err.message });
    }
};