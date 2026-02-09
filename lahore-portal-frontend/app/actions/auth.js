'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ✅ Fixed: Ensuring the URL is trimmed and handled correctly
const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Agar URL ke aakhir mein /api hai toh usay handle karein
  return url.endsWith('/api') ? url : `${url}/api`;
};

export async function handleLogin(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const API_URL = getBaseUrl();

  try {
    console.log(`Attempting login to: ${API_URL}/auth/login`);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      // Server Action mein cache: 'no-store' hona zaroori hai taake hamesha fresh data aaye
      cache: 'no-store'
    });

    // Content-Type check taake agar HTML error aaye toh code crash na ho
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      throw new Error("Backend ne JSON response nahi diya!");
    }

    if (!res.ok) {
      return { success: false, error: data.error || "Login fail ho gaya!" };
    }

    const user = data.user; 
    const cookieStore = await cookies();

    // ✅ Session Cookies Setup
    cookieStore.set('token', data.token, { 
      httpOnly: false, // Client-side JS (js-cookie) ke liye false rakha hai
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 
    });

    cookieStore.set('userId', user.id.toString(), { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 
    });
    
    cookieStore.set('role', user.role, { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return { 
      success: true, 
      token: data.token, 
      role: user.role, 
      userId: user.id 
    };

  } catch (error) {
    console.error("Auth Action Error:", error.message);
    return { success: false, error: "Server se rabta nahi ho saka! Code: " + error.message };
  }
}

export async function handleSignup(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const dob = formData.get('dob');
  const API_URL = getBaseUrl();

  try {
    // Input validation
    if (!name || !email) {
      return { success: false, error: "Name aur Email zaroori hain!" };
    }

    console.log(`📝 Registration attempt for: ${email}`);
    console.log(`📡 Sending to: ${API_URL}/auth/signup`);

    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        dob: dob || null, 
        role: 'student' 
      }),
      cache: 'no-store'
    });

    const contentType = res.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      console.error("❌ Non-JSON response received");
      throw new Error("Backend ne JSON response nahi diya!");
    }

    if (!res.ok) {
      console.error("❌ Registration failed:", data);
      return { 
        success: false, 
        error: data.error || "Registration fail ho gaya! Phir se try karein." 
      };
    }

    console.log("✅ Registration successful:", data);
    return { 
      success: true, 
      message: data.message || "Registration successful! Email check karein password set karne ke liye.",
      userId: data.userId
    };

  } catch (error) {
    console.error("❌ Signup Action Error:", error.message);
    return { 
      success: false, 
      error: "Server se rabta nahi ho saka! " + (error.message || "Network error") 
    };
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  cookieStore.delete('token');
  redirect('/login');
}