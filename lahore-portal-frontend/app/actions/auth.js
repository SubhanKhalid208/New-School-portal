'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

    const user = data.user; 
    const cookieStore = await cookies();

    cookieStore.set('token', data.token, { httpOnly: true, path: '/' });

    cookieStore.set('userId', user.id.toString(), { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: 60 * 60 * 24 
    });
    
    cookieStore.set('role', user.role, { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: 60 * 60 * 24
    });

    if (user.role === 'admin') targetRoute = '/admin';
    else if (user.role === 'teacher') targetRoute = '/teacher';
    else targetRoute = `/dashboard/student/${user.id}`; 

  } catch (error) {
    console.error("Auth Action Error:", error);
    return { success: false, error: "Server se rabta nahi ho saka! Check karein backend 5000 pe on hai." };
  }

  if (targetRoute) {
    redirect(targetRoute);
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  cookieStore.delete('token');
  redirect('/login');
}