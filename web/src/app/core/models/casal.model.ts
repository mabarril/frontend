import { Pessoa } from './pessoa.model';
import { Filho } from './filho.model';

export interface Casal {
    id?: number;
    data_casamento?: string; // YYYY-MM-DD
    endereco?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
    contato_emergencia_nome1?: string;
    contato_emergencia_telefone1?: string;
    contato_emergencia_nome2?: string;
    contato_emergencia_telefone2?: string;
    responsavel_filhos_nome?: string;
    responsavel_filhos_telefone?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string; // Soft delete

    // Relations (often returned by API in composite objects)
    esposo?: Pessoa;
    esposa?: Pessoa;
    pessoas?: Pessoa[];
    filhos?: Filho[];
}

// Interface for API Request payload (creating a couple)
export interface CreateCasalRequest {
    casal: Casal;
    pessoas: Pessoa[];
    filhos: Filho[];
}
