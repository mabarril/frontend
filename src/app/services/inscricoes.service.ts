import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InscricoesService {
  private apiUrl = 'localhost:21025/api';
  constructor(private http: HttpClient) { }

  getInscricoesDoEvento(eventoId: number) {
    return this.http.get(`${this.apiUrl}/inscricoes/evento/${eventoId}`);
  }

  deletarInscricao(inscricaoId: number) {
    return this.http.delete(`${this.apiUrl}/inscricoes/${inscricaoId}`);
  }

    // Enviar inscrição do convidado
  registrarInscricao(inscricao: any): Observable<any> {
    console.log('Inscrição:', inscricao);
    return this.http.post(`${this.apiUrl}/inscricoes`, inscricao);
  }

  // atualizar inscrição do convidado
  atualizarInscricao(id: number, registro: Registro): Observable<any> {  
    return this.http.put(`${this.apiUrl}/inscricoes/${id}`, registro);
  } 
}
