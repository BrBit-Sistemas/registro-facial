'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { request } from "@/services/request-api/request";
import UrlParamsService from "@/urlParams/UrlParamsService";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const companySchema = z.object({
    tipo: z.enum(['pf', 'pj']),
    razaoSocial: z.string().min(3, 'Razão Social deve ter pelo menos 3 caracteres'),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
    ie: z.string().optional(),
    endereco: z.string().min(5, 'Endereço é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(2, 'Bairro é obrigatório'),
    proximo: z.string().optional(),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    uf: z.string().min(2, 'UF é obrigatório'),
    contato: z.string().min(8, 'Contato é obrigatório'),
    email: z.string().email('Email inválido').optional(),
    site: z.string().url('URL inválida').optional().or(z.literal('')),
    dadosAdicionais: z.string().optional(),
});

const UFList = [
    { value: 'AC', label: 'AC - Acre' },
    { value: 'AL', label: 'AL - Alagoas' },
    { value: 'AP', label: 'AP - Amapá' },
    { value: 'AM', label: 'AM - Amazonas' },
    { value: 'BA', label: 'BA - Bahia' },
    { value: 'CE', label: 'CE - Ceará' },
    { value: 'DF', label: 'DF - Distrito Federal' },
    { value: 'ES', label: 'ES - Espírito Santo' },
    { value: 'GO', label: 'GO - Goiás' },
    { value: 'MA', label: 'MA - Maranhão' },
    { value: 'MT', label: 'MT - Mato Grosso' },
    { value: 'MS', label: 'MS - Mato Grosso do Sul' },
    { value: 'MG', label: 'MG - Minas Gerais' },
    { value: 'PA', label: 'PA - Pará' },
    { value: 'PB', label: 'PB - Paraíba' },
    { value: 'PR', label: 'PR - Paraná' },
    { value: 'PE', label: 'PE - Pernambuco' },
    { value: 'PI', label: 'PI - Piauí' },
    { value: 'RJ', label: 'RJ - Rio de Janeiro' },
    { value: 'RN', label: 'RN - Rio Grande do Norte' },
    { value: 'RS', label: 'RS - Rio Grande do Sul' },
    { value: 'RO', label: 'RO - Rondônia' },
    { value: 'RR', label: 'RR - Roraima' },
    { value: 'SC', label: 'SC - Santa Catarina' },
    { value: 'SP', label: 'SP - São Paulo' },
    { value: 'SE', label: 'SE - Sergipe' },
    { value: 'TO', label: 'TO - Tocantins' },
];

type PersonFormData = z.infer<typeof companySchema>;

function RenderSelect({
    label,
    name,
    options,
    error,
    setValue,
    placeholder = "Selecione...",
    value,
}: {
    label: string;
    name: keyof PersonFormData;
    options: { value: string; label: string }[];
    error?: { message?: string };
    setValue: (name: keyof PersonFormData, value: string) => void;
    placeholder?: string;
    value?: string;
}) {
    return (
        <div className="space-y-2 ">
            <Label htmlFor={name}>{label}</Label>
            <Select
                
               value={value} onValueChange={(newValue) => {
                // Ignorar onValueChange com string vazia se já temos um valor
                if (newValue === "" && value && value !== "") {
                    return;
                }
                setValue(name, newValue);
            }}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
    );
}

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyRegisterPage() {
    const [entityType, setEntityType] = useState<'pf' | 'pj'>('pj');
    const urlParams = useMemo(() => new UrlParamsService(), []);
    const [openL, setOpenL] = useState(false);
    const idCompany = useRef('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            tipo: 'pj'
        }
    });

    const onSubmit = async (data: CompanyFormData) => {
        try {
            console.log('Company data:', data);

            toast.success("CPMA cadastrado com sucesso!");
        } catch {
            toast.info("Erro ao cadastrar CPMA");
        }
    };

    const getCompanyData = (async () => {
        const valueUrl = {
            companyId: idCompany.current
        };
        const params = urlParams.injectUrlParams(valueUrl);

        setOpenL(true);
        try {
                const { data, status } = await request.get( `api/company${params}`);
                if (status === 200) {

                   console.log('Company data:', data);
                    
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
    })

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
        getCompanyData();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Cadastro CPMA</h1>
                    <p className="text-muted-foreground">Cadastro de Pessoas e Materiais</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Tipo de Cadastro</CardTitle>
                            <CardDescription>Selecione o tipo de entidade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                defaultValue="pj"
                                onValueChange={(value) => {
                                    setEntityType(value as 'pf' | 'pj');
                                    setValue('tipo', value as 'pf' | 'pj');
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pf" id="pf" />
                                    <Label htmlFor="pf">Pessoa Física</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pj" id="pj" />
                                    <Label htmlFor="pj">Pessoa Jurídica</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>
                                {entityType === 'pj' ? 'Dados da Empresa' : 'Dados Pessoais'}
                            </CardTitle>
                            <CardDescription>
                                {entityType === 'pj' ? 'Informações da pessoa jurídica' : 'Informações da pessoa física'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="razaoSocial">
                                        {entityType === 'pj' ? 'Razão Social' : 'Nome Completo'} *
                                    </Label>
                                    <Input id="razaoSocial" {...register('razaoSocial')} />
                                    {errors.razaoSocial && <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">
                                        {entityType === 'pj' ? 'CNPJ' : 'CPF'} *
                                    </Label>
                                    <Input
                                        id="cnpj"
                                        {...register('cnpj')}
                                        placeholder={entityType === 'pj' ? '00000000000000' : '00000000000'}
                                        maxLength={entityType === 'pj' ? 14 : 11}
                                    />
                                    {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
                                </div>
                            </div>

                            {entityType === 'pj' && (
                                <div className="space-y-2">
                                    <Label htmlFor="ie">Inscrição Estadual</Label>
                                    <Input id="ie" {...register('ie')} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="endereco">Endereço *</Label>
                                <Input id="endereco" {...register('endereco')} />
                                {errors.endereco && <p className="text-sm text-destructive">{errors.endereco.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input id="complemento" {...register('complemento')} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bairro">Bairro *</Label>
                                    <Input id="bairro" {...register('bairro')} />
                                    {errors.bairro && <p className="text-sm text-destructive">{errors.bairro.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proximo">Ponto de Referência</Label>
                                <Input id="proximo" {...register('proximo')} placeholder="Próximo a..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade *</Label>
                                    <Input id="cidade" {...register('cidade')} />
                                    {errors.cidade && <p className="text-sm text-destructive">{errors.cidade.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <RenderSelect
                                        label="UF"
                                        name="uf"
                                        options={UFList}
                                        error={errors.uf}
                                        setValue={setValue}
                                        placeholder="Selecione a UF"
                                        value={watch('uf')}
                                    />
                                    {errors.uf && <p className="text-sm text-destructive">{errors.uf.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contato">Contato *</Label>
                                    <Input
                                        id="contato"
                                        {...register('contato')}
                                        placeholder="(00) 00000-0000"
                                    />
                                    {errors.contato && <p className="text-sm text-destructive">{errors.contato.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="email@exemplo.com"
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                                </div>
                            </div>

                            {entityType === 'pj' && (
                                <div className="space-y-2">
                                    <Label htmlFor="site">Site</Label>
                                    <Input
                                        id="site"
                                        {...register('site')}
                                        placeholder="https://www.exemplo.com"
                                    />
                                    {errors.site && <p className="text-sm text-destructive">{errors.site.message}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="dadosAdicionais">Dados Adicionais</Label>
                                <Textarea
                                    id="dadosAdicionais"
                                    {...register('dadosAdicionais')}
                                    placeholder="Informações complementares..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" className="bg-gradient-primary text-white hover:opacity-90">
                            <Save className="h-4 w-4 mr-2" />
                              Atualizar Cadastro
                        </Button>
                        <Button type="button" 
                                className="bg-gradient-primary text-white hover:opacity-90">
                            Cancelar
                        </Button>
                    </div>
                </form>
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