import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ListaInscricao } from './components/lista-inscricao/lista-inscricao';
import { FormCadastro } from './components/form-cadastro/form-cadastro';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'lista-incricao', component: ListaInscricao },
  { path: 'registro', component: FormCadastro },
  { path: 'registro/:id', component: FormCadastro },
  { path: '**', redirectTo: '/dashboard' }
];

