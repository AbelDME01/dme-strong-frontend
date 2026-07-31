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
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: 'home',   loadComponent: () => import('./features/home/pages/home-a/home-a.component').then(m => m.HomeAComponent) },
      {
        path: 'routines',
        children: [
          { path: '',        loadComponent: () => import('./features/routines/pages/routines/routines.component').then(m => m.RoutinesComponent) },
          { path: 'builder', data: { hideTabBar: true }, loadComponent: () => import('./features/routines/pages/builder/builder.component').then(m => m.BuilderComponent) },
        ],
      },
      {
        path: 'workout',
        children: [
          { path: 'active', data: { hideTabBar: true }, loadComponent: () => import('./features/workout/pages/active-workout/active-workout.component').then(m => m.ActiveWorkoutComponent) },
        ],
      },
      {
        path: 'history',
        children: [
          { path: '',             loadComponent: () => import('./features/history/pages/history/history.component').then(m => m.HistoryComponent) },
          { path: 'exercise/:id', data: { hideTabBar: true }, loadComponent: () => import('./features/history/pages/exercise-detail/exercise-detail.component').then(m => m.ExerciseDetailComponent) },
          { path: 'workout/:id',  data: { hideTabBar: true }, loadComponent: () => import('./features/history/pages/workout-detail/workout-detail.component').then(m => m.WorkoutDetailComponent) },
        ],
      },
      {
        path: 'profile',
        children: [
          { path: '',     loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent) },
          { path: 'edit', data: { hideTabBar: true }, loadComponent: () => import('./features/profile/pages/edit-profile/edit-profile.component').then(m => m.EditProfileComponent) },
        ],
      },
      { path: 'stats',     redirectTo: 'history', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'home',    pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
