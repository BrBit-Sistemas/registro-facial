'use client'
import { useEffect, useState } from 'react';
import './globals.css'
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(()=>{
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      return router.push('/login');
    }, 3000);
   },[])
  return (
        <div suppressHydrationWarning className="min-h-screen flex items-center justify-center" style={{display: loading? "flex": "none"}}>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
  );
}