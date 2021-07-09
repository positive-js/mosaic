import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { McE2EApp } from './app.component';
import { AppRoutingModule } from './app.routing.module';


@NgModule({
    declarations: [McE2EApp],
    imports: [
        BrowserModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    bootstrap: [McE2EApp]
})
// tslint:disable-next-line:naming-convention
export class McE2EAppModule {}
