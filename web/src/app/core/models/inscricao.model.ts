import { Casal } from './casal.model';
import { Evento } from './evento.model';

export type TipoParticipante = 'encontrista' | 'convidado';
export type InscricaoStatus = 'confirmada' | 'cancelada';

export interface Inscricao {
    id?: number;
    casal_id: number;
    evento_id: number;
    tipo_participante: TipoParticipante;
    data_inscricao?: string; // DateTime
    status?: InscricaoStatus;
    data_desistencia?: string; // DateTime
    valor_devolvido?: number;
    observacoes?: string;
    created_at?: string;
    updated_at?: string;

    // Expanded relations
    casal?: Casal;
    evento?: Evento;
}

export interface CreateInscricaoRequest {
    inscricao: Inscricao;
    gerar_url?: boolean;
}

export interface CancelarInscricaoRequest {
    data_desistencia: string;
    valor_devolvido: number;
    observacoes: string;
}
