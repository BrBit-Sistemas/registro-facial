'use client'
import { useEffect } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import { isAuthenticated } from '@/shared/helper/auth-handler'
import { useRouter, usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(()=>{
    // Só redirecionar se não estiver na página de login
    if(!isAuthenticated() && pathname !== '/login'){
        router.push('/login');
    }
  },[router, pathname])

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
            <div className="flex min-h-screen">
             <div className="w-full bg-gray-2 dark:bg-[#FFF]">
              <main className="isolate mx-auto w-full overflow-hidden ">
               {children}
              </main>
              </div> 
            </div>
        <Toaster />
        </AuthProvider> 
      </body>
    </html>
  )
}

