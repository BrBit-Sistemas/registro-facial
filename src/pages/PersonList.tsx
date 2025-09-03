import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Person {
  id: string;
  idFacial: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: string;
  vara: string;
  regime: string;
  cidade?: string;
  uf?: string;
  processo?: string;
  isActive: boolean;
  dataCadastro: string;
  hasPhoto: boolean;
}

// Mock data - replace with actual API calls
const mockPeople: Person[] = [
  {
    id: '1',
    idFacial: 'FAC-001',
    nome: 'João Silva Santos',
    cpf: '12345678901',
    rg: 'MG1234567',
    dataNascimento: '1985-03-15',
    sexo: 'masculino',
    vara: '1ª Vara Criminal',
    regime: 'Regime Aberto',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    processo: 'PROC-2024-001',
    isActive: true,
    dataCadastro: '2024-01-15',
    hasPhoto: true
  },
  {
    id: '2',
    idFacial: 'FAC-002',
    nome: 'Maria Oliveira Costa',
    cpf: '98765432109',
    rg: 'SP9876543',
    dataNascimento: '1990-07-22',
    sexo: 'feminino',
    vara: '2ª Vara Criminal',
    regime: 'Regime Semiaberto',
    cidade: 'São Paulo',
    uf: 'SP',
    processo: 'PROC-2024-002',
    isActive: true,
    dataCadastro: '2024-01-20',
    hasPhoto: false
  },
  {
    id: '3',
    idFacial: 'FAC-003',
    nome: 'Pedro Henrique Almeida',
    cpf: '45678912345',
    rg: 'RJ4567891',
    dataNascimento: '1978-11-30',
    sexo: 'masculino',
    vara: 'Vara de Execuções Penais',
    regime: 'Regime Fechado',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    processo: 'PROC-2023-150',
    isActive: false,
    dataCadastro: '2023-12-10',
    hasPhoto: true
  }
];

const PersonList = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  useEffect(() => {
    // Load people from localStorage or use mock data
    const storedPeople = localStorage.getItem('people');
    if (storedPeople) {
      setPeople(JSON.parse(storedPeople));
    } else {
      setPeople(mockPeople);
      localStorage.setItem('people', JSON.stringify(mockPeople));
    }
  }, []);

  useEffect(() => {
    const filtered = people.filter(person =>
      person.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.cpf.includes(searchTerm) ||
      person.idFacial.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPeople(filtered);
  }, [searchTerm, people]);

  const handleEdit = (person: Person) => {
    navigate('/person-register', { state: { person, editMode: true } });
  };

  const confirmDelete = (person: Person) => {
    setPersonToDelete(person);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!personToDelete) return;

    const updatedPeople = people.filter(p => p.id !== personToDelete.id);
    setPeople(updatedPeople);
    localStorage.setItem('people', JSON.stringify(updatedPeople));
    
    toast({
      title: "Pessoa removida",
      description: `${personToDelete.nome} foi removido com sucesso.`,
    });
    
    setDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getRegimeVariant = (regime: string) => {
    switch (regime.toLowerCase()) {
      case 'regime aberto':
        return 'default';
      case 'regime semiaberto':
        return 'secondary';
      case 'regime fechado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pessoas Cadastradas</h1>
          <p className="text-muted-foreground">Gerencie as pessoas registradas no sistema</p>
        </div>
        <Button 
          onClick={() => navigate('/person-register')}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Pessoa
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Lista de Pessoas</CardTitle>
          <CardDescription>
            {filteredPeople.length} pessoa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou ID Facial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Facial</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Vara</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhuma pessoa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-mono text-sm">{person.idFacial}</TableCell>
                      <TableCell className="font-medium">{person.nome}</TableCell>
                      <TableCell>{formatCPF(person.cpf)}</TableCell>
                      <TableCell>{person.vara}</TableCell>
                      <TableCell>
                        <Badge variant={getRegimeVariant(person.regime)}>
                          {person.regime}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.isActive ? "default" : "secondary"}>
                          {person.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.hasPhoto ? "outline" : "destructive"}>
                          {person.hasPhoto ? 'Com foto' : 'Sem foto'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(person.dataCadastro), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(person)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDelete(person)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{personToDelete?.nome}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonList;