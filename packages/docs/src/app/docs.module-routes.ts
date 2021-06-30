import { Routes } from '@angular/router';


export const APP_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./containers/homepage/homepage.module').then((m) => m.HomepageModule)
    },
    {
        path: ':section',
        loadChildren: () =>
            import('./components/main-layout/main-layout.module').then((m) => m.MainLayoutModule)
    },
    { path: '**', redirectTo: '/404' }
];
