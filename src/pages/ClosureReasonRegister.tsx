import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ClosureReason {
  id: string;
  reason: string;
}

const ClosureReasonRegister = () => {
  const [reason, setReason] = useState('');
  const [reasons, setReasons] = useState<ClosureReason[]>([
    { id: '1', reason: 'Cumprimento integral da pena' },
    { id: '2', reason: 'Indulto' },
    { id: '3', reason: 'Progressão de regime' },
    { id: '4', reason: 'Falecimento' },
    { id: '5', reason: 'Transferência' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Erro",
        description: "Motivo de encerramento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setReasons(reasons.map(r => 
        r.id === editingId ? { ...r, reason } : r
      ));
      toast({
        title: "Motivo atualizado",
        description: "Motivo de encerramento atualizado com sucesso!",
      });
      setEditingId(null);
    } else {
      const newReason: ClosureReason = {
        id: Date.now().toString(),
        reason
      };
      setReasons([...reasons, newReason]);
      toast({
        title: "Motivo cadastrado",
        description: "Novo motivo de encerramento cadastrado com sucesso!",
      });
    }
    
    setReason('');
  };

  const handleEdit = (reasonItem: ClosureReason) => {
    setReason(reasonItem.reason);
    setEditingId(reasonItem.id);
  };

  const handleDelete = (id: string) => {
    setReasons(reasons.filter(r => r.id !== id));
    toast({
      title: "Motivo removido",
      description: "Motivo de encerramento removido com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Motivos de Encerramento</h1>
        <p className="text-muted-foreground">Gerencie os motivos de encerramento</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Novo Motivo</CardTitle>
          <CardDescription>Adicione ou edite um motivo de encerramento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de Encerramento</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Livramento condicional"
              />
            </div>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'} Motivo
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setReason('');
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
          <CardTitle>Motivos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os motivos de encerramento</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.map((reasonItem) => (
                <TableRow key={reasonItem.id}>
                  <TableCell className="font-medium">{reasonItem.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(reasonItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(reasonItem.id)}
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

export default ClosureReasonRegister;