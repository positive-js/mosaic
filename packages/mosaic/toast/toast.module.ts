import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McToastOutlet, McToastContainerComponent } from './toast-container.component';
import { McToastComponent } from './toast.component';
import { defaultToastConfig, TOAST_CONFIG_TOKEN } from './toast.type';


@NgModule({
    declarations: [
        McToastComponent,
        McToastContainerComponent,
        McToastOutlet
    ],
    imports: [
        CommonModule,
        OverlayModule,
        A11yModule,
        McIconModule
    ],
    entryComponents: [
        McToastComponent,
        McToastContainerComponent
    ]
})
export class ToastModule {
    static forRoot(config = defaultToastConfig): ModuleWithProviders<any> {
        return {
            ngModule: ToastModule,
            providers: [{
                provide: TOAST_CONFIG_TOKEN,
                useValue: { ...defaultToastConfig, ...config }
            }]
        };
    }
}
