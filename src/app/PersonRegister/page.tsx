'use client';
import DashboardLayout from "@/components/layout/DashboardLayout";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, Send, User, List } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { geraStringAleatoria } from '@/lib/geraStringAleatoria';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Person } from "../PersonList/page";
import { Suspense } from 'react';

const personSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
    rg: z.string().min(5, 'RG inválido'),
    dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    sexo: z.string().min(1, 'Sexo é obrigatório'),
    vara: z.string().min(1, 'Vara é obrigatória'),
    regime: z.string().min(1, 'Regime é obrigatório'),
    naturalidade: z.string().optional(),
    nacionalidade: z.string().optional(),
    nomePai: z.string().optional(),
    nomeMae: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    contato1: z.string().optional(),
    contato2: z.string().optional(),
    processo: z.string().optional(),
    motivoEncerramento: z.string().optional(),
    dadosAdicionais: z.string().optional(),
    idFacial: z.string().optional(),
    tipo_frequencia: z.string().optional(),
    foto: z.any().optional(),
});

const varaList = [
    { value: 'Vara Criminal 1', label: '1ª Vara Criminal' },
    { value: 'Vara Criminal 2', label: '2ª Vara Criminal' },
    { value: 'Vara Criminal 3', label: '3ª Vara Criminal' },
    { value: 'Vara de Execuções Penais', label: 'Vara de Execuções Penais' },
];

const regimeList = [
    { value: 'Aberto', label: 'Regime Aberto' },
    { value: 'Semiaberto', label: 'Regime Semiaberto' },
    { value: 'Fechado', label: 'Regime Fechado' },
    { value: 'Provisório', label: 'Prisão Provisória' },
];

const sexoList = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'O', label: 'Outro' },
];

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

const tipoFrequenciaList = [
    { value: '30', label: '30 - Mensal' },
    { value: '60', label: '60 - Bimestral' },
    { value: '90', label: '90 - Trimestral' },
    { value: '180', label: '180 - Semestral' },
    { value: '365', label: '365 - Anual' },
];

type PersonFormData = z.infer<typeof personSchema>;

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

function PersonRegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const personToEdit = useRef<Person>(null);
    const editMode = searchParams.get("editMode") === "true" ? true : false;

    const [isActive, setIsActive] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openL, setOpenL] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<PersonFormData>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            nome: '',
            cpf: '',
            rg: '',
            dataNascimento: '',
            sexo: '',
            vara: '',
            regime: '',
            naturalidade: '',
            nacionalidade: 'Brasileira',
            nomePai: '',
            nomeMae: '',
            cidade: '',
            uf: '',
            contato1: '',
            contato2: '',
            processo: '',
            motivoEncerramento: '',
            dadosAdicionais: '',
            idFacial: '',
            tipo_frequencia: '',
            foto: null,
        }
    });

    function convertBufferToDataURLSafe(bufferObj: { type: string; data: number[] }): string {
        const dataPhoto = bufferObj?.data ? bufferObj?.data : "";
        try {
            const dataURL = Buffer.from(dataPhoto).toString('utf8');
            return dataURL;

        } catch (error) {
            console.error('Erro na conversão:', error);
            return '';
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const editingPerson = sessionStorage.getItem("editingPerson");
            if (editingPerson) {
                try {
                    const parsed = JSON.parse(editingPerson);
                    personToEdit.current = parsed;

                    // Reset do formulário com os dados da pessoa
                    if (editMode && parsed) {
                        const formData = {
                            nome: parsed.nome || '',
                            cpf: parsed.cpf?.replace(/\W/g, '') || '',
                            rg: parsed.rg?.replace(/\W/g, '') || '',
                            dataNascimento: parsed.dataNascimento || '',
                            sexo: parsed.sexo || '',
                            vara: parsed.vara || '',
                            regime: parsed.regime || '',
                            naturalidade: parsed.Naturalidade || '',
                            nacionalidade: parsed.Nacionalidade || 'Brasileira',
                            nomePai: parsed.Nome_Pai || '',
                            nomeMae: parsed.Nome_Mae || '',
                            cidade: parsed.cidade || '',
                            uf: parsed.uf || '',
                            contato1: parsed.Contato_1 || '',
                            contato2: parsed.Contato_2 || '',
                            processo: parsed.processo || '',
                            motivoEncerramento: parsed.Motivo_Encerramento || '',
                            dadosAdicionais: parsed.Dados_Adicionais || '',
                            idFacial: parsed.idFacial || '',
                            tipo_frequencia: parsed.tipo_frequencia || '',
                            foto: parsed.Foto || null,
                        };

                        reset(formData);

                        // Garantir que os campos de seleção sejam definidos
                        if (parsed.sexo) setValue('sexo', parsed.sexo);
                        if (parsed.vara) setValue('vara', parsed.vara);
                        if (parsed.regime) setValue('regime', parsed.regime);
                        if (parsed.uf) setValue('uf', parsed.uf);
                        if (parsed.tipo_frequencia) setValue('tipo_frequencia', parsed.tipo_frequencia);

                        const dataPhoto = convertBufferToDataURLSafe(parsed.Foto || null);

                        setIsActive(parsed.isActive || false);
                        setCapturedImage(dataPhoto);
                    }
                } catch (e) {
                    console.error("Erro ao parsear editingPerson:", e);
                }
            }

        }
    }, [editMode, reset, setValue, watch]);


    const onSubmit = async (data: PersonFormData) => {
        setOpenL(true);
        try {
            if (editMode) {
                const payload = {
                    id: personToEdit.current?.id,
                    Nome: data.nome,
                    CPF: data.cpf,
                    RG: data.rg,
                    Data_Nascimento: data.dataNascimento,
                    Sexo: data.sexo,
                    Vara: data.vara,
                    Regime: data.regime,
                    Naturalidade: data.naturalidade,
                    Nacionalidade: data.nacionalidade,
                    Nome_Pai: data.nomePai,
                    Nome_Mae: data.nomeMae,
                    Cidade: data.cidade,
                    UF: data.uf,
                    Contato_1: data.contato1,
                    Contato_2: data.contato2,
                    Processo: data.processo,
                    Motivo_Encerramento: data.motivoEncerramento,
                    Dados_Adicionais: data.dadosAdicionais,
                    tipo_frequencia: data.tipo_frequencia,
                    Status: isActive ? "Ativo" : "Inativo",
                    Foto: capturedImage ? capturedImage : null,
                    Prontuario: '',
                    ID_usuario: JSON.parse(sessionStorage.getItem('user') || '{}').id,
                    ID_CPMA_UNIDADE: JSON.parse(sessionStorage.getItem('cpma_unidade') || '{"id": "1"}').id,
                };
                try {
                    await api.put(`api/pessoa`, payload).then((response) => {
                        setOpenL(false);
                        if (response.data.status !== 1) {
                            toast.info("Erro ao atualizado pessoa");
                            throw new Error('Erro ao atualizado pessoa');
                        } else {
                            setOpenL(false);
                            toast.info("Cadastro atualizado");
                        }
                    }).catch(() => {
                        setOpenL(false);
                        toast.info("Erro ao atualizado pessoa");
                        throw new Error('Erro ao cadastrar pessoa');
                    });
                } catch (e) {
                    setOpenL(false);
                    toast.info("Erro ao atualizado pessoa");
                    console.error("Erro ao parsear sessionStorage user:", e);
                }

            } else {
                const payload = {
                    Nome: data.nome,
                    CPF: data.cpf,
                    RG: data.rg,
                    Data_Nascimento: data.dataNascimento,
                    Sexo: data.sexo,
                    Vara: data.vara,
                    Regime: data.regime,
                    Naturalidade: data.naturalidade,
                    Nacionalidade: data.nacionalidade,
                    Nome_Pai: data.nomePai,
                    Nome_Mae: data.nomeMae,
                    Cidade: data.cidade,
                    UF: data.uf,
                    Contato_1: data.contato1,
                    Contato_2: data.contato2,
                    Processo: data.processo,
                    Motivo_Encerramento: data.motivoEncerramento,
                    Dados_Adicionais: data.dadosAdicionais,
                    idFacial: geraStringAleatoria(10),
                    tipo_frequencia: data.tipo_frequencia,
                    Status: isActive ? "Ativo" : "Inativo",
                    Foto: capturedImage ? capturedImage : null,
                    Prontuario: '',
                    ID_usuario: JSON.parse(sessionStorage.getItem('user') || '{}').id,
                    ID_CPMA_UNIDADE: JSON.parse(sessionStorage.getItem('cpma_unidade') || '{"id": "1"}').id,
                };

                await api.post(`api/pessoa`, payload).then((response) => {
                    if (response.data.status !== 1) {
                        setOpenL(false);
                        toast.info("Erro ao cadastrar pessoa");
                        throw new Error('Erro ao cadastrar pessoa');
                    } else {
                        setOpenL(false);
                        toast.info("Cadastro realizado");
                    }
                }).catch(() => {
                    setOpenL(false);
                    toast.info("Erro ao cadastrar pessoa");
                    throw new Error('Erro ao cadastrar pessoa');
                });
            }
            router.push('/PersonList');
        } catch {
            setOpenL(false);
            toast.info("Erro no cadastro");
        }
    };

    const capturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setShowWebcam(false);
            toast.success("Foto capturada com sucesso!");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                toast.success("Foto carregada com sucesso!");
            };
            reader.readAsDataURL(file);
        }
    };

    async function adicionarUsuario() {
        const ipFacial = JSON.parse(sessionStorage.getItem('cpma_unidade') || '{"ip_facial": "http://localhost"}').ip_facial

        if (!watch('idFacial')) {
            toast.info("Salve o cadastro para gerar um ID Facial antes de enviar a foto!");
            return;
        }
        
        const jsonPayload = {
            UserList: [
                {
                    UserID: watch('idFacial'),
                    UserName: watch('nome'),
                    UserType: 0,
                    UseTime: 200,
                    IsFirstEnter: false,
                    FirstEnterDoors: [0, 1],
                    UserStatus: 0,
                    Authority: 1,
                    CitizenIDNo: "123456789012345678",
                    Password: watch('idFacial'),
                    Doors: [0],
                    TimeSections: [255],
                    SpecialDaysSchedule: [255],
                    ValidFrom: "2019-01-02 00:00:00",
                    ValidTo: "2037-01-02 01:00:00",
                    ipFacial: ipFacial
                }
            ]
        };

        try {
            const response = await fetch("/api/facial-recognition/insert-multi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // 👈 importante
                },
                body: JSON.stringify(jsonPayload), // 👈 precisa serializar
            });

            if (!response.ok) {
                setOpenL(false);

                toast.info("Error, foto não foi enviada!");
                return;
            }
            toast.success("Foto enviada com sucesso!");
            const resultado = response;
            return resultado;

        } catch (err) {
            setOpenL(false);
            console.error('Falha na requisição:', err);
            throw err;
        }
    }

    async function adicionarFotoUsuario() {
        const ipFacial = JSON.parse(sessionStorage.getItem('cpma_unidade') || '{"ip_facial": "http://localhost"}').ip_facial
        const formData = new FormData();
        
        if (!watch('idFacial')) {
            toast.info("Salve o cadastro para gerar um ID Facial antes de enviar a foto");
            return;
        }

        const jsonPayload = {
            ipFacial: ipFacial,
            UserID: watch('idFacial'),
            Info: {
                UserName: watch('nome'),
                PhotoData: capturedImage?.replace(/^data:image\/\w+;base64,/, '')
            }
        };

        formData.append('data', JSON.stringify(jsonPayload));

        try {
            const response = await fetch('/api/facial-recognition/update', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                setOpenL(false);

                toast.info("Foto não enviada!");
                return;
            }
            toast.success("Foto enviada com sucesso!");
            const resultado = response;
            return resultado;

        } catch (err) {
            setOpenL(false);
            toast.info("Foto não enviada!");
            console.error('Falha na requisição:', err);
            throw err;
        }
    }

    const sendToFacialReader = async () => {

        if (!watch('idFacial')) {
            toast.info("Salve o cadastro para gerar um ID Facial antes de enviar a foto");
            return;
        }

        setOpenL(true);
        if (!capturedImage) {
            setOpenL(false);
            toast.info("Capture ou carregue uma foto primeiro");
            return;
        }
        await adicionarUsuario();
        await adicionarFotoUsuario();
        //await liberarUsuario();
        setOpenL(false);
        toast.success("Foto enviada para o leitor facial com sucesso!");
    };

    const viewList = () => {
        sessionStorage.removeItem('editingPerson');
        personToEdit.current = null;
        router.push('/PersonList')
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {editMode ? 'Editar Pessoa' : 'Cadastro de Pessoas'}
                        </h1>
                        <p className="text-muted-foreground">
                            {editMode ? 'Atualize os dados da pessoa' : 'Registre novas pessoas no sistema'}
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => viewList()}
                        className="bg-gradient-primary text-white hover:opacity-90"
                    >
                        <List className="h-4 w-4" />
                        Ver Lista
                    </Button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                            <CardDescription>Dados básicos da pessoa</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ativo"
                                    checked={isActive}
                                    onCheckedChange={(checked: boolean | "indeterminate") => setIsActive(checked as boolean)}
                                />
                                <Label htmlFor="ativo">Pessoa Ativa</Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="idFacial">ID Facial</Label>
                                    <Input
                                        id="idFacial"
                                        value={watch('idFacial') ? watch('idFacial') : `${geraStringAleatoria(10)}`}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataCadastro">Data de Cadastro</Label>
                                    <Input
                                        id="dataCadastro"
                                        value={format(new Date(), 'dd/MM/yyyy')}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <RenderSelect
                                    label="Vara *"
                                    name="vara"
                                    options={varaList}
                                    error={errors.vara}
                                    setValue={setValue}
                                    placeholder="Selecione a vara"
                                    value={watch('vara')}
                                />
                                <RenderSelect
                                    label="Regime Penal *"
                                    name="regime"
                                    options={regimeList}
                                    error={errors.regime}
                                    setValue={setValue}
                                    placeholder="Selecione o regime"
                                    value={watch('regime')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input id="nome" {...register('nome')} />
                                {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <RenderSelect
                                    label="Sexo *"
                                    name="sexo"
                                    options={sexoList}
                                    error={errors.sexo}
                                    setValue={setValue}
                                    placeholder="Selecione o sexo"
                                    value={watch('sexo')}
                                />
                                <div className="space-y-2">
                                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                                    <Input
                                        id="dataNascimento"
                                        type="date"
                                        {...register('dataNascimento')}
                                    />
                                    {errors.dataNascimento && <p className="text-sm text-destructive">{errors.dataNascimento.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG *</Label>
                                    <Input id="rg" {...register('rg')} />
                                    {errors.rg && <p className="text-sm text-destructive">{errors.rg.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF *</Label>
                                    <Input
                                        id="cpf"
                                        {...register('cpf')}
                                        placeholder="00000000000"
                                        maxLength={11}
                                    />
                                    {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="naturalidade">Naturalidade</Label>
                                    <Input id="naturalidade" {...register('naturalidade')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nacionalidade">Nacionalidade</Label>
                                    <Input id="nacionalidade" {...register('nacionalidade')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input id="cidade" {...register('cidade')} />
                                </div>
                                <RenderSelect
                                    label="UF"
                                    name="uf"
                                    options={UFList}
                                    error={errors.uf}
                                    setValue={setValue}
                                    placeholder="Selecione a UF"
                                    value={watch('uf')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomePai">Nome do Pai</Label>
                                    <Input id="nomePai" {...register('nomePai')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nomeMae">Nome da Mãe</Label>
                                    <Input id="nomeMae" {...register('nomeMae')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contato1">Contato 1</Label>
                                    <Input id="contato1" {...register('contato1')} placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contato2">Contato 2</Label>
                                    <Input id="contato2" {...register('contato2')} placeholder="(00) 00000-0000" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="processo">Processo</Label>
                                    <Input id="processo" {...register('processo')} />
                                </div>
                                <RenderSelect
                                    label="Frequência"
                                    name="tipo_frequencia"
                                    options={tipoFrequenciaList}
                                    error={errors.tipo_frequencia}
                                    setValue={setValue}
                                    placeholder="Selecione a frequência"
                                    value={watch('tipo_frequencia')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivoEncerramento">Motivo de Encerramento</Label>
                                <Textarea id="motivoEncerramento" {...register('motivoEncerramento')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dadosAdicionais">Dados Adicionais</Label>
                                <Textarea id="dadosAdicionais" {...register('dadosAdicionais')} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Captura de Foto</CardTitle>
                            <CardDescription>Capture ou carregue uma foto da pessoa</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowWebcam(!showWebcam)}
                                    className="bg-gradient-primary text-white hover:opacity-90"
                                >
                                    <Camera className="h-4 w-4" />
                                    Capturar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gradient-primary text-white hover:opacity-90"
                                >
                                    <Upload className="h-4 w-4" />
                                    Procurar
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    onClick={sendToFacialReader}
                                    className="flex items-center gap-2 ml-auto bg-gradient-primary text-white hover:opacity-90"
                                >
                                    <Send className="h-4 w-4" />
                                    Enviar para Leitor Facial
                                </Button>
                            </div>
                            {showWebcam && (
                                <div className="space-y-4">
                                    <Webcam
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full max-w-md mx-auto rounded-lg "
                                    />
                                    <Button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="w-full max-w-md mx-auto block bg-gradient-primary text-white hover:opacity-90"
                                    >
                                        Capturar Foto
                                    </Button>
                                </div>
                            )}
                            {capturedImage && !showWebcam && (
                                <div className="flex justify-center">
                                    <Image
                                        src={capturedImage}
                                        alt="Foto capturada"
                                        width={400}
                                        height={300}
                                        className="max-w-md rounded-lg shadow-md"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        {editMode ?
                            <Button type="submit" className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90">
                                <User className="h-4 w-4 mr-2" />
                                Atualizar Cadastro
                            </Button> :
                            <Button type="submit" className="bg-gradient-primary flex items-center gap-2 ml-auto bg-gradient-primary text-white hover:opacity-90">
                                <User className="h-4 w-4 mr-2" />
                                Salvar Cadastro
                            </Button>
                        }
                        <Button
                            type="button"
                            className="bg-gradient-primary bg-gradient-primary text-white hover:opacity-90"
                            onClick={() => viewList()}
                        >
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

export default function PersonRegisterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PersonRegisterContent />
        </Suspense>
    );
}