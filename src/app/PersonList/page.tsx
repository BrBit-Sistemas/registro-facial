'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { request } from "@/services/request-api/request";
import UrlParamsService from "@/urlParams/UrlParamsService";
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
import { api } from '@/lib/api';

export interface Person {
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
    Prontuario: string;
    Naturalidade: string;
    Nacionalidade: string;
    Nome_Pai: string;
    Nome_Mae: string;
    Contato_1: string;
    Contato_2: string;
    tipo_frequencia: string;
    Motivo_Encerramento: string;
    Dados_Adicionais: string;
    Foto: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

export default function PersonListPage() {
    const router = useRouter();
    const [people, setPeople] = useState<Person[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
    const idCompany = useRef('');
    const urlParams = new UrlParamsService();

    const [openL, setOpenL] = useState(false);

    const getPessoas = async () => {
        
        const valueUrl = {
            companyId: idCompany.current,
            description: searchTerm,
        };
        const params = urlParams.injectUrlParams(valueUrl);

        setOpenL(true);
        
        try {
        const {data, status} = await request.get<ApiResponse<any>>(`api/pessoa${params}`);
        console.log(data?.data);
       // await new Promise(resolve => setTimeout(resolve, 1000));
        if (status === 200) {
            setPeople(data?.data.map((item: any) => ({
                id: item.id,
                idFacial: item.id_facial,
                nome: item.nome_completo,
                cpf: item.cpf,
                rg: item.rg,
                dataNascimento: item.data_nascimento.split("T")[0],
                sexo: item.sexo,
                vara: item.vara,
                regime: item.regime_penal,
                cidade: item.cidade,
                uf: item.uf,
                processo: item.processo,
                isActive: item.status === "Ativo" ? true : false,
                dataCadastro: item.data_cadastro.split("T")[0],
                hasPhoto: item.foto ? true : false,
                Prontuario: item.prontuario,
                Naturalidade: item.naturalidade,
                Nacionalidade: item.nacionalidade,
                Nome_Pai: item.nome_pai,
                Nome_Mae: item.nome_mae,
                Contato_1: item.contato_1,
                Contato_2: item.contato_2,
                tipo_frequencia: item.tipo_frequencia,
                Motivo_Encerramento: item.motivo_encerramento,
                Dados_Adicionais: item.dados_adicionais,
                Foto: item.foto
            })));
            setFilteredPeople(data.data.map((item: any) => ({
                id: item.id,
                idFacial: item.id_facial,
                nome: item.nome_completo,
                cpf: item.cpf,
                rg: item.rg,
                dataNascimento: item.data_nascimento.split("T")[0],
                sexo: item.sexo,
                vara: item.vara,
                regime: item.regime_penal,
                cidade: item.cidade,
                uf: item.uf,
                processo: item.processo,
                isActive: item.status === "Ativo" ? true : false,
                dataCadastro: item.data_cadastro.split("T")[0],
                hasPhoto: item.foto ? true : false,
                Prontuario: item.prontuario,
                Naturalidade: item.naturalidade,
                Nacionalidade: item.nacionalidade,
                Nome_Pai: item.nome_pai,
                Nome_Mae: item.nome_mae,
                Contato_1: item.contato_1,
                Contato_2: item.contato_2,
                tipo_frequencia: item.tipo_frequencia,
                Motivo_Encerramento: item.motivo_encerramento,
                Dados_Adicionais: item.dados_adicionais,
                Foto: item.foto
            })));
            
            toast.info("Listagem de pessoas ok!");
            setOpenL(false);
        }else{
            setOpenL(false);
            toast.info("Não foi possível encontrar dados!");
        }
        } catch (e) {
                console.error("Erro ao parsear idComp:", e);
                setOpenL(false);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            let cpma = JSON.parse(sessionStorage.getItem('cpma_unidade') || '{}').id
            const idComp = cpma;
        if (idComp) {
            try {
                const parsed = JSON.parse(idComp);
                idCompany.current = parsed;
                console.log(parsed);
            } catch (e) {
                console.error("Erro ao parsear idComp:", e);
            }
        }
    }
    },[]); 

    useEffect(() => {
        getPessoas();
    }, []);

    useEffect(() => {

        const filtered = people.filter(person =>
            (person.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredPeople(filtered ? filtered : []);
    }, [searchTerm, people]);

    const handleEdit = (person: Person) => {
        //router.push('/person-register', { state: { person, editMode: true } });
        sessionStorage.setItem("editingPerson", JSON.stringify(person));
        router.push("/PersonRegister?editMode=true");
    };

    // const confirmDelete = (person: Person) => {
    //     setPersonToDelete(person);
    //     setDeleteDialogOpen(true);
    // };

    const handleDelete = async () => {
        if (!personToDelete) return;

        setOpenL(true);
        await api.delete(`pessoas/pessoas-list/${personToDelete.id}/`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOpenL(false);

        toast.info(`${personToDelete.nome} foi removido com sucesso.`,);
        getPessoas();

        setDeleteDialogOpen(false);
        setPersonToDelete(null);
    };

    const formatCPF = (cpf?: string) => {
    if (!cpf) return "—"; // ou pode retornar vazio
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const getRegimeVariant = (regime?: string) => {
    if (!regime) return 'outline'; // fallback padrão
    
    switch (regime.toLowerCase()) {
        case 'aberto':
        return 'default';
        case 'semiaberto':
        return 'secondary';
        case 'fechado':
        return 'destructive';
        default:
        return 'outline';
    }
    };


    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Pessoas Cadastradas</h1>
                        <p className="text-muted-foreground">Gerencie as pessoas registradas no sistema</p>
                    </div>
                    <Button
                        onClick={() => router.push('/PersonRegister')}
                        className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90"
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
                                    placeholder="Buscar por nome..."
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
                                        <TableRow key="no-data">
                                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                                Nenhuma pessoa encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPeople.map((person, index) => (
                                            <TableRow key={index}>
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
                                                <TableCell>{format(new Date(person.dataCadastro || '2000-01-01'), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(person)}
                                                            className=" text-emerald-500 hover:opacity-90"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {/* <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => confirmDelete(person)}
                                                            className="text-red-400 hover:opacity-90"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button> */}
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
                    <AlertDialogContent
                        className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90"
                    >
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription
                             className="text-white"
                            >
                                Tem certeza que deseja excluir <strong>{personToDelete?.nome}</strong>?
                                Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel 
                              className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90"
                            >Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-gradient-primary bg-gradient-primary text-white-500 hover:opacity-90"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 5 }}
                open={openL}
            >
                <CircularProgress color="inherit" /> Carregando...
            </Backdrop>
        </DashboardLayout>
    );
}