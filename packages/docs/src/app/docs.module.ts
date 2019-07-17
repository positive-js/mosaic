import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ExampleModule } from '@ptsecurity/mosaic-examples';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { MainLayoutModule } from './components/main-layout/main-layout.module';
import { ComponentListModule, ComponentListComponent, HomepageComponent, HomepageModule } from './containers';
import { ComponentCategoryList } from './containers/component-category-list/component-category-list.component';
import { ComponentCategoryListModule } from './containers/component-category-list/component-category-list.module';
import {
    ComponentApiComponent,
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './containers/component-viewer/component-viewer.component';
import { ComponentViewerModule } from './containers/component-viewer/component-viewer.module';
import { DocsComponent } from './docs.component';
import { DocumentationItems } from './shared/documentation-items/documentation-items';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ExampleModule,

        RouterModule.forRoot([
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
        ]),

        HomepageModule,
        ComponentListModule,
        ComponentViewerModule,
        ComponentCategoryListModule,
        MainLayoutModule
    ],
    declarations: [DocsComponent],
    providers: [
        DocumentationItems,
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        }
    ],
    bootstrap: [DocsComponent]
})
export class AppModule {}
