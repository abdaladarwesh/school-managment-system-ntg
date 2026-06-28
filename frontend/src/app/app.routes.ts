import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    children: [
        {
            path: "",
            component:Login
        }
    ]
  },
  {
    path: "",
    component: DashboardLayout,
    children: [
        {
            path: "dashboard",
            loadComponent: () => import("../app/pages/dashboard/dashboard").then(c => c.Dashboard)
        }
    ]
  }
];
