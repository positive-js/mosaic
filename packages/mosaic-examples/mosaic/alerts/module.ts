import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { AlertsOverviewExample } from './alerts-overview/alerts-overview-example';


const EXAMPLES = [
    AlertsOverviewExample
];

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McIconModule,
        McButtonModule,
        McLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class AlertsExamplesModule {
}
