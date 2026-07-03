import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
        {
            path: "login",
            component:Login
        },
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
        },
        {
          path:"students",
          loadComponent: () => import("../app/pages/student-page/student-page").then(c => c.StudentPage)
        },
        {
          path:"students/add",
          loadComponent: () => import("../app/pages/add-student/add-student").then(c => c.AddStudent)
        },
        {
          path:"students/:id/edit",
          loadComponent: () => import("../app/pages/add-student/add-student").then(c => c.AddStudent)
        },
        {
          path:"students/:id",
          loadComponent: () => import("../app/pages/student-detail/student-detail").then(c => c.StudentDetail)
        },
        {
          path: "attendance",
          loadComponent: () => import("../app/pages/attendance/attendance").then(c => c.Attendance)
        },
        {
          path: "complaints",
          loadComponent: () => import("../app/pages/complaints/complaints").then(c => c.Complaints)
        },
        {
          path: "permissions",
          loadComponent: () => import("../app/pages//permissions/permissions").then(c => c .PermissionComponent)
        },
        {
          path: "attendance-records",
          loadComponent: () => import("../app/pages/record/record").then(c => c.AttendanceComponent)
        },
        {
          path: "late-arrivals",
          loadComponent: () => import("../app/pages/late/late").then(c => c.LateComponent)
        },
        {
          path: "violations",
          loadComponent: () => import("../app/pages/violations/violations").then(c => c.ViolationsComponent)
        },
    ]
  }
];
