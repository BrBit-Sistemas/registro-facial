import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/person-list', label: 'Pessoas', icon: Users },
    { path: '/company-register', label: 'Cadastro CPMA', icon: Building2 },
    { path: '/occurrence-history', label: 'Histórico de Ocorrências', icon: History },
    { path: '/facial-review', label: 'Revisão Facial', icon: ScanFace },
  ];

  const auxiliaryMenuItems = [
    { path: '/court-register', label: 'Varas', icon: Gavel },
    { path: '/regime-register', label: 'Regimes Penais', icon: Shield },
    { path: '/frequency-type', label: 'Tipos de Frequência', icon: Calendar },
    { path: '/closure-reason', label: 'Motivos de Encerramento', icon: XCircle },
    { path: '/occurrence-type', label: 'Tipos de Ocorrência', icon: AlertCircle },
  ];

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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
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
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
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
                <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
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
  );
};

export default Layout;