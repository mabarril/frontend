import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
}
