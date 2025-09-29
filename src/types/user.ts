export type userType = {
    company_id: string;
    date_create: string;
    email: string;
    first_name: string;
    id: number;
    last_name: string;
}

export type companyType = {
    id: number;
    cnpj: string;
    dataInicioAtividade: string;
    razaoSocial: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone1: string;
    socios: string;
    inscricoesEstaduais: string;
    email: string;
}