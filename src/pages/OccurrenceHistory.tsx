import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, History, Plus, Upload, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Occurrence {
  id: string;
  personName: string;
  personCode: string;
  type: string;
  date: string;
  time: string;
  history: string;
  attachment?: string;
}

const OccurrenceHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<{ code: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    history: '',
  });
  const [occurrences, setOccurrences] = useState<Occurrence[]>([
    {
      id: '1',
      personName: 'João Silva',
      personCode: 'FAC-001',
      type: 'Falta ao comparecimento',
      date: '2024-01-15',
      time: '09:30',
      history: 'Não compareceu ao registro facial matinal',
    },
    {
      id: '2',
      personName: 'Maria Santos',
      personCode: 'FAC-002',
      type: 'Bom comportamento',
      date: '2024-01-14',
      time: '14:00',
      history: 'Comparecimento regular e pontual durante todo o mês',
    },
  ]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código ou nome para buscar",
        variant: "destructive"
      });
      return;
    }

    // Mock search
    const mockPerson = {
      code: `FAC-${Date.now()}`,
      name: searchTerm
    };
    
    setSelectedPerson(mockPerson);
    toast({
      title: "Pessoa encontrada",
      description: `Registrando ocorrência para ${searchTerm}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerson) {
      toast({
        title: "Erro",
        description: "Selecione uma pessoa primeiro",
        variant: "destructive"
      });
      return;
    }

    if (!formData.type || !formData.history.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newOccurrence: Occurrence = {
      id: Date.now().toString(),
      personName: selectedPerson.name,
      personCode: selectedPerson.code,
      ...formData
    };

    setOccurrences([newOccurrence, ...occurrences]);
    
    toast({
      title: "Ocorrência registrada",
      description: "Ocorrência registrada com sucesso!",
    });

    // Reset form
    setFormData({
      type: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      history: '',
    });
  };

  const filteredOccurrences = selectedPerson
    ? occurrences.filter(o => o.personCode === selectedPerson.code)
    : occurrences;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico de Ocorrências</h1>
        <p className="text-muted-foreground">Registre e visualize ocorrências</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Buscar Pessoa</CardTitle>
          <CardDescription>Localize por código ou nome</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Digite o código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          {selectedPerson && (
            <div className="mt-4 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Pessoa selecionada:</p>
              <p className="font-medium">{selectedPerson.name} - {selectedPerson.code}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPerson && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Registrar Ocorrência</CardTitle>
            <CardDescription>Adicione uma nova ocorrência para {selectedPerson.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="falta">Falta ao comparecimento</SelectItem>
                      <SelectItem value="descumprimento">Descumprimento de medida</SelectItem>
                      <SelectItem value="novo-delito">Novo delito</SelectItem>
                      <SelectItem value="bom-comportamento">Bom comportamento</SelectItem>
                      <SelectItem value="advertencia">Advertência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="history">Histórico *</Label>
                <Textarea
                  id="history"
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  placeholder="Descreva a ocorrência..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Anexar Arquivo</Label>
                <div className="flex gap-2">
                  <Input
                    id="attachment"
                    type="file"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Ocorrência
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>
            {selectedPerson 
              ? `Ocorrências de ${selectedPerson.name}`
              : 'Todas as ocorrências recentes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Pessoa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences.map((occurrence) => (
                <TableRow key={occurrence.id}>
                  <TableCell>{occurrence.date}</TableCell>
                  <TableCell>{occurrence.time}</TableCell>
                  <TableCell className="font-medium">{occurrence.personName}</TableCell>
                  <TableCell>{occurrence.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{occurrence.history}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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

export default OccurrenceHistory;