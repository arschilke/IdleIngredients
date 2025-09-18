import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-manager/order-manager').then(m => m.OrderManagerComponent)
  },
  {
    path: 'resources',
    loadComponent: () => import('./features/resources/resource-manager/resource-manager').then(m => m.ResourceManagerComponent)
  },
  {
    path: 'trains',
    loadComponent: () => import('./features/trains/train-manager/train-manager').then(m => m.TrainManagerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
