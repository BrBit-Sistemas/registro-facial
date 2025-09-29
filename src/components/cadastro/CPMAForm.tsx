'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';

const pessoaSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório'),
  rg: z.string().min(1, 'RG é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  contato1: z.string().min(1, 'Pelo menos um contato é obrigatório'),
});

type PessoaFormData = z.infer<typeof pessoaSchema>;

export default function PessoaForm() {
  const [ativo, setAtivo] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PessoaFormData>({
    resolver: zodResolver(pessoaSchema),
  });

  const onSubmit = (data: PessoaFormData) => {
    console.log('Dados do formulário:', data);
    toast.success('Pessoa cadastrada com sucesso!');
  };

  const handleCapturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsCameraOpen(false);
        toast.success('Foto capturada com sucesso!');
      }
    }
  };

  const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      toast.success('Foto carregada com sucesso!');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Status e ID Facial */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="rounded" />
          <Label htmlFor="ativo">Ativo</Label>
        </div>
        <div>
          <Label htmlFor="idFacial">ID Facial</Label>
          <Input id="idFacial" value="AUTO_GENERATED" disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="dataCadastro">Data Cadastro</Label>
          <Input id="dataCadastro" value={new Date().toLocaleDateString('pt-BR')} disabled className="bg-gray-50" />
        </div>
      </motion.div>

      {/* Dados Básicos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nomeCompleto">Nome Completo *</Label>
          <Input id="nomeCompleto" {...register('nomeCompleto')} placeholder="Digite o nome completo" />
          {errors.nomeCompleto && <p className="text-sm text-red-600 mt-1">{errors.nomeCompleto.message}</p>}
        </div>
        <div>
          <Label htmlFor="contato1">Contato 1 *</Label>
          <Input id="contato1" {...register('contato1')} placeholder="Digite o contato principal" />
          {errors.contato1 && <p className="text-sm text-red-600 mt-1">{errors.contato1.message}</p>}
        </div>
      </motion.div>

      {/* Documentos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rg">RG *</Label>
          <Input id="rg" {...register('rg')} placeholder="Digite o RG" />
          {errors.rg && <p className="text-sm text-red-600 mt-1">{errors.rg.message}</p>}
        </div>
        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input id="cpf" {...register('cpf')} placeholder="Digite o CPF" />
          {errors.cpf && <p className="text-sm text-red-600 mt-1">{errors.cpf.message}</p>}
        </div>
      </motion.div>

      {/* Captura de Foto */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>Foto</CardTitle>
            <CardDescription>Capture pela webcam ou faça upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setIsCameraOpen(!isCameraOpen)}>
                <Video className="h-4 w-4 mr-2" />
                {isCameraOpen ? 'Fechar câmera' : 'Abrir câmera'}
              </Button>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Procurar
              </Button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUploadPhoto} className="hidden" />
            </div>

            {/* Webcam ao vivo */}
            {isCameraOpen && (
              <div className="flex flex-col items-center space-y-4">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg border w-64 h-48" />
                <Button type="button" onClick={handleCapturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Foto
                </Button>
              </div>
            )}

            {/* Preview da foto */}
            {capturedImage && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="mt-4">
                <div className="w-32 h-32 relative border rounded-lg overflow-hidden">
                  <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Botões de Ação */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex space-x-4">
        <Button type="submit" className="flex-1">Salvar Cadastro</Button>
        <Button type="button" variant="outline" className="flex-1" disabled={!capturedImage}>
          Enviar dados para Leitor Facial
        </Button>
      </motion.div>
    </form>
  );
}
