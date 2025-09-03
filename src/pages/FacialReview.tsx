import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScanFace, Check, X, Filter, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FacialReading {
  id: string;
  personName: string;
  personCode: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
  image?: string;
}

const FacialReview = () => {
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [userFilter, setUserFilter] = useState('');
  const [readings, setReadings] = useState<FacialReading[]>([
    {
      id: '1',
      personName: 'João Silva',
      personCode: 'FAC-001',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '08:30',
      status: 'pending',
      confidence: 95.5,
    },
    {
      id: '2',
      personName: 'Maria Santos',
      personCode: 'FAC-002',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:15',
      status: 'approved',
      confidence: 98.2,
    },
    {
      id: '3',
      personName: 'Pedro Oliveira',
      personCode: 'FAC-003',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      status: 'pending',
      confidence: 87.3,
    },
    {
      id: '4',
      personName: 'Ana Costa',
      personCode: 'FAC-004',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '11:30',
      status: 'rejected',
      confidence: 65.8,
    },
  ]);

  const handleApprove = (id: string) => {
    setReadings(readings.map(reading =>
      reading.id === id ? { ...reading, status: 'approved' as const } : reading
    ));
    toast({
      title: "Leitura aprovada",
      description: "Leitura facial aprovada com sucesso!",
    });
  };

  const handleReject = (id: string) => {
    setReadings(readings.map(reading =>
      reading.id === id ? { ...reading, status: 'rejected' as const } : reading
    ));
    toast({
      title: "Leitura rejeitada",
      description: "Leitura facial rejeitada.",
      variant: "destructive"
    });
  };

  const filteredReadings = readings.filter(reading => {
    const matchesDate = !dateFilter || reading.date === dateFilter;
    const matchesUser = !userFilter || 
      reading.personName.toLowerCase().includes(userFilter.toLowerCase()) ||
      reading.personCode.toLowerCase().includes(userFilter.toLowerCase());
    return matchesDate && matchesUser;
  });

  const getStatusBadge = (status: FacialReading['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-accent text-accent-foreground">{confidence.toFixed(1)}%</Badge>;
    } else if (confidence >= 75) {
      return <Badge variant="secondary">{confidence.toFixed(1)}%</Badge>;
    } else {
      return <Badge variant="destructive">{confidence.toFixed(1)}%</Badge>;
    }
  };

  const stats = {
    total: filteredReadings.length,
    pending: filteredReadings.filter(r => r.status === 'pending').length,
    approved: filteredReadings.filter(r => r.status === 'approved').length,
    rejected: filteredReadings.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revisão de Leituras Faciais</h1>
        <p className="text-muted-foreground">Aprove ou rejeite leituras faciais do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as leituras por data e usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Buscar por nome ou código..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Leituras Faciais</CardTitle>
          <CardDescription>Lista de leituras para revisão</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.personName}</TableCell>
                  <TableCell>{reading.personCode}</TableCell>
                  <TableCell>{reading.date}</TableCell>
                  <TableCell>{reading.time}</TableCell>
                  <TableCell>{getConfidenceBadge(reading.confidence)}</TableCell>
                  <TableCell>{getStatusBadge(reading.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {reading.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApprove(reading.id)}
                            className="text-accent hover:text-accent"
                            title="Aprovar"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleReject(reading.id)}
                            className="text-destructive hover:text-destructive"
                            title="Rejeitar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacialReview;