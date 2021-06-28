import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { AlertsOverviewExample } from './alerts-overview/alerts-overview-example';


export {
    AlertsOverviewExample
};

const EXAMPLES = [
    AlertsOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McIconModule,
        McButtonModule,
        McLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    entryComponents: EXAMPLES
})
export class AlertsExamplesModule {
}
