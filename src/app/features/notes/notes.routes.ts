import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { Notes } from './pages/notes/notes';

export const notesRoutes: Routes = [
  { path: 'notes', component: Notes, canActivate: [authGuard] },
  { path: 'notes/reminders', component: Notes, canActivate: [authGuard] },
  { path: 'notes/archive', component: Notes, canActivate: [authGuard] },
  { path: 'notes/trash', component: Notes, canActivate: [authGuard] },
  { path: 'dashboard/notes', redirectTo: 'notes', pathMatch: 'full' }
];