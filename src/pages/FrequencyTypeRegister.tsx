import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FrequencyType {
  id: string;
  days: number;
  frequency: string;
}

const FrequencyTypeRegister = () => {
  const [formData, setFormData] = useState({
    days: '',
    frequency: ''
  });
  const [frequencies, setFrequencies] = useState<FrequencyType[]>([
    { id: '1', days: 1, frequency: 'Diária' },
    { id: '2', days: 7, frequency: 'Semanal' },
    { id: '3', days: 15, frequency: 'Quinzenal' },
    { id: '4', days: 30, frequency: 'Mensal' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.days || !formData.frequency.trim()) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setFrequencies(frequencies.map(freq => 
        freq.id === editingId 
          ? { ...freq, days: Number(formData.days), frequency: formData.frequency }
          : freq
      ));
      toast({
        title: "Frequência atualizada",
        description: "Tipo de frequência atualizado com sucesso!",
      });
      setEditingId(null);
    } else {
      const newFrequency: FrequencyType = {
        id: Date.now().toString(),
        days: Number(formData.days),
        frequency: formData.frequency
      };
      setFrequencies([...frequencies, newFrequency]);
      toast({
        title: "Frequência cadastrada",
        description: "Novo tipo de frequência cadastrado com sucesso!",
      });
    }
    
    setFormData({ days: '', frequency: '' });
  };

  const handleEdit = (freq: FrequencyType) => {
    setFormData({
      days: freq.days.toString(),
      frequency: freq.frequency
    });
    setEditingId(freq.id);
  };

  const handleDelete = (id: string) => {
    setFrequencies(frequencies.filter(freq => freq.id !== id));
    toast({
      title: "Frequência removida",
      description: "Tipo de frequência removido com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tipos de Frequência</h1>
        <p className="text-muted-foreground">Gerencie os tipos de frequência do sistema</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Novo Tipo de Frequência</CardTitle>
          <CardDescription>Adicione ou edite um tipo de frequência</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Número de dias</Label>
                <Input
                  id="days"
                  type="number"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  placeholder="Ex: 7"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="Ex: Semanal"
                />
              </div>
            </div>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'} Frequência
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ days: '', frequency: '' });
                }}
                className="ml-2"
              >
                Cancelar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Frequências Cadastradas</CardTitle>
          <CardDescription>Lista de todos os tipos de frequência</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dias</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequencies.map((freq) => (
                <TableRow key={freq.id}>
                  <TableCell className="font-medium">{freq.days}</TableCell>
                  <TableCell>{freq.frequency}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(freq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(freq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default FrequencyTypeRegister;