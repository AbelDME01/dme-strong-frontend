import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: 'home',   canActivate: [authGuard], loadComponent: () => import('./features/home/pages/home-a/home-a.component').then(m => m.HomeAComponent) },
  { path: 'home-b', canActivate: [authGuard], loadComponent: () => import('./features/home/pages/home-b/home-b.component').then(m => m.HomeBComponent) },
  {
    path: 'routines',
    canActivate: [authGuard],
    children: [
      { path: '',        loadComponent: () => import('./features/routines/pages/routines/routines.component').then(m => m.RoutinesComponent) },
      { path: 'builder', loadComponent: () => import('./features/routines/pages/builder/builder.component').then(m => m.BuilderComponent) },
    ],
  },
  {
    path: 'workout',
    canActivate: [authGuard],
    children: [
      { path: 'active', loadComponent: () => import('./features/workout/pages/active-workout/active-workout.component').then(m => m.ActiveWorkoutComponent) },
    ],
  },
  {
    path: 'history',
    canActivate: [authGuard],
    children: [
      { path: '',             loadComponent: () => import('./features/history/pages/history/history.component').then(m => m.HistoryComponent) },
      { path: 'exercise/:id', loadComponent: () => import('./features/history/pages/exercise-detail/exercise-detail.component').then(m => m.ExerciseDetailComponent) },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      { path: '',     loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'edit', loadComponent: () => import('./features/profile/pages/edit-profile/edit-profile.component').then(m => m.EditProfileComponent) },
    ],
  },
  { path: 'stats',      redirectTo: '/history', pathMatch: 'full' },
  { path: 'dashboard',  canActivate: [authGuard], loadComponent: () => import('./features/dashboard/pages/web-dashboard/web-dashboard.component').then(m => m.WebDashboardComponent) },
  { path: '**', redirectTo: '/auth/login' },
];
