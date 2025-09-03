import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Regime {
  id: string;
  name: string;
}

const RegimeRegister = () => {
  const [regimeName, setRegimeName] = useState('');
  const [regimes, setRegimes] = useState<Regime[]>([
    { id: '1', name: 'Regime Aberto' },
    { id: '2', name: 'Regime Semiaberto' },
    { id: '3', name: 'Regime Fechado' },
    { id: '4', name: 'Prisão Provisória' },
    { id: '5', name: 'Prisão Domiciliar' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regimeName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do regime é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setRegimes(regimes.map(regime => 
        regime.id === editingId ? { ...regime, name: regimeName } : regime
      ));
      toast({
        title: "Regime atualizado",
        description: "Regime penal atualizado com sucesso!",
      });
      setEditingId(null);
    } else {
      const newRegime: Regime = {
        id: Date.now().toString(),
        name: regimeName
      };
      setRegimes([...regimes, newRegime]);
      toast({
        title: "Regime cadastrado",
        description: "Novo regime penal cadastrado com sucesso!",
      });
    }
    
    setRegimeName('');
  };

  const handleEdit = (regime: Regime) => {
    setRegimeName(regime.name);
    setEditingId(regime.id);
  };

  const handleDelete = (id: string) => {
    setRegimes(regimes.filter(regime => regime.id !== id));
    toast({
      title: "Regime removido",
      description: "Regime penal removido com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cadastro de Regimes Penais</h1>
        <p className="text-muted-foreground">Gerencie os regimes penais do sistema</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Novo Regime Penal</CardTitle>
          <CardDescription>Adicione ou edite um regime penal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regimeName">Nome do Regime</Label>
              <Input
                id="regimeName"
                value={regimeName}
                onChange={(e) => setRegimeName(e.target.value)}
                placeholder="Ex: Livramento Condicional"
              />
            </div>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'} Regime
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setRegimeName('');
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
          <CardTitle>Regimes Cadastrados</CardTitle>
          <CardDescription>Lista de todos os regimes penais no sistema</CardDescription>
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
              {regimes.map((regime) => (
                <TableRow key={regime.id}>
                  <TableCell className="font-medium">{regime.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(regime)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(regime.id)}
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

export default RegimeRegister;