import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Sahi aur Single Imports (Saare duplicate nikal diye hain)
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import studentRoutes from './routes/studentRoutes.js'; 

const app = express();

// Middleware (Inka order sab se zaroori hai)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json()); // Yeh line routes se upar honi chahiye lazmi!

// API Endpoints (Check karein path exactly yahi ho)
app.use('/api/auth', authRoutes); 
app.use('/api/courses', courseRoutes); 
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/student', studentRoutes); // Isse aapka student dashboard connect hoga

app.get('/', (req, res) => {
  res.send('Lahore Education API is Online and Running!');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ success: false, message: "Server mein koi masla hai!" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});