import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }  from '@angular/router';

import { HomeComponent } from './+home/index';
import { GameComponent } from './+game/index';

const appRoutes: Routes = [
   {
    path: '',
    component: HomeComponent
  },
{
    path: 'game/:id',
    component: GameComponent
  },
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
