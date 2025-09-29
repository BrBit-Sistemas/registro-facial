'use client'

import { useAuth } from '@/contexts/AuthContext'
import { isAuthenticated } from "@/shared/helper/auth-handler";
import { useRouter, usePathname  } from 'next/navigation'
import { useEffect } from 'react'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Building2,
  Gavel,
  Shield,
  Calendar,
  XCircle,
  AlertCircle,
  History,
  ScanFace,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from 'next/link'

  const menuItems = [
    { href: '/dashboard', name: 'Dashboard', icon: Home },
    { href: '/PersonList', name: 'Pessoas', icon: Users },
    { href: '/CompanyRegister', name: 'Cadastro CPMA', icon: Building2 },
    { href: '/OccurrenceHistory', name: 'Histórico de Ocorrências', icon: History },
    { href: '/FacialReview', name: 'Revisão Facial', icon: ScanFace },
  ];

  const auxiliaryMenuItems = [
    { href: '/CourtRegister', name: 'Varas', icon: Gavel },
    { href: '/RegimeRegister', name: 'Regimes Penais', icon: Shield },
    { href: '/FrequencyTypeRegister', name: 'Tipos de Frequência', icon: Calendar },
    { href: '/ClosureReasonRegister', name: 'Motivos de Encerramento', icon: XCircle },
    { href: '/OccurrenceTypeRegister', name: 'Tipos de Ocorrência', icon: AlertCircle },
  ];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { logout } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userAction, setUserAction] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    
    if (typeof window !== "undefined") {
      let useName = JSON.parse(sessionStorage.getItem('user') || '{}').name;
      setUserAction(useName ? useName : 'Use Name');
      let useEmail = JSON.parse(sessionStorage.getItem('user') || '{}').email;
      setUserEmail(useEmail ? useEmail : 'Use Email');
    }
  }, [])


  const handleLogout = () => {
    logout();
    router.push('/login')
  };

  return (
    <div className="min-h-screen bg-background ">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-smooth ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col ">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-br from-background via-secondary to-background border-b border-sidebar-border">
            <div className="h-40 w-40 rounded-full flex items-center justify-center text-primary font-bold">
              <img src="/logo-1920x570.png" alt="Logo" className="w-100" />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden "
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto ">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
               <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Auxiliary Registers Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                  <Shield className="h-5 w-5" />
                  <span>Cadastros Auxiliares</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover">
                <DropdownMenuLabel>Cadastros</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {auxiliaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User info */}
          <div className="border-t border-sidebar-border p-4 ">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">{userAction}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Sistema de Registro Facial
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
