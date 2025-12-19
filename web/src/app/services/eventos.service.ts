import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const EVENTO_KEY = 'eventoSelecionadoId';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = '/api';
  constructor(private http: HttpClient) { }

  getEventos() {
    return this.http.get(`${this.apiUrl}/eventos`);
  }
  getEventosById(id: number) {
    return this.http.get(`${this.apiUrl}/eventos/${id}`);
  }
  createEvento(evento: any) {
    return this.http.post(`${this.apiUrl}/eventos`, evento);
  }



  setEventoSelecionado(id: number) {
    sessionStorage.setItem(EVENTO_KEY, id.toString());
  }

  getEventoSelecionado(): number | null {
    const valor = sessionStorage.getItem(EVENTO_KEY);
    return valor ? Number(valor) : null;
  }

  limparEventoSelecionado() {
    sessionStorage.removeItem(EVENTO_KEY);
  }
}
