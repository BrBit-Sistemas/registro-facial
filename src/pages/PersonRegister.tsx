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
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, apiTokenNull } from '@/utils/api';
import { geraStringAleatoria } from '@/utils/geraStringAleatoria';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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
  { value: '1', label: '1ª Vara Criminal' },
  { value: '2', label: '2ª Vara Criminal' },
  { value: '3', label: '3ª Vara Criminal' },
  { value: '4', label: 'Vara de Execuções Penais' },
];

const regimeList = [
  { value: 'aberto', label: 'Regime Aberto' },
  { value: 'semiaberto', label: 'Regime Semiaberto' },
  { value: 'fechado', label: 'Regime Fechado' },
  { value: 'provisorio', label: 'Prisão Provisória' },
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
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select value={value} onValueChange={(value) => setValue(name, value)}>
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

const PersonRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const personToEdit = location.state?.person || null;

  const [isActive, setIsActive] = useState(personToEdit?.isActive ?? true);
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


  useEffect(() => {
    setOpenL(true);
    if (editMode && personToEdit) {
      reset({
        nome: personToEdit.nome || '',
        cpf: personToEdit.cpf || '',
        rg: personToEdit.rg || '',
        dataNascimento: personToEdit.dataNascimento || '',
        sexo: personToEdit.sexo || '',
        vara: personToEdit.vara || '',
        regime: personToEdit.regime || '',
        naturalidade: personToEdit.Naturalidade || '',
        nacionalidade: personToEdit.nacionalidade || 'Brasileira',
        nomePai: personToEdit.Nome_Pai || '',
        nomeMae: personToEdit.Nome_Mae || '',
        cidade: personToEdit.cidade || '',
        uf: personToEdit.uf || '',
        contato1: personToEdit.Contato_1 || '',
        contato2: personToEdit.Contato_2 || '',
        processo: personToEdit.processo || '',
        motivoEncerramento: personToEdit.Motivo_Encerramento || '',
        dadosAdicionais: personToEdit.Dados_Adicionais || '',
        idFacial: personToEdit.idFacial || '',
        tipo_frequencia: personToEdit.tipo_frequencia || '',
        foto: personToEdit.Foto || null,
      });
      setIsActive(personToEdit.isActive);
      setCapturedImage(personToEdit.Foto || null);
    }
    setOpenL(false);
  }, [editMode, personToEdit, reset]);

  const onSubmit = async (data: PersonFormData) => {
    setOpenL(true);
    try {
      if (editMode && personToEdit) {
        await api.put(`pessoas/pessoas-list/`, {
          id: personToEdit.id,
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
          ID_usuario: JSON.parse(localStorage.getItem('user') || '{}').id,
          ID_CPMA_UNIDADE: JSON.parse(localStorage.getItem('id_cpma_unidade') || '1'),
        }).then((response) => {
          setOpenL(false);
          if (response.data.status !== 1) {
            toast({
              title: "Erro ao cadastrar pessoa",
              description: response.data.message,
            });
            throw new Error('Erro ao cadastrar pessoa');
          } else {
            setOpenL(false);
            toast({
              title: "Cadastro atualizado",
              description: "Pessoa atualizada com sucesso!",
            });
          }
        }).catch((error) => {
          setOpenL(false);
          toast({
            title: "Erro ao cadastrar pessoa",
            description: error,
          });
          throw new Error('Erro ao cadastrar pessoa');
        });
    
      } else {

        await api.post(`pessoas/pessoas-list/`, {
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
          ID_usuario: JSON.parse(localStorage.getItem('user') || '{}').id,
          ID_CPMA_UNIDADE: JSON.parse(localStorage.getItem('id_cpma_unidade') || '1'),
        }).then((response) => {
          if (response.data.status !== 1) {
            setOpenL(false);
            toast({
              title: "Erro ao cadastrar pessoa",
              description: response.data.message,
            });
            throw new Error('Erro ao cadastrar pessoa');
          } else {
            setOpenL(false);
            toast({
              title: "Cadastro realizado",
              description: "Pessoa cadastrada com sucesso!",
            });
          }
        }).catch((error) => {
            setOpenL(false);
          toast({
            title: "Erro ao cadastrar pessoa",
            description: error,
          });
          throw new Error('Erro ao cadastrar pessoa');
        });
      }
      navigate('/person-list');
    } catch (error) {
      setOpenL(false);
      toast({
        title: "Erro no cadastro",
        description: "Erro ao cadastrar pessoa",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowWebcam(false);
      toast({
        title: "Foto capturada",
        description: "Foto capturada com sucesso!",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        toast({
          title: "Foto carregada",
          description: "Foto carregada com sucesso!",
        });
      };
      reader.readAsDataURL(file);
    }
  };

 async function adicionarUsuario() {
    try {
        const response = await fetch('http://localhost:8081/SagepFRA/tasks.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "OPTION": "USUARIO_ADICIONAR",
                "DADOS": {
                    "FACE_ID": "1425",
                    "NOME": "WIlson"
                }
            }),
            // Adiciona credentials se necessário
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const resultado = await response.json();
        return resultado;
        
    } catch (error) {
        console.error('Falha na requisição:', error);
        throw error;
    }
}


  const sendToFacialReader = async() => {
    setOpenL(true);
    if (!capturedImage) {
      setOpenL(false);
      toast({
        title: "Erro",
        description: "Capture ou carregue uma foto primeiro",
        variant: "destructive"
      });
      return;
    }
    // Simula o envio da imagem para o leitor facial
    setTimeout(async() => {
      adicionarUsuario().then(data => console.log(data)).catch(error => console.error(error));
      setOpenL(false);
      toast({
        title: "Enviado",
        description: "Foto enviada para o leitor facial com sucesso!",
      });
    }, 2000);
    toast({
      title: "Enviando...",
      description: "Dados enviados para o leitor facial",
    });
  };

  return (
    <>
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
          variant="outline"
          onClick={() => navigate('/person-list')}
          className="flex items-center gap-2"
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
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
              <Label htmlFor="ativo">Pessoa Ativa</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idFacial">ID Facial</Label>
                <Input
                  id="idFacial"
                  value={personToEdit?.idFacial ? personToEdit?.idFacial : `${geraStringAleatoria(10)}`}
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
                value={watch('vara') || personToEdit?.vara || ''}
                />
              <RenderSelect
                label="Regime Penal *"
                name="regime"
                options={regimeList}
                error={errors.regime}
                setValue={setValue}
                placeholder="Selecione o regime"
                value={watch('regime') || personToEdit?.regime || ''}
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
                value={watch('sexo') || personToEdit?.sexo || ''}
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
                value={watch('uf') || personToEdit?.uf || ''}
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
                value={watch('tipo_frequencia') || personToEdit?.tipo_frequencia || ''}
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
                variant="outline"
                onClick={() => setShowWebcam(!showWebcam)}
                className="flex items-center gap-2"
                >
                <Camera className="h-4 w-4" />
                Capturar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
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
                variant="secondary"
                onClick={sendToFacialReader}
                className="flex items-center gap-2 ml-auto"
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
                  className="w-full max-w-md mx-auto rounded-lg"
                  />
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full max-w-md mx-auto block"
                  >
                  Capturar Foto
                </Button>
              </div>
            )}
            {capturedImage && !showWebcam && (
              <div className="flex justify-center">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="max-w-md rounded-lg shadow-md"
                  />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {editMode ?
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <User className="h-4 w-4 mr-2" />
              Atualizar Cadastro
            </Button> :
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              <User className="h-4 w-4 mr-2" />
              Salvar Cadastro
            </Button>
          }
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/person-list')}
            >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
    <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 5}}
        open={openL}
    >
        <CircularProgress color="inherit" /> Carregando...
    </Backdrop>
   </>
  );
};

export default PersonRegister;