'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Webcam from 'react-webcam'
import imageCompression from 'browser-image-compression'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Camera, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { AnimatedButton } from '../ui/animated-button'
import { motion } from 'framer-motion'

const pessoaSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório'),
  rg: z.string().min(1, 'RG é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  contato1: z.string().min(1, 'Pelo menos um contato é obrigatório'),
})

type PessoaFormData = z.infer<typeof pessoaSchema>

export default function PessoaForm() {
  const [ativo, setAtivo] = useState(true)
  const [capturedImage, setCapturedImage] = useState<string | null>(null) // Base64
  const [compressedFile, setCompressedFile] = useState<File | null>(null) // Arquivo comprimido
  const [openCamera, setOpenCamera] = useState(false)

  const webcamRef = useRef<Webcam>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PessoaFormData>({
    resolver: zodResolver(pessoaSchema),
  })

  // Utilitário: converter base64 para File
  const base64ToFile = async (base64: string, filename: string): Promise<File> => {
    const res = await fetch(base64)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
  }

  // Captura da webcam
  const capturePhoto = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        const file = await base64ToFile(imageSrc, 'captura.jpg')

        const compressed = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 600,
          useWebWorker: true,
        })

        const compressedBase64 = await imageCompression.getDataUrlFromFile(compressed)

        setCapturedImage(compressedBase64)
        setCompressedFile(compressed)

        setOpenCamera(false)
        toast.success('Foto capturada com sucesso!')
      }
    }
  }

  // Upload local
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      })

      const compressedBase64 = await imageCompression.getDataUrlFromFile(compressed)

      setCapturedImage(compressedBase64)
      setCompressedFile(compressed)

      toast.success('Foto carregada com sucesso!')
    }
  }

  // Enviar dados + foto para API
  const enviarParaAPI = async () => {
    if (!capturedImage) {
      toast.error('Nenhuma foto capturada!');
      return;
    }

    try {
      // Converter base64 para Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('foto', blob, 'foto.jpg');

      const apiResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) throw new Error('Erro ao enviar foto');

      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      toast.error('Erro ao enviar foto');
    }
  };

  const onSubmit = (data: PessoaFormData) => {
    console.log('Dados do formulário:', data)
    toast.success('Pessoa cadastrada com sucesso!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Status e ID Facial */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="ativo">Ativo</Label>
        </div>
        <div>
          <Label htmlFor="idFacial">ID Facial</Label>
          <Input id="idFacial" value="AUTO_GENERATED" disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="dataCadastro">Data Cadastro</Label>
          <Input
            id="dataCadastro"
            value={new Date().toLocaleDateString('pt-BR')}
            disabled
            className="bg-gray-50"
          />
        </div>
      </motion.div>

      {/* Dados Básicos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nomeCompleto">Nome Completo *</Label>
          <Input
            id="nomeCompleto"
            {...register('nomeCompleto')}
            placeholder="Digite o nome completo"
          />
          {errors.nomeCompleto && (
            <p className="text-sm text-red-600 mt-1">{errors.nomeCompleto.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contato1">Contato 1 *</Label>
          <Input
            id="contato1"
            {...register('contato1')}
            placeholder="Digite o contato principal"
          />
          {errors.contato1 && (
            <p className="text-sm text-red-600 mt-1">{errors.contato1.message}</p>
          )}
        </div>
      </motion.div>

      {/* Documentos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <Card>
        <CardHeader>
          <CardTitle>Foto</CardTitle>
          <CardDescription>Capture ou faça upload da foto da pessoa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
            <AnimatedButton type="button" variant="outline" onClick={() => setOpenCamera(true)} className="w-full sm:w-auto">
              <Camera className="h-4 w-4 mr-2" />
              Capturar
            </AnimatedButton>
            <AnimatedButton type="button" variant="outline" asChild className="w-full sm:w-auto">
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2 inline" />
                Procurar
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </AnimatedButton>
          </motion.div>

          {/* Webcam */}
          {openCamera && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-4 space-y-2 flex flex-col items-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full max-w-sm h-auto rounded-lg"
              />
              <AnimatedButton type="button" onClick={capturePhoto} className="w-full sm:w-auto">
                Tirar Foto
              </AnimatedButton>
            </motion.div>
          )}

          {/* Preview */}
          {capturedImage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-4 flex justify-center">
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square relative rounded-lg overflow-hidden">
                <Image src={capturedImage} alt="Preview" width={400} height={400} className="object-cover w-full h-full" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row gap-4">
        <AnimatedButton type="submit" className="w-full sm:flex-1">
          Salvar Cadastro
        </AnimatedButton>
        <AnimatedButton
          type="button"
          variant="outline"
          className="w-full sm:flex-1 bg-blue-900"
          disabled={!compressedFile}
          onClick={enviarParaAPI}
        >
          Enviar dados para Leitor Facial
        </AnimatedButton>
      </motion.div>
    </form>
  )
}
