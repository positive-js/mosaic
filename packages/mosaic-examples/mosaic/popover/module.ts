import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';

import { PopoverOverviewExample } from './popover-overview/popover-overview-example';


const EXAMPLES = [
    PopoverOverviewExample
];

@NgModule({
    imports: [
        BrowserAnimationsModule,
        A11yModule,
        McButtonModule,
        McPopoverModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
