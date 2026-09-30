import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: Login,
  },

  {
    path: 'signup',
    component: Signup,
  },

  {
    path: 'forgot-password',
    component: ForgotPassword,
  },

  {
    path: 'reset-password',
    component: ResetPassword,
  },
];
