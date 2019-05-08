import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import {
    McCard
} from './card.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [McCard],
    declarations: [McCard]
})
export class McCardModule {}
