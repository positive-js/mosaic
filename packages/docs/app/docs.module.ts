import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { MainLayoutModule } from './components/main-layout/main-layout.module';

import { CompComponent, CompModule, HomepageComponent, HomepageModule } from './containers';

import { DocsComponent } from './docs.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,

        RouterModule.forRoot([
            { path: '', component: HomepageComponent, pathMatch: 'full' },
            {
                path: 'docs',
                component: MainLayoutComponent,
                children: [
                    {path: '', redirectTo: 'components', pathMatch: 'full'},

                    {   path: 'components', component: CompComponent }

                ]
            },
            {path: '**', redirectTo: ''}
        ]),

        HomepageModule,
        CompModule,
        MainLayoutModule
    ],
    declarations: [DocsComponent],
    providers: [

        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        }
    ],
    bootstrap: [DocsComponent]
})
export class AppModule {}
