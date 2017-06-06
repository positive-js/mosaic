import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const ROUTES: Routes = [
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    }
];

const ROUTER_CONFIG = { useHash: false };


export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES, ROUTER_CONFIG);
