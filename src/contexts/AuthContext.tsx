'use client';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const storedUser = sessionStorage.getItem('token');
    if (storedUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("=== LOGIN DEBUG ===");
      console.log("Tentando login com:", email);
      setIsLoading(true);
      const rest = await api.post('api/auth/sign-in', { 
        email, 
        password
      });

      console.log("Resposta da API:", rest.status, rest.data);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      if (rest.status === 200) {
        const userData = {
          id: rest.data.user.id,
          name: rest.data.user.nome,
          email: rest.data.user.email,
          role: 'admin'
        };
        console.log("Dados do usuário:", userData);
        console.log("Dados da empresa:", rest.data.company);
        console.log("Token:", rest.data.token);
        
        setIsAuthenticated(true);
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));

        sessionStorage.setItem('cpma_unidade', JSON.stringify(rest.data.company));

        sessionStorage.setItem('token', JSON.stringify(rest.data.token));

        console.log("✅ Login realizado com sucesso");
        setIsLoading(false);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao SAGEP!",
        });
        return true;
      } else {
        console.log("❌ Login falhou - status:", rest.status);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log("❌ Erro no login:", error);
      setIsAuthenticated(false);
      setIsLoading(false);
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive"
      });
      return false;
    }

  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cpma_unidade');
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}