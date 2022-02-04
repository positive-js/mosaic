import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DemoMosaicModule } from '../mosaic.module';
// tslint:disable-next-line:no-import-side-effect
import '../polyfills';

import { MosaicDocsExample } from './mosaic-docs-example';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        DemoMosaicModule,
        ReactiveFormsModule
    ],
    declarations: [MosaicDocsExample],
    bootstrap: [MosaicDocsExample],
    providers: []
})
export class AppModule {
}
