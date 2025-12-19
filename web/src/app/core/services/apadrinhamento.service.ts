import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Apadrinhamento } from '../models/apadrinhamento.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApadrinhamentoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/apadrinhamentos`;

    createApadrinhamento(inscricaoId: number, casalPadrinhoId: number): Observable<Apadrinhamento> {
        return this.http.post<Apadrinhamento>(this.apiUrl, {
            inscricao_id: inscricaoId,
            casal_padrinho_id: casalPadrinhoId
        });
    }

    getApadrinhamentosPorInscricao(inscricaoId: number): Observable<Apadrinhamento[]> {
        return this.http.get<Apadrinhamento[]>(`${this.apiUrl}/inscricao/${inscricaoId}`);
    }

    getApadrinhamentosPorPadrinho(casalId: number): Observable<Apadrinhamento[]> {
        return this.http.get<Apadrinhamento[]>(`${this.apiUrl}/padrinho/${casalId}`);
    }

    getApadrinhamento(id: number): Observable<Apadrinhamento> {
        return this.http.get<Apadrinhamento>(`${this.apiUrl}/${id}`);
    }

    deleteApadrinhamento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
