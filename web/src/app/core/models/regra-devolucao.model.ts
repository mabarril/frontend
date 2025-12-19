export interface RegraDevolucao {
    id?: number;
    evento_id?: number;
    data_limite: string; // YYYY-MM-DD
    percentual_devolucao: number;
    created_at?: string;
    updated_at?: string;
}
