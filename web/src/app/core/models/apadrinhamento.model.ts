import { Inscricao } from './inscricao.model';
import { Casal } from './casal.model';

export interface Apadrinhamento {
    id?: number;
    inscricao_id: number;
    casal_padrinho_id: number;
    created_at?: string;
    updated_at?: string;

    // Expanded
    inscricao?: Inscricao;
    casal_padrinho?: Casal;
}
