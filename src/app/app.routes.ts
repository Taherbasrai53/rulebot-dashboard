import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/layout/pages/dashboard/dashboard.component';
import { RuleBuilderComponent } from './features/layout/pages/rule-builder/rule-builder.component';
import { SidebarComponent } from './features/layout/components/sidebar/sidebar.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: SidebarComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rule-builder', component: RuleBuilderComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
