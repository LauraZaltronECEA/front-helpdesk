import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './features/layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/components/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/components/register.component').then(c => c.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/components/forgot-password.component').then(c => c.ForgotPasswordComponent) },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'tickets', loadComponent: () => import('./features/tickets/components/ticket-list.component').then(c => c.TicketListComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./features/tickets/pages/ticket-detail.page').then(c => c.TicketDetailPage) },
      { path: 'users', loadComponent: () => import('./features/users/pages/user-list.page').then(c => c.UserListPage) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
