import { Routes } from '@angular/router';

import {
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './components/component-viewer/component-viewer.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';


export const APP_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: ':id', redirectTo: ':id', pathMatch: 'full' },

            {
                path: ':id',
                component: ComponentViewerComponent,
                children: [
                    {path: '', redirectTo: 'overview', pathMatch: 'full'},
                    {path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full'},
                    {path: '**', redirectTo: 'overview'}
                ]
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
