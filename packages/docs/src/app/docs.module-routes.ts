import { Routes } from '@angular/router';

import {
    ComponentApiComponent,
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './components/component-viewer/component-viewer.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { ComponentListComponent } from './containers';
import { ComponentCategoryList } from './containers/component-category-list/component-category-list.component';


export const APP_ROUTES: Routes = [
    { path: '', redirectTo: 'categories' , pathMatch: 'full' },
    { path: 'categories', redirectTo: '/components/categories' },

    {
        path: ':section',
        component: MainLayoutComponent,
        children: [
            {path: '', redirectTo: 'categories', pathMatch: 'full'},
            {path: 'component/:id', redirectTo: ':id', pathMatch: 'full'},
            {path: 'category/:id', redirectTo: '/categories/:id', pathMatch: 'full'},

            {
                path: 'categories',
                children: [
                    {path: '', component: ComponentCategoryList},
                    {path: ':id', component: ComponentListComponent}
                ]
            },

            {
                path: ':id',
                component: ComponentViewerComponent,
                children: [
                    {path: '', redirectTo: 'overview', pathMatch: 'full'},
                    {path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full'},
                    {path: 'api', component: ComponentApiComponent, pathMatch: 'full'},
                    {path: '**', redirectTo: 'overview'}
                ]
            }
        ]
    },
    {path: '**', redirectTo: ''}
];
