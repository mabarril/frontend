export interface UrlUnica {
    id?: number;
    inscricao_id: number;
    token: string;
    valido_ate: string; // DateTime
    created_at?: string;
    updated_at?: string;
}
