'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, ScanFace, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import DashboardLayout from '@/components/layout/DashboardLayout';

  // Mock data for charts
  const registrationData = [
    { month: 'Jan', registrations: 0 },
    { month: 'Fev', registrations: 0 },
    { month: 'Mar', registrations: 0 },
    { month: 'Abr', registrations: 0 },
    { month: 'Mai', registrations: 0 },
    { month: 'Jun', registrations: 0 },
    { month: 'Jul', registrations: 0 },
    { month: 'Ago', registrations: 0 },
    { month: 'Set', registrations: 0 },
    { month: 'Out', registrations: 15 },
    { month: 'Nov', registrations: 0 },
    { month: 'Dez', registrations: 0 }
  ];

  const facialData = [
    { day: 'Seg', readings: 9 },
    { day: 'Ter', readings: 0 },
    { day: 'Qua', readings: 0 },
    { day: 'Qui', readings: 0 },
    { day: 'Sex', readings: 0 },
    { day: 'Sáb', readings: 0 },
    { day: 'Dom', readings: 0 },
  ];

  const pieData = [
    { name: 'Com Registro', value: 15, color: 'hsl(var(--accent))' },
    { name: 'Sem Registro', value: 0, color: 'hsl(var(--destructive))' },
  ];

  const stats = [
    {
      title: 'Total de Pessoas',
      value: '9',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-primary'
    },
    {
      title: 'Registros Hoje',
      value: '12',
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-gradient-accent'
    },
    {
      title: 'Sem Registro (30 dias)',
      value: '0',
      change: '-8%',
      trend: 'down',
      icon: UserX,
      color: 'bg-gradient-dark'
    },
    {
      title: 'Leituras Faciais',
      value: '15',
      change: '+18%',
      trend: 'up',
      icon: ScanFace,
      color: 'bg-gradient-primary'
    },
  ];

export default function Dashboard() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de registro facial</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 mr-1 ${stat.trend === 'up' ? 'text-accent' : 'text-destructive'}`} />
                  <span className={stat.trend === 'up' ? 'text-accent' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Cadastros de Pessoas</CardTitle>
            <CardDescription>Evolução mensal de novos cadastros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Cadastros"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Registros Faciais</CardTitle>
            <CardDescription>Leituras realizadas nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="readings" 
                  fill="hsl(var(--accent))" 
                  name="Leituras"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Status de Registro Facial</CardTitle>
          <CardDescription>Pessoas com e sem registro nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}