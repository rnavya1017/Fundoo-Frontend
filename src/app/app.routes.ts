import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { notesRoutes } from './features/notes/notes.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  ...authRoutes,
  ...notesRoutes,

  {
    path: '**',
    redirectTo: 'login'
  }

];