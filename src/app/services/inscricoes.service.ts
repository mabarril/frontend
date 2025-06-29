import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InscricoesService {
  private apiUrl = '/api';
  constructor(private http: HttpClient) { }

  getInscricoesDoEvento(eventoId: number) {
    return this.http.get(`${this.apiUrl}/inscricoes/evento/${eventoId}`);
  }

  deletarInscricao(inscricaoId: number) {
    return this.http.delete(`${this.apiUrl}/inscricoes/${inscricaoId}`);
  }
}
