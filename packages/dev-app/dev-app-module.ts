import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '@ptsecurity/cdk/layout';

import { ButtonDemo } from './button/button-demo';
import { DatepickerDemo } from './datepicker/datepicker-demo';
import { DevAppComponent, DevAppHome, DevApp404 } from './dev-app';
import { InputDemo } from './input/input-demo';
import { DevAppMosaicModule } from './mosaic-module';
import { DEV_APP_ROUTES } from './routes';


@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        DevAppMosaicModule,

        FormsModule,
        HttpClientModule,
        LayoutModule,
        ReactiveFormsModule,
        RouterModule.forRoot(DEV_APP_ROUTES)
    ],
    declarations: [
        DevAppComponent,
        DevAppHome,
        DevApp404,

        ButtonDemo,
        InputDemo,
        DatepickerDemo
    ],
    providers: [],
    entryComponents: [],
    bootstrap: [DevAppComponent]
})
export class DevAppModule {
}
