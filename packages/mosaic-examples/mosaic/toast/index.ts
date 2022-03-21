import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { MC_TOAST_CONFIG, McToastModule, McToastPosition, McToastService } from '@ptsecurity/mosaic/toast';

import { ToastOverviewExample } from './toast-overview/toast-overview-example';


export {
    ToastOverviewExample
};

const EXAMPLES = [
    ToastOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McButtonModule,
        McToastModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    providers: [
        McToastService,
        {
            provide: MC_TOAST_CONFIG,
            useValue: {
                position: McToastPosition.TOP_RIGHT,
                duration: 3000
            }
        }
    ]
})
export class ToastExamplesModule {}
