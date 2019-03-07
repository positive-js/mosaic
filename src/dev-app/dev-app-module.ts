import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@ptsecurity/cdk/layout';

import { ButtonDemo } from './button/button-demo';
import { DevAppComponent, DevAppHome, DevApp404 } from './dev-app';
import { DevAppMosaicModule } from './mosaic-module';


@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        DevAppMosaicModule,

        FormsModule,
        HttpClientModule,
        LayoutModule,
        ReactiveFormsModule
        // RouterModule.forRoot(DEV_APP_ROUTES)
    ],
    declarations: [
        DevAppComponent,
        DevAppHome,
        DevApp404,

        ButtonDemo
    ],
    providers: [],
    entryComponents: [],
    bootstrap: [DevAppComponent]
})
export class DevAppModule {
}
