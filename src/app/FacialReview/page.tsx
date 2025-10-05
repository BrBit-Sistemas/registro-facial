'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScanFace, Check, X, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { request } from "@/services/request-api/request";
import UrlParamsService from "@/urlParams/UrlParamsService";
import { FacialReadingsResponse } from "@/types/FacialReadingsResponse";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

interface ApiResponse<T> {
    data: T;
    status: number;
}

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

export default function FacialReviewPage() {
    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [dateFilterStart, setDateFilterStart] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateFilterEnd, setDateFilterEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [userFilter, setUserFilter] = useState('');
    const idCompany = useRef('');
    const urlParams = useMemo(() => new UrlParamsService(), []);
    const [openL, setOpenL] = useState(false);

    const [readings, setReadings] = useState<FacialReading[]>([]);

    const handleApprove = (id: string) => {
        setReadings(readings.map(reading =>
            reading.id === id ? { ...reading, status: 'approved' as const } : reading
        ));
        toast.info("Leitura facial aprovada com sucesso!");
    };

    const handleReject = (id: string) => {
        setReadings(readings.map(reading =>
            reading.id === id ? { ...reading, status: 'rejected' as const } : reading
        ));
        toast.info("Leitura facial rejeitada.");
    };

const filteredReadings = useMemo(() => {
    const filtered = readings.filter(reading => {
        const readingDate = new Date(
            reading.date.split('/').reverse().join('-') // "dd/MM/yyyy" -> "yyyy-MM-dd"
        );
        const startDate = dateFilterStart ? new Date(dateFilterStart) : null;
        const endDate = dateFilterEnd ? new Date(dateFilterEnd) : null;

        const matchesDate = !startDate || readingDate >= startDate;
        const matchesDateRange = !endDate || readingDate <= endDate;
        const matchesUser = !userFilter ||
            reading.personName.toLowerCase().includes(userFilter.toLowerCase()) ||
            reading.personCode.toLowerCase().includes(userFilter.toLowerCase());
        return matchesDate && matchesDateRange && matchesUser;
    });
    return filtered;
}, [readings, dateFilterStart, dateFilterEnd, userFilter]);

    // Paginação dos dados filtrados
    const totalPages = Math.max(1, Math.ceil(filteredReadings.length / itemsPerPage));
    const paginatedReadings = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return filteredReadings.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredReadings, currentPage, itemsPerPage]);

    const getStatusBadge = (status: FacialReading['status']) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-lime-600 text-white">Aprovado</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejeitado</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pendente</Badge>;
        }
    };

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 90) {
            return <Badge className="bg-lime-600 text-white">{confidence.toFixed(1)}%</Badge>;
        } else if (confidence >= 75) {
            return <Badge variant="secondary">{confidence.toFixed(1)}%</Badge>;
        } else {
            return <Badge variant="destructive">{confidence.toFixed(1)}%</Badge>;
        }
    };

    const stats = useMemo(() => ({
        total: filteredReadings.length,
        pending: filteredReadings.filter(r => r.status === 'pending').length,
        approved: filteredReadings.filter(r => r.status === 'approved').length,
        rejected: filteredReadings.filter(r => r.status === 'rejected').length,
    }), [filteredReadings]);

    const getFacialReadings = useCallback(async () => {
        setOpenL(true);
        if (!idCompany.current) {
            toast.error("ID da empresa não encontrado. Faça login novamente.");
            setOpenL(false);
            return;
        }
        setReadings([]);
        // Construir os parâmetros da URL
        const valueUrl = {
            companyId: idCompany.current,
            description: userFilter,
        };
        const params = urlParams.injectUrlParams(valueUrl);

            try {
                const { data, status } = await request.get<ApiResponse<FacialReadingsResponse[]>>( `api/facial-readings${params}`);
                if (status === 200) {

                    const filteredData = await Promise.all(data.data.map(async item => ({
                        id: String(item.id),
                        personName: item.nome.trim(),
                        personCode: item.prontuario.trim(),
                        date: format(new Date(item.data_leitura), 'dd/MM/yyyy'),
                        time: item.hora_leitura,
                        status: 'approved',
                        confidence: 95.5,
                    })));
                    
                   setReadings(filteredData as FacialReading[]);
                    setOpenL(false);

                    toast.success("Lista de leitura biometrica!");
                } else {
                    setOpenL(false);
                    toast.error("Erro ao carregar lista de leitura biometrica");
                }
            } catch (error) {
                setOpenL(false);
                console.error(error);
        }
    }, [urlParams, userFilter]);
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const cpmaData = sessionStorage.getItem('cpma_unidade');

                if (cpmaData) {
                    const parsed = JSON.parse(cpmaData);

                    if (parsed && parsed.id) {
                        idCompany.current = parsed.id;
                    } else {
                        toast.error("Dados da empresa não encontrados. Faça login novamente.");
                    }
                } else {
                    toast.error("Dados da empresa não encontrados. Faça login novamente.");
                }
            } catch {
                toast.error("Erro ao carregar dados da empresa. Faça login novamente.");
            }
        }
        getFacialReadings();
        // console.log('readings', readings);
    }, [getFacialReadings]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Revisão de Leituras Faciais</h1>
                    <p className="text-muted-foreground">Aprove ou rejeite leituras faciais do sistema</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex justify-between">
                                <ScanFace/>
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600 flex justify-between">
                                <ScanFace/>
                                {stats.pending}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-lime-600 flex justify-between">
                                <ScanFace/>
                                {stats.approved}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 flex justify-between">
                                <ScanFace/>
                                {stats.rejected}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>Filtre as leituras por data e usuário</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Input
                                type="date"
                                value={dateFilterStart}
                                onChange={(e) => setDateFilterStart(e.target.value)}
                                className="max-w-xs"
                            />
                            <Input
                                type="date"
                                value={dateFilterEnd}
                                onChange={(e) => setDateFilterEnd(e.target.value)}
                                className="max-w-xs"
                            />
                            <Input
                                placeholder="Buscar por nome ou código..."
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="flex-1"
                            />
                            <Button 
                                onClick={getFacialReadings}
                                type="button"
                                className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Leituras Faciais</CardTitle>
                        <CardDescription>Lista de leituras para revisão</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Controles de paginação */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span>Itens por página:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={e => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >Anterior</button>
                                <span>Página {currentPage} de {totalPages}</span>
                                <button
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >Próxima</button>
                            </div>
                        </div>
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
                                {paginatedReadings.length === 0 ? 
                                    <TableRow key="no-data">
                                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                                            Nenhuma lista de leituras para revisão encontrada
                                        </TableCell>
                                    </TableRow> 
                                : paginatedReadings.map((reading) => (
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
                                                    type="button"
                                                    variant="outline"
                                                    className="border-transparent text-blue-500 relative transform rounded-lg bg-gradient-to-r hover:bg-transparent hover:text-emerald-500/50 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                                                    size="icon"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {reading.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="border-transparent text-emerald-500 relative transform rounded-lg bg-gradient-to-r hover:bg-transparent hover:text-emerald-500/50 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                                                            size="icon"
                                                            onClick={() => handleApprove(reading.id)}
                                                            title="Aprovar"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="border-transparent text-red-500 relative transform rounded-lg bg-gradient-to-r hover:bg-transparent hover:text-emerald-500/50 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                                                            size="icon"
                                                            onClick={() => handleReject(reading.id)}
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
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 5 }}
                open={openL}
            >
                <CircularProgress color="inherit" /> Carregando...
            </Backdrop>
        </DashboardLayout>
    );
}