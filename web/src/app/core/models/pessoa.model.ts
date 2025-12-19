export type TipoPessoa = 'esposo' | 'esposa';
export type Religiao = 'católica' | 'evangélica' | 'espírita' | 'judaica' | 'islâmica' | 'budista' | 'outra' | 'sem religião';
export type DietaAlimentar = 'não' | 'ovolactovegetariano' | 'vegetariano' | 'vegano';

export interface Pessoa {
    id?: number;
    casal_id?: number;
    tipo: TipoPessoa;
    nome_completo: string;
    nome_social?: string;
    data_nascimento: string; // YYYY-MM-DD
    profissao?: string;
    email?: string;
    celular?: string;
    rg?: string;
    rg_emissor?: string;
    cpf?: string;
    problema_saude?: boolean;
    problema_saude_descricao?: string;
    medicamento_especial?: boolean;
    medicamento_especial_descricao?: string;
    diabetico?: boolean;
    dieta_alimentar?: DietaAlimentar;
    religiao?: Religiao;
    created_at?: string;
    updated_at?: string;
}
