import { Routes } from '@angular/router';


export const APP_ROUTES: Routes = [

    {
        path: ':section',
        loadChildren: () =>
            import('./components/main-layout/main-layout.module').then((m) => m.MainLayoutModule)
    },
    { path: '**', redirectTo: '/404' }
];
