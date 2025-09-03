import { useState } from 'react';
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
import { Building2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

type CompanyFormData = z.infer<typeof companySchema>;

const CompanyRegister = () => {
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pj');

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
      
      toast({
        title: "Cadastro realizado",
        description: "CPMA cadastrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro ao cadastrar CPMA",
        variant: "destructive"
      });
    }
  };

  return (
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
                <Label htmlFor="uf">UF *</Label>
                <Select onValueChange={(value) => setValue('uf', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
          <Button type="submit" className="bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Cadastro
          </Button>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyRegister;