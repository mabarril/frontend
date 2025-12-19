import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evento, CreateEventoRequest } from '../models/evento.model';

@Injectable({
    providedIn: 'root'
})
export class EventoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/eventos`;

    getEventos(): Observable<Evento[]> {
        return this.http.get<Evento[]>(this.apiUrl);
    }

    getEvento(id: number): Observable<Evento> {
        return this.http.get<Evento>(`${this.apiUrl}/${id}`);
    }

    createEvento(request: CreateEventoRequest): Observable<Evento> {
        return this.http.post<Evento>(this.apiUrl, request);
    }

    updateEvento(id: number, request: CreateEventoRequest): Observable<Evento> {
        return this.http.put<Evento>(`${this.apiUrl}/${id}`, request);
    }

    deleteEvento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
