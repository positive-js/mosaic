import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import {
    ContentLeft, ContentRight,
    McCard
} from './cards.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McCard,
        ContentLeft,
        ContentRight
    ],
    declarations: [
        McCard,
        ContentLeft,
        ContentRight
    ]
})
export class McCardsModule {}
