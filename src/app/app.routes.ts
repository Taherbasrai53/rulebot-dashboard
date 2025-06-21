import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/layout/pages/dashboard/dashboard.component';
import { RuleBuilderComponent } from './features/layout/pages/rule-builder/rule-builder.component';
import { SidebarComponent } from './features/layout/components/sidebar/sidebar.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: SidebarComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rule-builder', component: RuleBuilderComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
