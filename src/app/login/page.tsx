'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { validatorEmail, validatorPassword } from "@/components/utils/validations";
export default function Login() {
  const [data, setData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  let router = useRouter();
  // Validação dos inputs
  const isValidInput = useCallback(() => {
    return validatorEmail(data.email) && validatorPassword(data.password);
  }, [data.email, data.password]);
  // Atualiza o estado conforme o input
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidInput()) {
        toast.info("E-mail ou senha incorreto!");
        return;
      }
      setLoading(true);
      // Simula delay para UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Login realizado com sucesso!');
        setTimeout(() => {
          setLoading(false);
          router.push('/dashboard');
        }, 3000);
        
      } else {
        setLoading(false);
        toast.error('Credenciais inválidas, entre contato com suporte.');
      }
    },
    [data.email, data.password, isValidInput, login, router]
  );
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <Card className="w-full max-w-md rounded-2xl border border-gray-200 bg-gradient-primary/50 text-card-foreground shadow-xl backdrop-blur-lg">
        <CardHeader className="flex flex-col items-center p-6">
          <img
            src="/logo-1920x570.png"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
          <CardTitle className="mt-4 text-center text-lg font-semibold">
            Sistema de Registro Facial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Usuário */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Usuário
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                value={data.email}
                onChange={handleChange}
                placeholder="Digite seu usuário"
                required
                autoComplete="email"
                className='border-blue-500'
              />
            </div>
            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  className='border-blue-500'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(show => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {/* Botão */}
            <AnimatedButton type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </AnimatedButton>
          </form>
        </CardContent>
      </Card>
      <div suppressHydrationWarning className="flex absolute min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4" style={{ display: loading ? "flex" : "none" }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
}    