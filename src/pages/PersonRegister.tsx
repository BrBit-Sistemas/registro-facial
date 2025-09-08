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
});

type PersonFormData = z.infer<typeof personSchema>;

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
  const [idPessao, setIdPessoa] = useState<string | null>(null);

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
      nacionalidade: 'Brasileira'
    }
  });

  console.log('watch',personToEdit);

  useEffect(() => {
    if (editMode && personToEdit) {
      setIdPessoa(personToEdit.id);
      reset({
        nome: personToEdit.nome,
        cpf: personToEdit.cpf,
        rg: personToEdit.rg,
        dataNascimento: personToEdit.dataNascimento,
        sexo: personToEdit.sexo,
        vara: personToEdit.vara,
        regime: personToEdit.regime,
        cidade: personToEdit.cidade,
        uf: personToEdit.uf,
        idFacial: personToEdit.idFacial,
        processo: personToEdit.processo,
        nacionalidade: personToEdit.nacionalidade,
        naturalidade: personToEdit.Naturalidade,
        nomePai: personToEdit.Nome_Pai,
        nomeMae: personToEdit.Nome_Mae,
        contato1: personToEdit.Contato_1,
        contato2: personToEdit.Contato_2,
        motivoEncerramento: personToEdit.Motivo_Encerramento,
        dadosAdicionais: personToEdit.Dados_Adicionais,
        tipo_frequencia: personToEdit.tipo_frequencia,

      });
      setIsActive(personToEdit.isActive);
    }
  }, [editMode, personToEdit, reset]);

  const onSubmit = async (data: PersonFormData) => {
    try {
      const people = JSON.parse(localStorage.getItem('people') || '[]');
      
      if (editMode && personToEdit) {
        // Update existing person
        const updatedPeople = people.map((p: any) => 
          p.id === personToEdit.id 
            ? { ...personToEdit, ...data, isActive, hasPhoto: !!capturedImage }
            : p
        );
        localStorage.setItem('people', JSON.stringify(updatedPeople));
        
        toast({
          title: "Cadastro atualizado",
          description: "Pessoa atualizada com sucesso!",
        });
      } else {
        // Add new person
        const newPerson = {
          id: Date.now().toString(),
          idFacial: `${Date.now()}`,
          ...data,
          isActive,
          dataCadastro: format(new Date(), 'yyyy-MM-dd'),
          hasPhoto: !!capturedImage
        };
        people.push(newPerson);
        localStorage.setItem('people', JSON.stringify(people));
        
        toast({
          title: "Cadastro realizado",
          description: "Pessoa cadastrada com sucesso!",
        });
      }
      
      navigate('/person-list');
    } catch (error) {
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

  const sendToFacialReader = () => {
    if (!capturedImage) {
      toast({
        title: "Erro",
        description: "Capture ou carregue uma foto primeiro",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Enviando...",
      description: "Dados enviados para o leitor facial",
    });
  };

  return (
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idFacial">ID Facial</Label>
                <Input 
                  id="idFacial" 
                  {...register('idFacial')} 
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vara">Vara *</Label>
                <Select onValueChange={(value) => setValue('vara', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a vara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1vara">1ª Vara Criminal</SelectItem>
                    <SelectItem value="2vara">2ª Vara Criminal</SelectItem>
                    <SelectItem value="3vara">3ª Vara Criminal</SelectItem>
                    <SelectItem value="vep">Vara de Execuções Penais</SelectItem>
                  </SelectContent>
                </Select>
                {errors.vara && <p className="text-sm text-destructive">{errors.vara.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regime">Regime Penal *</Label>
                <Select onValueChange={(value) => setValue('regime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Regime Aberto</SelectItem>
                    <SelectItem value="semiaberto">Regime Semiaberto</SelectItem>
                    <SelectItem value="fechado">Regime Fechado</SelectItem>
                    <SelectItem value="provisorio">Prisão Provisória</SelectItem>
                  </SelectContent>
                </Select>
                {errors.regime && <p className="text-sm text-destructive">{errors.regime.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input id="nome" {...register('nome')} />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select onValueChange={(value) => setValue('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && <p className="text-sm text-destructive">{errors.sexo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input id="naturalidade" {...register('naturalidade')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input id="nacionalidade" {...register('nacionalidade')} />
              </div>
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
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register('cidade')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Select onValueChange={(value) => setValue('uf', value)} >
                  <SelectTrigger >
                    <SelectValue placeholder="UF" {...register('uf')}/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="AP">AP</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="DF">DF</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="PB">PB</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="PI">PI</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="RO">RO</SelectItem>
                    <SelectItem value="RR">RR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="SE">SE</SelectItem>
                    <SelectItem value="TO">TO</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="space-y-2">
                <Label htmlFor="tipo_frequencia">Frequência</Label>
                <Select onValueChange={(value) => setValue('uf', value)} {...register('tipo_frequencia')}>
                  <SelectTrigger>
                    <SelectValue placeholder="30	Mensal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          <Button type="submit" className="bg-gradient-primary hover:opacity-90">
            <User className="h-4 w-4 mr-2" />
            {editMode ? 'Atualizar Cadastro' : 'Salvar Cadastro'}
          </Button>
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
  );
};

export default PersonRegister;