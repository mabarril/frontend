import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackBar = inject(MatSnackBar);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'Ocorreu um erro inesperado.';

            if (error.error instanceof ErrorEvent) {
                // Client side error
                message = error.error.message;
            } else {
                // Server side error
                if (error.status === 0) {
                    message = 'Erro de conexão com o servidor.';
                } else if (error.status === 401) {
                    message = 'Sessão expirada ou não autorizado.';
                } else if (error.status === 403) {
                    message = 'Acesso negado.';
                } else if (error.status === 404) {
                    message = 'Recurso não encontrado.';
                } else if (error.error && error.error.message) {
                    message = error.error.message;
                } else if (typeof error.error === 'string') {
                    message = error.error;
                }
            }

            snackBar.open(message, 'Fechar', {
                duration: 5000,
                panelClass: ['error-snackbar'],
                horizontalPosition: 'end',
                verticalPosition: 'top'
            });

            return throwError(() => error);
        })
    );
};
