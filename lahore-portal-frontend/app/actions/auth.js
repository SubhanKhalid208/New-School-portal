'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleLogin(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  let targetRoute = '';

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Login fail ho gaya!" };
    }

    const cookieStore = await cookies();
    const userId = data.id || data.user_id; 

    // userId ko read-able banane ke liye httpOnly ko false karein
    cookieStore.set('userId', userId.toString(), { 
      httpOnly: false, // Dashboard pe js-cookie se read karne ke liye false lazmi hai
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: 60 * 60 * 24 // 1 Din
    });
    
    cookieStore.set('role', data.role, { 
      httpOnly: false, // Sidebar pe role check karne ke liye false rakhein
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: 60 * 60 * 24
    });

    if (data.role === 'admin') targetRoute = '/admin';
    else if (data.role === 'teacher') targetRoute = '/teacher';
    else targetRoute = '/dashboard';

  } catch (error) {
    console.error("Auth Action Error:", error);
    return { success: false, error: "Server se rabta nahi ho saka!" };
  }

  if (targetRoute) {
    redirect(targetRoute);
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  redirect('/login');
}