"use client"; 
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

// 1. Pehle aik chota component banaya jo logic handle karega
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const token = searchParams.get('token'); 

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const getApiUrl = () => {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanEndpoint = '/auth/reset-password';
      const withoutApi = cleanEndpoint.replace(/^\/api/, '');
      return `${BASE_URL}/api${withoutApi}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!token) {
                setMessage("Error: Token nahi mila - link expire ho gaya ya ghalat hai");
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setMessage("Error: Password kam se kam 6 characters ka hona chahiye");
                setLoading(false);
                return;
            }

            const API_URL = getApiUrl();
            console.log(`📡 Sending reset password request to: ${API_URL}`);
            console.log(`🔐 Token: ${token.substring(0, 10)}...`);
            
            const res = await axios.post(API_URL, {
                token,
                password
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            console.log("✅ Password update successful");
            setMessage("✅ Shabash! Password set ho gaya hai. 3 second mein login par ja rahe hain...");
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            console.error("❌ Reset Password Error:", err);
            const errorMsg = err.response?.data?.error || err.message || "Kuch ghalat hua";
            setMessage("Error: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
                <h1 style={{ color: '#dc3545' }}>Lahore Portal - Invalid Link</h1>
                <p>Ye link expire ho gaya ya ghalat hai. Email se naiya link mangwayein.</p>
                <button 
                    onClick={() => router.push('/login')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 25px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
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
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Update ho raha hai..." : "Password Update Karein"}
                </button>
            </form>
            {message && <p style={{ marginTop: '20px', fontWeight: 'bold', color: message.includes('Error') ? '#dc3545' : '#28a745' }}>{message}</p>}
        </div>
    );
}

// 2. Main Page component jo Suspense use karta hai
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}