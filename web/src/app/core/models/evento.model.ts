import { RegraDevolucao } from './regra-devolucao.model';

export type EventoStatus = 'planejado' | 'inscricoes_abertas' | 'em_andamento' | 'concluido';

export interface Evento {
    id?: number;
    nome: string;
    data_inicio: string; // ISO DateTime
    data_fim: string; // ISO DateTime
    local: string;
    capacidade_maxima: number;
    status: EventoStatus;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEventoRequest {
    evento: Evento;
    regras_devolucao: RegraDevolucao[];
}
