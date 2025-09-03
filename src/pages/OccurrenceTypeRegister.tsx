import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OccurrenceType {
  id: string;
  description: string;
}

const OccurrenceTypeRegister = () => {
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState<OccurrenceType[]>([
    { id: '1', description: 'Falta ao comparecimento' },
    { id: '2', description: 'Descumprimento de medida' },
    { id: '3', description: 'Novo delito' },
    { id: '4', description: 'Bom comportamento' },
    { id: '5', description: 'Advertência' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setTypes(types.map(type => 
        type.id === editingId ? { ...type, description } : type
      ));
      toast({
        title: "Tipo atualizado",
        description: "Tipo de ocorrência atualizado com sucesso!",
      });
      setEditingId(null);
    } else {
      const newType: OccurrenceType = {
        id: Date.now().toString(),
        description
      };
      setTypes([...types, newType]);
      toast({
        title: "Tipo cadastrado",
        description: "Novo tipo de ocorrência cadastrado com sucesso!",
      });
    }
    
    setDescription('');
  };

  const handleEdit = (type: OccurrenceType) => {
    setDescription(type.description);
    setEditingId(type.id);
  };

  const handleDelete = (id: string) => {
    setTypes(types.filter(type => type.id !== id));
    toast({
      title: "Tipo removido",
      description: "Tipo de ocorrência removido com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tipos de Ocorrência</h1>
        <p className="text-muted-foreground">Gerencie os tipos de ocorrência</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Novo Tipo</CardTitle>
          <CardDescription>Adicione ou edite um tipo de ocorrência</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Violação de perímetro"
              />
            </div>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'} Tipo
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setDescription('');
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
          <CardTitle>Tipos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os tipos de ocorrência</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(type.id)}
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

export default OccurrenceTypeRegister;