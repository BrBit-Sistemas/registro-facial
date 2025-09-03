import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gavel, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Court {
  id: string;
  name: string;
}

const CourtRegister = () => {
  const [courtName, setCourtName] = useState('');
  const [courts, setCourts] = useState<Court[]>([
    { id: '1', name: '1ª Vara Criminal' },
    { id: '2', name: '2ª Vara Criminal' },
    { id: '3', name: '3ª Vara Criminal' },
    { id: '4', name: 'Vara de Execuções Penais' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courtName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da vara é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setCourts(courts.map(court => 
        court.id === editingId ? { ...court, name: courtName } : court
      ));
      toast({
        title: "Vara atualizada",
        description: "Vara atualizada com sucesso!",
      });
      setEditingId(null);
    } else {
      const newCourt: Court = {
        id: Date.now().toString(),
        name: courtName
      };
      setCourts([...courts, newCourt]);
      toast({
        title: "Vara cadastrada",
        description: "Nova vara cadastrada com sucesso!",
      });
    }
    
    setCourtName('');
  };

  const handleEdit = (court: Court) => {
    setCourtName(court.name);
    setEditingId(court.id);
  };

  const handleDelete = (id: string) => {
    setCourts(courts.filter(court => court.id !== id));
    toast({
      title: "Vara removida",
      description: "Vara removida com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cadastro de Varas</h1>
        <p className="text-muted-foreground">Gerencie as varas do sistema</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Nova Vara</CardTitle>
          <CardDescription>Adicione ou edite uma vara</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courtName">Nome da Vara</Label>
              <Input
                id="courtName"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="Ex: 4ª Vara Criminal"
              />
            </div>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'} Vara
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setCourtName('');
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
          <CardTitle>Varas Cadastradas</CardTitle>
          <CardDescription>Lista de todas as varas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(court)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(court.id)}
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

export default CourtRegister;