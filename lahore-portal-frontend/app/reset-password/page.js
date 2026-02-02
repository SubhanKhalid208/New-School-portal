"use client"; 

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const token = searchParams.get('token'); 

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
        
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                password
            });
            setMessage("Shabash! Password set ho gaya hai. 3 second mein login par ja rahe hain...");
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.error || "Kuch ghalat hua"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
            <h1 style={{ color: '#28a745' }}>Lahore Portal - Set Password</h1>
            <p>Apna naya password yahan likhein:</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
                <input 
                    type="password" 
                    placeholder="Naya Password likhein" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '12px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? "Update ho raha hai..." : "Password Update Karein"}
                </button>
            </form>
            {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
}