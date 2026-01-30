import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';

// 1. Login Endpoint
// URL: http://localhost:5000/api/auth/login
router.post('/login', authController.login);

// 2. Signup / Register Endpoint
// Humne dono raste khol diye hain taake koi error na aaye
router.post('/signup', authController.signup);
router.post('/register', authController.signup); // Yeh line naye user management ke liye zaroori hai

export default router;