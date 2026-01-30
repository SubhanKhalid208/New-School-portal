import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lahore Education Portal",
  description: "Attendance and Management System by Subhan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0f1c] text-white`}>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#161d2f',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
        
        {/* Children render ho rahe hain, baki layout AdminLayout handle karega */}
        {children}
      </body>
    </html>
  );
}