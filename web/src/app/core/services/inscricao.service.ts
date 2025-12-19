import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
    Inscricao,
    CreateInscricaoRequest,
    CancelarInscricaoRequest
} from '../models/inscricao.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InscricaoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inscricoes`;

    getInscricoes(): Observable<Inscricao[]> {
        return this.http.get<Inscricao[]>(this.apiUrl);
    }

    getInscricoesPorEvento(eventoId: number): Observable<Inscricao[]> {
        return this.http.get<Inscricao[]>(`${this.apiUrl}/evento/${eventoId}`);
    }

    getInscricoesPorCasal(casalId: number): Observable<Inscricao[]> {
        return this.http.get<Inscricao[]>(`${this.apiUrl}/casal/${casalId}`);
    }

    getInscricao(id: number): Observable<Inscricao> {
        return this.http.get<Inscricao>(`${this.apiUrl}/${id}`);
    }

    createInscricao(request: CreateInscricaoRequest): Observable<Inscricao> {
        return this.http.post<Inscricao>(this.apiUrl, request);
    }

    updateInscricao(id: number, request: CreateInscricaoRequest): Observable<Inscricao> {
        return this.http.put<Inscricao>(`${this.apiUrl}/${id}`, request);
    }

    cancelarInscricao(id: number, request: CancelarInscricaoRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/cancelar`, request);
    }

    deleteInscricao(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
